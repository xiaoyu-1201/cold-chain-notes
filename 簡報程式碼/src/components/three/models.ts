import * as THREE from 'three'

/**
 * 零件 3D 示意模型（以基本幾何組合，重點在看懂內部構造，不是精確外型）
 * 外殼材質放進 shells：開啟「剖開」時會被切掉前半，露出內部零件。
 */

export type Part3DId = 'comp' | 'cond' | 'txv' | 'evap' | 'oub' | 'kp15' | 'receiver' | 'gbc' | 'dml' | 'sgi' | 'evr' | 'tc' | 'acc'

export interface LegendItem {
  color: string
  name: string
  desc: string
}

export interface PartModel {
  group: THREE.Group
  shells: THREE.Material[]
  legend: LegendItem[]
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
  done(): PartModel {
    return { group: this.group, shells: this.shells, legend: this.legend }
  }
}

/** 管線接頭：本體兩側的銅管 */
function stubsX(b: Builder, half: number, r = 0.11, len = 0.5) {
  const cu = mat.copper()
  b.cylX(r, len, cu, [-half - len / 2, 0, 0], 24)
  b.cylX(r, len, cu, [half + len / 2, 0, 0], 24)
  return cu
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
    b.note(ring, '含水指示環', '系統含水時會變色（顏色依品牌），很多人不知道')
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
    const nut = mat.brass()
    b.hexX(0.2, 0.22, nut, [-1.28, 0, 0])
    b.hexX(0.2, 0.22, nut, [1.28, 0, 0])
    stubsX(b, 1.39, 0.09, 0.35)
    const core = mat.paint(0xe8d9b0)
    b.cylX(0.38, 1.3, core)
    const screen = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.4, wireframe: true })
    b.cylX(0.42, 0.04, screen, [-0.72, 0, 0], 24)
    b.cylX(0.42, 0.04, screen, [0.72, 0, 0], 24)
    b.note(core, '分子篩（乾燥劑）', '吸走系統裡的水分；水會結冰把管路塞住')
    b.note(screen, '濾網', '擋住雜質、焊渣，保護膨脹閥')
    b.note(shellM, '銅殼', '裝在液管上；系統打開過就要換新')
    b.note(nut, '喇叭口接頭', '有的是喇叭口、有的是焊接型')
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
    b.cylY(0.09, 0.36, plunger, [0, 0.42, 0], 24)
    const springM = mat.glow(0xf59e0b)
    b.spring(0.07, 0.24, 6, 0.012, springM, [0, 0.62, 0])
    const seat = mat.paint(0xef4444)
    b.cylY(0.12, 0.05, seat, [0, 0.2, 0], 24)
    const flow = mat.fluid(0x38bdf8, 0.45)
    b.cylX(0.12, 1.1, flow, [0, 0.02, 0])
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
    b.cylY(0.4, 0.03, diaphragm, [0, 0.42, 0])
    const capillary = mat.copper()
    b.tube([[0, 0.53, 0], [0, 0.9, 0], [0.6, 1.05, 0.2], [1.3, 0.8, 0.3], [1.6, 0.3, 0.3]], 0.025, capillary)
    const bulb = mat.copper()
    b.cylY(0.1, 0.7, bulb, [1.6, -0.05, 0.3], 24)
    const pin = mat.steel()
    b.cylY(0.035, 0.45, pin, [0, 0.12, 0], 16)
    const needle = mat.paint(0xef4444)
    b.mesh(new THREE.ConeGeometry(0.08, 0.16, 24), needle, [0, -0.15, 0], [Math.PI, 0, 0])
    const springM = mat.glow(0xf59e0b)
    b.spring(0.1, 0.22, 5, 0.014, springM, [0, -0.5, 0])
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
    b.cylX(0.13, 0.62, bore, [0, 0, 0], 24)
    const stem = mat.steel()
    b.cylY(0.07, 0.5, stem, [0, 0.45, 0], 16)
    const handle = mat.paint(0xef4444)
    b.box(0.9, 0.08, 0.16, handle, [0.3, 0.72, 0])
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
    for (let i = 0; i < 6; i++) b.mesh(new THREE.TorusGeometry(0.16, 0.04, 12, 32), bellows, [0.3, -0.35 + i * 0.07, 0], [R, 0, 0])
    const contacts = mat.glow(0xf59e0b)
    b.box(0.5, 0.08, 0.2, contacts, [0, 0.25, 0])
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
}

export function buildPart(id: Part3DId): PartModel {
  return builders[id]()
}
