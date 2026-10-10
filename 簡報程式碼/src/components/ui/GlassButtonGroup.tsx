import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { lensBindings, lensProximity, useLensTrack, useLiquidLens } from '../../hooks/useLiquidLens'
import { cn } from '../../lib/cn'
import { LensView } from './LiquidLens'

/**
 * 一排按鈕（10/10，iOS 26 液態玻璃）：按下時那顆後面出現玻璃鏡片；手指在這排上左右滑，鏡片跟著走、
 * 經過的按鈕放大約 1.06；放開在哪一顆就觸發那一顆（呼叫它的 click），滑出整排＝取消。只是點一下照常。
 * 跟分段切換、手機膠囊用同一個 useLiquidLens。上下滑照常捲頁面（touch-action: pan-y）。
 * 不標 data-no-swipe（整排都不能滑換頁範圍太大）：真的開始水平拖鏡片時，手機版換頁手勢才讓出來（lensDragBusy）。
 * 用法：把原本的 <div className="flex ..."> 換成 <GlassButtonGroup className="flex ...">，按鈕要是它的子元素（或孫元素）。
 */
export function GlassButtonGroup({ className, children, label, role = 'group' }: { className?: string; children: ReactNode; label?: string; role?: string }) {
  const lens = useLiquidLens({ liftScale: 1.14 })
  const box = useRef<HTMLDivElement>(null)
  const items = useRef<(HTMLElement | null)[]>([])
  // 先找出這排的按鈕（要在 useLensTrack 的 layout effect 之前跑）
  useLayoutEffect(() => {
    items.current = box.current ? [...box.current.querySelectorAll<HTMLElement>(':scope > button, :scope > * > button')] : []
  })
  const track = useLensTrack({ lens, container: box, items, rest: -1, pressMoves: true, cancelOutside: true, onCommit: (i) => items.current[i]?.click() })

  // 經過的按鈕放大：直接改 style.scale，不讓 React 重新 render
  const { x, m, a, reduced } = lens
  const geom = track.geom
  useEffect(() => {
    const apply = () => {
      const xv = x.get()
      const yv = m.get()
      const av = a.get()
      items.current.forEach((el, i) => {
        if (!el) return
        const p = lensProximity(geom.current[i], xv, av, reduced, yv)
        el.style.scale = p > 0.001 ? String(1 + 0.06 * p) : ''
      })
    }
    const offX = x.on('change', apply)
    const offY = m.on('change', apply)
    const offA = a.on('change', apply)
    return () => {
      offX()
      offY()
      offA()
    }
  }, [x, m, a, reduced, geom])

  return (
    <div ref={box} role={role} aria-label={label} data-lens-group {...lensBindings(track)} className={cn(!/\b(absolute|fixed)\b/.test(className ?? '') && 'relative', 'touch-pan-y', className)}>
      <LensView lens={lens} ghost vertical />
      {children}
    </div>
  )
}
