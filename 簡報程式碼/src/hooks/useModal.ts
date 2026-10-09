import { useEffect, useRef, type RefObject } from 'react'

/**
 * 小視窗共用：打開時焦點移進視窗、Esc 關閉、關掉後焦點回到原本的按鈕
 * （10/10 code review：照片放大按 Esc 關不掉，只拿簡報筆的人會卡住）。
 * onClose 用 ref 存最新的，父元件每次 render 傳新函式也不會讓焦點跳來跳去。
 */
export function useModal(open: boolean, onClose: () => void, initialFocus?: RefObject<HTMLElement | null>) {
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  })
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const t = window.setTimeout(() => initialFocus?.current?.focus(), 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      close.current()
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey, true)
      if (prev?.isConnected) prev.focus()
    }
  }, [open, initialFocus])
}
