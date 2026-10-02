import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * 捲到附近才掛上、捲遠了就拆掉（3D 用）。
 * 手機閱讀模式整份簡報排成一長頁：每章的 3D 都同時開著，記憶體不夠，放大畫面時網頁會當掉。
 * 這樣同一時間只有畫面附近的 1～2 個 3D 在跑。
 */
export function InView({ children, fallback = null, margin = '200px' }: { children: ReactNode; fallback?: ReactNode; margin?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return (
    <div ref={ref} className="absolute inset-0">
      {near ? children : fallback}
    </div>
  )
}
