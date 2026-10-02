import { MotionGlobalConfig } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'

/** 換頁動畫約 0.5 秒；等它跑完、瀏覽器有空再掛上重的東西（3D），換頁才不會卡 */
const SLIDE_SEC = 0.52

export function Deferred({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    // 檢查模式（沒有動畫）直接掛上
    const delay = MotionGlobalConfig.skipAnimations ? 0 : SLIDE_SEC * 1000
    let idle = 0
    const timer = window.setTimeout(() => {
      if ('requestIdleCallback' in window) idle = window.requestIdleCallback(() => setReady(true), { timeout: 300 })
      else setReady(true)
    }, delay)
    return () => {
      window.clearTimeout(timer)
      if (idle) window.cancelIdleCallback(idle)
    }
  }, [])
  return <>{ready ? children : fallback}</>
}
