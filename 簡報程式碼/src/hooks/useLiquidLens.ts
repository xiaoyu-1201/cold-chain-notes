import { useMotionValue, useReducedMotionConfig, useSpring, useTransform, useVelocity } from 'framer-motion'
import { useCallback, useEffect, useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'

/**
 * 液態玻璃鏡片（10/10，像 iOS 26 分頁列）：手機版懸浮膠囊、電腦版篇章列／頁碼條、分段切換（Segmented）、
 * 一排按鈕（GlassButtonGroup）共用這一份。
 *   - 換到別項：彈簧滑過去（有一點 overshoot），依速度「果凍拉伸」（scaleX 最多 1.25、scaleY 壓扁），停下來回彈。
 *   - 按住左右拖：鏡片跟著手指走，經過的項目稍微放大，放開在哪一項就選哪一項；只是點一下照常（交給 click）。
 *   - 只改 motion value（transform／寬高），拖動時 React 不重新 render。
 *   - 「減少動態效果」（含 MotionConfig、?audit）：沒有彈簧、拉伸、放大，直接切換。
 *   - 背景分頁 rAF 不跑、彈簧會停在半路：每次移動後排一個 timeout，時間到還沒到終點就直接跳過去。
 * 位置用 offsetLeft／offsetTop（不受縮放畫布影響）；指標座標換算成容器自己的座標（除以縮放比例、加上捲動量）。
 */
const LENS_SPRING = { stiffness: 520, damping: 30, mass: 0.9 }
const SIZE_SPRING = { stiffness: 480, damping: 34 }
const LIFT_SPRING = { stiffness: 420, damping: 26 }
const JELLY_SPRING = { stiffness: 380, damping: 13 }
const SETTLE_MS = 900
/** 拖多遠才算拖（觸控要大一點：iOS 手指一點就會晃幾 px，10/10 code review） */
const slopFor = (type: string) => (type === 'mouse' ? 6 : 12)

/** c＝中心 x、w＝寬；m＝中心 y、h＝高（一排按鈕會換行時才用到） */
export type LensGeom = { c: number; w: number; m?: number; h?: number }

export function useLiquidLens({ liftScale = 1.08 }: { liftScale?: number } = {}) {
  const reduced = useReducedMotionConfig() ?? false
  const tx = useMotionValue(0)
  const tw = useMotionValue(0)
  const tm = useMotionValue(0)
  const th = useMotionValue(0)
  const lift = useMotionValue(0)
  const x = useSpring(tx, LENS_SPRING)
  const w = useSpring(tw, SIZE_SPRING)
  const m = useSpring(tm, LENS_SPRING)
  const h = useSpring(th, SIZE_SPRING)
  const a = useSpring(lift, LIFT_SPRING)
  const speed = useTransform(useVelocity(x), [-1600, 0, 1600], [1, 0, 1])
  const jelly = useSpring(speed, JELLY_SPRING)
  const left = useTransform([x, w], ([xv, wv]: number[]) => xv - wv / 2)
  const top = useTransform([m, h], ([mv, hv]: number[]) => mv - hv / 2)
  const grow = (av: number) => 1 + (liftScale - 1) * Math.max(0, Math.min(1.2, av))
  const scaleX = useTransform([jelly, a], ([j, av]: number[]) => grow(av) * (1 + 0.25 * Math.max(-0.4, Math.min(1, j))))
  const scaleY = useTransform([jelly, a], ([j, av]: number[]) => grow(av) * (1 - 0.1 * Math.max(-0.4, Math.min(1, j))))
  const placed = useRef(false)
  const settle = useRef(0)

  const snap = useCallback(() => {
    x.jump(tx.get())
    w.jump(tw.get())
    m.jump(tm.get())
    h.jump(th.get())
    a.jump(lift.get())
    jelly.jump(0)
  }, [x, w, m, h, a, jelly, tx, tw, tm, th, lift])

  const moveTo = useCallback(
    (g: LensGeom, instant = false) => {
      tx.set(g.c)
      tw.set(g.w)
      if (g.m !== undefined && g.h !== undefined) {
        tm.set(g.m)
        th.set(g.h)
      }
      window.clearTimeout(settle.current)
      if (instant || reduced || !placed.current) {
        placed.current = true
        snap()
        return
      }
      settle.current = window.setTimeout(snap, SETTLE_MS)
    },
    [tx, tw, tm, th, reduced, snap],
  )

  const setLift = useCallback(
    (on: boolean) => {
      lift.set(on ? 1 : 0)
      window.clearTimeout(settle.current)
      if (reduced) a.jump(on ? 1 : 0)
      else settle.current = window.setTimeout(snap, SETTLE_MS)
    },
    [lift, a, reduced, snap],
  )

  useEffect(() => () => window.clearTimeout(settle.current), [])

  return { x, w, m, a, left, top, h, scaleX, scaleY, reduced, moveTo, setLift }
}

export type LiquidLens = ReturnType<typeof useLiquidLens>

/** 經過的項目稍微放大（只在按住／拖動時） */
export function useLensMagnify(lens: LiquidLens, geom: RefObject<LensGeom[]>, index: number, amount = 0.15) {
  const { reduced } = lens
  return useTransform([lens.x, lens.a], ([xv, av]: number[]) => lensProximity(geom.current?.[index], xv, av, reduced) * amount + 1)
}

/** 鏡片離這一項多近（0～1），乘上「按住的程度」；有給 y 時，不同排（按鈕換行）＝0 */
export function lensProximity(g: LensGeom | undefined, x: number, a: number, reduced: boolean, y?: number) {
  if (reduced || !g || !g.w) return 0
  if (y !== undefined && g.m !== undefined && g.h !== undefined && Math.abs(y - g.m) > g.h / 2) return 0
  const p = Math.max(0, 1 - Math.abs(x - g.c) / (g.w / 2 + 12))
  return Math.max(0, Math.min(1, a)) * p
}

type TrackOptions = {
  lens: LiquidLens
  /** 放鏡片的容器（鏡片是它的 absolute 子元素；可以是左右捲動的容器） */
  container: RefObject<HTMLElement | null>
  /** 每一項的按鈕（offsetParent 必須是 container） */
  items: RefObject<(HTMLElement | null)[]>
  /** 鏡片平常停在哪一項（-1＝平常不顯示：一排按鈕） */
  rest: number
  onCommit: (index: number) => void
  /** 哪一項可以開始拖（篇章列：只有拖鏡片本身才移動鏡片，其他地方照舊捲動） */
  canStart?: (index: number) => boolean
  /** 按下就讓鏡片滑到那一項（手機膠囊、分段切換、一排按鈕） */
  pressMoves?: boolean
  /** 滑出容器再放開＝取消（一排按鈕） */
  cancelOutside?: boolean
}

type Drag = { id: number; type: string; x0: number; moved: boolean; idx: number; start: number; outside: boolean }

/**
 * 鏡片正在被水平拖（或剛放開）：手機版「左右滑換頁」要讓出來（10/10 code review：整排標 data-no-swipe 範圍太大，
 * 名詞清單 70 顆幾乎整個螢幕都不能滑換頁）。只有真的開始水平拖才擋。
 */
let dragging = false
let draggingSince = 0
let releasedAt = 0
/** 保險：拖曳超過 3 秒還沒結束（例如元件在拖到一半被卸載、收不到放開），就不再擋換頁 */
const MAX_DRAG_MS = 3000
export function lensDragBusy() {
  if (dragging && performance.now() - draggingSince > MAX_DRAG_MS) dragging = false
  return dragging || performance.now() - releasedAt < 400
}

export function useLensTrack({ lens, container, items, rest, onCommit, canStart, pressMoves = false, cancelOutside = false }: TrackOptions) {
  const geom = useRef<LensGeom[]>([])
  const drag = useRef<Drag | null>(null)
  const latest = useRef({ rest, onCommit, canStart })
  const timers = useRef<number[]>([])
  const { moveTo, setLift, reduced } = lens

  useLayoutEffect(() => {
    latest.current = { rest, onCommit, canStart }
  })
  useEffect(() => {
    const list = timers.current
    const d = drag
    return () => {
      list.forEach((t) => window.clearTimeout(t))
      // 拖到一半被卸載（換頁、關掉 Lightbox／3D）：React 不會再送放開給它，「拖曳中」要在這裡解除，不然換頁會一直被擋（10/10 最後一輪 code review）
      if (d.current?.moved) {
        dragging = false
        releasedAt = performance.now()
      }
    }
  }, [])
  const later = useCallback((fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.current = timers.current.filter((x) => x !== t)
      fn()
    }, ms)
    timers.current.push(t)
  }, [])

  const measure = useCallback(() => {
    geom.current = (items.current ?? []).map((el) => (el ? { c: el.offsetLeft + el.offsetWidth / 2, w: el.offsetWidth, m: el.offsetTop + el.offsetHeight / 2, h: el.offsetHeight } : { c: 0, w: 0 }))
  }, [items])

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

  // 尺寸變了（字型載入、視窗縮放）→ 直接對齊，不播動畫。項目元素換了（換一篇的頁碼）就重新訂閱。
  const ro = useRef<ResizeObserver | null>(null)
  const observed = useRef<(HTMLElement | null)[]>([])
  useEffect(() => {
    const list = [container.current, ...(items.current ?? [])]
    if (ro.current && list.length === observed.current.length && list.every((el, i) => el === observed.current[i])) return
    ro.current?.disconnect()
    observed.current = list
    const obs = new ResizeObserver(() => {
      if (drag.current) return
      measure()
      toRest(true)
    })
    list.forEach((el) => el && obs.observe(el))
    ro.current = obs
  })
  useEffect(() => () => ro.current?.disconnect(), [])

  const local = (e: { clientX: number; clientY: number }) => {
    const el = container.current
    if (!el) return { x: 0, y: 0, inside: false }
    const r = el.getBoundingClientRect()
    const k = r.width ? el.offsetWidth / r.width : 1
    const pad = 10
    const inside = e.clientX >= r.left - pad && e.clientX <= r.right + pad && e.clientY >= r.top - pad && e.clientY <= r.bottom + pad
    return { x: (e.clientX - r.left) * k - el.clientLeft + el.scrollLeft, y: (e.clientY - r.top) * k - el.clientTop + el.scrollTop, inside }
  }
  const nearest = (px: number, py: number) => {
    let best = -1
    let dist = Infinity
    geom.current.forEach((g, i) => {
      if (!g.w) return
      const dy = g.m !== undefined && g.h ? Math.max(0, Math.abs(py - g.m) - g.h / 2) * 3 : 0
      const d = Math.abs(px - g.c) + dy
      if (d < dist) {
        dist = d
        best = i
      }
    })
    return best
  }
  const isDisabled = (i: number) => {
    const el = items.current?.[i] as HTMLButtonElement | null | undefined
    return !el || el.disabled || el.getAttribute('aria-disabled') === 'true'
  }

  /** 拖過就不算點擊：擋掉放開後的那一下 click（到下一次按下或 400ms 後才拿掉，iOS 的 click 會晚到） */
  const blockClick = (el: HTMLElement | null) => {
    if (!el) return
    const block = (ev: Event) => {
      // 鍵盤（Enter／空白鍵）產生的 click 不擋
      if ((ev as MouseEvent).detail === 0) return
      ev.stopImmediatePropagation()
      ev.preventDefault()
    }
    const remove = () => {
      el.removeEventListener('click', block, true)
      el.removeEventListener('pointerdown', remove, true)
    }
    el.addEventListener('click', block, { capture: true, once: true })
    el.addEventListener('pointerdown', remove, { capture: true, once: true })
    later(remove, 400)
  }

  const end = (e: { pointerId: number }, commit: boolean) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return false
    drag.current = null
    setLift(false)
    const el = container.current
    try {
      if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    } catch {
      // 模擬事件沒有真的 pointer
    }
    if (d.moved) {
      dragging = false
      releasedAt = performance.now()
      // 先觸發、再擋掉瀏覽器自己的那一下 click（一排按鈕的觸發就是 click()，不能被自己擋掉）
      // 拖出去又拖回按下的那一項放開＝不算（跟篇章列一致，10/10 code review）
      if (commit && !d.outside && d.idx >= 0 && d.idx !== d.start && !isDisabled(d.idx)) latest.current.onCommit(d.idx)
      blockClick(el)
    }
    // 點一下：交給按鈕自己的 click；之後鏡片回到（可能已經換掉的）目前那一項
    later(() => {
      if (!drag.current) toRest()
    }, 0)
    return true
  }

  /** 回傳 true＝鏡片接手這次按壓（呼叫端就不要再做自己的拖曳捲動） */
  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (!e.isPrimary || drag.current) return true
    if (e.pointerType === 'mouse' && e.button !== 0) return false
    measure()
    const p = local(e)
    const idx = nearest(p.x, p.y)
    if (idx < 0 || !(latest.current.canStart?.(idx) ?? true)) return false
    if (isDisabled(idx)) return false
    drag.current = { id: e.pointerId, type: e.pointerType, x0: e.clientX, moved: false, idx, start: idx, outside: false }
    setLift(true)
    if (pressMoves) moveTo(geom.current[idx])
    return true
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return false
    // 滑鼠在外面放開、沒收到 pointerup：按鍵已經放了就直接結束
    if (e.pointerType === 'mouse' && e.buttons === 0) return end(e, false)
    if (!d.moved) {
      if (Math.abs(e.clientX - d.x0) < slopFor(d.type)) return true
      d.moved = true
      dragging = true
      draggingSince = performance.now()
      try {
        container.current?.setPointerCapture(e.pointerId)
      } catch {
        // 同上
      }
    }
    const p = local(e)
    if (cancelOutside) {
      const out = !p.inside
      if (out !== d.outside) {
        d.outside = out
        setLift(!out)
      }
      if (out) return true
    }
    const idx = nearest(p.x, p.y)
    if (idx < 0) return true
    d.idx = idx
    const g = geom.current[idx]
    const row = geom.current.filter((o) => o.w && (o.m === undefined || g.m === undefined || Math.abs(o.m - g.m) < 4))
    const lo = Math.min(...row.map((o) => o.c - o.w / 2)) + g.w / 2
    const hi = Math.max(...row.map((o) => o.c + o.w / 2)) - g.w / 2
    moveTo({ ...g, c: reduced ? g.c : Math.min(Math.max(p.x, lo), hi) })
    return true
  }

  /** 還沒開始拖就離開（滑鼠往上下滑出）＝取消，免得鏡片卡在按下的樣子 */
  const onPointerLeave = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current
    if (d && !d.moved) end(e, false)
  }

  return {
    geom,
    onPointerDown,
    onPointerMove,
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => end(e, true),
    onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => end(e, false),
    onPointerLeave,
    onLostPointerCapture: (e: ReactPointerEvent<HTMLElement>) => end(e, false),
  }
}

/** 直接綁在容器上的 pointer 事件（Segmented、手機膠囊、一排按鈕） */
export function lensBindings(track: ReturnType<typeof useLensTrack>) {
  return {
    onPointerDown: track.onPointerDown,
    onPointerMove: track.onPointerMove,
    onPointerUp: track.onPointerUp,
    onPointerCancel: track.onPointerCancel,
    onPointerLeave: track.onPointerLeave,
    onLostPointerCapture: track.onLostPointerCapture,
  }
}
