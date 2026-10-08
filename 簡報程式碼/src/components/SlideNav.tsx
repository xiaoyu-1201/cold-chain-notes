import { BookOpen, ChevronLeft, ChevronRight, CornerUpLeft, Maximize, Menu, Minimize, Pointer } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { parts } from '../data/parts'
import { slides } from '../data/slides'
import { isNew } from '../data/whatsNew'
import type { PartId } from '../data/types'
import { cn, pad } from '../lib/cn'
import { toneStyles } from '../lib/tone'
import { Kbd } from './ui/Kbd'

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
        'flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white/[0.07] px-3.5 text-slate-200 transition hover:bg-white/[0.14] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:pointer-events-none disabled:opacity-30',
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
  onToggleFullscreen,
  back,
  onBack,
  onReader,
  hints,
}: SlideNavProps) {
  return (
    <nav
      aria-label="簡報控制"
      className="flex h-16 shrink-0 items-center gap-4 bg-[#0b1626]/90 px-3 backdrop-blur sm:px-5"
    >
      {/* 篇章列現在是固定寬，大螢幕時左邊先保留一塊給提示／標題，不然會被篇章列吃光 */}
      <div className="flex flex-1 items-center gap-3 min-[1600px]:min-w-[260px]">
        <NavButton label="章節目錄 (M)" onClick={onOpenMenu}>
          <Menu className="size-5" aria-hidden />
          <span className="hidden text-sm font-bold md:inline">目錄</span>
        </NavButton>
        {back ? (
          <NavButton
            label={`返回 P.${pad(back.number)} ${back.title}（Backspace）`}
            onClick={onBack}
            className="min-w-0 bg-amber-400/20 text-amber-50 hover:bg-amber-400/30"
          >
            <CornerUpLeft className="size-5 shrink-0" aria-hidden />
            <span className="truncate text-sm font-bold">
              返回 P.{pad(back.number)}
              <span className="ml-1.5 hidden font-medium text-amber-100/80 sm:inline">{back.title}</span>
            </span>
          </NavButton>
        ) : null}
        {/* 提示放在絕對定位層：只用剩下的空間，不會把左半邊撐大、擠到中間的篇章列 */}
        <div className="relative h-10 min-w-0 flex-1">
          {hints.length > 0 ? (
            <p
              title={hints.join('；')}
              className="absolute left-0 top-1/2 hidden max-w-full -translate-y-1/2 items-center gap-2 overflow-hidden rounded-full bg-sky-400/10 px-3.5 py-1.5 text-sm font-semibold text-sky-100 min-[1600px]:flex"
            >
              <Pointer className="size-4 shrink-0 animate-pulse text-sky-300" aria-hidden />
              <span className="shrink-0 text-sky-300">本頁可以點</span>
              <span className="min-w-0 truncate">{hints.join('；')}</span>
            </p>
          ) : (
            !back && (
              <div className="absolute inset-0 hidden flex-col justify-center min-[1700px]:flex">
                <p className="truncate text-sm font-bold text-slate-100">氣冷式冷凍冷藏系統・新人培訓</p>
                <p className="truncate text-xs text-slate-400">
                  {partLabel}・{title}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <NavButton label="上一頁 (←)" onClick={onPrev} disabled={index === 0}>
          <ChevronLeft className="size-5" aria-hidden />
        </NavButton>
        <ChapterBar index={index} onGoTo={onGoTo} />
        <span className="min-w-[72px] shrink-0 text-center font-mono text-sm font-bold tracking-wider text-slate-300" aria-live="polite">
          <span className="text-sky-300">{pad(index + 1)}</span> / {pad(total)}
        </span>
        <NavButton label="下一頁 (→ / Space)" onClick={onNext} disabled={index === total - 1}>
          <ChevronRight className="size-5" aria-hidden />
        </NavButton>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="hidden items-center gap-1.5 whitespace-nowrap text-xs text-slate-400 min-[1900px]:flex">
          <Kbd>←</Kbd>
          <Kbd>→</Kbd>
          <span className="mr-2">翻頁</span>
          <Kbd>F</Kbd>
          <span className="mr-2">全螢幕</span>
          <Kbd>M</Kbd>
          <span>目錄</span>
        </div>
        <NavButton label="手機版（一頁一張卡，直式）" onClick={onReader}>
          <BookOpen className="size-5" aria-hidden />
          <span className="hidden text-sm font-bold md:inline">手機版</span>
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

/**
 * 篇章列（取代頁碼點）：九篇名稱一直看得到；目前這篇展開成頁碼膠囊，
 * 滑鼠移上去浮出「頁碼・篇章・頁名」；點篇名跳到該篇第一頁。
 * 螢幕不夠寬（iPad）時可以左右滑，並自動捲到目前這頁；浮出說明畫在捲動區外面才不會被切掉。
 */
function ChapterBar({ index, onGoTo }: { index: number; onGoTo: (index: number) => void }) {
  const [tip, setTip] = useState<{ i: number; x: number } | null>(null)
  const [fade, setFade] = useState({ l: false, r: false })
  const wrap = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const active = useRef<HTMLButtonElement>(null)
  const measure = useCallback(() => {
    const el = scroller.current
    if (!el) return
    setFade({ l: el.scrollLeft > 2, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 })
  }, [])
  useEffect(() => {
    const el = scroller.current
    const btn = active.current
    if (el && btn && el.scrollWidth > el.clientWidth) el.scrollLeft = btn.offsetLeft - el.clientWidth / 2 + btn.offsetWidth / 2
    measure()
  }, [index, measure])
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])
  const show = (i: number) => (e: { currentTarget: HTMLElement }) => {
    const box = wrap.current?.getBoundingClientRect()
    const r = e.currentTarget.getBoundingClientRect()
    if (box) setTip({ i, x: r.left + r.width / 2 - box.left })
  }
  const mask = fade.l || fade.r ? `linear-gradient(to right, ${fade.l ? 'transparent, #000 40px' : '#000'}, ${fade.r ? '#000 calc(100% - 40px), transparent' : '#000'})` : undefined
  // 篇章列太長時：兩端有箭頭可以點、滑鼠也可以按住左右拖
  const slide = (dir: -1 | 1) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.6, behavior: 'smooth' })
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const onPointerDown = (e: { pointerType: string; clientX: number; currentTarget: HTMLDivElement }) => {
    if (e.pointerType !== 'mouse') return
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false }
  }
  const onPointerMove = (e: { clientX: number; currentTarget: HTMLDivElement; buttons: number }) => {
    const d = drag.current
    if (!d || !e.buttons) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 4) d.moved = true
    if (d.moved) e.currentTarget.scrollLeft = d.left - dx
  }
  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    // 拖過就不要算成點擊（不然放開時會跳頁）
    if (d?.moved) {
      const block = (ev: Event) => ev.stopPropagation()
      scroller.current?.addEventListener('click', block, { capture: true, once: true })
      window.setTimeout(() => scroller.current?.removeEventListener('click', block, { capture: true }), 0)
    }
  }
  const arrowCls = 'absolute top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-navy-800/90 text-slate-200 shadow-md ring-1 ring-white/15 transition hover:bg-navy-700 hover:text-white focus-visible:outline-2 focus-visible:outline-sky-300'
  // 篇章列寬度固定成「最寬的那一種情況」（頁數最多的那篇展開時），換篇時外框才不會跟著伸縮、
  // 把旁邊的頁碼和按鈕擠來擠去。寬度用一排看不見的替身量出來；字型載入完會重量一次。
  const ghost = useRef<HTMLDivElement>(null)
  const [barW, setBarW] = useState<number>()
  useEffect(() => {
    const g = ghost.current
    if (!g) return
    const calc = () => {
      const kids = Array.from(g.children) as HTMLElement[]
      const label = kids.filter((k) => k.dataset.kind === 'label').map((k) => k.offsetWidth)
      const open = kids.filter((k) => k.dataset.kind === 'open').map((k) => k.offsetWidth)
      const sum = label.reduce((a, b) => a + b, 0)
      const widest = Math.max(...open.map((w, i) => sum - label[i] + w))
      if (Number.isFinite(widest) && widest > 0) setBarW(Math.ceil(widest) + 8) // 外框 p-1：左右各 4px
    }
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(g)
    document.fonts?.ready.then(calc)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={wrap} style={{ width: barW }} className="relative hidden min-w-0 lg:block" onMouseLeave={() => setTip(null)}>
      {/* 替身收在 0×0 的隱藏盒子裡量尺寸，不會把 nav 撐出一條看不見的橫向捲動 */}
      <div aria-hidden className="absolute left-0 top-0 size-0 overflow-hidden">
      <div ref={ghost} className="pointer-events-none invisible flex w-max items-center whitespace-nowrap">
        {dotGroups.map((group) => (
          <span key={`l-${group.part}`} data-kind="label" className="shrink-0 px-3 py-1.5 text-[14px] font-semibold">
            {groupLabel(group.part)}
          </span>
        ))}
        {dotGroups.map((group) => (
          <span key={`o-${group.part}`} data-kind="open" className="flex shrink-0 items-center gap-1 py-0.5 pl-3 pr-1">
            <span className="mr-1 text-[14px] font-bold">{groupLabel(group.part)}</span>
            {group.items.map((i) => (
              <span key={i} className="size-7 shrink-0" />
            ))}
          </span>
        ))}
      </div>
      </div>
      {fade.l && (
        <button type="button" onClick={() => slide(-1)} onMouseDown={keepFocus} aria-label="篇章列往左捲" className={cn(arrowCls, 'left-0')}>
          <ChevronLeft className="size-4" aria-hidden />
        </button>
      )}
      {fade.r && (
        <button type="button" onClick={() => slide(1)} onMouseDown={keepFocus} aria-label="篇章列往右捲" className={cn(arrowCls, 'right-0')}>
          <ChevronRight className="size-4" aria-hidden />
        </button>
      )}
      <div
        ref={scroller}
        onScroll={() => (measure(), setTip(null))}
        onWheel={(e) => {
          if (scroller.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) scroller.current.scrollLeft += e.deltaY
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className={cn('relative flex items-center overflow-x-auto rounded-full bg-white/[0.06] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', (fade.l || fade.r) && 'cursor-grab active:cursor-grabbing')}
      >
        {/* mx-auto：內容比外框窄時置中；內容比外框寬時 auto margin 自動變 0，左邊不會被切掉 */}
        <div className="mx-auto flex shrink-0 items-center">
        {dotGroups.map((group) => {
          const part = parts[group.part]
          const tone = toneStyles[part.tone]
          const current = group.items.includes(index)
          if (!current)
            return (
              <button
                key={group.part}
                type="button"
                onClick={() => onGoTo(group.items[0])}
                onMouseDown={keepFocus}
                onMouseEnter={show(group.items[0])}
                onFocus={show(group.items[0])}
                aria-label={`${part.short}：${group.items.length} 頁，跳到第一頁`}
                className="relative shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[14px] font-semibold text-slate-400 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-300"
              >
                {groupLabel(group.part)}
                {/* 這一篇裡有新頁：右上角綠點 */}
                {group.items.some((i) => isNew(slides[i].added)) && <span aria-hidden className="absolute right-1 top-1 size-2 rounded-full bg-emerald-400" />}
              </button>
            )
          return (
            <div key={group.part} className="flex shrink-0 items-center gap-1 rounded-full bg-white/[0.1] py-0.5 pl-3 pr-1">
              <span className={cn('mr-1 whitespace-nowrap text-[14px] font-bold', tone.text)}>{groupLabel(group.part)}</span>
              {group.items.map((i, k) => {
                const on = i === index
                return (
                  <button
                    key={slides[i].id}
                    ref={on ? active : undefined}
                    type="button"
                    aria-label={`第 ${i + 1} 頁：${slides[i].title}`}
                    aria-current={on ? 'page' : undefined}
                    onClick={() => onGoTo(i)}
                    onMouseDown={keepFocus}
                    onMouseEnter={show(i)}
                    onFocus={show(i)}
                    className={cn(
                      'relative flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-bold transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-300',
                      on ? 'bg-sky-300 text-navy-950' : 'text-slate-300 hover:bg-white/[0.14] hover:text-white',
                      // 查閱頁：字淡一點（必讀的才是實心）
                      !on && slides[i].tier === 'ref' && 'text-slate-500',
                      // 這一批新增的頁：綠色外框＋右上角小點（目前頁用綠框就夠）
                      isNew(slides[i].added) && (on ? 'ring-2 ring-emerald-400' : 'ring-1 ring-emerald-400/80 text-emerald-200'),
                    )}
                  >
                    {k + 1}
                    {isNew(slides[i].added) && !on && <span aria-hidden className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-400" />}
                  </button>
                )
              })}
            </div>
          )
        })}
        </div>
      </div>
      {tip && <Tip i={tip.i} x={tip.x} />}
    </div>
  )
}
/** 篇章列的浮出說明 */
function Tip({ i, x }: { i: number; x: number }) {
  const s = slides[i]
  return (
    <span style={{ left: x }} className="pointer-events-none absolute bottom-full z-50 mb-3 -translate-x-1/2 whitespace-nowrap rounded-xl bg-navy-800/95 px-3 py-1.5 text-[13px] font-semibold text-slate-100 shadow-lg backdrop-blur">
      <span className="font-mono text-sky-300">P.{pad(i + 1)}</span>
      <span className={cn('mx-1.5', toneStyles[parts[s.part].tone].text)}>{parts[s.part].short}</span>
      {isNew(s.added) && <span className="mr-1.5 rounded bg-emerald-400 px-1.5 text-[12px] font-black text-navy-950">新</span>}
      {s.tier === 'ref' && <span className="mr-1.5 text-slate-400">查閱 ·</span>}
      {s.title}
    </span>
  )
}
