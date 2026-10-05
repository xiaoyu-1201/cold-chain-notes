import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * iPad 觸控修正：OrbitControls 只抓第一根手指。雙指縮放時第二指若在 3D 外（或按鈕上）放開，
 * 它收不到放開，之後單指拖曳都被當成兩指 → 只會縮放、平移，不會轉。
 * 這裡每根手指都抓住（放開一定送回 canvas），新的一次觸控開始時清掉殘留的手指。
 * host 要是 canvas 的外層（capture 階段先跑，比 OrbitControls 早）；回傳的函式用來移除。
 */
export function fixTouchPointers(controls: OrbitControls, host: HTMLElement, canvas: HTMLCanvasElement) {
  const tracked = controls as unknown as { _pointers: number[]; _pointerPositions: Record<number, unknown> }
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch' && e.isPrimary && tracked._pointers.length) {
      tracked._pointers.length = 0
      tracked._pointerPositions = {}
    }
    if (e.target !== canvas) return
    try {
      canvas.setPointerCapture(e.pointerId)
    } catch {
      /* 手指已經放開 */
    }
  }
  host.addEventListener('pointerdown', onDown, true)
  return () => host.removeEventListener('pointerdown', onDown, true)
}
