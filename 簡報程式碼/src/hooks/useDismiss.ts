import { useEffect, useRef, type RefObject } from 'react'

/**
 * Apple 風格的小視窗：點旁邊空白處或按 Esc 就關閉。
 * 不算「旁邊」的地方：圖上的熱點（[data-hit]，由圖自己切換）、標了 [data-dismiss-ignore] 的元素、
 * 以及從小視窗打開的全螢幕視窗（[aria-modal="true"]）。
 */
export function useDismiss(ref: RefObject<HTMLElement | null>, onClose: () => void, enabled = true) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!enabled) return
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Element | null
      if (!target || ref.current?.contains(target)) return
      if (target.closest('[data-hit], svg [role="button"], .cycle-hit, [data-dismiss-ignore], [aria-modal="true"]')) return
      closeRef.current()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || document.querySelector('[aria-modal="true"]')) return
      e.stopPropagation()
      closeRef.current()
    }
    // 延後一拍註冊，避免打開小視窗的那一下點擊馬上又把它關掉
    const id = window.setTimeout(() => {
      document.addEventListener('pointerdown', onPointer, true)
      window.addEventListener('keydown', onKey, true)
    }, 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', onPointer, true)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [ref, enabled])
}
