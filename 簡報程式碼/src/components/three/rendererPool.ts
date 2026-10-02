import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * 共用的 WebGL 繪圖器。
 * 建立繪圖器和環境反射貼圖要編譯 shader，很花時間；每次換頁、換零件都重建，畫面就會卡一下。
 * 用完放回池子，下一個 3D 直接拿來用（最多留 2 個，同時開兩個 3D 也不會搶）。
 */
export interface PooledRenderer {
  renderer: THREE.WebGLRenderer
  /** 環境反射貼圖（金屬質感），跟著繪圖器走，不要自己 dispose */
  env: THREE.Texture
}

const free: PooledRenderer[] = []

export function acquireRenderer(): PooledRenderer {
  const pooled = free.pop()
  if (pooled) return pooled
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.localClippingEnabled = true
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.domElement.style.display = 'block'
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const env = pmrem.fromScene(room, 0.04).texture
  room.dispose()
  pmrem.dispose()
  return { renderer, env }
}

export function releaseRenderer(p: PooledRenderer) {
  const el = p.renderer.domElement
  el.remove()
  el.style.cursor = ''
  if (free.length < 2) {
    free.push(p)
    return
  }
  p.env.dispose()
  p.renderer.dispose()
}
