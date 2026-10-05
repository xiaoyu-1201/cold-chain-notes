import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { buildPart, type LegendItem, type Part3DId, type PartControl } from './models'
import { acquireRenderer, releaseRenderer } from './rendererPool'
import { fixTouchPointers } from './touchFix'

interface Part3DProps {
  id: Part3DId
  /** 剖開：切掉外殼前半，看內部構造 */
  cut: boolean
  /** 自動旋轉 */
  spin: boolean
  /** 運轉：風扇轉、活塞動（models.ts 用 userData.anim 標記的零件） */
  run?: boolean
  onLegend?: (legend: LegendItem[]) => void
  /** 零件有「動手操作」時回報給外面畫控制項 */
  onControl?: (control: PartControl | undefined) => void
  /** 操作值 0～1（開關、滑桿） */
  opValue?: number
}

/** 零件 3D 檢視：拖曳旋轉、滾輪／雙指縮放 */
export default function Part3D({ id, cut, spin, run = false, onLegend, onControl, opValue }: Part3DProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const api = useRef<{ setCut: (c: boolean) => void; setSpin: (s: boolean) => void; setRun: (r: boolean) => void; setOp: (v: number) => void } | null>(null)
  const legendRef = useRef(onLegend)
  legendRef.current = onLegend
  const controlRef = useRef(onControl)
  controlRef.current = onControl

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const pooled = acquireRenderer()
    const { renderer } = pooled
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.environment = pooled.env
    const key = new THREE.DirectionalLight(0xffffff, 1.2)
    key.position.set(3, 5, 4)
    scene.add(key, new THREE.AmbientLight(0xffffff, 0.35))

    const model = buildPart(id)
    legendRef.current?.(model.legend)
    controlRef.current?.(model.control)
    const control = model.control
    let opTarget = control?.initial ?? 0
    let opNow = opTarget
    control?.apply?.(opNow)
    const box = new THREE.Box3().setFromObject(model.group)
    const center = box.getCenter(new THREE.Vector3())
    const radius = box.getSize(new THREE.Vector3()).length() / 2
    model.group.position.sub(center)
    scene.add(model.group)
    const moving: { o: THREE.Object3D; kind: 'spin' | 'slide'; speed: number; amp: number; base: number }[] = []
    model.group.traverse((o) => {
      const a = o.userData.anim as { kind: 'spin' | 'slide'; speed: number; amp?: number } | undefined
      if (a) moving.push({ o, kind: a.kind, speed: a.speed, amp: a.amp ?? 0, base: a.kind === 'slide' ? o.position.x : o.rotation.z })
    })
    let running = false

    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100)
    camera.position.set(radius * 1.6, radius * 1.1, radius * 2.6)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.minDistance = radius * 0.6
    controls.maxDistance = radius * 6
    controls.autoRotateSpeed = 1.4
    // 滾輪往游標放大（想看哪裡就指哪裡）；右鍵／雙指拖曳平移；雙擊回到原本的角度
    controls.zoomToCursor = true
    controls.screenSpacePanning = true
    const home = { pos: camera.position.clone(), target: new THREE.Vector3() }
    let fly: { p0: THREE.Vector3; t0: THREE.Vector3; start: number } | null = null
    const onDbl = () => {
      fly = { p0: camera.position.clone(), t0: controls.target.clone(), start: performance.now() }
    }
    controls.addEventListener('start', () => (fly = null))
    renderer.domElement.addEventListener('dblclick', onDbl)
    const unfixTouch = fixTouchPointers(controls, host, renderer.domElement)

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
    const setCut = (c: boolean) =>
      model.shells.forEach((m) => {
        m.clippingPlanes = c ? [plane] : []
        m.side = c ? THREE.DoubleSide : THREE.FrontSide
        m.needsUpdate = true
      })
    const setSpin = (s: boolean) => {
      controls.autoRotate = s
    }
    const setRun = (r: boolean) => {
      running = r
    }
    const setOp = (v: number) => {
      opTarget = v
    }
    api.current = { setCut, setSpin, setRun, setOp }

    let size = ''
    const resize = () => {
      const w = Math.max(host.clientWidth, 1)
      const h = Math.max(host.clientHeight, 1)
      size = `${w}x${h}`
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    let raf = 0
    const clock = new THREE.Clock()
    const tick = () => {
      // 框的大小變了（下面多出操作區、換頁動畫）就重設，ResizeObserver 慢一步時畫面才不會被拉歪
      if (`${Math.max(host.clientWidth, 1)}x${Math.max(host.clientHeight, 1)}` !== size) resize()
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime
      // 操作值慢慢靠近目標，機構看起來是「動過去」的
      if (control?.apply && Math.abs(opTarget - opNow) > 0.001) {
        opNow += (opTarget - opNow) * Math.min(1, dt * 6)
        control.apply(opNow)
      }
      if (running || (control?.kind === 'run' && opTarget > 0.5))
        for (const m of moving) {
          if (m.kind === 'spin') m.o.rotation.z += m.speed * dt
          else m.o.position.x = m.base + Math.sin(t * m.speed) * m.amp
        }
      if (fly) {
        const k = Math.min((performance.now() - fly.start) / 600, 1)
        const s = k * k * (3 - 2 * k)
        camera.position.lerpVectors(fly.p0, home.pos, s)
        controls.target.lerpVectors(fly.t0, home.target, s)
        if (k >= 1) fly = null
      }
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener('dblclick', onDbl)
      unfixTouch()
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
      api.current = null
    }
  }, [id])

  useEffect(() => {
    api.current?.setCut(cut)
  }, [cut, id])

  useEffect(() => {
    api.current?.setSpin(spin)
  }, [spin, id])

  useEffect(() => {
    api.current?.setRun(run)
  }, [run, id])

  useEffect(() => {
    if (opValue !== undefined) api.current?.setOp(opValue)
  }, [opValue, id])

  return <div ref={hostRef} className="h-full w-full cursor-grab touch-none active:cursor-grabbing" />
}
