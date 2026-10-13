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
    // 構造標籤：拉到 3D 畫面左右兩欄＋一條引線指回零件（10/13 使用者：標籤被擋住、轉動時一直閃、左右換邊、標線沒標好）
    // 引線不被零件擋住（不然看起來像指到空的地方，10/13 QA）；線頭一顆小圓點標出指的是哪裡
    const lineMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.8, depthTest: false })
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x0f2440, depthTest: false })
    const dotGeo = new THREE.SphereGeometry(radius * 0.014, 12, 12)
    const tagEls: HTMLDivElement[] = []
    const labelPx = host.closest('.deck-canvas') ? 20 : 15
    // 相機的起始位置：判斷「零件哪裡看得到」也用這個視角（兩邊共用，改一邊不會忘了另一邊）
    const homePos = new THREE.Vector3(radius * 1.6, radius * 1.1, radius * 2.6)
    const rc = new THREE.Raycaster()
    // 零件現在有沒有顯示（例：保溫管「沒包」時是藏起來的；乾燥過濾器切「焊接」才出現焊接頭）
    const shownNow = (o: THREE.Object3D | null): boolean => (!o ? true : o.visible && shownNow(o.parent))
    const allMeshes: THREE.Mesh[] = []
    model.group.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && !o.userData.mountOnly) allMeshes.push(o as THREE.Mesh)
    })
    const partMeshes = model.legendMats.map((m) => meshesOf(m))
    const tags = model.legend.map((item) => {
      const wrap = document.createElement('div')
      const el = document.createElement('div')
      el.textContent = item.name
      // 投影片畫布上最小 20px（畫布會縮小顯示）；放大視窗沒有縮放，15px 就夠
      el.style.cssText = 'font:700 ' + labelPx + 'px system-ui,sans-serif;color:#0f2440;background:rgba(255,255,255,0.96);padding:3px 10px;border-radius:999px;box-shadow:0 0 0 1.5px ' + item.color + ',0 4px 12px -4px rgba(15,36,64,.35);white-space:nowrap;pointer-events:auto;cursor:pointer'
      // 滑鼠移到標籤上，也讓那個零件亮起來
      el.addEventListener('mouseenter', () => hoverRef.current?.(item.name))
      el.addEventListener('mouseleave', () => hoverRef.current?.(null))
      wrap.appendChild(el)
      tagEls.push(el)
      const tag = new CSS2DObject(wrap)
      const lead = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), lineMat)
      lead.visible = false
      lead.renderOrder = 10
      const dot = new THREE.Mesh(dotGeo, dotMat)
      dot.renderOrder = 11
      dot.visible = false
      scene.add(lead, dot)
      tag.userData.lead = lead
      tag.userData.dot = dot
      tag.userData.pin = null
      tag.userData.inside = false
      tag.visible = false
      scene.add(tag)
      return tag
    })

    /**
     * 引線釘在零件「身上、看得到的地方」：外框中心可能是空的（毛細管盤成一圈）、可能被別的零件擋住（柱塞在線圈裡）→
     * 從零件「現在顯示的」頂點裡，挑起始視角看得到、又離中心最近的點；記住是哪個零件的哪個點，零件會動時引線跟著走。
     * 被外殼擋住、不算外殼就看得到＝在外殼裡：沒剖開時不標。
     * 很花時間（射線），所以第一次打開標籤時才算；零件顯示／藏起來有變（切開關、拉滑桿）就重算。
     */
    let pinSig = ''
    const sideOf: boolean[] = tags.map(() => false)
    let orderAll: number[] = tags.map((_, i) => i)
    // 剖開／合起來也要重挑（剖開後外殼前半沒了，看得到的地方不一樣）
    const visSig = () => (cutOn ? 'c' : 'o') + allMeshes.map((m) => (shownNow(m) ? '1' : '0')).join('')
    const ensurePins = () => {
      const sig = visSig()
      if (sig === pinSig) return
      pinSig = sig
      model.group.updateMatrixWorld(true)
      const blockersAll = allMeshes.filter((m) => {
        if (!shownNow(m)) return false
        const mm = m.material as THREE.Material
        // 半透明的（冷媒流動、玻璃）擋不住視線
        return !(mm.transparent && mm.opacity < 0.6)
      })
      const blockersNoShell = blockersAll.filter((m) => !model.shells.includes(m.material as THREE.Material))
      tags.forEach((tag, i) => {
        const ms = partMeshes[i].filter((m) => shownNow(m))
        const bb = ms.reduce((b, mesh) => b.expandByObject(mesh), new THREE.Box3())
        const center = bb.isEmpty() ? new THREE.Vector3() : bb.getCenter(new THREE.Vector3())
        const cands: { mesh: THREE.Mesh; local: THREE.Vector3; world: THREE.Vector3; d: number }[] = []
        for (const mesh of ms) {
          const posAttr = mesh.geometry.getAttribute('position') as THREE.BufferAttribute | undefined
          if (!posAttr) continue
          // 每個零件最多抽 ~300 個點就夠挑
          const step = Math.max(1, Math.floor((posAttr.count * ms.length) / 300))
          for (let j = 0; j < posAttr.count; j += step) {
            const local = new THREE.Vector3().fromBufferAttribute(posAttr, j)
            const world = mesh.localToWorld(local.clone())
            cands.push({ mesh, local, world, d: world.distanceToSquared(center) })
          }
        }
        cands.sort((a, b) => a.d - b.d)
        const own = new Set<THREE.Object3D>(ms)
        const pickVisible = (blockers: THREE.Mesh[]) => {
          const tries = Math.min(cands.length, 40)
          for (let t = 0; t < tries; t++) {
            const c = cands[Math.floor((t * cands.length) / tries)]
            const dir = c.world.clone().sub(homePos)
            const dist = dir.length()
            rc.set(homePos, dir.normalize())
            // 停在那個點前面一點點，不要打到自己表面同一點
            rc.far = dist * 0.995
            // 剖開時，外殼被切掉的前半（z > 0）不算擋住
            const blocked = rc.intersectObjects(blockers, false).some((h) => !own.has(h.object) && !(cutOn && h.point.z > 0 && model.shells.includes((h.object as THREE.Mesh).material as THREE.Material)))
            if (!blocked) return c
          }
          return null
        }
        const seen = pickVisible(blockersAll)
        const noShell = seen ? null : pickVisible(blockersNoShell)
        const best = seen ?? noShell ?? cands[0]
        // 只有「被外殼擋住」才算在裡面；被別的零件擋住（沒有外殼可剖）照樣標
        tag.userData.inside = !seen && !!noShell && !model.shells.includes(model.legendMats[i])
        tag.userData.pin = best ? { mesh: best.mesh, local: best.local } : null
        tag.position.copy(best ? best.world : center)
        ;(tag.userData.dot as THREE.Mesh).position.copy(tag.position)
        ;((tag.userData.lead as THREE.Line).geometry.getAttribute('position') as THREE.BufferAttribute).setXYZ(0, tag.position.x, tag.position.y, tag.position.z)
      })
      // 左欄／右欄：照零件左右位置排，一半放左、一半放右（全部擠在同一邊會左重右輕，10/13 QA）；上下順序看高低。只在重算時更新，平常轉動不會換邊
      const byX = tags.map((_, i) => i).sort((a, b) => tags[a].position.x - tags[b].position.x)
      byX.forEach((i, r) => (sideOf[i] = tags.length === 1 ? tags[i].position.x < 0 : r < Math.floor(tags.length / 2)))
      orderAll = tags.map((_, i) => i).sort((a, b) => tags[b].position.y - tags[a].position.y)
      sizes.fill(null)
    }
    // 外殼裡面的零件：沒剖開時看不到，不標（指著它亮起來時才標）
    let cutOn = false
    const showTags = () =>
      tags.forEach((t, i) => {
        t.visible = ((labelsOn && (cutOn || !t.userData.inside)) || i === hlIndex) && partMeshes[i].some((m) => shownNow(m))
        ;(t.userData.lead as THREE.Line).visible = t.visible
        ;(t.userData.dot as THREE.Mesh).visible = t.visible
      })
    /** 標籤跟著零件身上那個點走（零件會動） */
    const followPins = () =>
      tags.forEach((t) => {
        const pin = t.userData.pin as { mesh: THREE.Mesh; local: THREE.Vector3 } | null
        if (!pin || !t.visible) return
        pin.mesh.localToWorld(t.position.copy(pin.local))
        ;(t.userData.dot as THREE.Mesh).position.copy(t.position)
        const pos = (t.userData.lead as THREE.Line).geometry.getAttribute('position') as THREE.BufferAttribute
        pos.setXYZ(0, t.position.x, t.position.y, t.position.z)
        pos.needsUpdate = true
      })

    /** 排版：兩欄、不重疊、不出框、避開下面那排按鈕；引線拉到標籤邊緣。標籤大小量一次就記住，不必每格都讀畫面 */
    const tmp = new THREE.Vector3()
    const sizes: ({ w: number; h: number } | null)[] = tags.map(() => null)
    let lastKey = ''
    const unstack = () => {
      const hr = host.getBoundingClientRect()
      if (!hr.width) return
      // 電腦版整張投影片是縮放的：量到的是螢幕像素，translate 要用縮放前的像素（k＝縮放比例）
      const k = hr.width / Math.max(host.offsetWidth, 1)
      // 相機、零件、框都沒動：不用重排
      // 3D 上面浮著的按鈕、提示（data-3d-avoid）：標籤要避開，按鈕換行變高也跟著讓（10/13 QA）
      const avoid = [...((host.closest('.viewport-blueprint') ?? host.parentElement)?.querySelectorAll<HTMLElement>('[data-3d-avoid]') ?? [])].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0)
      const key = [hr.left, hr.top, hr.width, hr.height, ...avoid.flatMap((r) => [r.left, r.top, r.right, r.bottom]), ...camera.matrixWorld.elements, ...camera.projectionMatrix.elements, ...tags.flatMap((t) => (t.visible ? [t.position.x, t.position.y, t.position.z] : [9e9]))].map((n) => n.toFixed(3)).join(',')
      if (key === lastKey) return
      lastKey = key
      const pad = 10 * k
      const gap = 6 * k
      for (const side of [true, false]) {
        // 這一欄（左半或右半）的上下安全範圍：上半部浮著的東西底下開始、下半部浮著的東西上面為止
        const half = (r: DOMRect) => (side ? r.left < hr.left + hr.width / 2 : r.right > hr.left + hr.width / 2)
        let minY = hr.top + pad
        let maxY = hr.bottom - pad
        for (const r of avoid) {
          if (!half(r)) continue
          if (r.top + r.height / 2 < hr.top + hr.height / 2) minY = Math.max(minY, r.bottom + gap)
          else maxY = Math.min(maxY, r.top - gap)
        }
        const col = orderAll.filter((i) => tags[i].visible && sideOf[i] === side)
        const items = col.map((i) => {
          const el = tagEls[i]
          if (!sizes[i] && el.offsetWidth) sizes[i] = { w: el.offsetWidth, h: el.offsetHeight }
          const s = sizes[i] ?? { w: el.offsetWidth, h: el.offsetHeight }
          const w = s.w * k
          const h = s.h * k
          // 標籤原本（還沒位移）就置中在零件那一點的投影上
          tmp.copy(tags[i].position).project(camera)
          const ax = hr.left + ((tmp.x + 1) / 2) * hr.width
          const ay = hr.top + ((1 - tmp.y) / 2) * hr.height
          return { i, el, left: ax - w / 2, top: ay - h / 2, w, h, ay, z: tmp.z, ty: 0 }
        })
        let y = minY
        for (const it of items) {
          it.ty = Math.max(y, it.ay - it.h / 2)
          y = it.ty + it.h + gap
        }
        const over = y - gap - maxY
        if (over > 0) items.forEach((it) => (it.ty = Math.max(minY, it.ty - over)))
        for (const it of items) {
          const tx = side ? hr.left + pad : hr.right - pad - it.w
          it.el.style.transform = `translate(${(tx - it.left) / k}px, ${(it.ty - it.top) / k}px)`
          const ex = side ? tx + it.w : tx
          const ey = it.ty + it.h / 2
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
      showTags()
    }
    const setLabels = (on: boolean) => {
      labelsOn = on
      showTags()
    }
    const moving: { o: THREE.Object3D; kind: 'spin' | 'slide'; speed: number; amp: number; base: number }[] = []
    model.group.traverse((o) => {
      const a = o.userData.anim as { kind: 'spin' | 'slide'; speed: number; amp?: number } | undefined
      if (a) moving.push({ o, kind: a.kind, speed: a.speed, amp: a.amp ?? 0, base: a.kind === 'slide' ? o.position.x : o.rotation.z })
    })
    let running = false

    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100)
    camera.position.copy(homePos)
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
    const setCut = (c: boolean) => {
      model.shells.forEach((m) => {
        m.clippingPlanes = c ? [plane] : []
        m.side = c ? THREE.DoubleSide : THREE.FrontSide
        m.needsUpdate = true
      })
      cutOn = c
      showTags()
    }
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
      // 順序：先決定哪些標籤要顯示、釘點跟著零件走 → 畫標籤 → 排版（同一格的相機）→ 最後畫 3D，引線和標籤才不會差一格
      const labeling = labelsOn || hlIndex >= 0
      if (labeling) {
        ensurePins()
        showTags()
        model.group.updateMatrixWorld()
        followPins()
      }
      labelLayer.render(scene, camera)
      if (labeling) unstack()
      renderer.render(scene, camera)
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
        if ((o as THREE.Line).isLine) (o as THREE.Line).geometry.dispose()
        if (mesh.isMesh) {
          mesh.geometry.dispose()
          const m = mesh.material
          ;(Array.isArray(m) ? m : [m]).forEach((x) => x.dispose())
        }
      })
      lineMat.dispose()
      dotMat.dispose()
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
