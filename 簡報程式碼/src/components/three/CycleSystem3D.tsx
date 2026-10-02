import { Play, Power, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { CycleNodeId } from '../../data/cycleNotes'
import { cn } from '../../lib/cn'
import { buildPart, type Part3DId } from './models'

type V3 = [number, number, number]
type PipeId = 'discharge' | 'liquid' | 'mixture' | 'suction'
/** 名稱標籤放哪一側：上（預設）、下、左、右 */
type Side = 't' | 'b' | 'l' | 'r'

/** 零件擺位（對照 2D 圖：上冷凝器、下蒸發器、右壓縮機、左膨脹閥，小零件在管線上） */
const PLACEMENTS: { id: Part3DId; pos: V3; scale: number; rotZ?: number; label: string; major?: boolean; side?: Side }[] = [
  { id: 'cond', pos: [0, 1.9, 0], scale: 0.85, label: '② 冷凝器', major: true },
  { id: 'evap', pos: [0, -1.9, 0], scale: 0.85, label: '④ 蒸發器', major: true },
  { id: 'comp', pos: [3.2, 0, 0], scale: 0.55, label: '① 壓縮機', major: true, side: 'l' },
  { id: 'txv', pos: [-3.2, 0, 0], scale: 0.42, rotZ: Math.PI / 2, label: '③ 膨脹閥', major: true, side: 'r' },
  { id: 'receiver', pos: [-1.55, 2.2, 0], scale: 0.24, label: '儲液器' },
  { id: 'gbc', pos: [-2.35, 1.9, 0], scale: 0.24, label: '手閥', side: 'b' },
  { id: 'dml', pos: [-3.2, 1.35, 0], scale: 0.2, rotZ: Math.PI / 2, label: '乾燥過濾器', side: 'r' },
  { id: 'sgi', pos: [-3.2, 0.98, 0], scale: 0.24, rotZ: Math.PI / 2, label: '視液鏡', side: 'r' },
  { id: 'evr', pos: [-3.2, 0.62, 0], scale: 0.22, rotZ: Math.PI / 2, label: '電磁閥', side: 'r' },
  { id: 'tc', pos: [-4.45, 0.62, 0], scale: 0.3, label: '溫控器' },
  { id: 'oub', pos: [3.2, 1.3, 0], scale: 0.24, label: '油分離器', side: 'l' },
  { id: 'kp15', pos: [4.45, 0.15, 0], scale: 0.3, label: '壓力開關' },
  { id: 'acc', pos: [3.2, -1.3, 0], scale: 0.24, label: '液氣分離器', side: 'l' },
]

/** 四段管路（依冷媒流向）＋顏色＋狀態標籤（標在管路外側） */
const PIPES: { id: PipeId; color: number; points: V3[]; label: string; labelPos: V3; side: Side }[] = [
  { id: 'discharge', color: 0xf87171, points: [[3.2, 0.75, 0], [3.2, 1.9, 0], [1.05, 1.9, 0]], label: '高溫高壓氣態', labelPos: [3.42, 1.65, 0], side: 'r' },
  { id: 'liquid', color: 0xfbbf24, points: [[-1.05, 1.9, 0], [-3.2, 1.9, 0], [-3.2, 0.42, 0]], label: '中溫中壓液態', labelPos: [-3.42, 1.6, 0], side: 'l' },
  { id: 'mixture', color: 0x5eead4, points: [[-3.2, -0.42, 0], [-3.2, -1.9, 0], [-0.95, -1.9, 0]], label: '液氣混合', labelPos: [-3.42, -1.35, 0], side: 'l' },
  { id: 'suction', color: 0x38bdf8, points: [[0.95, -1.9, 0], [3.2, -1.9, 0], [3.2, -0.75, 0]], label: '低溫低壓氣態', labelPos: [3.42, -1.6, 0], side: 'r' },
]

/** 啟動後的導覽：冷媒從壓縮機出發，一段一段跑完一圈 */
const STAGES: { node: CycleNodeId; title: string; text: string }[] = [
  { node: 'comp', title: '① 壓縮機啟動', text: '把低溫低壓氣體壓成高溫高壓氣體' },
  { node: 'discharge', title: '高壓氣管', text: '高溫高壓氣體從壓縮機流到冷凝器' },
  { node: 'cond', title: '② 冷凝器放熱', text: '風扇把熱吹到室外，冷媒凝結成液體' },
  { node: 'liquid', title: '液管', text: '液態冷媒經過儲液器、乾燥過濾器、視液鏡，流到膨脹閥' },
  { node: 'txv', title: '③ 膨脹閥降壓', text: '液態冷媒擠過小孔，壓力和溫度一起下降' },
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
}

interface Api {
  setSelected: (id: CycleNodeId | null) => void
  setCut: (c: boolean) => void
  start: () => void
  stop: () => void
  skip: () => void
}

/** 整套冷凍循環 3D：按「啟動」看冷媒跑一圈；零件可點選、可剖開；拖曳旋轉、滾輪縮放 */
export default function CycleSystem3D({ selected, onSelect, cut, compact = false }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const selectRef = useRef(onSelect)
  selectRef.current = onSelect
  const api = useRef<Api | null>(null)
  const [phase, setPhase] = useState<Phase>('off')
  const [stage, setStage] = useState(0)
  const stateRef = useRef({ setPhase, setStage })

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.localClippingEnabled = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.domElement.style.display = 'block'
    host.appendChild(renderer.domElement)

    const labels = new CSS2DRenderer()
    labels.domElement.style.position = 'absolute'
    labels.domElement.style.inset = '0'
    labels.domElement.style.pointerEvents = 'none'
    host.appendChild(labels.domElement)

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTex
    const key = new THREE.DirectionalLight(0xffffff, 1.1)
    key.position.set(3, 6, 6)
    scene.add(key, new THREE.AmbientLight(0xffffff, 0.3))

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    camera.position.set(0.9, 1.3, 12.5)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.minDistance = 5
    controls.maxDistance = 26
    controls.maxPolarAngle = Math.PI * 0.75

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
    heatIn.position.set(0, -3.3, 0)
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
    const cold = puffs(16, 0x93c5fd, [[-1.0, -0.2], [0.2, 1.0]], -2.3, -3.0)

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
    api.current = {
      setSelected: (id) => (selectedId = id),
      setCut,
      start: () => {
        runStart = clock.getElapsedTime()
        shownStage = -1
        setPhaseBoth('tour')
      },
      stop: () => setPhaseBoth('off'),
      skip: () => {
        runStart = clock.getElapsedTime() - STAGES.length * STAGE_SEC
      },
    }

    // 點選（拖曳不算點選）
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let down: { x: number; y: number } | null = null
    const pick = (e: PointerEvent): CycleNodeId | null => {
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
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointerup', onUp)
    renderer.domElement.addEventListener('pointermove', onMove)

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
      camera.position.setLength(Math.max(7.4 / span, 11.4 / (span * camera.aspect)))
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    const focus = new THREE.Vector3()
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
      const compOn = reached(0)
      const condOn = reached(2)
      const evapOn = reached(6)

      // 管路灌冷媒＋流動光點
      for (const p of pipes) {
        const s = PIPE_STAGE[p.id]
        const prog = phase === 'off' ? 0 : clamp01((e - s * STAGE_SEC) / (STAGE_SEC * 0.9))
        p.fill.setDrawRange(0, Math.floor(prog * TUBE_SEG) * TUBE_RAD * 6)
        p.front.visible = prog > 0 && prog < 1
        if (p.front.visible) p.front.position.copy(p.curve.getPointAt(prog))
        const full = prog >= 1
        p.dots.forEach((d, i) => {
          d.visible = full
          if (full) d.position.copy(p.curve.getPointAt((i / p.dots.length + t * 0.22) % 1))
        })
      }

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
        [hot, condOn],
        [cold, evapOn],
      ] as const) {
        for (const q of list) {
          q.mesh.visible = on
          if (!on) continue
          const u = (t * 0.5 + q.phase) % 1
          q.mesh.position.set(q.x + Math.sin((u + q.phase) * 6) * 0.06, q.y0 + (q.y1 - q.y0) * u, q.z)
          ;(q.mesh.material as THREE.MeshBasicMaterial).opacity = Math.sin(Math.PI * u) * 0.85
        }
      }

      // 高亮：選取＝琥珀色；導覽中的這一步＝藍色呼吸光
      const stageNode = touring ? STAGES[step].node : null
      const pulse = 0.5 + 0.5 * Math.sin(t * 5)
      partMats.forEach((mats, id) => {
        const sel = id === selectedId
        const cur = id === stageNode
        for (const x of mats) {
          if (sel) {
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

      const target = selectedId ?? stageNode
      const c = target ? centers.get(target) : null
      focus.copy(c ?? new THREE.Vector3()).multiplyScalar(c ? (selectedId ? 0.25 : 0.18) : 0)
      controls.target.lerp(focus, 0.06)
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
      controls.dispose()
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.isMesh) {
          mesh.geometry.dispose()
          const m = mesh.material
          ;(Array.isArray(m) ? m : [m]).forEach((x) => x.dispose())
        }
      })
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
      host.removeChild(renderer.domElement)
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

  const text = compact ? 'text-[14px]' : 'text-[19px]'
  const btn = cn(
    'flex shrink-0 items-center gap-1.5 rounded-full font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300',
    compact ? 'px-3 py-1.5 text-[14px]' : 'px-5 py-2 text-[18px]',
  )
  const icon = compact ? 'size-4' : 'size-5'

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={hostRef} className="relative min-h-0 flex-1 touch-none" />
      {/* 控制列：停機 → 啟動按鈕；導覽中 → 這一步在做什麼；運轉中 → 重看／停機 */}
      <div className={cn('flex shrink-0 items-center', compact ? 'min-h-[64px] gap-2.5 px-3 py-2.5' : 'min-h-[92px] gap-5 px-7 py-4')}>
        {phase === 'off' && (
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
        {phase === 'tour' && (
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
        {phase === 'on' && (
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
