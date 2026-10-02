import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { CycleNodeId } from '../../data/cycleNotes'
import { buildPart, type Part3DId } from './models'

type V3 = [number, number, number]
type PipeId = 'discharge' | 'liquid' | 'mixture' | 'suction'

/** 零件擺位（對照 2D 圖：上冷凝器、下蒸發器、右壓縮機、左膨脹閥，小零件在管線上） */
const PLACEMENTS: { id: Part3DId; pos: V3; scale: number; rotZ?: number; label: string; major?: boolean }[] = [
  { id: 'cond', pos: [0, 1.9, 0], scale: 0.85, label: '② 冷凝器', major: true },
  { id: 'evap', pos: [0, -1.9, 0], scale: 0.85, label: '④ 蒸發器', major: true },
  { id: 'comp', pos: [3.2, 0, 0], scale: 0.55, label: '① 壓縮機', major: true },
  { id: 'txv', pos: [-3.2, 0, 0], scale: 0.42, rotZ: Math.PI / 2, label: '③ 膨脹閥', major: true },
  { id: 'receiver', pos: [-1.55, 2.2, 0], scale: 0.24, label: '儲液器' },
  { id: 'gbc', pos: [-2.35, 1.9, 0], scale: 0.24, label: '手閥' },
  { id: 'dml', pos: [-3.2, 1.35, 0], scale: 0.2, rotZ: Math.PI / 2, label: '乾燥過濾器' },
  { id: 'sgi', pos: [-3.2, 0.98, 0], scale: 0.24, rotZ: Math.PI / 2, label: '視液鏡' },
  { id: 'evr', pos: [-3.2, 0.62, 0], scale: 0.22, rotZ: Math.PI / 2, label: '電磁閥' },
  { id: 'tc', pos: [-4.45, 0.62, 0], scale: 0.3, label: '溫控器' },
  { id: 'oub', pos: [3.2, 1.3, 0], scale: 0.24, label: '油分離器' },
  { id: 'kp15', pos: [4.45, 0.15, 0], scale: 0.3, label: '壓力開關' },
  { id: 'acc', pos: [3.2, -1.3, 0], scale: 0.24, label: '液氣分離器' },
]

/** 四段管路（依冷媒流向）＋顏色＋狀態標籤 */
const PIPES: { id: PipeId; color: number; points: V3[]; label: string; labelPos: V3 }[] = [
  { id: 'discharge', color: 0xf87171, points: [[3.2, 0.75, 0], [3.2, 1.9, 0], [1.05, 1.9, 0]], label: '高溫高壓氣態', labelPos: [3.95, 1.65, 0] },
  { id: 'liquid', color: 0xfbbf24, points: [[-1.05, 1.9, 0], [-3.2, 1.9, 0], [-3.2, 0.42, 0]], label: '中溫中壓液態', labelPos: [-4.15, 1.45, 0] },
  { id: 'mixture', color: 0x5eead4, points: [[-3.2, -0.42, 0], [-3.2, -1.9, 0], [-0.95, -1.9, 0]], label: '液氣混合', labelPos: [-3.95, -1.35, 0] },
  { id: 'suction', color: 0x38bdf8, points: [[0.95, -1.9, 0], [3.2, -1.9, 0], [3.2, -0.75, 0]], label: '低溫低壓氣態', labelPos: [3.95, -1.6, 0] },
]

interface Props {
  selected: CycleNodeId | null
  onSelect: (id: CycleNodeId | null) => void
  cut: boolean
}

/** 整套冷凍循環 3D：零件可點選、管內冷媒流動、可剖開；拖曳旋轉、滾輪縮放 */
export default function CycleSystem3D({ selected, onSelect, cut }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const selectRef = useRef(onSelect)
  selectRef.current = onSelect
  const api = useRef<{ highlight: (id: CycleNodeId | null) => void; setCut: (c: boolean) => void } | null>(null)

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
    controls.maxDistance = 20
    controls.maxPolarAngle = Math.PI * 0.75

    /** 每個節點（零件／管路）的物件與材質，用來選取與高亮 */
    const nodes = new Map<CycleNodeId, { object: THREE.Object3D; materials: THREE.MeshStandardMaterial[]; center: THREE.Vector3 }>()
    const shells: THREE.Material[] = []
    const pickables: THREE.Object3D[] = []

    const makeLabel = (text: string, id: CycleNodeId | null, major: boolean, tone?: string) => {
      const el = document.createElement('div')
      el.textContent = text
      el.style.cssText = [
        'pointer-events:auto',
        `cursor:${id ? 'pointer' : 'default'}`,
        `font:${major ? 700 : 600} ${major ? 21 : 16}px system-ui, sans-serif`,
        `color:${tone ?? (major ? '#f8fafc' : '#bae6fd')}`,
        'padding:2px 8px',
        'border-radius:999px',
        `background:${major ? 'rgba(15,23,42,0.75)' : 'rgba(15,23,42,0.55)'}`,
        'white-space:nowrap',
        'user-select:none',
      ].join(';')
      if (id) el.addEventListener('click', (e) => {
        e.stopPropagation()
        selectRef.current(id)
      })
      return new CSS2DObject(el)
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
      shells.push(...model.shells)
      const materials: THREE.MeshStandardMaterial[] = []
      holder.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
        if (m && !materials.includes(m)) materials.push(m)
      })
      nodes.set(p.id, { object: holder, materials, center: new THREE.Vector3(...p.pos) })
      pickables.push(holder)
      const size = new THREE.Box3().setFromObject(holder).getSize(new THREE.Vector3())
      const label = makeLabel(p.label, p.id, !!p.major)
      label.position.set(p.pos[0], p.pos[1] + size.y / 2 + (p.major ? 0.28 : 0.16), 0)
      scene.add(label)
    }

    // 管路＋流動光點
    const flows: { curve: THREE.CurvePath<THREE.Vector3>; dots: THREE.Mesh[] }[] = []
    for (const pipe of PIPES) {
      const curve = new THREE.CurvePath<THREE.Vector3>()
      for (let i = 0; i < pipe.points.length - 1; i++) curve.add(new THREE.LineCurve3(new THREE.Vector3(...pipe.points[i]), new THREE.Vector3(...pipe.points[i + 1])))
      const mat = new THREE.MeshStandardMaterial({ color: pipe.color, emissive: pipe.color, emissiveIntensity: 0.08, metalness: 0.1, roughness: 0.5 })
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.08, 16, false), mat)
      tube.userData.nodeId = pipe.id
      scene.add(tube)
      pickables.push(tube)
      const mid = curve.getPointAt(0.5)
      nodes.set(pipe.id, { object: tube, materials: [mat], center: mid })
      const dotMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: pipe.color, emissiveIntensity: 1.2 })
      const dots = Array.from({ length: 8 }, () => {
        const d = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), dotMat)
        scene.add(d)
        return d
      })
      flows.push({ curve, dots })
      const label = makeLabel(pipe.label, pipe.id, false, `#${new THREE.Color(pipe.color).getHexString()}`)
      label.position.set(...pipe.labelPos)
      scene.add(label)
    }
    const heatOut = makeLabel('放熱 → 室外', null, false, '#fca5a5')
    heatOut.position.set(0, 2.95, 0)
    const heatIn = makeLabel('吸熱 ← 庫內', null, false, '#7dd3fc')
    heatIn.position.set(0, -2.85, 0)
    scene.add(heatOut, heatIn)

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
    const setCut = (c: boolean) =>
      shells.forEach((m) => {
        m.clippingPlanes = c ? [plane] : []
        m.side = c ? THREE.DoubleSide : THREE.FrontSide
        m.needsUpdate = true
      })

    let focus = new THREE.Vector3(0, 0, 0)
    const highlight = (id: CycleNodeId | null) => {
      nodes.forEach((n, nid) => {
        const on = nid === id
        n.materials.forEach((m) => {
          const isPipe = nid === 'discharge' || nid === 'liquid' || nid === 'mixture' || nid === 'suction'
          if (isPipe) m.emissiveIntensity = on ? 0.7 : 0.08
          else {
            m.emissive = new THREE.Color(on ? 0xfbbf24 : 0x000000)
            m.emissiveIntensity = on ? 0.35 : 0
          }
        })
      })
      focus = id && nodes.get(id) ? nodes.get(id)!.center.clone().multiplyScalar(0.5) : new THREE.Vector3(0, 0, 0)
    }
    api.current = { highlight, setCut }

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
      // 寬度不夠時拉遠，整套系統都放得進畫面
      camera.position.setLength(Math.max(12.5, 12.5 * (1.5 / camera.aspect)))
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    const clock = new THREE.Clock()
    let raf = 0
    const tick = () => {
      const t = clock.getElapsedTime()
      for (const f of flows) f.dots.forEach((d, i) => d.position.copy(f.curve.getPointAt((i / f.dots.length + t * 0.12) % 1)))
      controls.target.lerp(focus, 0.08)
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
  }, [])

  useEffect(() => {
    api.current?.highlight(selected)
  }, [selected])

  useEffect(() => {
    api.current?.setCut(cut)
  }, [cut])

  return <div ref={hostRef} className="relative h-full w-full touch-none" />
}
