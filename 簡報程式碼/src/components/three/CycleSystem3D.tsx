import { Minus, Play, Plus, Power, RotateCcw, Scan } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { CycleNodeId } from '../../data/cycleNotes'
import type { FaultFx, PipeMode } from '../../data/faults'
import { cn } from '../../lib/cn'
import { buildPart, type Part3DId } from './models'
import { acquireRenderer, releaseRenderer } from './rendererPool'

type V3 = [number, number, number]
type PipeId = 'discharge' | 'liquid' | 'mixture' | 'suction'
/** 名稱標籤放哪一側：上（預設）、下、左、右 */
type Side = 't' | 'b' | 'l' | 'r'

/**
 * 零件擺位（依老闆 10/2 看 3D 後的修正〔錄音07 00:51～03:30〕）：
 * - 冷凝器「上進下出」：高溫氣體從上面進去，液體從下面出來
 * - 儲液器要「進去再出來」：液管先進儲液器上方、從底部取液出來，不是從旁邊經過
 * - 膨脹閥裝在蒸發器旁邊（很多做「內膨」，鎖在蒸發器箱子裡，因為會結冰滴水）；電磁閥拉到膨脹閥前面
 */
const PLACEMENTS: { id: Part3DId; pos: V3; scale: number; rotZ?: number; label: string; major?: boolean; side?: Side }[] = [
  { id: 'cond', pos: [0, 1.9, 0], scale: 0.85, label: '② 冷凝器', major: true },
  { id: 'evap', pos: [0.4, -1.9, 0], scale: 0.85, label: '④ 蒸發器', major: true },
  { id: 'comp', pos: [3.2, 0, 0], scale: 0.55, label: '① 壓縮機', major: true, side: 'l' },
  { id: 'txv', pos: [-1.55, -1.9, 0], scale: 0.34, label: '③ 膨脹閥', major: true },
  { id: 'receiver', pos: [-1.75, 1.8, 0], scale: 0.24, label: '儲液器', side: 'l' },
  { id: 'gbc', pos: [-3.2, 0.75, 0], scale: 0.24, rotZ: Math.PI / 2, label: '手閥', side: 'r' },
  { id: 'dml', pos: [-3.2, 0.2, 0], scale: 0.2, rotZ: Math.PI / 2, label: '乾燥過濾器', side: 'r' },
  { id: 'sgi', pos: [-3.2, -0.35, 0], scale: 0.24, rotZ: Math.PI / 2, label: '視液鏡', side: 'r' },
  { id: 'evr', pos: [-2.55, -1.9, 0], scale: 0.22, label: '電磁閥', side: 'b' },
  { id: 'tc', pos: [-4.45, 0.55, 0], scale: 0.3, label: '溫控器' },
  { id: 'oub', pos: [3.2, 1.3, 0], scale: 0.24, label: '油分離器', side: 'l' },
  { id: 'kp15', pos: [4.45, 0.15, 0], scale: 0.3, label: '壓力開關' },
  { id: 'acc', pos: [3.2, -1.3, 0], scale: 0.24, label: '液氣分離器', side: 'l' },
]

/** 四段管路（依冷媒流向）＋顏色＋狀態標籤（標在管路外側） */
const PIPES: { id: PipeId; color: number; points: V3[]; label: string; labelPos: V3; side: Side }[] = [
  // 從冷凝器上方進去
  { id: 'discharge', color: 0xf87171, points: [[3.2, 0.75, 0], [3.2, 2.3, 0], [1.08, 2.3, 0]], label: '高溫高壓氣態', labelPos: [3.42, 1.75, 0], side: 'r' },
  // 冷凝器下方出來 → 繞上去從儲液器上方進去 → 底部出來 → 沿左邊往下 → 走到蒸發器旁的膨脹閥
  {
    id: 'liquid',
    color: 0xfbbf24,
    points: [[-1.08, 1.5, 0], [-1.4, 1.5, 0], [-1.4, 2.32, 0], [-1.75, 2.32, 0], [-1.75, 1.15, 0], [-3.2, 1.15, 0], [-3.2, -1.9, 0], [-1.86, -1.9, 0]],
    label: '中溫中壓液態',
    labelPos: [-3.42, -0.9, 0],
    side: 'l',
  },
  { id: 'mixture', color: 0x5eead4, points: [[-1.24, -1.9, 0], [-0.55, -1.9, 0]], label: '液氣混合', labelPos: [-1.3, -2.15, 0], side: 'b' },
  { id: 'suction', color: 0x38bdf8, points: [[1.35, -1.9, 0], [3.2, -1.9, 0], [3.2, -0.75, 0]], label: '低溫低壓氣態', labelPos: [3.42, -1.6, 0], side: 'r' },
]

/** 啟動後的導覽：冷媒從壓縮機出發，一段一段跑完一圈 */
const STAGES: { node: CycleNodeId; title: string; text: string }[] = [
  { node: 'comp', title: '① 壓縮機啟動', text: '把低溫低壓氣體壓成高溫高壓氣體' },
  { node: 'discharge', title: '高壓氣管', text: '高溫高壓氣體從壓縮機流到冷凝器；管子接近 100°C，不能摸' },
  { node: 'cond', title: '② 冷凝器放熱', text: '冷媒上進下出；風扇把熱吹到室外，冷媒凝結成液體，出口摸起來是溫的' },
  { node: 'liquid', title: '液管', text: '液態冷媒先進儲液器再出來，經過乾燥過濾器、視液鏡、電磁閥，流到膨脹閥' },
  { node: 'txv', title: '③ 膨脹閥降壓', text: '膨脹閥裝在蒸發器旁；液態冷媒擠過小孔，壓力和溫度一起下降' },
  { node: 'mixture', title: '液氣混合段', text: '低溫的液氣混合冷媒流進蒸發器' },
  { node: 'evap', title: '④ 蒸發器吸熱', text: '冷媒蒸發，吸走庫內的熱；風扇吹出冷風' },
  { node: 'suction', title: '吸氣管', text: '低溫低壓氣體回到壓縮機，開始下一圈' },
]
const STAGE_SEC = 2.6
/** 每段管路在第幾步灌滿冷媒 */
const PIPE_STAGE: Record<PipeId, number> = { discharge: 1, liquid: 3, mixture: 5, suction: 7 }
const TUBE_SEG = 120
const TUBE_RAD = 16

type Phase = 'off' | 'tour' | 'on'

interface Props {
  selected: CycleNodeId | null
  onSelect: (id: CycleNodeId | null) => void
  cut: boolean
  /** 手機版：字小一點 */
  compact?: boolean
  /** 故障模擬：目前這一步要演的狀態（null＝一般模式） */
  fault?: FaultFx | null
  /** 故障模擬的名稱（控制列顯示） */
  faultLabel?: string
  onExitFault?: () => void
}

interface Api {
  setSelected: (id: CycleNodeId | null) => void
  setCut: (c: boolean) => void
  setFault: (fx: FaultFx | null) => void
  start: () => void
  stop: () => void
  skip: () => void
  /** 回到全覽 */
  home: () => void
  /** 放大（f < 1）或縮小（f > 1） */
  zoom: (f: number) => void
}

/** 整套冷凍循環 3D：按「啟動」看冷媒跑一圈；故障模擬演出拿掉零件的後果；零件可點選、可剖開 */
export default function CycleSystem3D({ selected, onSelect, cut, compact = false, fault = null, faultLabel, onExitFault }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const selectRef = useRef(onSelect)
  selectRef.current = onSelect
  const api = useRef<Api | null>(null)
  const [phase, setPhase] = useState<Phase>('off')
  const [stage, setStage] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const stateRef = useRef({ setPhase, setStage, setZoomed })

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const pooled = acquireRenderer()
    const { renderer } = pooled
    host.appendChild(renderer.domElement)

    const labels = new CSS2DRenderer()
    labels.domElement.style.position = 'absolute'
    labels.domElement.style.inset = '0'
    labels.domElement.style.pointerEvents = 'none'
    host.appendChild(labels.domElement)

    const scene = new THREE.Scene()
    scene.environment = pooled.env
    const key = new THREE.DirectionalLight(0xffffff, 1.1)
    key.position.set(3, 6, 6)
    scene.add(key, new THREE.AmbientLight(0xffffff, 0.3))

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    camera.position.set(0, 1.5, 12.5)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.minDistance = 2.2
    controls.maxDistance = 26
    controls.maxPolarAngle = Math.PI * 0.75
    // 滾輪往游標的位置放大；右鍵（觸控：雙指）拖曳＝平移
    controls.zoomToCursor = true
    controls.screenSpacePanning = true

    /** 零件的材質（記住原本的發光，取消高亮時還原） */
    const partMats = new Map<CycleNodeId, { m: THREE.MeshStandardMaterial; emissive: number; intensity: number }[]>()
    const centers = new Map<CycleNodeId, THREE.Vector3>()
    const pipeMats = new Map<PipeId, { fill: THREE.MeshStandardMaterial; empty: THREE.MeshStandardMaterial }>()
    const shells: THREE.Material[] = []
    const pickables: THREE.Object3D[] = []
    const moving: { o: THREE.Object3D; kind: 'spin' | 'slide'; speed: number; amp: number; base: number; part: Part3DId }[] = []
    const holders = new Map<Part3DId, THREE.Object3D>()

    const makeLabel = (text: string, id: CycleNodeId | null, major: boolean, tone?: string) => {
      const el = document.createElement('div')
      el.textContent = text
      const size = major ? (compact ? 15 : 21) : compact ? 13 : 16
      el.style.cssText = [
        'pointer-events:auto',
        `cursor:${id ? 'pointer' : 'default'}`,
        `font:${major ? 700 : 600} ${size}px system-ui, sans-serif`,
        `color:${tone ?? (major ? '#f8fafc' : '#bae6fd')}`,
        'padding:2px 8px',
        'border-radius:999px',
        `background:${major ? 'rgba(13,17,23,0.78)' : 'rgba(13,17,23,0.6)'}`,
        'white-space:nowrap',
        'user-select:none',
      ].join(';')
      if (id)
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          selectRef.current(id)
        })
      return new CSS2DObject(el)
    }
    /** 依側邊放標籤：左右側的標籤貼齊零件邊緣，不會蓋到管線上的其他零件 */
    const placeLabel = (label: CSS2DObject, pos: V3, half: THREE.Vector3, side: Side, gap: number) => {
      if (side === 'l') {
        label.position.set(pos[0] - half.x - gap, pos[1], 0)
        label.center.set(1, 0.5)
      } else if (side === 'r') {
        label.position.set(pos[0] + half.x + gap, pos[1], 0)
        label.center.set(0, 0.5)
      } else if (side === 'b') {
        label.position.set(pos[0], pos[1] - half.y - gap, 0)
        label.center.set(0.5, 0)
      } else label.position.set(pos[0], pos[1] + half.y + gap, 0)
      scene.add(label)
    }

    // 零件
    for (const p of PLACEMENTS) {
      const model = buildPart(p.id)
      const box = new THREE.Box3().setFromObject(model.group)
      model.group.position.sub(box.getCenter(new THREE.Vector3()))
      const holder = new THREE.Group()
      holder.add(model.group)
      holder.scale.setScalar(p.scale)
      holder.position.set(...p.pos)
      if (p.rotZ) holder.rotation.z = p.rotZ
      holder.userData.nodeId = p.id
      scene.add(holder)
      holders.set(p.id, holder)
      shells.push(...model.shells)
      const mats: { m: THREE.MeshStandardMaterial; emissive: number; intensity: number }[] = []
      holder.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
        if (m && 'emissive' in m && !mats.some((x) => x.m === m)) mats.push({ m, emissive: m.emissive.getHex(), intensity: m.emissiveIntensity })
        const anim = o.userData.anim as { kind: 'spin' | 'slide'; speed: number; amp?: number } | undefined
        if (anim) moving.push({ o, kind: anim.kind, speed: anim.speed, amp: anim.amp ?? 0, base: anim.kind === 'slide' ? o.position.x : o.rotation.z, part: p.id })
      })
      partMats.set(p.id, mats)
      centers.set(p.id, new THREE.Vector3(...p.pos))
      pickables.push(holder)
      const half = new THREE.Box3().setFromObject(holder).getSize(new THREE.Vector3()).multiplyScalar(0.5)
      placeLabel(makeLabel(p.label, p.id, !!p.major), p.pos, half, p.side ?? 't', p.major ? 0.24 : 0.12)
    }

    // 管路：底下一條灰色空管，上面一條彩色管＝冷媒，啟動後沿流向慢慢灌滿
    const pipes: { id: PipeId; curve: THREE.CurvePath<THREE.Vector3>; fill: THREE.TubeGeometry; dots: THREE.Mesh[]; front: THREE.Mesh }[] = []
    for (const pipe of PIPES) {
      const curve = new THREE.CurvePath<THREE.Vector3>()
      for (let i = 0; i < pipe.points.length - 1; i++) curve.add(new THREE.LineCurve3(new THREE.Vector3(...pipe.points[i]), new THREE.Vector3(...pipe.points[i + 1])))
      const empty = new THREE.MeshStandardMaterial({ color: 0x4b5563, emissive: pipe.color, emissiveIntensity: 0, metalness: 0.5, roughness: 0.45 })
      const emptyTube = new THREE.Mesh(new THREE.TubeGeometry(curve, TUBE_SEG, 0.075, TUBE_RAD, false), empty)
      const fillMat = new THREE.MeshStandardMaterial({ color: pipe.color, emissive: pipe.color, emissiveIntensity: 0.1, metalness: 0.1, roughness: 0.5 })
      const fillGeo = new THREE.TubeGeometry(curve, TUBE_SEG, 0.085, TUBE_RAD, false)
      fillGeo.setDrawRange(0, 0)
      const fillTube = new THREE.Mesh(fillGeo, fillMat)
      emptyTube.userData.nodeId = fillTube.userData.nodeId = pipe.id
      scene.add(emptyTube, fillTube)
      pickables.push(emptyTube)
      centers.set(pipe.id, curve.getPointAt(0.5))
      pipeMats.set(pipe.id, { fill: fillMat, empty })
      const dotMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: pipe.color, emissiveIntensity: 1.2 })
      const dots = Array.from({ length: 7 }, () => {
        const d = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), dotMat)
        d.visible = false
        scene.add(d)
        return d
      })
      const front = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }))
      front.visible = false
      scene.add(front)
      pipes.push({ id: pipe.id, curve, fill: fillGeo, dots, front })
      placeLabel(makeLabel(pipe.label, pipe.id, false, `#${new THREE.Color(pipe.color).getHexString()}`), pipe.labelPos, new THREE.Vector3(), pipe.side, 0)
    }
    const heatOut = makeLabel('放熱 → 室外', null, false, '#fca5a5')
    heatOut.position.set(0, 3.4, 0)
    const heatIn = makeLabel('吸熱 ← 庫內', null, false, '#7dd3fc')
    heatIn.position.set(0.4, -3.3, 0)
    scene.add(heatOut, heatIn)

    // 熱氣（冷凝器上方往上飄）與冷風（蒸發器下方往下吹）
    const puffs = (n: number, color: number, xs: [number, number][], y0: number, y1: number) =>
      Array.from({ length: n }, (_, i) => {
        const [a, b] = xs[i % xs.length]
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false }))
        mesh.visible = false
        scene.add(mesh)
        return { mesh, x: a + Math.random() * (b - a), z: -0.15 + Math.random() * 0.5, phase: Math.random(), y0, y1 }
      })
    const hot = puffs(18, 0xfca5a5, [[-1.0, 1.0]], 2.55, 3.2)
    const cold = puffs(16, 0x93c5fd, [[-0.6, 0.2], [0.6, 1.4]], -2.3, -3.0)

    // ── 故障模擬用的物件 ──
    const tag = (bg: string) => {
      const o = makeLabel('', null, true, '#fff')
      o.element.style.background = bg
      o.element.style.boxShadow = '0 6px 20px -6px rgba(0,0,0,0.6)'
      o.visible = false
      scene.add(o)
      return o
    }
    const removedTag = tag('rgba(220,38,38,0.92)')
    const alarmTag = tag('rgba(220,38,38,0.92)')
    alarmTag.center.set(0.5, 1.6)
    // 膨脹閥入口結冰：一團白色冰晶
    const ice = new THREE.Group()
    const iceMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, emissive: 0xbae6fd, emissiveIntensity: 0.35, roughness: 0.2, transparent: true, opacity: 0.92 })
    for (let i = 0; i < 9; i++) {
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07 + Math.random() * 0.07, 0), iceMat)
      c.position.set((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3)
      ice.add(c)
    }
    ice.position.set(-1.92, -1.9, 0.05)
    ice.visible = false
    scene.add(ice)
    // 冷凍油：琥珀色油滴沿著整圈跑（穿過零件內部）
    const loop = new THREE.CurvePath<THREE.Vector3>()
    PIPES.forEach((p, i) => {
      for (let k = 0; k < p.points.length - 1; k++) loop.add(new THREE.LineCurve3(new THREE.Vector3(...p.points[k]), new THREE.Vector3(...p.points[k + 1])))
      const next = PIPES[(i + 1) % PIPES.length].points[0]
      loop.add(new THREE.LineCurve3(new THREE.Vector3(...p.points[p.points.length - 1]), new THREE.Vector3(...next)))
    })
    const oilMat = new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0xf59e0b, emissiveIntensity: 0.9, roughness: 0.3 })
    const oil = Array.from({ length: 10 }, () => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), oilMat)
      m.visible = false
      scene.add(m)
      return m
    })
    // 管內流動的特殊樣子：液體（琥珀）、氣泡（白、大顆）
    const liquidDot = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 1 })
    const bubbleDot = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6, transparent: true, opacity: 0.85 })
    const baseDot = new Map(pipes.map((p) => [p.id, p.dots[0].material as THREE.MeshStandardMaterial]))
    let fx: FaultFx | null = null
    const dischargeBase = new THREE.Color(0xf87171)
    const overheatColor = new THREE.Color(0xff1f1f)

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
    const setCut = (c: boolean) =>
      shells.forEach((m) => {
        m.clippingPlanes = c ? [plane] : []
        m.side = c ? THREE.DoubleSide : THREE.FrontSide
        m.needsUpdate = true
      })

    let selectedId: CycleNodeId | null = null
    let phase: Phase = 'off'
    let runStart = 0
    let shownStage = -1
    const clock = new THREE.Clock()
    const setPhaseBoth = (p: Phase) => {
      phase = p
      stateRef.current.setPhase(p)
    }

    // 鏡頭：平常由使用者自己縮放／平移；雙擊零件或按按鈕時，平滑飛過去
    const homePos = new THREE.Vector3(0, 1.5, 12.5)
    let atHome = true
    let fly: { p0: THREE.Vector3; t0: THREE.Vector3; p1: THREE.Vector3; t1: THREE.Vector3; start: number } | null = null
    const FLY_SEC = 0.7
    const markZoomed = (z: boolean) => {
      if (atHome !== z) return
      atHome = !z
      stateRef.current.setZoomed(z)
    }
    const flyTo = (target: THREE.Vector3, pos: THREE.Vector3) => {
      fly = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target.clone(), start: clock.getElapsedTime() }
    }
    const home = () => {
      flyTo(new THREE.Vector3(), homePos.clone())
      markZoomed(false)
    }
    const zoom = (f: number) => {
      const dir = camera.position.clone().sub(controls.target)
      const len = THREE.MathUtils.clamp(dir.length() * f, controls.minDistance, controls.maxDistance)
      flyTo(controls.target, controls.target.clone().add(dir.setLength(len)))
      markZoomed(true)
    }
    /** 飛到某個零件前面：保持目前的觀看角度，只拉近距離 */
    const flyToNode = (id: CycleNodeId) => {
      const c = centers.get(id)
      if (!c) return
      const holder = holders.get(id as Part3DId)
      const size = holder ? new THREE.Box3().setFromObject(holder).getSize(new THREE.Vector3()).length() : 1.6
      const dir = camera.position.clone().sub(controls.target).normalize()
      flyTo(c, c.clone().add(dir.multiplyScalar(THREE.MathUtils.clamp(size * 2.6, 2.6, 6))))
      markZoomed(true)
    }
    controls.addEventListener('start', () => {
      fly = null
      markZoomed(true)
    })
    api.current = {
      setSelected: (id) => (selectedId = id),
      setCut,
      setFault: (f) => {
        fx = f
        if (f) ice.scale.setScalar(0.01)
      },
      start: () => {
        runStart = clock.getElapsedTime()
        shownStage = -1
        setPhaseBoth('tour')
      },
      stop: () => setPhaseBoth('off'),
      skip: () => {
        runStart = clock.getElapsedTime() - STAGES.length * STAGE_SEC
      },
      home,
      zoom,
    }

    // 點選（拖曳不算點選）
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let down: { x: number; y: number } | null = null
    const pick = (e: MouseEvent): CycleNodeId | null => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(pickables, true)[0]
      let o: THREE.Object3D | null = hit?.object ?? null
      while (o && !o.userData.nodeId) o = o.parent
      return (o?.userData.nodeId as CycleNodeId | undefined) ?? null
    }
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY }
    }
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return
      const id = pick(e)
      if (id) selectRef.current(id)
    }
    const onMove = (e: PointerEvent) => {
      if (e.buttons) return
      renderer.domElement.style.cursor = pick(e) ? 'pointer' : 'grab'
    }
    // 雙擊零件＝飛過去放大；雙擊空白處＝回到全覽
    const onDbl = (e: MouseEvent) => {
      const id = pick(e)
      if (id) flyToNode(id)
      else home()
    }
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointerup', onUp)
    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('dblclick', onDbl)

    const resize = () => {
      const w = Math.max(host.clientWidth, 1)
      const h = Math.max(host.clientHeight, 1)
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      labels.setSize(w, h)
      camera.aspect = w / h
      // 高度要放得下上下的標籤（約 7.4 單位），寬度要放得下左右的標籤（約 11.4 單位）
      const span = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      homePos.setLength(Math.max(7.4 / span, 11.4 / (span * camera.aspect)))
      if (atHome && !fly) camera.position.copy(homePos)
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
    let raf = 0
    let last = 0
    const tick = () => {
      const t = clock.getElapsedTime()
      const dt = Math.min(t - last, 0.05)
      last = t
      // 進度：導覽中是第幾步；全部跑完就切成「運轉中」
      const e = phase === 'off' ? -1 : t - runStart
      const step = phase === 'off' ? -1 : Math.floor(e / STAGE_SEC)
      if (phase === 'tour' && step >= STAGES.length) setPhaseBoth('on')
      const touring = phase === 'tour' && step < STAGES.length
      if (touring && step !== shownStage) {
        shownStage = step
        stateRef.current.setStage(step)
      }
      const reached = (s: number) => phase !== 'off' && e >= s * STAGE_SEC
      // 故障模擬時，以這一步的設定為準（沒寫＝正常運轉）
      const compOn = fx ? (fx.compOn ?? true) : reached(0)
      const condOn = fx ? (fx.condFan ?? true) : reached(2)
      const evapOn = fx ? (fx.evapFan ?? true) : reached(6)
      const hotOn = fx ? (fx.hotPuffs ?? condOn) : condOn
      const coldOn = fx ? (fx.coldPuffs ?? evapOn) : evapOn

      // 管路灌冷媒＋流動光點
      for (const p of pipes) {
        const s = PIPE_STAGE[p.id]
        const prog = fx ? 1 : phase === 'off' ? 0 : clamp01((e - s * STAGE_SEC) / (STAGE_SEC * 0.9))
        p.fill.setDrawRange(0, Math.floor(prog * TUBE_SEG) * TUBE_RAD * 6)
        p.front.visible = prog > 0 && prog < 1
        if (p.front.visible) p.front.position.copy(p.curve.getPointAt(prog))
        const full = prog >= 1
        const mode: PipeMode = fx?.flow?.[p.id] ?? 'on'
        // 液體在管裡是慢慢流；氣泡大顆；供液不穩只剩零星幾顆
        const speed = mode === 'liquid' ? 0.07 : 0.22
        p.dots.forEach((d, i) => {
          const show = full && mode !== 'off' && !(mode === 'weak' && i % 3 !== 0)
          d.visible = show
          if (!show) return
          const bubble = mode === 'bubbles' && i % 2 === 1
          d.material = mode === 'liquid' ? liquidDot : bubble ? bubbleDot : baseDot.get(p.id)!
          d.scale.setScalar(bubble ? 1.7 : mode === 'liquid' ? 1.15 : 1)
          d.position.copy(p.curve.getPointAt((i / p.dots.length + t * speed) % 1))
        })
      }

      // 故障模擬：拿掉的零件、警示、結冰、冷凍油
      holders.forEach((h, id) => (h.visible = id !== fx?.removed))
      removedTag.visible = !!fx?.removed
      if (fx?.removed) {
        removedTag.element.textContent = '✕ 拿掉了'
        removedTag.position.copy(centers.get(fx.removed)!)
      }
      alarmTag.visible = !!fx?.alarm
      if (fx?.alarm) {
        alarmTag.element.textContent = `⚠ ${fx.alarm.text}`
        alarmTag.element.style.background = fx.alarm.tone === 'red' ? 'rgba(220,38,38,0.92)' : 'rgba(217,119,6,0.92)'
        alarmTag.element.style.opacity = String(0.75 + 0.25 * Math.sin(t * 6))
        alarmTag.position.copy(centers.get(fx.alarm.at)!)
      }
      ice.visible = !!fx?.ice
      if (ice.visible) ice.scale.lerp(new THREE.Vector3(1, 1, 1), 0.04)
      oil.forEach((m, i) => {
        m.visible = !!fx?.oil
        if (m.visible) m.position.copy(loop.getPointAt((i / oil.length + t * 0.06) % 1))
      })
      const heat = fx?.overheat ?? 0
      const dm = pipeMats.get('discharge')!.fill
      dm.color.copy(dischargeBase).lerp(overheatColor, heat)
      dm.emissive.copy(dm.color)

      // 會動的零件：壓縮機震動＋活塞、冷凝器／蒸發器風扇
      for (const m of moving) {
        const on = m.part === 'comp' ? compOn : m.part === 'cond' ? condOn : m.part === 'evap' ? evapOn : false
        if (!on) continue
        if (m.kind === 'spin') m.o.rotation.z += m.speed * dt
        else m.o.position.x = m.base + Math.sin(t * m.speed) * m.amp
      }
      const comp = holders.get('comp')
      if (comp) {
        comp.position.x = 3.2 + (compOn ? Math.sin(t * 70) * 0.012 : 0)
        comp.position.y = compOn ? Math.cos(t * 63) * 0.008 : 0
      }
      for (const [list, on] of [
        [hot, hotOn],
        [cold, coldOn],
      ] as const) {
        for (const q of list) {
          q.mesh.visible = on
          if (!on) continue
          const u = (t * 0.5 + q.phase) % 1
          q.mesh.position.set(q.x + Math.sin((u + q.phase) * 6) * 0.06, q.y0 + (q.y1 - q.y0) * u, q.z)
          ;(q.mesh.material as THREE.MeshBasicMaterial).opacity = Math.sin(Math.PI * u) * 0.85
        }
      }

      // 高亮：警示＝紅／橘閃爍；選取＝琥珀色；導覽中的這一步（或故障模擬的焦點）＝藍色呼吸光
      const stageNode = fx ? (fx.focus ?? null) : touring ? STAGES[step].node : null
      const pulse = 0.5 + 0.5 * Math.sin(t * 5)
      const alarmAt = fx?.alarm?.at ?? (heat >= 0.8 ? 'comp' : null)
      partMats.forEach((mats, id) => {
        const sel = id === selectedId
        const cur = id === stageNode
        const warn = id === alarmAt
        for (const x of mats) {
          if (warn) {
            x.m.emissive.setHex(fx?.alarm?.tone === 'amber' ? 0xf59e0b : 0xef4444)
            x.m.emissiveIntensity = 0.25 + 0.4 * pulse
          } else if (sel) {
            x.m.emissive.setHex(0xfbbf24)
            x.m.emissiveIntensity = 0.35
          } else if (cur) {
            x.m.emissive.setHex(0x7dd3fc)
            x.m.emissiveIntensity = 0.12 + 0.22 * pulse
          } else {
            x.m.emissive.setHex(x.emissive)
            x.m.emissiveIntensity = x.intensity
          }
        }
      })
      pipeMats.forEach((m, id) => {
        const sel = id === selectedId
        const cur = id === stageNode
        m.fill.emissiveIntensity = sel ? 0.7 : cur ? 0.3 + 0.3 * pulse : 0.1
        m.empty.emissiveIntensity = sel ? 0.45 : 0
      })
      // 過熱：排氣管越來越紅、越亮
      if (heat > 0) dm.emissiveIntensity = Math.max(dm.emissiveIntensity, 0.15 + heat * (0.6 + 0.3 * pulse))

      // 選取零件不會移動鏡頭（靠高亮指出位置）；只有雙擊或按按鈕才飛過去
      if (fly) {
        const k = clamp01((t - fly.start) / FLY_SEC)
        const s = k * k * (3 - 2 * k)
        camera.position.lerpVectors(fly.p0, fly.p1, s)
        controls.target.lerpVectors(fly.t0, fly.t1, s)
        if (k >= 1) fly = null
      }
      controls.update()
      renderer.render(scene, camera)
      labels.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointerup', onUp)
      renderer.domElement.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('dblclick', onDbl)
      controls.dispose()
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.isMesh) {
          mesh.geometry.dispose()
          const m = mesh.material
          ;(Array.isArray(m) ? m : [m]).forEach((x) => x.dispose())
        }
      })
      releaseRenderer(pooled)
      host.removeChild(labels.domElement)
      api.current = null
    }
  }, [compact])

  useEffect(() => {
    api.current?.setSelected(selected)
  }, [selected])

  useEffect(() => {
    api.current?.setCut(cut)
  }, [cut])

  useEffect(() => {
    api.current?.setFault(fault)
  }, [fault])

  const text = compact ? 'text-[14px]' : 'text-[19px]'
  const btn = cn(
    'flex shrink-0 items-center gap-1.5 rounded-full font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300',
    compact ? 'px-3 py-1.5 text-[14px]' : 'px-5 py-2 text-[18px]',
  )
  const icon = compact ? 'size-4' : 'size-5'
  const zoomBtn = cn('grid place-items-center text-slate-200 transition hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-300', compact ? 'size-9' : 'size-11')

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative min-h-0 flex-1">
        <div ref={hostRef} className="absolute inset-0 touch-none" />
        {/* 鏡頭控制：放大、縮小、回到全覽（放大後才出現） */}
        <div className={cn('absolute flex flex-col items-end', compact ? 'right-2 top-2 gap-1.5' : 'right-4 top-4 gap-2')}>
          <div className="flex flex-col overflow-hidden rounded-full bg-[rgba(13,17,23,0.72)] ring-1 ring-white/10">
            <button type="button" aria-label="放大" onClick={() => api.current?.zoom(0.7)} className={cn(zoomBtn, 'border-b border-white/10')}>
              <Plus className={icon} aria-hidden />
            </button>
            <button type="button" aria-label="縮小" onClick={() => api.current?.zoom(1.4)} className={zoomBtn}>
              <Minus className={icon} aria-hidden />
            </button>
          </div>
          {zoomed && (
            <button
              type="button"
              onClick={() => api.current?.home()}
              className={cn(btn, 'bg-[rgba(13,17,23,0.72)] text-sky-300 ring-1 ring-white/10 hover:bg-[rgba(30,41,59,0.85)]', compact ? 'px-3 py-1.5' : 'px-4 py-2')}
            >
              <Scan className={icon} aria-hidden />
              全覽
            </button>
          )}
        </div>
        {!zoomed && !compact && <p className="pointer-events-none absolute left-5 top-4 text-[16px] text-slate-400">滾輪縮放・右鍵拖曳平移・雙擊零件放大</p>}
      </div>
      {/* 控制列：停機 → 啟動按鈕；導覽中 → 這一步在做什麼；運轉中 → 重看／停機 */}
      <div className={cn('flex shrink-0 items-center', compact ? 'min-h-[64px] gap-2.5 px-3 py-2.5' : 'min-h-[92px] gap-5 px-7 py-4')}>
        {fault && (
          <>
            <span className={cn('relative flex shrink-0', compact ? 'size-2.5' : 'size-3')} aria-hidden>
              <span className="absolute inset-0 animate-ping rounded-full bg-red-400/70" />
              <span className="relative size-full rounded-full bg-red-400" />
            </span>
            <p className={cn('min-w-0 flex-1 text-slate-300', text)}>
              <b className="mr-3 text-red-200">故障模擬：{faultLabel}</b>
              {compact ? '看下面說明' : '看右邊的說明一步一步走'}
            </p>
            <button type="button" onClick={onExitFault} className={cn(btn, 'bg-white/[0.08] text-slate-200 hover:bg-white/[0.12]')}>
              結束模擬
            </button>
          </>
        )}
        {!fault && phase === 'off' && (
          <>
            <button
              type="button"
              onClick={() => api.current?.start()}
              className={cn(btn, 'bg-sky-500 text-white shadow-[0_8px_24px_-8px_rgba(14,165,233,0.8)] hover:bg-sky-400', compact ? 'px-4 py-2 text-[15px]' : 'px-7 py-3 text-[21px]')}
            >
              <Play className={cn(icon, 'fill-current')} aria-hidden />
              啟動冷凍系統
            </button>
            <p className={cn('min-w-0 text-slate-400', text)}>按下去，看冷媒從壓縮機出發，跑完一圈</p>
          </>
        )}
        {!fault && phase === 'tour' && (
          <>
            <div className="flex shrink-0 gap-1" aria-label={`第 ${stage + 1} 步，共 ${STAGES.length} 步`}>
              {STAGES.map((s, i) => (
                <span key={s.node} className={cn('rounded-full transition-colors', compact ? 'h-1.5 w-3' : 'h-2 w-5', i <= stage ? 'bg-sky-400' : 'bg-white/15')} />
              ))}
            </div>
            <div className="min-w-0 flex-1" aria-live="polite">
              <p className={cn('font-bold text-white', compact ? 'text-[15px]' : 'text-[21px]')}>{STAGES[stage]?.title}</p>
              <p className={cn('text-slate-300', text)}>{STAGES[stage]?.text}</p>
            </div>
            <button type="button" onClick={() => api.current?.skip()} className={cn(btn, 'text-sky-300 hover:bg-white/[0.06]')}>
              跳過
            </button>
          </>
        )}
        {!fault && phase === 'on' && (
          <>
            <span className={cn('relative flex shrink-0', compact ? 'size-2.5' : 'size-3')} aria-hidden>
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative size-full rounded-full bg-emerald-400" />
            </span>
            <p className={cn('min-w-0 flex-1 text-slate-300', text)}>
              <b className="mr-3 text-white">運轉中</b>冷媒一直循環；點零件看說明
            </p>
            <button type="button" onClick={() => api.current?.start()} className={cn(btn, 'bg-white/[0.08] text-sky-300 hover:bg-white/[0.12]')}>
              <RotateCcw className={icon} aria-hidden />
              {compact ? '重看' : '重看一次'}
            </button>
            <button type="button" onClick={() => api.current?.stop()} className={cn(btn, 'bg-white/[0.08] text-slate-200 hover:bg-white/[0.12]')}>
              <Power className={icon} aria-hidden />
              停機
            </button>
          </>
        )}
      </div>
    </div>
  )
}
