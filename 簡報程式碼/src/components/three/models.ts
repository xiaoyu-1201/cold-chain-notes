import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/**
 * 零件 3D 示意模型（以基本幾何組合，重點在看懂內部構造，不是精確外型）
 * 外殼材質放進 shells：開啟「剖開」時會被切掉前半，露出內部零件。
 */

export type Part3DId = 'comp' | 'scroll' | 'cond' | 'txv' | 'evap' | 'oub' | 'kp15' | 'receiver' | 'gbc' | 'dml' | 'sgi' | 'evr' | 'tc' | 'acc' | 'flare' | 'fittings' | 'insul'

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
  /** 跟 legend 一一對應的材質（滑鼠移到說明上，3D 裡用這個材質的零件會亮起來） */
  legendMats: THREE.Material[]
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
  legendMats: THREE.Material[] = []

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
    this.legendMats.push(m)
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
    return { group: this.group, shells: this.shells, legend: this.legend, legendMats: this.legendMats, control: this.control }
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
/** 圓角方塊（塑膠殼、鑄件看起來比較真） */
function rbox(b: Builder, w: number, h: number, d: number, r: number, m: THREE.Material, pos: V3 = [0, 0, 0]) {
  return b.mesh(new RoundedBoxGeometry(w, h, d, 4, r), m, pos)
}
/** 直立的鐵筒：上下圓頂（儲液器、液氣分離器、油分離器） */
function vessel(b: Builder, r: number, halfH: number, m: THREE.Material) {
  const k = r * 0.32
  return lathe(b, [[0, -halfH - k], [r * 0.6, -halfH - k * 0.85], [r * 0.9, -halfH - k * 0.4], [r, -halfH], [r, halfH], [r * 0.9, halfH + k * 0.4], [r * 0.6, halfH + k * 0.85], [0, halfH + k]], m, 'y', [0, 0, 0], 56)
}
/** 筒身上的標籤（白底、一條藍邊、幾行字的樣子），面向正前方 */
function stickerY(b: Builder, r: number, y: number, h: number) {
  const paper = mat.paint(0xf8fafc)
  const band = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.004, r + 0.004, h, 48, 1, true, -0.9, 1.8), paper)
  band.position.y = y
  b.group.add(band)
  const ink = mat.paint(0x334155)
  for (let i = 0; i < 3; i++) {
    const line = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.007, r + 0.007, 0.025, 48, 1, true, -0.55, 1.1 - i * 0.2), ink)
    line.position.y = y + h * 0.25 - i * h * 0.22
    b.group.add(line)
  }
  const edge = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.006, r + 0.006, 0.04, 48, 1, true, -0.9, 1.8), mat.paint(0x2563eb))
  edge.position.y = y + h / 2 - 0.02
  b.group.add(edge)
}
/** 底座＋四個角座（橡皮墊、螺絲） */function feet(b: Builder, w: number, d: number, y: number, fx: number, fz: number) {
  b.box(w, 0.06, d, mat.paint(0x2b2f36), [0, y, 0])
  const rubber = mat.paint(0x111111)
  const bolt = mat.steel()
  for (const x of [-fx, fx])
    for (const z of [-fz, fz]) {
      b.cylY(0.11, 0.1, rubber, [x, y + 0.08, z], 20)
      b.cylY(0.04, 0.2, bolt, [x, y + 0.13, z], 12)
      b.cylY(0.07, 0.04, bolt, [x, y + 0.22, z], 6)
    }
}
/** 殼上的銘牌（白底＋幾行字的樣子）；angle 0＝正面（+z），負的往左 */
function nameplate(b: Builder, radius: number, angle: number, y: number, sx = 1, sz = 1) {
  const g = new THREE.Group()
  g.position.set(radius * sx * Math.sin(angle), y, radius * sz * Math.cos(angle) + 0.01)
  g.rotation.y = angle
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.26), mat.paint(0xf8fafc)))
  const ink = mat.paint(0x334155)
  for (let i = 0; i < 4; i++) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(i === 0 ? 0.3 : 0.24, 0.022), ink)
    line.position.set(-0.03 + (i === 0 ? 0.03 : 0), 0.08 - i * 0.055, 0.002)
    g.add(line)
  }
  b.group.add(g)
}
/** 鰭片：一片一片的薄板，沿 x 排 */
function finBlock(b: Builder, w: number, h: number, d: number, n: number, m: THREE.Material, pos: V3) {
  const geo = new THREE.BoxGeometry(0.012, h, d)
  for (let i = 0; i < n; i++) b.mesh(geo, m, [pos[0] - w / 2 + (i + 0.5) * (w / n), pos[1], pos[2]])
}
/** 穿過鰭片的銅管（沿 x）＋兩端的 U 彎 */
function coilTubes(b: Builder, L: number, ys: number[], zs: number[], m: THREE.Material, small = false) {
  const r = small ? 0.028 : 0.035
  for (const y of ys) for (const z of zs) b.cylX(r, L + 0.16, m, [0, y, z], 16)
  for (let i = 0; i < ys.length - 1; i++) {
    const x = (i % 2 === 0 ? 1 : -1) * (L / 2 + 0.08)
    const dy = ys[i + 1] - ys[i]
    for (const z of zs) {
      const bend = b.mesh(new THREE.TorusGeometry(dy / 2, r, 10, 20, Math.PI), m, [x, ys[i] + dy / 2, z])
      bend.rotation.z = x > 0 ? -R : R
    }
  }
}
/** 風扇：外框、同心圓護網、十字支架、中間馬達蓋；後面的扇葉會轉。面向 +z */
function fanGuard(b: Builder, r: number, center: V3, guard: THREE.Material, blade: THREE.Material, speed: number) {
  const g = new THREE.Group()
  g.position.set(...center)
  b.group.add(g)
  g.add(new THREE.Mesh(new THREE.TorusGeometry(r, 0.028, 8, 56), guard))
  for (const k of [0.78, 0.56, 0.34]) g.add(new THREE.Mesh(new THREE.TorusGeometry(r * k, 0.01, 6, 48), guard))
  for (let i = 0; i < 4; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(2 * r, 0.016, 0.016), guard)
    spoke.rotation.z = (i * Math.PI) / 4
    g.add(spoke)
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.16, r * 0.16, 0.08, 24), guard)
  hub.rotation.x = R
  g.add(hub)
  const rotor = new THREE.Group()
  rotor.position.z = -0.07
  rotor.userData.anim = { kind: 'spin', speed }
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2
    const bl = new THREE.Mesh(new THREE.BoxGeometry(r * 0.38, r * 0.78, 0.012), blade)
    bl.position.set(Math.cos(a) * r * 0.46, Math.sin(a) * r * 0.46, 0)
    bl.rotation.set(0, 0.45, a + Math.PI / 2)
    rotor.add(bl)
  }
  g.add(rotor)
  return g
}
const builders: Record<Part3DId, () => PartModel> = {  /** 視液鏡（10/13 做細）：黃銅本體、兩頭六角、上面鍍鉻鏡框＋玻璃＋含水指示環 */
  sgi() {
    const b = new Builder()
    const body = b.shell(mat.brass())
    lathe(b, [[0.22, -0.62], [0.29, -0.5], [0.34, -0.3], [0.34, 0.3], [0.29, 0.5], [0.22, 0.62]], body, 'x')
    b.hexX(0.3, 0.22, body, [-0.72, 0, 0])
    b.hexX(0.3, 0.22, body, [0.72, 0, 0])
    b.cylY(0.31, 0.34, body, [0, 0.3, 0], 48)
    const cu = stubsX(b, 0.83)
    const liquid = mat.fluid(0x38bdf8)
    b.cylX(0.2, 1.4, liquid)
    const chrome = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 1, roughness: 0.15 })
    b.mesh(new THREE.TorusGeometry(0.28, 0.045, 14, 56), chrome, [0, 0.48, 0], [R, 0, 0])
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      b.box(0.03, 0.06, 0.02, chrome, [Math.cos(a) * 0.33, 0.44, Math.sin(a) * 0.33]).rotation.y = -a
    }
    const ring = mat.glow(0x22c55e)
    b.mesh(new THREE.TorusGeometry(0.15, 0.035, 16, 48), ring, [0, 0.47, 0], [R, 0, 0])
    const glass = mat.glass()
    b.cylY(0.25, 0.04, glass, [0, 0.5, 0], 48)
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
    b.note(chrome, '鏡框', '壓住玻璃；外圈有防滑紋')
    b.note(body, '黃銅本體', '裝在液管上，乾燥過濾器後面')
    b.note(cu, '銅管接頭', '接液管（焊接或喇叭口）')
    return b.done()
  },

  /** 乾燥過濾器（10/13 做細）：圓滑的銅殼、兩端收口、接縫，外面貼標籤（型號＋箭頭） */
  dml() {
    const b = new Builder()
    const shellM = b.shell(new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.75, roughness: 0.33 }))
    lathe(b, [[0.15, -1.18], [0.2, -1.12], [0.36, -1.0], [0.46, -0.84], [0.46, 0.84], [0.36, 1.0], [0.2, 1.12], [0.15, 1.18]], shellM, 'x', [0, 0, 0], 56)
    for (const x of [-0.84, 0.84]) b.mesh(new THREE.TorusGeometry(0.463, 0.012, 8, 56), b.shell(mat.copper()), [x, 0, 0], [0, R, 0])
    // 標籤：白底紅條，箭頭＝冷媒流向
    const label = b.shell(mat.paint(0xf8fafc))
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.466, 0.466, 1.05, 56, 1, true), label)
    band.rotation.z = R
    b.group.add(band)
    const stripe = b.shell(mat.paint(0xdc2626))
    for (const x of [-0.46, 0.46]) b.mesh(new THREE.CylinderGeometry(0.468, 0.468, 0.08, 56, 1, true), stripe, [x, 0, 0], [0, 0, R])
    const core = mat.paint(0xe8d9b0)
    b.cylX(0.38, 1.3, core)
    const screen = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.4, wireframe: true })
    b.cylX(0.42, 0.04, screen, [-0.72, 0, 0], 24)
    b.cylX(0.42, 0.04, screen, [0.72, 0, 0], 24)
    const arrowM = mat.paint(0x111827)
    b.box(0.5, 0.02, 0.07, arrowM, [-0.08, 0.47, 0])
    b.mesh(new THREE.ConeGeometry(0.1, 0.2, 24), arrowM, [0.27, 0.47, 0], [0, 0, -R]).scale.set(0.25, 1, 1)
    for (let i = 0; i < 3; i++) b.box(0.32 - i * 0.06, 0.012, 0.025, arrowM, [-0.05, 0.471, 0.16 + i * 0.06])
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

  /** 電磁閥（10/13 做細）：黃銅閥體（倒角）、不鏽鋼套管、黑色線圈＋側邊插頭盒和電線、頂上螺帽、本體箭頭 */
  evr() {
    const b = new Builder()
    const body = b.shell(mat.brass())
    rbox(b, 1.0, 0.5, 0.62, 0.08, body)
    stubsX(b, 0.5)
    const arrowM = mat.paint(0x111827)
    b.box(0.4, 0.03, 0.02, arrowM, [-0.05, -0.08, 0.315])
    b.mesh(new THREE.ConeGeometry(0.06, 0.14, 16), arrowM, [0.2, -0.08, 0.315], [0, 0, -R])
    b.cylY(0.14, 0.7, b.shell(mat.steel()), [0, 0.6, 0], 32)
    const coil = b.shell(mat.dark())
    rbox(b, 0.66, 0.58, 0.66, 0.07, coil, [0, 0.66, 0])
    b.box(0.4, 0.22, 0.01, mat.paint(0xf1f5f9), [0, 0.7, 0.335])
    const plug = b.shell(mat.paint(0x6b7280))
    rbox(b, 0.26, 0.36, 0.3, 0.04, plug, [0.46, 0.66, 0])
    b.cylY(0.07, 0.12, mat.dark(), [0.46, 0.42, 0], 20)
    b.tube([[0.46, 0.36, 0], [0.46, 0.1, 0.05], [0.7, -0.2, 0.2], [1.1, -0.3, 0.3]], 0.035, mat.dark())
    b.cylY(0.11, 0.08, mat.steel(), [0, 1.0, 0], 6)
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
    b.note(plug, '插頭盒', '電線從這裡接進線圈（接溫控器）')
    b.note(plunger, '柱塞', '被吸起時讓出閥座孔，冷媒才能通過')
    b.note(springM, '彈簧', '斷電時把柱塞壓回去 → 常閉（通電才開）')
    b.note(seat, '閥座孔', '柱塞壓住就關，冷媒被關在液管')
    b.note(body, '閥體', '裝在液管上、膨脹閥前面；箭頭＝冷媒方向')
    return b.done()
  },

  /** 膨脹閥（10/13 做細）：黃銅閥體、頂上不鏽鋼感溫頭（圓頂）、盤一圈的毛細管、感溫包＋固定夾、外均壓管、調整螺絲蓋 */
  txv() {
    const b = new Builder()
    const body = b.shell(mat.brass())
    rbox(b, 0.7, 0.62, 0.6, 0.07, body)
    stubsX(b, 0.35, 0.1, 0.45)
    b.cylY(0.1, 0.45, mat.copper(), [0, -0.52, 0], 24)
    const head = b.shell(new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.2 }))
    b.cylY(0.16, 0.16, head, [0, 0.36, 0], 32)
    lathe(b, [[0.46, 0.4], [0.47, 0.46], [0.42, 0.52], [0.28, 0.58], [0.1, 0.61], [0, 0.61]], head, 'y', [0, 0, 0], 56)
    const diaphragm = mat.paint(0x60a5fa)
    const diaphragmMesh = b.cylY(0.4, 0.03, diaphragm, [0, 0.45, 0])
    const capillary = mat.copper()
    const coil: V3[] = [[0, 0.6, 0], [0, 0.85, 0]]
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI * 2
      coil.push([0.35 + Math.cos(a) * 0.3, 1.0 + i * 0.006, Math.sin(a) * 0.3])
    }
    coil.push([1.1, 0.9, 0.3], [1.5, 0.5, 0.3], [1.6, 0.3, 0.3])
    b.tube(coil, 0.022, capillary)
    const bulb = mat.copper()
    b.cylY(0.1, 0.7, bulb, [1.6, -0.05, 0.3], 24)
    const clamp = mat.steel()
    for (const y of [0.15, -0.25]) b.mesh(new THREE.TorusGeometry(0.11, 0.018, 8, 32), clamp, [1.6, y, 0.3], [R, 0, 0])
    b.tube([[0.3, -0.1, -0.3], [0.6, -0.2, -0.5], [1.1, -0.4, -0.6], [1.5, -0.7, -0.5]], 0.02, mat.copper())
    b.cylZ(0.13, 0.18, mat.brass(), [0, -0.12, 0.38], 6)
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
        diaphragmMesh.position.y = 0.45 - 0.03 * v
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
    b.note(bulb, '感溫包', '用固定夾綁在蒸發器出口的吸氣管上，感應溫度')
    b.note(capillary, '毛細管', '把感溫包的壓力傳到膜片；多的盤成一圈')
    b.note(head, '感溫頭', '裡面是膜片；圓頂上會刻型號')
    b.note(diaphragm, '膜片', '上面推、下面頂，決定閥針開多大')
    b.note(needle, '閥針與閥座', '開度＝流量；這裡就是「降壓節流」的地方')
    b.note(springM, '過熱度彈簧', '前面的六角蓋裡是調整螺絲（進階再學）')
    return b.done()
  },

  /** 儲液器（10/13 做細）：直立的鐵筒（上下圓頂、銲道）、固定束環＋底座、頂上出口閥（六角＋蓋）、進口管、標籤 */
  receiver() {
    const b = new Builder()
    const tank = b.shell(new THREE.MeshStandardMaterial({ color: 0x3f4752, metalness: 0.4, roughness: 0.42 }))
    vessel(b, 0.5, 1.0, tank)
    const seam = b.shell(mat.dark())
    for (const y of [0.78, -0.78]) b.mesh(new THREE.TorusGeometry(0.505, 0.015, 8, 56), seam, [0, y, 0], [R, 0, 0])
    const band = mat.steel()
    for (const y of [0.45, -0.45]) b.mesh(new THREE.TorusGeometry(0.52, 0.03, 8, 56), band, [0, y, 0], [R, 0, 0])
    b.box(1.2, 0.05, 0.5, band, [0, -1.08, 0])
    b.box(0.08, 1.02, 0.08, band, [0, -0.6, -0.52])
    stickerY(b, 0.505, 0.0, 0.5)
    const liquid = mat.fluid(0x38bdf8)
    b.cylY(0.46, 0.85, liquid, [0, -0.5, 0])
    const dip = mat.copper()
    b.tube([[0.2, 1.3, 0], [0.2, 0.9, 0], [0.2, -0.95, 0]], 0.05, dip)
    const inlet = mat.copper()
    b.tube([[-0.9, 1.25, 0], [-0.2, 1.25, 0], [-0.2, 0.95, 0]], 0.06, inlet)
    const valve = mat.brass()
    rbox(b, 0.32, 0.24, 0.26, 0.04, valve, [0.2, 1.36, 0])
    b.cylY(0.15, 0.12, valve, [0.2, 1.2, 0], 6)
    b.cylY(0.07, 0.16, valve, [0.2, 1.56, 0], 6)
    b.cylX(0.06, 0.6, mat.copper(), [0.64, 1.36, 0], 16)
    b.note(liquid, '液態冷媒', '比較重，沉在下面')
    b.note(dip, '取液管', '一直伸到底部，只取液態送往膨脹閥')
    b.note(inlet, '進口', '冷凝器來的冷媒（可能還有一點氣）')
    b.note(valve, '出口閥', '往乾燥過濾器、膨脹閥；上面的六角蓋拆開才轉得動')
    b.note(tank, '筒身', '膨脹閥系統一定要裝；講義右下角那顆小圓')
    return b.done()
  },

  /** 液氣分離器（10/13 做細）：直立鐵筒、頂上兩支管（進、出）、束環＋腳架、標籤 */
  acc() {
    const b = new Builder()
    const tank = b.shell(new THREE.MeshStandardMaterial({ color: 0x2f3a47, metalness: 0.4, roughness: 0.42 }))
    vessel(b, 0.5, 0.95, tank)
    const seam = b.shell(mat.dark())
    for (const y of [0.72, -0.72]) b.mesh(new THREE.TorusGeometry(0.505, 0.015, 8, 56), seam, [0, y, 0], [R, 0, 0])
    const band = mat.steel()
    b.mesh(new THREE.TorusGeometry(0.52, 0.03, 8, 56), band, [0, -0.2, 0], [R, 0, 0])
    b.box(0.08, 0.9, 0.08, band, [0, -0.6, -0.52])
    b.box(0.9, 0.05, 0.4, band, [0, -1.03, -0.3])
    stickerY(b, 0.505, 0.2, 0.42)
    const liquid = mat.fluid(0x38bdf8)
    b.cylY(0.46, 0.45, liquid, [0, -0.7, 0])
    const utube = mat.copper()
    b.tube([[0.25, 1.35, 0], [0.25, 0.4, 0], [0.22, -0.55, 0], [0, -0.72, 0], [-0.22, -0.55, 0], [-0.25, 0.4, 0], [-0.25, 0.75, 0]], 0.055, utube)
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

  /** 油分離器（10/13 做細）：直立鐵筒（圓頂、銲道）、進出口管、底部回油管、束環 */
  oub() {
    const b = new Builder()
    const tank = b.shell(new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.4, roughness: 0.4 }))
    vessel(b, 0.42, 1.0, tank)
    const seam = b.shell(mat.dark())
    for (const y of [0.8, -0.8]) b.mesh(new THREE.TorusGeometry(0.425, 0.014, 8, 56), seam, [0, y, 0], [R, 0, 0])
    const band = mat.steel()
    b.mesh(new THREE.TorusGeometry(0.44, 0.03, 8, 56), band, [0, 0.1, 0], [R, 0, 0])
    b.box(0.08, 0.3, 0.3, band, [0, 0.1, -0.55])
    stickerY(b, 0.425, -0.3, 0.4)
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

  /** 往復式壓縮機（10/13 做細；使用者：要長形、不要圓胖）：橫向拉長的橢圓鐵殼，上下兩半銲在一起；底座四個角座、側邊接線盒、銘牌；三支管＝吸氣（粗）、排氣、充灌（端口壓扁封住）；剖開看活塞 */
  comp() {
    const b = new Builder()
    const dome = b.shell(new THREE.MeshStandardMaterial({ color: 0x1f2a44, metalness: 0.45, roughness: 0.38 }))
    // 從上面看是橢圓：x 拉長 1.35 倍、z 縮成 0.8 倍（實物多半是這種長形）
    const SX = 1.35
    const SZ = 0.8
    lathe(b, [[0, -0.7], [0.78, -0.7], [0.9, -0.62], [0.96, -0.45], [0.97, -0.1], [0.95, 0.15], [0.88, 0.4], [0.74, 0.6], [0.5, 0.76], [0.22, 0.83], [0, 0.85]], dome, 'y', [0, 0, 0], 64).scale.set(SX, 1, SZ)
    const seam = b.shell(mat.dark())
    b.mesh(new THREE.TorusGeometry(0.975, 0.022, 8, 72), seam, [0, -0.12, 0], [R, 0, 0]).scale.set(SX, SZ, 1)
    feet(b, 2.5, 1.3, -0.76, 1.05, 0.48)
    // 接線盒：電源接頭在裡面；單相要接繼電器＋啟動電容＋運轉電容
    const tbox = mat.paint(0x111827)
    b.box(0.5, 0.42, 0.24, tbox, [0.35, -0.2, 0.8])
    b.box(0.42, 0.34, 0.03, mat.paint(0x374151), [0.35, -0.2, 0.93])
    nameplate(b, 0.97, -0.5, 0.15, SX, SZ)
    const cu = mat.copper()
    const stub = (angle: number, y: number, r: number, out: number) => {
      const c = Math.cos(angle)
      const s = Math.sin(angle)
      return b.tube([[0.8 * SX * c, y, 0.8 * SZ * s], [(0.8 * SX + out - 0.8) * c, y, (0.8 * SZ + out - 0.8) * s]], r, cu)
    }
    stub(0.45, 0.32, 0.085, 1.45) // 吸氣：最粗
    stub(-0.15, 0.4, 0.055, 1.4) // 排氣
    stub(1.0, 0.12, 0.04, 1.25) // 充灌：最細
    b.box(0.1, 0.03, 0.08, cu, [(0.8 * SX + 0.47) * Math.cos(1.0), 0.12, (0.8 * SZ + 0.47) * Math.sin(1.0)]).rotation.y = -1.0
    // 內部（剖開才看得到）
    const stator = mat.copper()
    b.mesh(new THREE.TorusGeometry(0.5, 0.15, 20, 48), stator, [0, 0.25, 0], [R, 0, 0])
    const rotor = mat.steel()
    b.cylY(0.28, 0.5, rotor, [0, 0.25, 0])
    b.cylY(0.06, 1.0, rotor, [0, -0.05, 0], 16)
    const block = mat.paint(0x6b7280)
    b.box(0.9, 0.28, 0.5, block, [0.15, -0.38, 0])
    const piston = mat.paint(0xf59e0b)
    b.cylX(0.15, 0.28, piston, [0.42, -0.38, 0.0], 24).userData.anim = { kind: 'slide', amp: 0.07, speed: 14 }
    b.note(dome, '鐵殼（全密閉）', '上下兩半銲死，拆不開；往復式比渦捲式矮')
    b.note(tbox, '接線盒', '電源接在這裡；單相要配繼電器＋啟動電容＋運轉電容')
    b.note(cu, '三支管', '粗的吸氣、細的排氣；第三支是充灌，跟低壓端相通〔錄音16 13:48〕')
    b.note(stator, '馬達線圈', '通電轉動，帶動曲軸')
    b.note(piston, '活塞', '來回把低壓氣體壓成高溫高壓（不能壓液體）')
    b.control = { kind: 'run', label: '往復式壓縮機', off: '停機', on: '運轉', initial: 0, needsCut: true, describe: (v) => (v > 0.5 ? '運轉中：馬達帶動活塞來回，把吸進來的低壓氣體壓成高壓。' : '停機：按「運轉」看活塞怎麼動。外型比渦捲式矮。') }
    return b.done()
  },

  /** 渦捲式壓縮機（10/13 做細）：高、瘦的鐵殼；排氣從頂上出去、吸氣在側邊；接線盒、油視窗、底座角座；剖開看兩片渦捲 */
  scroll() {
    const b = new Builder()
    const dome = b.shell(new THREE.MeshStandardMaterial({ color: 0x1b2536, metalness: 0.45, roughness: 0.38 }))
    lathe(b, [[0, -1.25], [0.5, -1.25], [0.6, -1.17], [0.63, -1.0], [0.63, 0.9], [0.6, 1.05], [0.5, 1.17], [0.3, 1.25], [0, 1.28]], dome, 'y', [0, 0, 0], 64)
    const seam = b.shell(mat.dark())
    for (const y of [0.92, -0.98]) b.mesh(new THREE.TorusGeometry(0.64, 0.02, 8, 64), seam, [0, y, 0], [R, 0, 0])
    feet(b, 1.4, 1.4, -1.3, 0.55, 0.55)
    const tbox = mat.paint(0x111827)
    b.box(0.42, 0.5, 0.2, tbox, [0, 0.3, 0.66])
    b.box(0.36, 0.44, 0.03, mat.paint(0x374151), [0, 0.3, 0.77])
    nameplate(b, 0.64, -Math.PI / 3, -0.2)
    const cu = mat.copper()
    // 排氣：頂上直直出去再轉彎；吸氣：側邊
    b.tube([[0, 1.2, 0], [0, 1.5, 0], [0.1, 1.62, 0], [0.6, 1.64, 0]], 0.06, cu)
    b.tube([[0.58 * Math.cos(0.35), 0.1, 0.58 * Math.sin(0.35)], [1.1 * Math.cos(0.35), 0.1, 1.1 * Math.sin(0.35)]], 0.085, cu)
    // 油視窗（老闆：渦捲本身有油視窗〔錄音16 11:11〕）
    const sightRing = mat.brass()
    const a = 0.9
    b.mesh(new THREE.TorusGeometry(0.11, 0.03, 12, 32), sightRing, [0.64 * Math.cos(a), -0.8, 0.64 * Math.sin(a)], [0, Math.PI / 2 - a, 0])
    b.mesh(new THREE.CircleGeometry(0.1, 32), mat.glass(), [0.645 * Math.cos(a), -0.8, 0.645 * Math.sin(a)], [0, Math.PI / 2 - a, 0])
    // 內部：兩片渦捲（群組轉 90°，群組的 z 軸＝直立方向；轉群組＝繞直軸轉）
    const spiral = (m: THREE.Material, phase: number, moving: boolean) => {
      const pts: V3[] = []
      for (let i = 0; i <= 120; i++) {
        const t = (i / 120) * Math.PI * 5 + phase
        const r = 0.05 + (i / 120) * 0.38
        pts.push([Math.cos(t) * r, Math.sin(t) * r, 0])
      }
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)))
      const wall = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.025, 8, false), m)
      wall.scale.set(1, 1, 4)
      const g = new THREE.Group()
      g.rotation.x = -R
      g.position.set(0, 0.7, 0)
      if (moving) wall.position.set(0.03, 0.02, 0)
      g.add(wall)
      if (moving) g.userData.anim = { kind: 'spin', speed: 6 }
      b.group.add(g)
    }
    const fixed = mat.steel()
    spiral(fixed, 0, false)
    const orbit = mat.paint(0xf59e0b)
    spiral(orbit, Math.PI, true)
    b.cylY(0.44, 0.04, fixed, [0, 0.84, 0])
    const stator = mat.copper()
    b.mesh(new THREE.TorusGeometry(0.38, 0.13, 20, 48), stator, [0, -0.3, 0], [R, 0, 0])
    b.cylY(0.21, 0.5, mat.steel(), [0, -0.3, 0])
    b.cylY(0.05, 1.3, mat.steel(), [0, 0.1, 0], 16)
    const oil = mat.fluid(0xd97706, 0.7)
    b.cylY(0.55, 0.25, oil, [0, -1.05, 0])
    b.note(dome, '鐵殼（全密閉）', '渦捲式比往復式高、瘦')
    b.note(orbit, '渦捲（會動）', '繞著固定的那片轉，把氣體往中間擠、越擠壓力越高')
    b.note(fixed, '渦捲（固定）', '中間的出口把高壓氣體送上去')
    b.note(sightRing, '油視窗', '看得到冷凍油還夠不夠〔錄音16 11:11〕')
    b.note(tbox, '接線盒', '單相只要一顆運轉電容、沒有繼電器')
    b.note(cu, '吸氣、排氣管', '吸氣在側邊；排氣從頂上出去，最燙')
    b.control = { kind: 'run', label: '渦捲式壓縮機', off: '停機', on: '運轉', initial: 0, needsCut: true, describe: (v) => (v > 0.5 ? '運轉中：上面那片渦捲繞著轉，把氣體一路擠到中間變成高壓。' : '停機：按「運轉」看上面的渦捲怎麼動。外型比往復式高、瘦。') }
    return b.done()
  },

  /** 散熱器（冷凝器，裸露型；10/13 做細）：鰭片排、兩端銅管 U 彎、側板、前面風扇＋護網、後面馬達、底腳 */
  cond() {
    const b = new Builder()
    const L = 2.2
    const H = 1.3
    const fin = b.shell(new THREE.MeshStandardMaterial({ color: 0xcfd8e3, metalness: 0.75, roughness: 0.3 }))
    finBlock(b, L, H, 0.36, 46, fin, [0, 0, -0.05])
    const tubeM = mat.copper()
    coilTubes(b, L, [-0.5, -0.25, 0, 0.25, 0.5], [-0.12, 0.02], tubeM)
    const frame = b.shell(new THREE.MeshStandardMaterial({ color: 0xb8c2cc, metalness: 0.6, roughness: 0.45 }))
    for (const x of [-L / 2 - 0.05, L / 2 + 0.05]) b.box(0.04, H + 0.12, 0.5, frame, [x, 0, -0.05])
    b.box(L + 0.14, 0.04, 0.5, frame, [0, H / 2 + 0.06, -0.05])
    b.box(L + 0.14, 0.04, 0.5, frame, [0, -H / 2 - 0.06, -0.05])
    for (const x of [-L / 2 + 0.1, L / 2 - 0.1]) b.box(0.18, 0.08, 0.7, frame, [x, -H / 2 - 0.12, -0.05])
    const guard = mat.dark()
    const blade = mat.paint(0x1f2937)
    fanGuard(b, 0.55, [0, 0, 0.35], guard, blade, 9)
    b.cylZ(0.17, 0.3, mat.paint(0x374151), [0, 0, 0.1], 24) // 風扇馬達
    b.note(fin, '散熱鰭片', '增加散熱面積；會積灰塵，要定期清洗')
    b.note(tubeM, '銅管', '冷媒在裡面放熱、凝結成液體；兩端是 U 彎')
    b.note(guard, '風扇＋護網', '把熱吹到室外；出風四、五十度以上')
    b.note(frame, '側板、底腳', '裸露型馬達露在外面，台語叫「無穿衫」')
    b.control = { kind: 'run', label: '風扇', off: '停', on: '運轉', initial: 0, describe: (v) => (v > 0.5 ? '風扇運轉：把冷媒放出來的熱吹到室外，出風四、五十度。' : '風扇停：熱排不出去，高壓會升高。') }
    return b.done()
  },

  /** 蒸發器（冷風機；10/13 做細）：老闆說冷排「是吊上去的，有吊桿」〔錄音16 27:10〕。白色外殼、前面兩組風扇＋導風圈＋護網、後面看得到鰭片、右端銅管 U 彎＋分液頭、底下接水盤＋排水管 */
  evap() {
    const b = new Builder()
    const L = 2.4
    const H = 0.8
    const D = 0.9
    const housing = b.shell(new THREE.MeshStandardMaterial({ color: 0xeef2f6, metalness: 0.15, roughness: 0.45 }))
    b.box(L, 0.04, D, housing, [0, H / 2, 0]) // 頂板
    b.box(L, H, 0.04, housing, [0, 0, D / 2]) // 前板（裝風扇）
    for (const x of [-L / 2, L / 2]) b.box(0.04, H, D, housing, [x, 0, 0]) // 兩端
    const fin = new THREE.MeshStandardMaterial({ color: 0xa9b4c2, metalness: 0.7, roughness: 0.35 })
    finBlock(b, L - 0.12, H - 0.12, 0.42, 48, fin, [0, 0, -0.12])
    const tubeM = mat.copper()
    coilTubes(b, L - 0.12, [-0.22, -0.07, 0.08, 0.23], [-0.24, -0.02], tubeM, true)
    const heater = mat.glow(0xef4444)
    b.cylX(0.022, L - 0.2, heater, [0, -0.3, -0.12], 12)
    b.cylX(0.022, L - 0.2, heater, [0, 0.15, -0.12], 12)
    // 右端：分液頭（膨脹閥出來分成好幾路）
    const brass = mat.brass()
    b.mesh(new THREE.ConeGeometry(0.06, 0.16, 20), brass, [L / 2 + 0.2, -0.05, -0.12], [0, 0, R])
    for (let i = 0; i < 4; i++) b.tube([[L / 2 + 0.12, -0.05, -0.12], [L / 2 + 0.08, -0.05 + (i - 1.5) * 0.1, -0.12 + 0.06], [L / 2 + 0.04, -0.22 + i * 0.15, -0.24]], 0.01, tubeM)
    // 前面兩組風扇：導風圈＋護網
    const guard = mat.dark()
    const blade = mat.paint(0x475569)
    for (const x of [-0.6, 0.6]) {
      b.mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.08, 40, 1, true), mat.paint(0xd7dde4), [x, 0, D / 2 + 0.04], [R, 0, 0]).material.side = THREE.DoubleSide
      fanGuard(b, 0.3, [x, 0, D / 2 + 0.09], guard, blade, 11)
    }
    // 接水盤（往排水口斜）＋排水管
    const pan = mat.steel()
    b.box(L + 0.04, 0.05, D + 0.02, pan, [0, -H / 2 - 0.04, 0])
    // 吊架；天花板和吊桿只有單獨看零件時才有（循環圖會拿掉）
    const rod = mat.steel()
    for (const x of [-0.95, 0.95]) b.box(0.08, 0.06, D, rod, [x, H / 2 + 0.05, 0])
    const ceiling = mat.paint(0xf1f5f9)
    // 吊桿短短一截：冷排貼近天花板（10/13 使用者：吊桿太長）
    const mount: THREE.Object3D[] = [b.box(3.0, 0.1, 1.4, ceiling, [0, 0.82, 0])]
    for (const x of [-0.95, 0.95]) for (const z of [-0.32, 0.32]) {
      mount.push(b.cylY(0.022, 0.36, rod, [x, 0.6, z], 12))
      mount.push(b.cylY(0.045, 0.05, rod, [x, 0.5, z], 6))
    }
    const drain = mat.paint(0xe5e7eb)
    mount.push(b.tube([[L / 2 - 0.2, -H / 2 - 0.06, 0.2], [L / 2 - 0.2, -H / 2 - 0.3, 0.2], [L / 2 + 0.3, -H / 2 - 0.4, 0.2], [L / 2 + 0.6, -H / 2 - 0.4, 0.2]], 0.05, drain))
    mount.forEach((o) => (o.userData.mountOnly = true))
    b.note(housing, '外殼', '吊在庫內最上面：冷空氣往下走〔錄音16 27:10〕')
    b.note(fin, '鰭片', '低溫庫間距大，預留結霜的風道空間')
    b.note(tubeM, '銅管、分液頭', '膨脹閥出來的冷媒分成好幾路，在銅管裡蒸發吸熱')
    b.note(heater, '除霜電熱管', '冷凍要除霜：電熱管把霜化成水')
    b.note(guard, '風扇＋護網', '把庫內空氣吹過冷排；除霜完先不轉（滴水時間）')
    b.note(pan, '接水盤', '除霜化的水從這裡排掉，排水管要有落差')
    b.note(rod, '吊桿', '冷排是吊上去的〔錄音16 27:10〕')
    b.control = { kind: 'run', label: '風扇', off: '停', on: '運轉', initial: 0, describe: (v) => (v > 0.5 ? '風扇運轉：把庫內的空氣吹過冷排，冷風再吹回庫內。' : '風扇停：庫內空氣不流動，冷不容易散開。') }
    return b.done()
  },

  /** 手閥（球閥；10/13 做細）：鍛造黃銅閥體（中間鼓起）、兩頭六角＋延長銅管、閥桿＋壓蓋螺帽、包紅色膠套的把手 */
  gbc() {
    const b = new Builder()
    const body = b.shell(mat.brass())
    lathe(b, [[0.24, -0.52], [0.32, -0.36], [0.4, -0.12], [0.41, 0], [0.4, 0.12], [0.32, 0.36], [0.24, 0.52]], body, 'x', [0, 0, 0], 48)
    b.hexX(0.3, 0.2, body, [-0.62, 0, 0])
    b.hexX(0.3, 0.2, body, [0.62, 0, 0])
    stubsX(b, 0.72, 0.1, 0.5)
    b.cylY(0.16, 0.24, body, [0, 0.42, 0], 32)
    const nutM = mat.steel()
    b.cylY(0.12, 0.08, nutM, [0, 0.58, 0], 6)
    const ball = mat.steel()
    b.mesh(new THREE.SphereGeometry(0.3, 32, 32), ball)
    const bore = mat.dark()
    const borePivot = b.pivot([b.cylX(0.13, 0.62, bore, [0, 0, 0], 24)], [0, 0, 0])
    const stem = mat.steel()
    b.cylY(0.07, 0.5, stem, [0, 0.45, 0], 16)
    const handle = mat.paint(0xdc2626)
    const lever = [rbox(b, 0.75, 0.07, 0.17, 0.03, handle, [0.42, 0.7, 0]), b.box(0.22, 0.05, 0.14, nutM, [0.05, 0.7, 0]), b.cylY(0.06, 0.06, nutM, [0, 0.76, 0], 6)]
    const handlePivot = b.pivot(lever, [0, 0.72, 0])
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

  /** 壓力開關（KP 15；10/13 做細）：藍色機殼、灰色前蓋＋螺絲、上面兩個設定軸和刻度窗、手動復歸鈕、側邊電線固定頭、底下兩個喇叭螺帽接壓力管 */
  kp15() {
    const b = new Builder()
    const housing = b.shell(new THREE.MeshStandardMaterial({ color: 0x1e40af, metalness: 0.2, roughness: 0.45 }))
    rbox(b, 1.2, 1.2, 0.62, 0.07, housing)
    const cover = b.shell(mat.paint(0x9ca3af))
    rbox(b, 1.1, 0.8, 0.05, 0.03, cover, [0, -0.15, 0.32])
    const screwM = mat.steel()
    for (const x of [-0.46, 0.46]) for (const y of [0.18, -0.48]) b.cylZ(0.035, 0.02, screwM, [x, y, 0.35], 16)
    // 刻度窗（白底黑線）
    const scale = mat.paint(0xf8fafc)
    const ink = mat.paint(0x111827)
    for (const x of [-0.3, 0.3]) {
      b.box(0.36, 0.16, 0.01, scale, [x, 0.42, 0.315])
      for (let i = 0; i < 7; i++) b.box(0.008, i % 3 === 0 ? 0.08 : 0.05, 0.005, ink, [x - 0.15 + i * 0.05, 0.4, 0.322])
    }
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
    for (const x of [-0.3, 0.3]) {
      b.cylY(0.09, 0.16, knob, [x, 0.68, 0], 24)
      b.box(0.12, 0.02, 0.02, ink, [x, 0.765, 0])
    }
    const reset = mat.paint(0x2563eb)
    b.cylY(0.06, 0.1, reset, [0.3, 0.66, 0.2], 20)
    b.cylX(0.09, 0.16, mat.dark(), [0.66, -0.2, 0], 20)
    b.tube([[0.74, -0.2, 0], [1.0, -0.3, 0.1], [1.3, -0.6, 0.2]], 0.04, mat.dark())
    const cap = mat.copper()
    const nutB = mat.brass()
    for (const x of [-0.3, 0.3]) {
      b.cylY(0.09, 0.12, nutB, [x, -0.68, 0], 6)
      b.tube([[x, -0.72, 0], [x, -0.95, 0], [x * 2.6, -1.15, 0]], 0.025, cap)
    }
    b.note(bellows, '感壓伸縮囊', '左邊接低壓、右邊接高壓，壓力變化會推動')
    b.note(contacts, '電氣接點', '壓力超出設定就斷電，讓壓縮機停機')
    b.note(knob, '設定軸＋刻度', '上面轉軸設定跳脫壓力，前面的刻度窗看設定值')
    b.note(reset, '復歸鈕', '高壓跳了要按一下才會再接通（手動復歸型）')
    b.note(cap, '壓力接管', '底下喇叭螺帽接到系統的低壓側和高壓側')
    return b.done()
  },

  /** 溫控器（10/13 做細）：黑色面框、紅色數字顯示 -18、四顆按鍵、後面灰色本體＋端子台、感溫棒 */
  tc() {
    const b = new Builder()
    const box = b.shell(mat.paint(0x9ca3af))
    rbox(b, 1.05, 0.5, 0.6, 0.04, box, [0, 0, -0.08])
    const bezel = mat.paint(0x111827)
    rbox(b, 1.25, 0.66, 0.1, 0.05, bezel, [0, 0, 0.27])
    const panel = mat.paint(0x1f2937)
    b.box(0.62, 0.3, 0.01, panel, [-0.2, 0.08, 0.325])
    const screen = mat.glow(0xef4444)
    // 7 段數字「-18」
    const seg = (cx: number, on: string) => {
      const W = 0.1
      const Hh = 0.09
      const parts: Record<string, [number, number, number, number]> = {
        a: [0, Hh, W, 0.018], d: [0, -Hh, W, 0.018], g: [0, 0, W, 0.018],
        b: [W / 2, Hh / 2, 0.018, Hh], c: [W / 2, -Hh / 2, 0.018, Hh], e: [-W / 2, -Hh / 2, 0.018, Hh], f: [-W / 2, Hh / 2, 0.018, Hh],
      }
      for (const k of on) {
        const [x, y, w, h] = parts[k]
        b.box(w, h, 0.006, screen, [cx + x, 0.08 + y, 0.332])
      }
    }
    seg(-0.38, 'g')
    seg(-0.22, 'bc')
    seg(-0.06, 'abcdefg')
    const btn = mat.paint(0x4b5563)
    for (let i = 0; i < 4; i++) rbox(b, 0.11, 0.08, 0.04, 0.015, btn, [0.24 + (i % 2) * 0.15, 0.1 - Math.floor(i / 2) * 0.13, 0.33])
    const board = mat.paint(0x15803d)
    b.box(0.95, 0.4, 0.03, board, [0, 0, -0.1])
    const term = mat.paint(0x16a34a)
    b.box(0.9, 0.16, 0.12, term, [0, -0.12, -0.42])
    for (let i = 0; i < 8; i++) b.cylZ(0.025, 0.02, mat.steel(), [-0.38 + i * 0.11, -0.12, -0.49], 12)
    const cable = mat.dark()
    b.tube([[0.4, -0.15, -0.45], [0.8, -0.4, -0.3], [1.2, -0.45, 0.1], [1.4, -0.4, 0.3]], 0.03, cable)
    const probe = mat.steel()
    b.cylX(0.05, 0.45, probe, [1.6, -0.4, 0.3], 16)
    b.note(screen, '顯示幕', '顯示庫內溫度、設定值')
    b.note(probe, '感溫棒', '放在庫內，感應溫度')
    b.note(board, '控制電路', '到設定溫度就讓壓縮機停；溫差一般抓 4°C')
    b.note(btn, '按鍵', '設定溫度、溫差、除霜時間')
    b.note(term, '端子台', '後面接電源、壓縮機、除霜、風扇的線')
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
