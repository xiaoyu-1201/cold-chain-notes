import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'

/**
 * 可以上下捲的清單：下面（或上面）還有東西時，那一邊淡出，看得出來「還可以捲」。
 * 用法：const f = useScrollFade<HTMLDivElement>(); <div ref={f.ref} onScroll={f.measure} style={f.style}>
 */
export function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [edge, setEdge] = useState({ top: false, bottom: false })
  const measure = useCallback(() => {
    const el = ref.current
    if (el) setEdge({ top: el.scrollTop > 4, bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 4 })
  }, [])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => ro.disconnect()
  }, [measure])
  const mask =
    edge.top || edge.bottom
      ? `linear-gradient(to bottom, ${edge.top ? 'transparent, #000 40px' : '#000'}, ${edge.bottom ? '#000 calc(100% - 56px), transparent' : '#000'})`
      : undefined
  const style: CSSProperties | undefined = mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined
  return { ref, measure, style, more: edge.bottom }
}
