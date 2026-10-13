import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
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
  /** 構造說明的名稱：這個零件亮起來、其他變淡（滑鼠移到說明上；10/13 使用者） */
  highlight?: string | null
  /** 一鍵開關：零件旁邊直接標名稱 */
  labels?: boolean
  /** 滑鼠移到 3D 的某個零件上：回報它的名稱（沒有＝null） */
  onHoverPart?: (name: string | null) => void
  /** 畫面往上挪幾 px（下面壓著一排按鈕時，模型才不會被蓋住） */
  liftPx?: number
}

/** 零件 3D 檢視：拖曳旋轉、滾輪／雙指縮放 */
export default function Part3D({ id, cut, spin, run = false, onLegend, onControl, opValue, highlight = null, labels = false, onHoverPart, liftPx = 0 }: Part3DProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const api = useRef<{ setCut: (c: boolean) => void; setSpin: (s: boolean) => void; setRun: (r: boolean) => void; setOp: (v: number) => void; setHighlight: (n: string | null) => void; setLabels: (on: boolean) => void } | null>(null)
  const hoverRef = useRef(onHoverPart)
  hoverRef.current = onHoverPart
  const liftRef = useRef(liftPx)
  liftRef.current = liftPx
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
    model.group.updateMatrixWorld(true)

    // 構造標籤（一鍵開關）：每個說明項目放在用那個材質的零件中間
    const labelLayer = new CSS2DRenderer()
    labelLayer.domElement.style.position = 'absolute'
    labelLayer.domElement.style.inset = '0'
    labelLayer.domElement.style.pointerEvents = 'none'
    host.appendChild(labelLayer.domElement)
    const meshesOf = (m: THREE.Material) => {
      const out: THREE.Mesh[] = []
      model.group.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.isMesh && mesh.material === m && !o.userData.mountOnly) out.push(mesh)
      })
      return out
    }
    // 標籤拉到模型外面（從模型中心往那個零件的方向推出去）＋一條引線指回零件；畫面上疊到時再自動往下錯開（10/13 QA：標籤全擠在中間）
    const lineMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.7 })
    const tagEls: HTMLDivElement[] = []
    const tagMeshes: THREE.Mesh[][] = []
    const tags = model.legend.map((item, i) => {
      const bb = new THREE.Box3()
      const ms = meshesOf(model.legendMats[i])
      tagMeshes.push(ms)
      ms.forEach((mesh) => bb.expandByObject(mesh))
      const wrap = document.createElement('div')
      const el = document.createElement('div')
      el.textContent = item.name
      el.style.cssText = 'font:700 14px system-ui,sans-serif;color:#0f2440;background:rgba(255,255,255,0.96);padding:3px 10px;border-radius:999px;box-shadow:0 0 0 1.5px ' + item.color + ',0 4px 12px -4px rgba(15,36,64,.35);white-space:nowrap;pointer-events:auto;cursor:pointer'
      // 滑鼠移到標籤上，也讓那個零件亮起來
      el.addEventListener('mouseenter', () => hoverRef.current?.(item.name))
      el.addEventListener('mouseleave', () => hoverRef.current?.(null))
      wrap.appendChild(el)
      tagEls.push(el)
      const tag = new CSS2DObject(wrap)
      const anchor = bb.isEmpty() ? new THREE.Vector3() : bb.getCenter(new THREE.Vector3())
      const dir = anchor.clone()
      if (dir.lengthSq() < 1e-4) dir.set(0, 1, 0)
      dir.normalize()
      const out = anchor.clone()
      tag.position.copy(out)
      const lead = new THREE.Line(new THREE.BufferGeometry().setFromPoints([anchor, out]), lineMat)
      lead.visible = false
      scene.add(lead)
      tag.userData.lead = lead
      tag.visible = false
      scene.add(tag)
      return tag
    })
    /** 標註排版（10/13 使用者：標籤被擋住、轉動時一直閃、左右換邊）：
     *  每個標籤固定在左欄或右欄（看零件在模型的左半還是右半），上下順序也固定（看零件高低）；
     *  每一格畫面都重算位置，跟著零件平順移動、不重疊、不出框、避開下面那排按鈕；引線從零件拉到標籤 */
    const tmp = new THREE.Vector3()
    const offsets = tagEls.map(() => ({ x: 0, y: 0 }))
    const sideOf = tags.map((t, i) => {
      const a = t.position
      return Math.abs(a.x) < radius * 0.08 ? i % 2 === 0 : a.x < 0
    })
    const orderAll = tags.map((_, i) => i).sort((a, b) => tags[b].position.y - tags[a].position.y)
    // 零件現在有沒有顯示（例：保溫管「沒包」時保溫管是藏起來的）：藏起來的零件不標（10/13 使用者：標籤指到空的地方）
    const shownNow = (o: THREE.Object3D | null): boolean => (!o ? true : o.visible && shownNow(o.parent))
    const unstack = () => {
      tags.forEach((t, i) => {
        t.visible = (labelsOn || i === hlIndex) && tagMeshes[i].some((m) => shownNow(m))
        ;(t.userData.lead as THREE.Line).visible = t.visible
      })
      const hr = host.getBoundingClientRect()
      if (!hr.width) return
      const pad = 10
      const gap = 6
      const minY = hr.top + pad + 34
      const maxY = hr.bottom - (liftRef.current ? 70 : pad)
      for (const side of [true, false]) {
        const col = orderAll.filter((i) => tags[i].visible && sideOf[i] === side)
        const items = col.map((i) => {
          const el = tagEls[i]
          const cur = el.getBoundingClientRect()
          // 拿掉上一次的位移，就是標籤原本（在零件上）的位置
          const r = new DOMRect(cur.left - offsets[i].x, cur.top - offsets[i].y, cur.width, cur.height)
          tmp.copy(tags[i].position).project(camera)
          return { i, el, r, ay: hr.top + ((1 - tmp.y) / 2) * hr.height, z: tmp.z, ty: 0 }
        })
        let y = minY
        for (const it of items) {
          it.ty = Math.max(y, it.ay - it.r.height / 2)
          y = it.ty + it.r.height + gap
        }
        const over = y - gap - maxY
        if (over > 0) items.forEach((it) => (it.ty = Math.max(minY, it.ty - over)))
        for (const it of items) {
          const tx = side ? hr.left + pad : hr.right - pad - it.r.width
          offsets[it.i] = { x: tx - it.r.left, y: it.ty - it.r.top }
          it.el.style.transform = `translate(${offsets[it.i].x}px, ${offsets[it.i].y}px)`
          const ex = side ? tx + it.r.width : tx
          const ey = it.ty + it.r.height / 2
          tmp.set(((ex - hr.left) / hr.width) * 2 - 1, -((ey - hr.top) / hr.height) * 2 + 1, it.z).unproject(camera)
          const pos = (tags[it.i].userData.lead as THREE.Line).geometry.getAttribute('position') as THREE.BufferAttribute
          pos.setXYZ(1, tmp.x, tmp.y, tmp.z)
          pos.needsUpdate = true
        }
      }
    }
    let labelsOn = false
    // 亮起來／變淡：記住每個材質原本的樣子，取消時還原
    const allMats = new Set<THREE.MeshStandardMaterial>()
    model.group.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => allMats.add(m as THREE.MeshStandardMaterial))
    })
    const orig = new Map([...allMats].map((m) => [m, { transparent: m.transparent, opacity: m.opacity, emissive: m.emissive?.clone(), ei: m.emissiveIntensity }]))
    let hlIndex = -1
    const setHighlight = (name: string | null) => {
      hlIndex = name ? model.legend.findIndex((l) => l.name === name) : -1
      const target = hlIndex >= 0 ? model.legendMats[hlIndex] : null
      for (const m of allMats) {
        const o0 = orig.get(m)!
        if (!target) {
          m.transparent = o0.transparent
          m.opacity = o0.opacity
          if (o0.emissive) m.emissive.copy(o0.emissive)
          m.emissiveIntensity = o0.ei
        } else if (m === target) {
          m.transparent = o0.transparent
          m.opacity = o0.opacity
          m.emissive?.setHex(0xf59e0b)
          m.emissiveIntensity = 0.55
        } else {
          m.transparent = true
          m.opacity = Math.min(o0.opacity, 0.18)
          if (o0.emissive) m.emissive.copy(o0.emissive)
          m.emissiveIntensity = o0.ei
        }
        m.needsUpdate = true
      }
      tags.forEach((t, i) => {
        t.visible = labelsOn || i === hlIndex
        ;(t.userData.lead as THREE.Line).visible = t.visible
      })
    }
    const setLabels = (on: boolean) => {
      labelsOn = on
      tags.forEach((t, i) => {
        t.visible = on || i === hlIndex
        ;(t.userData.lead as THREE.Line).visible = t.visible
      })
    }
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
    api.current = { setCut, setSpin, setRun, setOp, setHighlight, setLabels }

    // 滑鼠移到 3D 的零件上：告訴外面是哪一個（外面再讓它亮起來）
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let lastHover: string | null = null
    const onMove = (e: PointerEvent) => {
      if (e.buttons || e.pointerType !== 'mouse') return
      const r = renderer.domElement.getBoundingClientRect()
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObject(model.group, true).find((h) => (h.object as THREE.Mesh).material && model.legendMats.includes((h.object as THREE.Mesh).material as THREE.Material))
      const name = hit ? model.legend[model.legendMats.indexOf((hit.object as THREE.Mesh).material as THREE.Material)].name : null
      renderer.domElement.style.cursor = name ? 'pointer' : ''
      if (name !== lastHover) {
        lastHover = name
        hoverRef.current?.(name)
      }
    }
    const onLeave = () => {
      if (lastHover !== null) {
        lastHover = null
        hoverRef.current?.(null)
      }
    }
    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('pointerleave', onLeave)

    let size = ''
    const resize = () => {
      const w = Math.max(host.clientWidth, 1)
      const h = Math.max(host.clientHeight, 1)
      size = `${w}x${h}`
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      camera.aspect = w / h
      // 下面壓著按鈕：整個畫面往上挪
      if (liftRef.current) camera.setViewOffset(w, h, 0, liftRef.current, w, h)
      else camera.clearViewOffset()
      camera.updateProjectionMatrix()
      labelLayer.setSize(w, h)
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
      labelLayer.render(scene, camera)
      if (labelsOn || hlIndex >= 0) unstack()
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener('dblclick', onDbl)
      renderer.domElement.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('pointerleave', onLeave)
      renderer.domElement.style.cursor = ''
      host.removeChild(labelLayer.domElement)
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

  useEffect(() => {
    api.current?.setHighlight(highlight)
  }, [highlight, id])

  useEffect(() => {
    api.current?.setLabels(labels)
  }, [labels, id])

  return <div ref={hostRef} className="relative h-full w-full cursor-grab touch-none active:cursor-grabbing" />
}
