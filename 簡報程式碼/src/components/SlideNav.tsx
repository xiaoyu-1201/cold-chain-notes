import { ChevronLeft, ChevronRight, CornerUpLeft, Maximize, Menu, Minimize } from 'lucide-react'
import { useState, type MouseEvent, type ReactNode } from 'react'
import { slides } from '../data/slides'
import { cn, pad } from '../lib/cn'
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
        'flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:pointer-events-none disabled:opacity-30',
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
}: SlideNavProps) {
  return (
    <nav
      aria-label="簡報控制"
      className="flex h-16 shrink-0 items-center gap-4 border-t border-white/10 bg-navy-900/85 px-3 backdrop-blur sm:px-5"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <NavButton label="章節目錄 (M)" onClick={onOpenMenu}>
          <Menu className="size-5" aria-hidden />
          <span className="hidden text-sm font-bold md:inline">目錄</span>
        </NavButton>
        {back ? (
          <NavButton
            label={`返回 P.${pad(back.number)} ${back.title}（Backspace）`}
            onClick={onBack}
            className="min-w-0 border-amber-400/50 bg-amber-400/15 text-amber-50 hover:border-amber-300 hover:bg-amber-400/25"
          >
            <CornerUpLeft className="size-5 shrink-0" aria-hidden />
            <span className="truncate text-sm font-bold">
              返回 P.{pad(back.number)}
              <span className="ml-1.5 hidden font-medium text-amber-100/80 sm:inline">{back.title}</span>
            </span>
          </NavButton>
        ) : (
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-bold text-slate-100">氣冷式冷凍冷藏系統・新人培訓</p>
            <p className="truncate text-xs text-slate-400">
              {partLabel}・{title}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <NavButton label="上一頁 (←)" onClick={onPrev} disabled={index === 0}>
          <ChevronLeft className="size-5" aria-hidden />
        </NavButton>
        <DockDots index={index} onGoTo={onGoTo} />
        <span className="min-w-[124px] text-center font-mono text-sm font-bold tracking-wider text-slate-300" aria-live="polite">
          Slide <span className="text-sky-300">{pad(index + 1)}</span> / {pad(total)}
        </span>
        <NavButton label="下一頁 (→ / Space)" onClick={onNext} disabled={index === total - 1}>
          <ChevronRight className="size-5" aria-hidden />
        </NavButton>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="hidden items-center gap-1.5 text-xs text-slate-400 xl:flex">
          <Kbd>←</Kbd>
          <Kbd>→</Kbd>
          <span className="mr-2">翻頁</span>
          <Kbd>F</Kbd>
          <span className="mr-2">全螢幕</span>
          <Kbd>M</Kbd>
          <span>目錄</span>
        </div>
        <NavButton label={isFullscreen ? '離開全螢幕 (F)' : '全螢幕 (F)'} onClick={onToggleFullscreen}>
          {isFullscreen ? <Minimize className="size-5" aria-hidden /> : <Maximize className="size-5" aria-hidden />}
        </NavButton>
      </div>
    </nav>
  )
}

/** 頁碼點：像 Mac Dock 一樣，滑鼠靠近時放大並顯示頁碼；點擊範圍加大 */
function DockDots({ index, onGoTo }: { index: number; onGoTo: (index: number) => void }) {
  const [hover, setHover] = useState<number | null>(null)
  return (
    <div className="hidden h-11 items-end md:flex" onMouseLeave={() => setHover(null)}>
      {slides.map((s, i) => {
        const d = hover === null ? 99 : Math.abs(i - hover)
        const scale = d === 0 ? 2.4 : d === 1 ? 1.75 : d === 2 ? 1.3 : 1
        const active = i === index
        const size = 9 * scale
        return (
          <button
            key={s.id}
            type="button"
            title={`${pad(i + 1)} · ${s.title}`}
            aria-label={`第 ${i + 1} 頁：${s.title}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => onGoTo(i)}
            onMouseDown={keepFocus}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            className="relative flex h-11 items-end justify-center px-[3px] pb-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            <span
              className={cn(
                'flex items-center justify-center rounded-full font-mono font-bold leading-none text-navy-950 transition-all duration-150 ease-out',
                active ? 'bg-sky-300' : d === 0 ? 'bg-slate-200' : 'bg-slate-500',
              )}
              style={{ width: active ? Math.max(size, 22) : size, height: size, fontSize: scale >= 1.75 ? 10 + (scale - 1.75) * 4 : 0 }}
            >
              {scale >= 1.75 ? i + 1 : ''}
            </span>
          </button>
        )
      })}
    </div>
  )
}