import { BookOpen, BookOpenCheck, ChevronLeft, ChevronRight, CornerUpLeft, Maximize, Menu, Minimize, Pointer, Search } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode, type WheelEvent as ReactWheelEvent } from 'react'
import { parts } from '../data/parts'
import { slides } from '../data/slides'
import { isNew } from '../data/whatsNew'
import type { PartId } from '../data/types'
import { cn, pad } from '../lib/cn'
import { toneStyles } from '../lib/tone'
import { Kbd } from './ui/Kbd'
import { LensMagnify, LensView } from './ui/LiquidLens'
import { useLensTrack, useLiquidLens } from '../hooks/useLiquidLens'

interface SlideNavProps {
  index: number
  total: number
  partLabel: string
  title: string
  isFullscreen: boolean
  onPrev: () => void
  onNext: () => void
  onGoTo: (index: number) => void
  onOpenMenu: () => void
  onSearch: () => void
  onProgress: () => void
  onToggleFullscreen: () => void
  /** 頁內連結跳轉後才出現的「返回」目標 */
  back: { number: number; title: string } | null
  onBack: () => void
  onReader: () => void
  /** 本頁可以點的東西（互動提示） */
  hints: string[]
}

/** 滑鼠點擊不搶走焦點，避免之後按 Space 重複觸發按鈕 */
const keepFocus = (e: MouseEvent) => e.preventDefault()

function NavButton({
  label,
  onClick,
  disabled,
  children,
  className,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      onMouseDown={keepFocus}
      disabled={disabled}
      className={cn(
        'flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line bg-card px-3.5 text-slate-200 transition hover:border-sky-500/50 hover:text-sky-300 active:bg-sky-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:pointer-events-none disabled:opacity-35',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function SlideNav({
  index,
  total,
  partLabel,
  title,
  isFullscreen,
  onPrev,
  onNext,
  onGoTo,
  onOpenMenu,
  onSearch,
  onProgress,
  onToggleFullscreen,
  back,
  onBack,
  onReader,
  hints,
}: SlideNavProps) {
  const labelCls = back ? 'hidden' : 'hidden text-sm font-bold xl:inline'
  return (
    <nav
      aria-label="簡報控制"
      className="glass glass-bar relative z-10 flex h-16 shrink-0 items-center gap-4 border-t border-line px-3 sm:px-5"
    >
      {/* 有「返回」鈕時，左邊三顆只留圖示（文字在說明裡），返回鈕才不會壓到篇章列（10/10 QA：1920 寬重疊 14px） */}
      {/* 篇章列是固定寬，大螢幕時左邊先保留一塊給提示／標題，不然會被篇章列吃光；平板（<1280）按鈕只留圖示 */}
      <div className="flex flex-1 items-center gap-3 min-[1600px]:min-w-[260px]">
        <NavButton label="章節目錄 (M)" onClick={onOpenMenu}>
          <Menu className="size-5" aria-hidden />
          <span className={labelCls}>目錄</span>
        </NavButton>
        <NavButton label="搜尋關鍵字 ( / )" onClick={onSearch} className="relative">
          <Search className="size-5" aria-hidden />
          <span className={labelCls}>搜尋</span>
          {/* 10/8 新功能：綠點（NEW_SINCE 往後移就自動退掉） */}
          {isNew('2026-10-08') && <span aria-hidden className="absolute right-1 top-1 size-2 rounded-full bg-emerald-400" />}
        </NavButton>
        <NavButton label="今天讀什麼：讀到哪、今天這 3 頁、錯題複習" onClick={onProgress} className="relative">
          <BookOpenCheck className="size-5" aria-hidden />
          <span className={labelCls}>今天</span>
          {isNew('2026-10-09') && <span aria-hidden className="absolute right-1 top-1 size-2 rounded-full bg-emerald-400" />}
        </NavButton>
        {back ? (
          // 只寫「返回 P.52」：完整標題放在說明（滑鼠停留、讀屏都聽得到），按鈕可以縮小，不會擠到中間的篇章列
          <NavButton
            label={`返回 P.${pad(back.number)} ${back.title}（Backspace）`}
            onClick={onBack}
            className="min-w-0 shrink border-amber-500/60 bg-amber-950 text-amber-100 hover:border-amber-500 hover:text-amber-100"
          >
            <CornerUpLeft className="size-5 shrink-0" aria-hidden />
            <span className="truncate text-sm font-bold">返回 P.{pad(back.number)}</span>
          </NavButton>
        ) : null}
        {/* 提示放在絕對定位層：只用剩下的空間，不會把左半邊撐大、擠到中間的篇章列 */}
        <div className="relative h-10 min-w-0 flex-1">
          {hints.length > 0 ? (
            <p
              title={hints.join('；')}
              className="absolute left-0 top-1/2 hidden max-w-full -translate-y-1/2 items-center gap-2 overflow-hidden rounded-full bg-sky-950 px-3.5 py-1.5 text-sm font-semibold text-sky-100 min-[1600px]:flex"
            >
              <Pointer className="size-4 shrink-0 text-sky-400" aria-hidden />
              <span className="shrink-0 text-sky-300">本頁可以點</span>
              <span className="min-w-0 truncate">{hints.join('；')}</span>
            </p>
          ) : (
            !back && (
              <div className="absolute inset-0 hidden flex-col justify-center min-[1700px]:flex">
                <p className="truncate text-sm font-bold text-slate-100">冷凍材料行培訓筆記</p>
                <p className="truncate text-[13px] text-slate-400">
                  {partLabel}・{title}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* 中間：左邊「篇章列」選篇，右邊「上一頁・這篇的頁碼・頁數・下一頁」翻頁；兩個都固定寬，換篇時什麼都不會動 */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <ChapterBar index={index} onGoTo={onGoTo} />
        <NavButton label="上一頁 (←)" onClick={onPrev} disabled={index === 0}>
          <ChevronLeft className="size-5" aria-hidden />
        </NavButton>
        <PageStrip index={index} onGoTo={onGoTo} />
        <span className="min-w-[60px] shrink-0 text-center font-mono text-sm font-bold tracking-wider text-slate-300" aria-live="polite">
          <span className="text-sky-300">{pad(index + 1)}</span> / {pad(total)}
        </span>
        <NavButton label="下一頁 (→ / Space)" onClick={onNext} disabled={index === total - 1}>
          <ChevronRight className="size-5" aria-hidden />
        </NavButton>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="hidden items-center gap-1.5 whitespace-nowrap text-[13px] text-slate-400 min-[1900px]:flex">
          <Kbd>←</Kbd>
          <Kbd>→</Kbd>
          <span className="mr-2">翻頁</span>
          <Kbd>F</Kbd>
          <span className="mr-2">全螢幕</span>
          <Kbd>M</Kbd>
          <span className="mr-2">目錄</span>
          <Kbd>/</Kbd>
          <span>搜尋</span>
        </div>
        <NavButton label="手機版（一頁一張卡，直式）" onClick={onReader}>
          <BookOpen className="size-5" aria-hidden />
          <span className="hidden text-sm font-bold xl:inline">手機版</span>
        </NavButton>
        <NavButton label={isFullscreen ? '離開全螢幕 (F)' : '全螢幕 (F)'} onClick={onToggleFullscreen}>
          {isFullscreen ? <Minimize className="size-5" aria-hidden /> : <Maximize className="size-5" aria-hidden />}
        </NavButton>
      </div>
    </nav>
  )
}

/** 依篇章分組（保持投影片順序），給頁碼點分區用 */
const dotGroups = slides.reduce<{ part: PartId; items: number[] }[]>((acc, s, i) => {
  const last = acc[acc.length - 1]
  if (last && last.part === s.part) last.items.push(i)
  else acc.push({ part: s.part, items: [i] })
  return acc
}, [])

/** 頁碼點上方的篇章小標（步驟用圈號＋兩字，其他兩字） */
const groupLabel = (p: PartId) => {
  const part = parts[p]
  return part.step ? part.short.replace(' ', '') : part.short
}

const arrowCls = 'absolute top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-card text-slate-200 ring-1 ring-line transition hover:text-sky-300 hover:ring-sky-500/50 focus-visible:outline-2 focus-visible:outline-sky-500'
const stripCls = 'relative flex items-center overflow-x-auto rounded-full border border-line bg-card p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
const focusRing = 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-500'

/** 目前這一頁屬於哪一篇 */
const groupOf = (index: number) => dotGroups.find((g) => g.items.includes(index)) ?? dotGroups[0]

/** 浮出說明：只有滑鼠才顯示（手指點了沒有「移開」這回事，說明框會一直留在畫面上） */
function useHoverTip() {
  const wrap = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<{ i: number; x: number } | null>(null)
  const show = useCallback(
    (i: number) => (e: { currentTarget: HTMLElement }) => {
      if (!window.matchMedia('(hover: hover)').matches) return
      const box = wrap.current?.getBoundingClientRect()
      const r = e.currentTarget.getBoundingClientRect()
      if (box) setTip({ i, x: r.left + r.width / 2 - box.left })
    },
    [],
  )
  const clear = useCallback(() => setTip(null), [])
  return { wrap, tip, show, clear }
}

/** 橫向捲動條共用的行為：兩端淡出、點箭頭捲 60%、滑鼠按住拖（拖過不算點擊）、滾輪 */
function useStripScroll() {
  const scroller = useRef<HTMLDivElement>(null)
  const [fade, setFade] = useState({ l: false, r: false })
  const measure = useCallback(() => {
    const el = scroller.current
    if (!el) return
    setFade({ l: el.scrollLeft > 2, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 })
  }, [])
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])
  const mask = fade.l || fade.r ? `linear-gradient(to right, ${fade.l ? 'transparent, #000 32px' : '#000'}, ${fade.r ? '#000 calc(100% - 32px), transparent' : '#000'})` : undefined
  const slide = (dir: -1 | 1) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.6, behavior: 'smooth' })
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    if (d?.moved) {
      const block = (ev: Event) => ev.stopPropagation()
      scroller.current?.addEventListener('click', block, { capture: true, once: true })
      window.setTimeout(() => scroller.current?.removeEventListener('click', block, { capture: true }), 0)
    }
  }
  const handlers = {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== 'mouse') return
      drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false }
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = drag.current
      if (!d || !e.buttons) return
      const dx = e.clientX - d.x
      if (Math.abs(dx) > 4) d.moved = true
      if (d.moved) e.currentTarget.scrollLeft = d.left - dx
    },
    onPointerUp,
    onPointerLeave: onPointerUp,
    onWheel: (e: ReactWheelEvent<HTMLDivElement>) => {
      if (scroller.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) scroller.current.scrollLeft += e.deltaY
    },
  }
  const scrollable = fade.l || fade.r
  return { scroller, fade, mask, slide, handlers, measure, scrollable }
}

function Arrows({ fade, slide, label }: { fade: { l: boolean; r: boolean }; slide: (dir: -1 | 1) => void; label: string }) {
  return (
    <>
      {fade.l && (
        <button type="button" onClick={() => slide(-1)} onMouseDown={keepFocus} aria-label={`${label}往左捲`} className={cn(arrowCls, 'left-0')}>
          <ChevronLeft className="size-4" aria-hidden />
        </button>
      )}
      {fade.r && (
        <button type="button" onClick={() => slide(1)} onMouseDown={keepFocus} aria-label={`${label}往右捲`} className={cn(arrowCls, 'right-0')}>
          <ChevronRight className="size-4" aria-hidden />
        </button>
      )}
    </>
  )
}

/**
 * 篇章列：一排九個篇名，位置固定；目前這篇變亮（用該篇的顏色），點篇名跳到該篇第一頁。
 * 頁碼不放在這裡（在旁邊的 PageStrip），所以換篇時外框和篇名都不會動。
 * 螢幕不夠寬（iPad）時可以左右滑、兩端有箭頭、滑鼠可以按住拖。
 */
function ChapterBar({ index, onGoTo }: { index: number; onGoTo: (index: number) => void }) {
  const { wrap, tip, show, clear } = useHoverTip()
  const { scroller, fade, mask, slide, handlers, measure, scrollable } = useStripScroll()
  const cur = groupOf(index)
  const curIdx = dotGroups.indexOf(cur)
  const active = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const el = scroller.current
    const btn = active.current
    if (el && btn && el.scrollWidth > el.clientWidth) el.scrollLeft = btn.offsetLeft - el.clientWidth / 2 + btn.offsetWidth / 2
    measure()
  }, [cur, measure, scroller])
  // 液態玻璃鏡片：目前這篇；按住鏡片（目前那篇）拖＝移動鏡片、放開跳到那一篇；在別的地方拖＝照舊捲動篇章列
  const lens = useLiquidLens({ liftScale: 1 })
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const track = useLensTrack({ lens, container: scroller, items, count: dotGroups.length, rest: curIdx, canStart: (i) => i === curIdx, onCommit: (i) => onGoTo(dotGroups[i].items[0]) })
  return (
    <div ref={wrap} className="relative hidden min-w-0 lg:block" onMouseLeave={clear}>
      <Arrows fade={fade} slide={slide} label="篇章列" />
      <div
        ref={scroller}
        {...handlers}
        {...lensHandlers(track, handlers)}
        onScroll={() => (measure(), clear())}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className={cn(stripCls, scrollable && 'cursor-grab active:cursor-grabbing')}
      >
        <LensView lens={lens} className="inset-y-1" restClassName={toneStyles[parts[cur.part].tone].soft} />
        {dotGroups.map((group, gi) => {
          const part = parts[group.part]
          const current = group === cur
          return (
            <button
              key={group.part}
              ref={(el) => {
                items.current[gi] = el
                if (current) active.current = el
              }}
              type="button"
              onClick={() => onGoTo(group.items[0])}
              onMouseDown={keepFocus}
              onMouseEnter={show(group.items[0])}
              onFocus={show(group.items[0])}
              aria-label={`${part.short}：${group.items.length} 頁，跳到第一頁`}
              aria-current={current ? 'true' : undefined}
              className={cn(
                'relative shrink-0 whitespace-nowrap rounded-full px-[5px] py-1.5 text-[13px] font-semibold leading-tight transition xl:px-2.5 2xl:px-3 2xl:text-[14px]',
                current ? cn('touch-pan-y font-bold', toneStyles[part.tone].text) : 'text-slate-400 hover:bg-white/[0.05] hover:text-ink',
                focusRing,
              )}
            >
              <LensMagnify lens={lens} geom={track.geom} index={gi}>
                {groupLabel(group.part)}
              </LensMagnify>
              {/* 這一篇裡有新頁：右上角綠點 */}
              {group.items.some((i) => isNew(slides[i].added)) && <span aria-hidden className="absolute right-1 top-1 size-2 rounded-full bg-emerald-400" />}
            </button>
          )
        })}
      </div>
      {tip && <Tip i={tip.i} x={tip.x} />}
    </div>
  )
}

/**
 * 頁碼條：目前這篇的每一頁一顆，放在上一頁／下一頁中間。寬度固定（放得下 7 顆），
 * 頁數多的篇（元件 20 頁）可以左右滑，目前頁自動捲到中間；換篇時篇章列和這條的位置都不變。
 */
function PageStrip({ index, onGoTo }: { index: number; onGoTo: (index: number) => void }) {
  const { wrap, tip, show, clear } = useHoverTip()
  const { scroller, mask, handlers, measure, scrollable } = useStripScroll()
  const cur = groupOf(index)
  const curIdx = cur.items.indexOf(index)
  const active = useRef<HTMLButtonElement>(null)
  // 液態玻璃鏡片：目前這頁；按住鏡片拖＝移動鏡片、放開跳到那一頁；在別的地方拖＝照舊捲動
  const lens = useLiquidLens({ liftScale: 1 })
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const track = useLensTrack({ lens, container: scroller, items, count: cur.items.length, rest: curIdx, canStart: (k) => k === curIdx, onCommit: (k) => onGoTo(cur.items[k]) })
  useEffect(() => {
    const el = scroller.current
    const btn = active.current
    if (el && btn && el.scrollWidth > el.clientWidth) {
      const left = btn.offsetLeft - el.clientWidth / 2 + btn.offsetWidth / 2
      el.scrollTo({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    }
    measure()
  }, [index, measure, scroller])
  return (
    <div ref={wrap} className="relative hidden lg:block" onMouseLeave={clear}>
      <div
        ref={scroller}
        {...handlers}
        {...lensHandlers(track, handlers)}
        onScroll={() => (measure(), clear())}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        aria-label={`${parts[cur.part].short}的頁碼`}
        className={cn(stripCls, 'w-[204px] xl:w-[232px]', scrollable && 'cursor-grab active:cursor-grabbing')}
      >
        <LensView lens={lens} className="inset-y-1" restClassName="bg-sky-950" />
        {/* mx-auto：不滿 7 顆時置中；超過時 auto margin 變 0，左邊不會被切掉 */}
        <div className="mx-auto flex shrink-0 items-center gap-1">
          {cur.items.map((i, k) => {
            const on = i === index
            return (
              <button
                key={slides[i].id}
                ref={(el) => {
                  items.current[k] = el
                  if (on) active.current = el
                }}
                type="button"
                aria-label={`第 ${i + 1} 頁：${slides[i].title}`}
                aria-current={on ? 'page' : undefined}
                onClick={() => onGoTo(i)}
                onMouseDown={keepFocus}
                onMouseEnter={show(i)}
                onFocus={show(i)}
                className={cn(
                  // after:：看不見的外圈，平板手指點得到（觸控範圍 36px）
                  'relative flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-bold transition after:absolute after:-inset-1.5 after:content-[""]',
                  on ? 'touch-pan-y font-black text-sky-200' : 'text-slate-300 hover:bg-white/[0.07] hover:text-ink',
                  // 查閱頁：字淡一點（必讀的才是實心）
                  !on && slides[i].tier === 'ref' && 'text-slate-500',
                  // 這一批新增的頁：綠色外框＋右上角小點（目前頁用綠框就夠）
                  isNew(slides[i].added) && (on ? 'ring-2 ring-emerald-400' : 'ring-1 ring-emerald-500/80 text-emerald-200'),
                  focusRing,
                )}
              >
                <LensMagnify lens={lens} geom={track.geom} index={k}>
                  {k + 1}
                </LensMagnify>
                {isNew(slides[i].added) && !on && <span aria-hidden className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-400" />}
              </button>
            )
          })}
        </div>
      </div>
      {tip && <Tip i={tip.i} x={tip.x} />}
    </div>
  )
}
/** 篇章列／頁碼條：按在鏡片（目前那一項）上＝移動鏡片，其他地方照舊（滑鼠按住拖＝捲動） */
function lensHandlers(track: ReturnType<typeof useLensTrack>, strip: ReturnType<typeof useStripScroll>['handlers']) {
  return {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!track.onPointerDown(e)) strip.onPointerDown(e)
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!track.onPointerMove(e)) strip.onPointerMove(e)
    },
    onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => {
      track.onPointerUp(e)
      strip.onPointerUp()
    },
    onPointerCancel: track.onPointerCancel,
  }
}

/** 篇章列的浮出說明 */
function Tip({ i, x }: { i: number; x: number }) {
  const s = slides[i]
  return (
    <span style={{ left: x }} className="pointer-events-none absolute bottom-full z-50 mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-card px-3 py-1.5 text-[13px] font-semibold text-slate-100 shadow-[0_6px_18px_-8px_rgba(15,36,64,0.3)]">
      <span className="font-mono text-sky-400">P.{pad(i + 1)}</span>
      <span className={cn('mx-1.5', toneStyles[parts[s.part].tone].text)}>{parts[s.part].short}</span>
      {isNew(s.added) && <span className="mr-1.5 rounded bg-emerald-400 px-1.5 text-[13px] font-black text-paper">新</span>}
      {s.tier === 'ref' && <span className="mr-1.5 text-slate-400">查閱 ·</span>}
      {s.title}
    </span>
  )
}
