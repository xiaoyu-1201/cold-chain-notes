import { useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from 'framer-motion'
import { useCallback, useEffect, useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'

/**
 * 液態玻璃鏡片（10/10，像 iOS 26 分頁列）：手機版懸浮膠囊、電腦版篇章列／頁碼條、分段切換（Segmented）共用這一份。
 *   - 換到別項：彈簧滑過去（有一點 overshoot），依速度「果凍拉伸」（scaleX 最多 1.25、scaleY 壓扁），停下來回彈。
 *   - 按住左右拖：鏡片跟著手指走，經過的項目稍微放大（最多 1.15），放開在哪一項就選哪一項；只是點一下照常（交給 click）。
 *   - 只改 motion value（transform／寬度），拖動時 React 不重新 render。
 *   - 「減少動態效果」：沒有彈簧、拉伸、放大，直接切換。
 *   - 背景分頁 rAF 不跑、彈簧會停在半路：每次移動後排一個 timeout，時間到還沒到終點就直接跳過去。
 * 位置用 offsetLeft／offsetWidth（不受縮放畫布影響）；滑鼠座標換算成容器自己的座標（除以縮放比例、加上捲動量）。
 */
const LENS_SPRING = { stiffness: 520, damping: 30, mass: 0.9 }
const SIZE_SPRING = { stiffness: 480, damping: 34 }
const LIFT_SPRING = { stiffness: 420, damping: 26 }
const JELLY_SPRING = { stiffness: 380, damping: 13 }
const SLOP = 6
const SETTLE_MS = 900

export type LensGeom = { c: number; w: number }

export function useLiquidLens({ liftScale = 1.08 }: { liftScale?: number } = {}) {
  const reduced = useReducedMotion() ?? false
  const tx = useMotionValue(0)
  const tw = useMotionValue(0)
  const lift = useMotionValue(0)
  const x = useSpring(tx, LENS_SPRING)
  const w = useSpring(tw, SIZE_SPRING)
  const a = useSpring(lift, LIFT_SPRING)
  const speed = useTransform(useVelocity(x), [-1600, 0, 1600], [1, 0, 1])
  const jelly = useSpring(speed, JELLY_SPRING)
  const left = useTransform([x, w], ([xv, wv]: number[]) => xv - wv / 2)
  const grow = (av: number) => 1 + (liftScale - 1) * Math.max(0, Math.min(1.2, av))
  const scaleX = useTransform([jelly, a], ([j, av]: number[]) => grow(av) * (1 + 0.25 * Math.max(-0.4, Math.min(1, j))))
  const scaleY = useTransform([jelly, a], ([j, av]: number[]) => grow(av) * (1 - 0.1 * Math.max(-0.4, Math.min(1, j))))
  const placed = useRef(false)
  const settle = useRef(0)

  const snap = useCallback(() => {
    x.jump(tx.get())
    w.jump(tw.get())
    a.jump(lift.get())
    jelly.jump(0)
  }, [x, w, a, jelly, tx, tw, lift])

  const moveTo = useCallback(
    (g: LensGeom, instant = false) => {
      tx.set(g.c)
      tw.set(g.w)
      window.clearTimeout(settle.current)
      if (instant || reduced || !placed.current) {
        placed.current = true
        snap()
        return
      }
      settle.current = window.setTimeout(snap, SETTLE_MS)
    },
    [tx, tw, reduced, snap],
  )

  const setLift = useCallback(
    (on: boolean) => {
      lift.set(on ? 1 : 0)
      if (reduced) a.jump(on ? 1 : 0)
    },
    [lift, a, reduced],
  )

  useEffect(() => () => window.clearTimeout(settle.current), [])

  return { x, w, a, left, scaleX, scaleY, reduced, moveTo, setLift }
}

export type LiquidLens = ReturnType<typeof useLiquidLens>

/** 經過的項目稍微放大（只在按住／拖動時） */
export function useLensMagnify(lens: LiquidLens, geom: RefObject<LensGeom[]>, index: number, amount = 0.15) {
  const { reduced } = lens
  return useTransform([lens.x, lens.a], ([xv, av]: number[]) => {
    const g = geom.current?.[index]
    if (reduced || !g || !g.w) return 1
    const p = Math.max(0, 1 - Math.abs(xv - g.c) / (g.w / 2 + 12))
    return 1 + amount * Math.max(0, Math.min(1, av)) * p
  })
}

type TrackOptions = {
  lens: LiquidLens
  /** 放鏡片的容器（鏡片是它的 absolute 子元素；可以是左右捲動的容器） */
  container: RefObject<HTMLElement | null>
  /** 每一項的按鈕（offsetParent 必須是 container） */
  items: RefObject<(HTMLElement | null)[]>
  count: number
  /** 鏡片平常停在哪一項（-1＝不顯示位置不變） */
  rest: number
  onCommit: (index: number) => void
  /** 哪一項可以開始拖（篇章列：只有拖鏡片本身才移動鏡片，其他地方照舊捲動） */
  canStart?: (index: number) => boolean
  /** 按下就讓鏡片滑到那一項（手機膠囊、分段切換） */
  pressMoves?: boolean
}

export function useLensTrack({ lens, container, items, count, rest, onCommit, canStart, pressMoves = false }: TrackOptions) {
  const geom = useRef<LensGeom[]>([])
  const drag = useRef<{ id: number; x0: number; moved: boolean; idx: number } | null>(null)
  const latest = useRef({ rest, onCommit, canStart })
  const { moveTo, setLift, reduced } = lens

  useLayoutEffect(() => {
    latest.current = { rest, onCommit, canStart }
  })

  const measure = useCallback(() => {
    geom.current = (items.current ?? []).slice(0, count).map((el) => (el ? { c: el.offsetLeft + el.offsetWidth / 2, w: el.offsetWidth } : { c: 0, w: 0 }))
  }, [items, count])

  const toRest = useCallback(
    (instant = false) => {
      const g = geom.current[latest.current.rest]
      if (g && g.w) moveTo(g, instant)
    },
    [moveTo],
  )

  // 目前那一項變了 → 鏡片滑過去（拖動中不動）
  useLayoutEffect(() => {
    if (drag.current) return
    measure()
    toRest()
  }, [rest, measure, toRest])

  // 尺寸變了（字型載入、視窗縮放、換一組項目）→ 直接對齊，不播動畫
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (drag.current) return
      measure()
      toRest(true)
    })
    if (container.current) ro.observe(container.current)
    items.current?.slice(0, count).forEach((el) => el && ro.observe(el))
    return () => ro.disconnect()
  }, [container, items, count, measure, toRest])

  const localX = (e: { clientX: number }) => {
    const el = container.current
    if (!el) return 0
    const r = el.getBoundingClientRect()
    const k = r.width ? el.offsetWidth / r.width : 1
    return (e.clientX - r.left) * k - el.clientLeft + el.scrollLeft
  }
  const nearest = (px: number) => {
    let best = -1
    let dist = Infinity
    geom.current.forEach((g, i) => {
      if (!g.w) return
      const d = Math.abs(px - g.c)
      if (d < dist) {
        dist = d
        best = i
      }
    })
    return best
  }

  /** 回傳 true＝鏡片接手這次按壓（呼叫端就不要再做自己的拖曳捲動） */
  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return false
    measure()
    const idx = nearest(localX(e))
    if (idx < 0 || !(latest.current.canStart?.(idx) ?? true)) return false
    drag.current = { id: e.pointerId, x0: e.clientX, moved: false, idx }
    setLift(true)
    if (pressMoves) moveTo(geom.current[idx])
    return true
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return false
    if (!d.moved) {
      if (Math.abs(e.clientX - d.x0) < SLOP) return true
      d.moved = true
      try {
        container.current?.setPointerCapture(e.pointerId)
      } catch {
        // 模擬事件沒有真的 pointer，抓不到也沒關係
      }
    }
    const px = localX(e)
    const idx = nearest(px)
    if (idx < 0) return true
    d.idx = idx
    const gs = geom.current.filter((g) => g.w)
    const w = geom.current[idx].w
    const lo = Math.min(...gs.map((g) => g.c - g.w / 2)) + w / 2
    const hi = Math.max(...gs.map((g) => g.c + g.w / 2)) - w / 2
    moveTo({ c: reduced ? geom.current[idx].c : Math.min(Math.max(px, lo), hi), w })
    return true
  }

  const end = (e: ReactPointerEvent<HTMLElement>, commit: boolean) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return false
    drag.current = null
    setLift(false)
    const el = container.current
    try {
      if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    } catch {
      // 同上
    }
    if (d.moved) {
      // 拖過就不算點擊：擋掉放開後的那一下 click（不然會選到按下去的那一項）
      const block = (ev: Event) => {
        ev.stopPropagation()
        ev.preventDefault()
      }
      el?.addEventListener('click', block, { capture: true, once: true })
      window.setTimeout(() => el?.removeEventListener('click', block, { capture: true }), 0)
      const target = items.current?.[d.idx] as HTMLButtonElement | null | undefined
      if (commit && target && !target.disabled) latest.current.onCommit(d.idx)
    }
    // 點一下：交給按鈕自己的 click；之後鏡片回到（可能已經換掉的）目前那一項
    window.setTimeout(() => {
      if (!drag.current) toRest()
    }, 0)
    return true
  }

  return {
    geom,
    onPointerDown,
    onPointerMove,
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => end(e, true),
    onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => end(e, false),
  }
}
