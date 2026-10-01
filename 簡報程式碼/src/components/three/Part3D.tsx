import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildPart, type Part3DId, type LegendItem } from './models'

interface Part3DProps {
  id: Part3DId
  /** 剖開：切掉外殼前半，看內部構造 */
  cut: boolean
  /** 自動旋轉 */
  spin: boolean
  onLegend?: (legend: LegendItem[]) => void
}

/** 零件 3D 檢視：拖曳旋轉、滾輪／雙指縮放 */
export default function Part3D({ id, cut, spin, onLegend }: Part3DProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const api = useRef<{ setCut: (c: boolean) => void; setSpin: (s: boolean) => void } | null>(null)
  const legendRef = useRef(onLegend)
  legendRef.current = onLegend

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.localClippingEnabled = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTex
    const key = new THREE.DirectionalLight(0xffffff, 1.2)
    key.position.set(3, 5, 4)
    scene.add(key, new THREE.AmbientLight(0xffffff, 0.35))

    const model = buildPart(id)
    legendRef.current?.(model.legend)
    const box = new THREE.Box3().setFromObject(model.group)
    const center = box.getCenter(new THREE.Vector3())
    const radius = box.getSize(new THREE.Vector3()).length() / 2
    model.group.position.sub(center)
    scene.add(model.group)

    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100)
    camera.position.set(radius * 1.6, radius * 1.1, radius * 2.6)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.minDistance = radius * 1.2
    controls.maxDistance = radius * 6
    controls.autoRotateSpeed = 1.4

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
    api.current = { setCut, setSpin }

    const resize = () => {
      const w = Math.max(host.clientWidth, 1)
      const h = Math.max(host.clientHeight, 1)
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
    const tick = () => {
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
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
      api.current = null
    }
  }, [id])

  useEffect(() => {
    api.current?.setCut(cut)
  }, [cut, id])

  useEffect(() => {
    api.current?.setSpin(spin)
  }, [spin, id])

  return <div ref={hostRef} className="h-full w-full cursor-grab touch-none active:cursor-grabbing" />
}
