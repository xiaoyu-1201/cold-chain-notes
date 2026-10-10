import * as THREE from 'three'

/**
 * 零件 3D 示意模型（以基本幾何組合，重點在看懂內部構造，不是精確外型）
 * 外殼材質放進 shells：開啟「剖開」時會被切掉前半，露出內部零件。
 */

export type Part3DId = 'comp' | 'cond' | 'txv' | 'evap' | 'oub' | 'kp15' | 'receiver' | 'gbc' | 'dml' | 'sgi' | 'evr' | 'tc' | 'acc' | 'flare' | 'fittings' | 'insul'

export interface LegendItem {
  color: string
  name: string
  desc: string
}

/** 動手操作：開關或滑桿，拖動時零件的機構跟著動 */
export interface PartControl {
  /** toggle＝開關；slider＝滑桿；run＝運轉（風扇轉、活塞動，由 userData.anim 標記的零件負責） */
  kind: 'toggle' | 'slider' | 'run'
  label: string
  /** 開關兩邊／滑桿兩端的字 */
  off: string
  on: string
  /** 預設值 0～1 */
  initial: number
  /** 機構在外殼裡面：一操作就自動剖開 */
  needsCut?: boolean
  /** 依目前值（0～1，已平滑）擺動零件 */
  apply?: (v: number) => void
  /** 這個值代表什麼（顯示在控制項下面） */
  describe: (v: number) => string
}

export interface PartModel {
  group: THREE.Group
  shells: THREE.Material[]
  legend: LegendItem[]
  control?: PartControl
}

type V3 = [number, number, number]
const R = Math.PI / 2

const mat = {
  brass: () => new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.85, roughness: 0.32 }),
  copper: () => new THREE.MeshStandardMaterial({ color: 0xc27a4a, metalness: 0.85, roughness: 0.3 }),
  steel: () => new THREE.MeshStandardMaterial({ color: 0xa7b1bd, metalness: 0.8, roughness: 0.35 }),
  dark: () => new THREE.MeshStandardMaterial({ color: 0x27313d, metalness: 0.35, roughness: 0.55 }),
  paint: (c: number) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.25, roughness: 0.5 }),
  glass: () => new THREE.MeshStandardMaterial({ color: 0xd6f1ff, roughness: 0.05, transparent: true, opacity: 0.35 }),
  fluid: (c: number, opacity = 0.55) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.2, transparent: true, opacity }),
  glow: (c: number) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6, roughness: 0.4 }),
}

class Builder {
  group = new THREE.Group()
  shells: THREE.Material[] = []
  legend: LegendItem[] = []

  /** 外殼材質（剖開時會被切掉） */
  shell<T extends THREE.Material>(m: T) {
    this.shells.push(m)
    return m
  }

  mesh(geo: THREE.BufferGeometry, m: THREE.Material, pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0]) {
    const o = new THREE.Mesh(geo, m)
    o.position.set(...pos)
    o.rotation.set(...rot)
    this.group.add(o)
    return o
  }

  cylX(r: number, len: number, m: THREE.Material, pos: V3 = [0, 0, 0], seg = 40, r2 = r) {
    return this.mesh(new THREE.CylinderGeometry(r2, r, len, seg), m, pos, [0, 0, R])
  }
  cylY(r: number, len: number, m: THREE.Material, pos: V3 = [0, 0, 0], seg = 40, r2 = r) {
    return this.mesh(new THREE.CylinderGeometry(r2, r, len, seg), m, pos)
  }
  cylZ(r: number, len: number, m: THREE.Material, pos: V3 = [0, 0, 0], seg = 40) {
    return this.mesh(new THREE.CylinderGeometry(r, r, len, seg), m, pos, [R, 0, 0])
  }
  box(w: number, h: number, d: number, m: THREE.Material, pos: V3 = [0, 0, 0]) {
    return this.mesh(new THREE.BoxGeometry(w, h, d), m, pos)
  }
  tube(points: V3[], r: number, m: THREE.Material) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
    return this.mesh(new THREE.TubeGeometry(curve, 64, r, 16, false), m)
  }
  /** 彈簧（螺旋線） */
  spring(r: number, h: number, turns: number, wire: number, m: THREE.Material, pos: V3) {
    const pts: V3[] = []
    for (let i = 0; i <= turns * 24; i++) {
      const a = (i / 24) * Math.PI * 2
      pts.push([pos[0] + Math.cos(a) * r, pos[1] + (i / (turns * 24)) * h, pos[2] + Math.sin(a) * r])
    }
    return this.tube(pts, wire, m)
  }
  /** 六角螺帽／接頭 */
  hexX(r: number, len: number, m: THREE.Material, pos: V3) {
    return this.cylX(r, len, m, pos, 6)
  }
  note(m: THREE.Material, name: string, desc: string) {
    const c = (m as THREE.MeshStandardMaterial).color
    this.legend.push({ color: `#${c.getHexString()}`, name, desc })
  }
  /** 把零件掛到一個支點上（之後縮放／旋轉都繞著支點） */
  pivot(objects: THREE.Object3D[], at: V3) {
    const p = new THREE.Group()
    p.position.set(...at)
    this.group.add(p)
    objects.forEach((o) => p.attach(o))
    return p
  }
  control?: PartControl
  done(): PartModel {
    return { group: this.group, shells: this.shells, legend: this.legend, control: this.control }
  }
}

/** 管線接頭：本體兩側的銅管 */
function stubsX(b: Builder, half: number, r = 0.11, len = 0.5) {
  const cu = mat.copper()
  b.cylX(r, len, cu, [-half - len / 2, 0, 0], 24)
  b.cylX(r, len, cu, [half + len / 2, 0, 0], 24)
  return cu
}

/** 旋轉體：profile 是 [半徑, 沿軸位置]；外壁要照位置變大的方向寫（法線才朝外） */
function lathe(b: Builder, profile: [number, number][], m: THREE.Material, axis: 'x' | 'y' = 'x', pos: V3 = [0, 0, 0], seg = 40) {
  const geo = new THREE.LatheGeometry(profile.map(([r, t]) => new THREE.Vector2(r, t)), seg)
  return b.mesh(geo, m, pos, axis === 'x' ? [0, 0, -R] : [0, 0, 0])
}
/** 空心管（看得到管壁厚度） */
function hollowX(b: Builder, rOut: number, rIn: number, x0: number, x1: number, m: THREE.Material, seg = 40, pos: V3 = [0, 0, 0]) {
  return lathe(b, [[rOut, x0], [rOut, x1], [rIn, x1], [rIn, x0], [rOut, x0]], m, 'x', pos, seg)
}
function hollowY(b: Builder, rOut: number, rIn: number, y0: number, y1: number, m: THREE.Material, pos: V3 = [0, 0, 0]) {
  return lathe(b, [[rOut, y0], [rOut, y1], [rIn, y1], [rIn, y0], [rOut, y0]], m, 'y', pos)
}
/** 六角螺帽（中間圓孔），沿 X 軸從 x0 開始 */
function hexNut(b: Builder, rHex: number, rHole: number, x0: number, len: number, m: THREE.Material) {
  const s = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6
    if (i) s.lineTo(Math.cos(a) * rHex, Math.sin(a) * rHex)
    else s.moveTo(Math.cos(a) * rHex, Math.sin(a) * rHex)
  }
  s.closePath()
  const hole = new THREE.Path()
  hole.absarc(0, 0, rHole, 0, Math.PI * 2, true)
  s.holes.push(hole)
  return b.mesh(new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false, curveSegments: 40 }), m, [x0, 0, 0], [0, R, 0])
}
/** 牙的紋路（一圈一圈），從 x0 到 x1，每 pitch 一圈（pitch 可以是負的） */
function threads(b: Builder, r: number, x0: number, x1: number, m: THREE.Material, pitch = 0.05) {
  const out: THREE.Mesh[] = []
  const n = Math.round((x1 - x0) / pitch)
  for (let i = 0; i <= n; i++) out.push(b.mesh(new THREE.TorusGeometry(r, 0.011, 6, 40), m, [x0 + i * pitch, 0, 0], [0, R, 0]))
  return out
}
/** 固定的亂數（每次畫出來一樣） */
function seeded(seed: number) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}
const builders: Record<Part3DId, () => PartModel> = {
  sgi() {
    const b = new Builder()
    const body = b.shell(mat.brass())
    b.cylX(0.34, 1.0, body)
    b.hexX(0.3, 0.22, body, [-0.62, 0, 0])
    b.hexX(0.3, 0.22, body, [0.62, 0, 0])
    b.cylY(0.33, 0.34, body, [0, 0.32, 0])
    const cu = stubsX(b, 0.73)
    const liquid = mat.fluid(0x38bdf8)
    b.cylX(0.2, 1.4, liquid)
    const ring = mat.glow(0x22c55e)
    b.mesh(new THREE.TorusGeometry(0.17, 0.035, 16, 48), ring, [0, 0.47, 0], [R, 0, 0])
    const glass = mat.glass()
    b.cylY(0.26, 0.05, glass, [0, 0.5, 0])
    b.note(glass, '玻璃視窗', '從上面看冷媒流過：冷媒夠時，液態像透明的水')
    b.note(ring, '含水指示環', '綠色＝乾燥；變淡＝水分快超標；黃色＝含水過多')
    const dry = new THREE.Color(0x22c55e)
    const wet = new THREE.Color(0xeab308)
    b.control = {
      kind: 'toggle',
      label: '系統裡的水分',
      off: '乾燥',
      on: '含水',
      initial: 0,
      apply: (v) => {
        ring.color.copy(dry).lerp(wet, v)
        ring.emissive.copy(ring.color)
      },
      describe: (v) => (v > 0.5 ? '指示環變黃：系統含水過多，乾燥過濾器吸飽了，要盡快更換。' : '指示環綠色：系統乾燥正常。'),
    }
    b.note(liquid, '冷媒通道', '液管裡的液態冷媒從這裡流過')
    b.note(body, '黃銅本體', '裝在液管上，乾燥過濾器後面')
    b.note(cu, '銅管接頭', '接液管（焊接或喇叭口）')
    return b.done()
  },

  dml() {
    const b = new Builder()
    const shellM = b.shell(mat.copper())
    b.cylX(0.46, 1.7, shellM)
    b.cylX(0.46, 0.32, shellM, [-1.01, 0, 0], 40, 0.16)
    b.cylX(0.16, 0.32, shellM, [1.01, 0, 0], 40, 0.46)
    const core = mat.paint(0xe8d9b0)
    b.cylX(0.38, 1.3, core)
    const screen = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.4, wireframe: true })
    b.cylX(0.42, 0.04, screen, [-0.72, 0, 0], 24)
    b.cylX(0.42, 0.04, screen, [0.72, 0, 0], 24)
    // 本體上的箭頭（冷媒流向）
    const arrowM = mat.paint(0x111827)
    b.box(0.62, 0.02, 0.07, arrowM, [-0.1, 0.462, 0])
    b.mesh(new THREE.ConeGeometry(0.1, 0.22, 24), arrowM, [0.32, 0.462, 0], [0, 0, -R]).scale.set(0.25, 1, 1)
    // 牙（沒 S）：六角＋外牙＋斜面；焊接（有 S）：銅管口＋插進去的銅管
    const nut = mat.brass()
    const socket = mat.copper()
    const pipe = mat.paint(0xe0a27a)
    const flare: THREE.Object3D[] = []
    const solder: THREE.Object3D[] = []
    for (const s of [-1, 1]) {
      flare.push(b.hexX(0.2, 0.2, nut, [s * 1.27, 0, 0]))
      flare.push(b.cylX(0.115, 0.3, nut, [s * 1.52, 0, 0], 32))
      flare.push(...threads(b, 0.115, s * 1.4, s * 1.64, nut, s * 0.06))
      flare.push(b.cylX(s > 0 ? 0.06 : 0.11, 0.06, nut, [s * 1.7, 0, 0], 32, s > 0 ? 0.11 : 0.06))
      solder.push(hollowX(b, 0.125, 0.1, Math.min(s * 1.17, s * 1.45), Math.max(s * 1.17, s * 1.45), socket, 32))
      solder.push(hollowX(b, 0.098, 0.08, Math.min(s * 1.25, s * 1.95), Math.max(s * 1.25, s * 1.95), pipe, 32))
    }
    b.control = {
      kind: 'toggle',
      label: '接頭（看型號有沒有 S）',
      off: '牙（沒 S）',
      on: '焊接（有 S）',
      initial: 0,
      apply: (v) => {
        flare.forEach((o) => (o.visible = v < 0.5))
        solder.forEach((o) => (o.visible = v >= 0.5))
      },
      describe: (v) =>
        v >= 0.5
          ? '有 S（盒子寫 ODF）＝焊接：兩頭是銅管口，銅管插進去燒焊。例：052S、164S。'
          : '沒有 S（盒子寫 SAE）＝牙：兩頭是外牙＋斜面，喇叭嘴套上螺帽鎖緊，不用動火。例：052、083。',
    }
    b.note(core, '分子篩（乾燥劑）', '吸走系統裡的水分；水會結冰把管路塞住')
    b.note(screen, '濾網', '擋住雜質、焊渣，保護膨脹閥')
    b.note(arrowM, '箭頭', '冷媒流向 IN → OUT；貼紙可能貼反，以本體箭頭為準')
    b.note(shellM, '銅殼', '裝在液管上；系統打開過就要換新')
    b.note(nut, '牙（沒 S）', '外牙＋斜面，用鎖的、拆得下來')
    b.note(socket, '焊接（有 S）', '銅管插進管口再燒焊')
    return b.done()
  },
  evr() {
    const b = new Builder()
    const body = b.shell(mat.brass())
    b.box(1.0, 0.5, 0.6, body)
    stubsX(b, 0.5)
    b.cylY(0.14, 0.7, b.shell(mat.steel()), [0, 0.6, 0], 32)
    const coil = b.shell(mat.dark())
    b.box(0.62, 0.56, 0.62, coil, [0, 0.66, 0])
    const plunger = mat.steel()
    const plungerMesh = b.cylY(0.09, 0.36, plunger, [0, 0.42, 0], 24)
    const springM = mat.glow(0xf59e0b)
    const springPivot = b.pivot([b.spring(0.07, 0.24, 6, 0.012, springM, [0, 0.62, 0])], [0, 0.86, 0])
    const seat = mat.paint(0xef4444)
    b.cylY(0.12, 0.05, seat, [0, 0.2, 0], 24)
    const flow = mat.fluid(0x38bdf8, 0.45)
    b.cylX(0.12, 1.1, flow, [0, 0.02, 0])
    b.control = {
      kind: 'toggle',
      label: '線圈電源',
      off: '斷電',
      on: '通電',
      initial: 0,
      needsCut: true,
      apply: (v) => {
        plungerMesh.position.y = 0.42 + 0.12 * v
        springPivot.scale.y = 1 - 0.4 * v
        coil.emissive.setHex(0xf59e0b)
        coil.emissiveIntensity = 0.45 * v
        flow.opacity = 0.06 + 0.5 * v
      },
      describe: (v) => (v > 0.5 ? '通電：線圈的磁力把柱塞吸上去，閥座打開，冷媒流過。' : '斷電：彈簧把柱塞壓在閥座上，冷媒被關在液管（常閉）。'),
    }
    b.note(coil, '線圈', '通電產生磁力，把柱塞吸上去 → 閥打開')
    b.note(plunger, '柱塞', '被吸起時讓出閥座孔，冷媒才能通過')
    b.note(springM, '彈簧', '斷電時把柱塞壓回去 → 常閉（通電才開）')
    b.note(seat, '閥座孔', '柱塞壓住就關，冷媒被關在液管')
    b.note(body, '閥體', '裝在液管上、膨脹閥前面')
    return b.done()
  },

  txv() {
    const b = new Builder()
    const body = b.shell(mat.brass())
    b.box(0.7, 0.6, 0.6, body)
    stubsX(b, 0.35, 0.1, 0.45)
    b.cylY(0.1, 0.45, mat.copper(), [0, -0.52, 0], 24)
    const head = b.shell(mat.steel())
    b.cylY(0.44, 0.22, head, [0, 0.42, 0])
    const diaphragm = mat.paint(0x60a5fa)
    const diaphragmMesh = b.cylY(0.4, 0.03, diaphragm, [0, 0.42, 0])
    const capillary = mat.copper()
    b.tube([[0, 0.53, 0], [0, 0.9, 0], [0.6, 1.05, 0.2], [1.3, 0.8, 0.3], [1.6, 0.3, 0.3]], 0.025, capillary)
    const bulb = mat.copper()
    b.cylY(0.1, 0.7, bulb, [1.6, -0.05, 0.3], 24)
    const pin = mat.steel()
    const pinMesh = b.cylY(0.035, 0.45, pin, [0, 0.12, 0], 16)
    const needle = mat.paint(0xef4444)
    const needleMesh = b.mesh(new THREE.ConeGeometry(0.08, 0.16, 24), needle, [0, -0.15, 0], [Math.PI, 0, 0])
    const springM = mat.glow(0xf59e0b)
    const springPivot = b.pivot([b.spring(0.1, 0.22, 5, 0.014, springM, [0, -0.5, 0])], [0, -0.5, 0])
    b.control = {
      kind: 'slider',
      label: '過熱度（感溫包的溫度）',
      off: '小（感溫包冷）',
      on: '大（感溫包熱）',
      initial: 0.5,
      needsCut: true,
      apply: (v) => {
        diaphragmMesh.position.y = 0.42 - 0.03 * v
        pinMesh.position.y = 0.12 - 0.1 * v
        needleMesh.position.y = -0.15 - 0.1 * v
        springPivot.scale.y = 1 - 0.35 * v
        bulb.emissive.setHex(0xef4444)
        bulb.emissiveIntensity = 0.35 * v
      },
      describe: (v) =>
        v < 0.34
          ? '過熱度小：感溫包冷、壓力低，彈簧把閥針往上頂，閥開小，供液少（避免液體回壓縮機）。'
          : v < 0.67
            ? '過熱度剛好：膜片上下的力平衡，閥針停在中間，供液剛好。'
            : '過熱度大：感溫包熱、壓力高，把膜片往下推，閥針打開，供液變多。',
    }
    b.note(bulb, '感溫包', '綁在蒸發器出口的吸氣管上，感應溫度')
    b.note(capillary, '毛細管', '把感溫包的壓力傳到膜片')
    b.note(diaphragm, '膜片', '上面推、下面頂，決定閥針開多大')
    b.note(needle, '閥針與閥座', '開度＝流量；這裡就是「降壓節流」的地方')
    b.note(springM, '過熱度彈簧', '底下有調整螺絲（進階再學）')
    return b.done()
  },

  receiver() {
    const b = new Builder()
    const tank = b.shell(mat.paint(0x64748b))
    b.mesh(new THREE.CapsuleGeometry(0.5, 1.5, 12, 40), tank)
    const liquid = mat.fluid(0x38bdf8)
    b.cylY(0.46, 0.85, liquid, [0, -0.5, 0])
    const dip = mat.copper()
    b.tube([[0.2, 1.3, 0], [0.2, 0.9, 0], [0.2, -0.95, 0]], 0.05, dip)
    const inlet = mat.copper()
    b.tube([[-0.9, 1.25, 0], [-0.2, 1.25, 0], [-0.2, 0.95, 0]], 0.06, inlet)
    const valve = mat.brass()
    b.box(0.3, 0.22, 0.22, valve, [0.2, 1.38, 0])
    b.cylX(0.06, 0.6, mat.copper(), [0.62, 1.38, 0], 16)
    b.note(liquid, '液態冷媒', '比較重，沉在下面')
    b.note(dip, '取液管', '一直伸到底部，只取液態送往膨脹閥')
    b.note(inlet, '進口', '冷凝器來的冷媒（可能還有一點氣）')
    b.note(valve, '出口閥', '往乾燥過濾器、膨脹閥')
    b.note(tank, '筒身', '膨脹閥系統一定要裝；講義右下角那顆小圓')
    return b.done()
  },

  acc() {
    const b = new Builder()
    const tank = b.shell(mat.paint(0x475569))
    b.mesh(new THREE.CapsuleGeometry(0.5, 1.3, 12, 40), tank)
    const liquid = mat.fluid(0x38bdf8)
    b.cylY(0.46, 0.45, liquid, [0, -0.72, 0])
    const utube = mat.copper()
    b.tube(
      [
        [0.25, 1.35, 0],
        [0.25, 0.4, 0],
        [0.22, -0.55, 0],
        [0, -0.72, 0],
        [-0.22, -0.55, 0],
        [-0.25, 0.4, 0],
        [-0.25, 0.75, 0],
      ],
      0.055,
      utube,
    )
    const hole = mat.glow(0xef4444)
    b.mesh(new THREE.SphereGeometry(0.035, 16, 16), hole, [0, -0.78, 0.04])
    const inlet = mat.copper()
    b.cylY(0.06, 0.5, inlet, [-0.05, 1.1, 0.2], 16)
    b.note(liquid, '沉在底部的液態', '冷排沒蒸發完的液體留在這裡，不會回壓縮機')
    b.note(utube, 'U 型取氣管', '開口在上方，只吸氣態回壓縮機')
    b.note(hole, '回油孔', '底部小孔讓冷凍油慢慢回壓縮機')
    b.note(inlet, '進口', '冷排（蒸發器）來的冷媒')
    b.note(tank, '筒身', '又叫低壓儲液器，裝在冷排和壓縮機中間')
    return b.done()
  },

  oub() {
    const b = new Builder()
    const tank = b.shell(mat.paint(0x1d4ed8))
    b.mesh(new THREE.CapsuleGeometry(0.42, 1.3, 12, 40), tank)
    const inlet = mat.copper()
    b.tube([[-0.9, 0.85, 0], [-0.2, 0.85, 0], [-0.2, 0.2, 0]], 0.06, inlet)
    const outlet = mat.copper()
    b.cylY(0.06, 0.6, outlet, [0.18, 1.15, 0], 16)
    const screen = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.4, wireframe: true })
    b.cylY(0.3, 0.5, screen, [0.05, 0.5, 0], 20)
    const oil = mat.fluid(0xf59e0b, 0.6)
    b.cylY(0.38, 0.4, oil, [0, -0.7, 0])
    const flt = mat.steel()
    b.mesh(new THREE.SphereGeometry(0.14, 24, 24), flt, [0, -0.55, 0])
    const ret = mat.copper()
    b.tube([[0, -0.9, 0], [0, -1.25, 0], [0.8, -1.25, 0]], 0.04, ret)
    b.note(inlet, '進口', '壓縮機排出的高溫高壓氣體（混著冷凍油）')
    b.note(screen, '分離網', '氣體轉向、撞網，油滴被分離出來')
    b.note(oil, '冷凍油', '沉在底部')
    b.note(flt, '浮球', '油夠多時浮起、打開回油閥')
    b.note(ret, '回油管', '把油送回壓縮機；氣體從上面出口往冷凝器')
    return b.done()
  },

  comp() {
    const b = new Builder()
    const dome = b.shell(mat.paint(0x1e3a8a))
    b.mesh(new THREE.CapsuleGeometry(0.75, 0.9, 16, 48), dome)
    const stator = mat.copper()
    b.mesh(new THREE.TorusGeometry(0.45, 0.14, 20, 48), stator, [0, 0.35, 0], [R, 0, 0])
    const rotor = mat.steel()
    b.cylY(0.26, 0.55, rotor, [0, 0.35, 0])
    const shaft = mat.steel()
    b.cylY(0.06, 1.1, shaft, [0, 0.05, 0], 16)
    const piston = mat.paint(0xf59e0b)
    b.cylX(0.16, 0.3, piston, [0.32, -0.45, 0], 24).userData.anim = { kind: 'slide', amp: 0.07, speed: 14 }
    const cyl = mat.dark()
    b.cylX(0.2, 0.42, cyl, [0.5, -0.45, 0], 24)
    const suction = mat.copper()
    b.tube([[-0.6, 0.4, 0.5], [-0.9, 0.5, 0.6], [-1.3, 0.5, 0.6]], 0.08, suction)
    const discharge = mat.copper()
    b.tube([[0.5, 0.75, 0.3], [0.7, 1.0, 0.3], [1.2, 1.0, 0.3]], 0.06, discharge)
    b.box(1.6, 0.08, 0.9, mat.dark(), [0, -1.25, 0])
    b.note(stator, '馬達線圈', '通電轉動，帶動壓縮')
    b.note(rotor, '轉子', '跟曲軸一起轉')
    b.note(piston, '活塞', '把低壓氣體壓成高溫高壓（不能壓液體）')
    b.note(suction, '吸氣管（低壓）', '冷排回來的低溫低壓氣體')
    b.note(discharge, '排氣管（高壓）', '往油分離器、冷凝器；最燙的一段')
    b.control = { kind: 'run', label: '壓縮機', off: '停機', on: '運轉', initial: 0, needsCut: true, describe: (v) => (v > 0.5 ? '運轉中：馬達帶動活塞來回，把吸進來的低壓氣體壓成高壓。' : '停機：按「運轉」看活塞怎麼動。') }
    return b.done()
  },

  cond() {
    const b = new Builder()
    const fin = b.shell(new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7, roughness: 0.35 }))
    for (let i = 0; i < 26; i++) b.box(0.02, 1.2, 0.5, fin, [-1.0 + i * 0.08, 0, 0])
    const tubeM = mat.copper()
    for (let r = 0; r < 4; r++) b.cylX(0.04, 2.3, tubeM, [0, -0.45 + r * 0.3, 0], 16)
    const housing = b.shell(mat.paint(0x334155))
    b.box(2.5, 0.1, 0.7, housing, [0, 0.68, 0])
    b.box(2.5, 0.1, 0.7, housing, [0, -0.68, 0])
    const blade = mat.paint(0x0f172a)
    for (let i = 0; i < 4; i++) {
      const o = b.box(0.08, 0.5, 0.02, blade, [0, 0, 0.45])
      o.rotation.z = (i * Math.PI) / 2 + 0.3
      o.userData.anim = { kind: 'spin', speed: 9 }
    }
    b.cylZ(0.08, 0.1, mat.steel(), [0, 0, 0.45], 16)
    b.note(fin, '散熱鰭片', '增加散熱面積；會積灰塵，要定期清洗')
    b.note(tubeM, '銅管', '冷媒在裡面放熱、凝結成液體')
    b.note(blade, '風扇', '把熱吹到室外；出風四、五十度以上')
    b.note(housing, '外框', '有外箱的耐風雨；裸露型台語叫「無穿衫」')
    b.control = { kind: 'run', label: '風扇', off: '停', on: '運轉', initial: 0, describe: (v) => (v > 0.5 ? '風扇運轉：把冷媒放出來的熱吹到室外，出風四、五十度。' : '風扇停：熱排不出去，高壓會升高。') }
    return b.done()
  },

  evap() {
    const b = new Builder()
    const housing = b.shell(mat.paint(0xe2e8f0))
    b.box(2.2, 0.9, 0.8, housing)
    const fin = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.35 })
    for (let i = 0; i < 20; i++) b.box(0.02, 0.7, 0.5, fin, [-0.85 + i * 0.09, 0, -0.05])
    const tubeM = mat.copper()
    for (let r = 0; r < 3; r++) b.cylX(0.035, 1.9, tubeM, [0, -0.22 + r * 0.22, -0.05], 16)
    const heater = mat.glow(0xef4444)
    b.cylX(0.025, 1.9, heater, [0, -0.33, 0.12], 12)
    const fanRing = b.shell(mat.dark())
    const evapBlade = mat.paint(0x475569)
    for (const x of [-0.55, 0.55]) {
      b.mesh(new THREE.TorusGeometry(0.28, 0.04, 12, 40), fanRing, [x, 0, 0.42])
      for (let i = 0; i < 2; i++) {
        const o = b.box(0.08, 0.46, 0.02, evapBlade, [x, 0, 0.42])
        o.rotation.z = (i * Math.PI) / 2 + 0.4
        o.userData.anim = { kind: 'spin', speed: 11 }
      }
    }
    const pan = mat.steel()
    b.box(2.2, 0.06, 0.9, pan, [0, -0.5, 0])
    b.note(tubeM, '銅管', '液氣混合的冷媒在裡面蒸發吸熱')
    b.note(fin, '鰭片', '低溫庫間距大，預留結霜的風道空間')
    b.note(heater, '除霜電熱管', '冷凍庫會結霜，要定時除霜')
    b.note(fanRing, '風扇', '把庫內空氣吹過冷排降溫')
    b.note(pan, '接水盤', '除霜融化的水從這裡排掉')
    b.control = { kind: 'run', label: '風扇', off: '停', on: '運轉', initial: 0, describe: (v) => (v > 0.5 ? '風扇運轉：把庫內的空氣吹過冷排，冷風再吹回庫內。' : '風扇停：庫內空氣不流動，冷不容易散開。') }
    return b.done()
  },

  gbc() {
    const b = new Builder()
    const body = b.shell(mat.brass())
    b.cylX(0.36, 1.0, body)
    b.hexX(0.3, 0.2, body, [-0.6, 0, 0])
    b.hexX(0.3, 0.2, body, [0.6, 0, 0])
    stubsX(b, 0.7, 0.1, 0.4)
    const ball = mat.steel()
    b.mesh(new THREE.SphereGeometry(0.3, 32, 32), ball)
    const bore = mat.dark()
    const borePivot = b.pivot([b.cylX(0.13, 0.62, bore, [0, 0, 0], 24)], [0, 0, 0])
    const stem = mat.steel()
    b.cylY(0.07, 0.5, stem, [0, 0.45, 0], 16)
    const handle = mat.paint(0xef4444)
    const handlePivot = b.pivot([b.box(0.9, 0.08, 0.16, handle, [0.3, 0.72, 0])], [0, 0.72, 0])
    const flow = mat.fluid(0x38bdf8, 0.45)
    b.cylX(0.09, 1.7, flow)
    b.control = {
      kind: 'toggle',
      label: '手閥',
      off: '關',
      on: '開',
      initial: 1,
      needsCut: true,
      apply: (v) => {
        const a = (1 - v) * (Math.PI / 2)
        handlePivot.rotation.y = a
        borePivot.rotation.y = a
        flow.opacity = 0.05 + 0.45 * v
      },
      describe: (v) => (v > 0.5 ? '開：把手跟管子平行，球的孔對著管子，冷媒通過。' : '關：把手轉 90° 跟管子垂直，球的孔轉開，冷媒被擋住。'),
    }
    b.note(ball, '球', '中間有個孔：孔對著管子＝開，轉 90° ＝關')
    b.note(bore, '球中間的孔', '冷媒從這裡通過')
    b.note(handle, '把手', '跟管子平行＝開，垂直＝關')
    b.note(body, '閥體', '乾燥過濾器前後各裝一顆，換零件時關起來')
    return b.done()
  },

  kp15() {
    const b = new Builder()
    const housing = b.shell(mat.paint(0x1e40af))
    b.box(1.2, 1.1, 0.6, housing)
    const bellows = mat.steel()
    for (let i = 0; i < 6; i++) b.mesh(new THREE.TorusGeometry(0.16, 0.04, 12, 32), bellows, [-0.3, -0.35 + i * 0.07, 0], [R, 0, 0])
    const high = Array.from({ length: 6 }, (_, i) => b.mesh(new THREE.TorusGeometry(0.16, 0.04, 12, 32), bellows, [0.3, -0.35 + i * 0.07, 0], [R, 0, 0]))
    const highPivot = b.pivot(high, [0.3, -0.38, 0])
    const contacts = mat.glow(0xf59e0b)
    const contactMesh = b.box(0.5, 0.08, 0.2, contacts, [0, 0.25, 0])
    b.control = {
      kind: 'slider',
      label: '高壓壓力',
      off: '正常',
      on: '過高',
      initial: 0.3,
      needsCut: true,
      apply: (v) => {
        highPivot.scale.y = 1 + 0.6 * v
        const trip = v > 0.75
        contactMesh.position.y = trip ? 0.36 : 0.25
        contacts.emissive.setHex(trip ? 0xef4444 : 0xf59e0b)
        contacts.color.setHex(trip ? 0xef4444 : 0xf59e0b)
      },
      describe: (v) => (v > 0.75 ? '高壓超過設定：右邊的伸縮囊撐開、把接點頂開，切斷電源，壓縮機停機保護。' : v > 0.5 ? '高壓偏高：伸縮囊被推高，但還沒到跳脫的設定值。' : '高壓正常：接點接通，壓縮機運轉。'),
    }
    const knob = mat.paint(0xe2e8f0)
    b.cylY(0.1, 0.18, knob, [-0.3, 0.64, 0], 24)
    b.cylY(0.1, 0.18, knob, [0.3, 0.64, 0], 24)
    const cap = mat.copper()
    b.tube([[-0.3, -0.55, 0], [-0.3, -0.9, 0], [-0.8, -1.1, 0]], 0.025, cap)
    b.tube([[0.3, -0.55, 0], [0.3, -0.9, 0], [0.8, -1.1, 0]], 0.025, cap)
    b.note(bellows, '感壓伸縮囊', '左邊接低壓、右邊接高壓，壓力變化會推動')
    b.note(contacts, '電氣接點', '壓力超出設定就斷電，讓壓縮機停機')
    b.note(knob, '設定旋鈕', '設定跳脫壓力')
    b.note(cap, '壓力接管', '接到系統的低壓側和高壓側')
    return b.done()
  },

  tc() {
    const b = new Builder()
    const box = b.shell(mat.paint(0xe5e7eb))
    b.box(1.2, 0.6, 0.6, box)
    const screen = mat.glow(0x22d3ee)
    b.box(0.6, 0.22, 0.02, screen, [-0.15, 0.08, 0.31])
    const btn = mat.dark()
    for (let i = 0; i < 3; i++) b.cylZ(0.05, 0.04, btn, [0.32 + i * 0.12 - 0.12, -0.12, 0.31], 16)
    const board = mat.paint(0x15803d)
    b.box(1.0, 0.4, 0.04, board, [0, 0, -0.1])
    const cable = mat.dark()
    b.tube([[0.6, -0.1, 0], [1.0, -0.4, 0], [1.4, -0.4, 0.3]], 0.03, cable)
    const probe = mat.steel()
    b.cylX(0.05, 0.45, probe, [1.6, -0.4, 0.3], 16)
    b.note(screen, '顯示幕', '顯示庫內溫度、設定值')
    b.note(probe, '感溫棒', '放在庫內，感應溫度')
    b.note(board, '控制電路', '到設定溫度就讓壓縮機停；溫差一般抓 4°C')
    b.note(btn, '按鍵', '設定溫度、溫差、除霜時間')
    return b.done()
  },
  flare() {
    const b = new Builder()
    // 接頭（不動）：左邊銅管、六角、外牙、45° 斜面
    const fit = mat.brass()
    const cuL = mat.copper()
    hollowX(b, 0.12, 0.1, -1.1, -0.5, cuL, 32)
    b.hexX(0.3, 0.3, fit, [-0.42, 0, 0])
    b.cylX(0.185, 0.52, fit, [-0.01, 0, 0])
    threads(b, 0.185, -0.24, 0.21, fit)
    b.cylX(0.1, 0.07, fit, [0.285, 0, 0], 40, 0.17)
    // 銅管＋喇叭嘴（斜面剛好貼在接頭斜面上）
    const cu = mat.copper()
    const tube = lathe(b, [[0.19, 0.27], [0.12, 0.34], [0.12, 1.6], [0.1, 1.6], [0.1, 0.32], [0.17, 0.25], [0.19, 0.27]], cu)
    const tubeP = b.pivot([tube], [0, 0, 0])
    // 喇叭螺帽：前段內牙、後段有斜面把喇叭嘴壓住
    const nutM = b.shell(mat.paint(0xd4a72c))
    nutM.metalness = 0.85
    nutM.roughness = 0.3
    const nutParts = [
      hexNut(b, 0.34, 0.2, 0, 0.5, nutM),
      lathe(b, [[0.2, 0.27], [0.2, 0.5], [0.13, 0.5], [0.13, 0.34], [0.2, 0.27]], nutM),
      ...threads(b, 0.2, 0.025, 0.225, nutM),
    ]
    const nutP = b.pivot(nutParts, [0, 0, 0])
    b.control = {
      kind: 'toggle',
      label: '把螺帽鎖上去',
      off: '分開',
      on: '鎖緊',
      initial: 0,
      needsCut: true,
      apply: (v) => {
        tubeP.position.x = 0.55 * (1 - v)
        nutP.position.x = 1.15 * (1 - v)
        nutP.rotation.x = (1 - v) * Math.PI * 3
      },
      describe: (v) =>
        v >= 0.5
          ? '鎖緊：螺帽把喇叭嘴壓在接頭斜面上，銅貼銅不會漏；不用燒焊、拆得下來。'
          : '分開：銅管先穿過螺帽，再用擴管工具把管口打成喇叭嘴（斜面）。',
    }
    b.note(cu, '喇叭嘴', '銅管口打成 45° 斜面（張開像喇叭）')
    b.note(nutM, '喇叭螺帽', '先套在銅管上；鎖緊時把喇叭嘴壓住')
    b.note(fit, '接頭（外牙＋斜面）', '幾分牙＝幾分的銅管鎖得上')
    b.note(cuL, '另一頭', '可能是焊接，也可能又是牙')
    return b.done()
  },

  fittings() {
    const b = new Builder()
    const elbow = b.shell(mat.copper())
    const tee = b.shell(mat.paint(0xb5653a))
    tee.metalness = 0.85
    tee.roughness = 0.3
    const red = b.shell(mat.paint(0xd4895a))
    red.metalness = 0.85
    red.roughness = 0.3
    const pipe = mat.paint(0xe8b08a)
    pipe.metalness = 0.6
    pipe.roughness = 0.35
    const moves: { o: THREE.Object3D; dir: V3 }[] = []
    const insert = (o: THREE.Object3D, dir: V3) => {
      const p = b.pivot([o], [0, 0, 0])
      moves.push({ o: p, dir })
    }
    // 90° 彎頭：彎的部分＋兩頭套筒
    b.mesh(new THREE.TorusGeometry(0.35, 0.15, 20, 32, Math.PI / 2), elbow, [-2.15, -0.2, 0])
    hollowY(b, 0.15, 0.125, -0.45, -0.2, elbow, [-1.8, 0, 0])
    hollowX(b, 0.15, 0.125, -2.4, -2.15, elbow, 40, [0, 0.15, 0])
    insert(hollowY(b, 0.12, 0.1, -0.7, -0.25, pipe, [-1.8, 0, 0]), [0, -1, 0])
    insert(hollowX(b, 0.12, 0.1, -2.65, -2.2, pipe, 32, [0, 0.15, 0]), [-1, 0, 0])
    // T 型三通
    hollowX(b, 0.15, 0.125, -0.45, 0.45, tee)
    hollowY(b, 0.15, 0.125, 0.1, 0.45, tee)
    insert(hollowX(b, 0.12, 0.1, -0.7, -0.25, pipe, 32), [-1, 0, 0])
    insert(hollowX(b, 0.12, 0.1, 0.25, 0.7, pipe, 32), [1, 0, 0])
    insert(hollowY(b, 0.12, 0.1, 0.25, 0.7, pipe), [0, 1, 0])
    // 大小頭（例 5分×3分）
    lathe(b, [[0.2, 1.75], [0.2, 2.05], [0.13, 2.25], [0.13, 2.5], [0.105, 2.5], [0.105, 2.25], [0.17, 2.05], [0.17, 1.75], [0.2, 1.75]], red)
    insert(hollowX(b, 0.165, 0.145, 1.5, 1.95, pipe, 32), [-1, 0, 0])
    insert(hollowX(b, 0.1, 0.085, 2.3, 2.75, pipe, 32), [1, 0, 0])
    b.control = {
      kind: 'toggle',
      label: '把銅管插進去',
      off: '還沒插',
      on: '插進去',
      initial: 0,
      needsCut: true,
      apply: (v) => {
        const k = 0.35 * (1 - v)
        moves.forEach(({ o, dir }) => o.position.set(dir[0] * k, dir[1] * k, dir[2] * k))
      },
      describe: (v) =>
        v >= 0.5
          ? '插進去再燒焊：4分的彎頭，剛好讓 4分（12.7 mm）銅管插進去。'
          : '口是「套筒」：銅管插在裡面，所以接頭、彎頭量內徑。',
    }
    b.note(elbow, '90° 彎頭', '賣最多；也有 45°、180°（U 型）')
    b.note(tee, 'T 型三通', '分成兩路；Y 型下面大、上面小')
    b.note(red, '大小頭', '一邊大一邊小，例 5分×3分')
    b.note(pipe, '銅管', '插在接頭裡面 → 接頭量內徑')
    return b.done()
  },

  insul() {
    const b = new Builder()
    const cu = mat.copper()
    hollowX(b, 0.12, 0.1, -1.8, 1.8, cu)
    const foam = b.shell(new THREE.MeshStandardMaterial({ color: 0x3a3f47, roughness: 0.95, metalness: 0 }))
    const seam = mat.paint(0xf59e0b)
    // 同一支 4分銅管（外徑 12.7 mm）：4分厚≈12.7 mm、6分厚≈19 mm（照比例）
    const layer = (t: number) => [hollowX(b, 0.13 + t, 0.13, -1.3, 1.3, foam, 56), b.box(2.6, 0.012, 0.024, seam, [0, 0.13 + t + 0.004, 0])]
    const thin = layer(0.24)
    const thick = layer(0.36)
    // 水滴用管路藍：淡色檢視窗上，原本的淺藍幾乎看不見（10/10）
    const drop = mat.fluid(0x2e7bc8, 0.9)
    const rnd = seeded(7)
    const drops: THREE.Object3D[] = []
    for (let i = 0; i < 90; i++) {
      const a = -Math.PI * (0.05 + rnd() * 0.9) // 下半圈比較多
      const up = rnd() < 0.3 ? Math.PI : 0
      const r = 0.012 + rnd() * 0.018
      drops.push(b.mesh(new THREE.SphereGeometry(r, 10, 8), drop, [-1.25 + rnd() * 2.5, Math.sin(a + up) * 0.125, Math.cos(a + up) * 0.125]))
    }
    for (let i = 0; i < 6; i++) {
      const x = -1.0 + i * 0.4 + rnd() * 0.1
      const m = b.mesh(new THREE.SphereGeometry(0.03, 12, 10), drop, [x, -0.16, 0])
      m.scale.set(1, 1.6, 1)
      drops.push(m)
      if (i % 2 === 0) drops.push(b.mesh(new THREE.SphereGeometry(0.025, 12, 10), drop, [x, -0.45 - rnd() * 0.3, 0]))
    }
    b.control = {
      kind: 'slider',
      label: '保溫管厚度',
      off: '沒包',
      on: '6分厚（冷凍）',
      initial: 0,
      apply: (v) => {
        const s = v < 0.25 ? 0 : v < 0.75 ? 1 : 2
        drops.forEach((o) => (o.visible = s === 0))
        thin.forEach((o) => (o.visible = s === 1))
        thick.forEach((o) => (o.visible = s === 2))
      },
      describe: (v) =>
        v < 0.25
          ? '沒包：回氣管比室溫冷很多，外面會結露、滴水（倒汗），跟裝冰水的杯子一樣；會滴到天花板、地上。'
          : v < 0.75
            ? '4分厚：冷藏用。洞要剛好插得進去：4分銅管（12.7 mm）配 13 mm 的洞。'
            : '6分厚：冷凍用（回氣管零下 20 幾度）；還不夠就再套一層（雙套管）。',
    }
    b.note(cu, '回氣管（銅管）', '冷排回壓縮機的那一支，很冰')
    b.note(foam, '保溫管', '洞剛好插得進去；厚度看冷凍或冷藏')
    b.note(seam, '割開的接縫', '割開包上，再用強力膠黏回去')
    b.note(drop, '倒汗（水滴）', '沒包時，水氣碰到冰管子凝結')
    return b.done()
  },
}

export function buildPart(id: Part3DId): PartModel {
  return builders[id]()
}
