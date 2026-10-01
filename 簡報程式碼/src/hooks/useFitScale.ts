import { useLayoutEffect, useState, type RefObject } from 'react'

/** 讓固定尺寸畫布（如 1920×1080）等比例縮放填滿容器 */
export function useFitScale(ref: RefObject<HTMLElement | null>, width: number, height: number) {
  const [scale, setScale] = useState(() =>
    Math.min((window.innerWidth - 24) / width, (window.innerHeight - 96) / height),
  )

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) setScale(Math.min(rect.width / width, rect.height / height))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, width, height])

  return scale
}
