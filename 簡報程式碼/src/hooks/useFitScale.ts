import { useLayoutEffect, useState, type RefObject } from 'react'

/** 依可用空間決定畫布寬度（高度固定），寬螢幕不留黑邊；寬度設上限，避免一行字過長 */
function fit(w: number, h: number, height: number, minW: number, maxW: number) {
  const width = Math.round(Math.min(Math.max((height * w) / h, minW), maxW))
  return { width, scale: Math.min(w / width, h / height) }
}

/** 畫布高度固定、寬度依螢幕比例調整，再等比例縮放填滿容器 */
export function useFitStage(ref: RefObject<HTMLElement | null>, height: number, minW: number, maxW: number) {
  const [stage, setStage] = useState(() => fit(window.innerWidth - 24, window.innerHeight - 96, height, minW, maxW))

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) setStage(fit(rect.width, rect.height, height, minW, maxW))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, height, minW, maxW])

  return stage
}
