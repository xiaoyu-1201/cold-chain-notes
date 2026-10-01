import { BookOpen, ChevronLeft, ChevronRight, CornerUpLeft, Maximize, Menu, Minimize, Pointer } from 'lucide-react'
import { useState, type MouseEvent, type ReactNode } from 'react'
import { parts } from '../data/parts'
import { slides } from '../data/slides'
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
        'flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/10 bg-white/[0.04] px-3 text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:pointer-events-none disabled:opacity-30',
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
        ) : null}
        {hints.length > 0 ? (
          <p
            title={hints.join('；')}
            className="hidden items-center gap-2 overflow-hidden rounded-xl border border-dashed border-sky-400/50 bg-sky-400/10 px-3 py-1.5 text-sm font-semibold text-sky-100 xl:flex"
          >
            <Pointer className="size-4 shrink-0 animate-pulse text-sky-300" aria-hidden />
            <span className="shrink-0 text-sky-300">本頁可以點</span>
            <span className="min-w-0 truncate">{hints.join('；')}</span>
          </p>
        ) : (
          !back && (
            <div className="hidden min-w-0 min-[1700px]:block">
              <p className="truncate text-sm font-bold text-slate-100">氣冷式冷凍冷藏系統・新人培訓</p>
              <p className="truncate text-xs text-slate-400">
                {partLabel}・{title}
              </p>
            </div>
          )
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
        <div className="hidden items-center gap-1.5 whitespace-nowrap text-xs text-slate-400 min-[1900px]:flex">
          <Kbd>←</Kbd>
          <Kbd>→</Kbd>
          <span className="mr-2">翻頁</span>
          <Kbd>F</Kbd>
          <span className="mr-2">全螢幕</span>
          <Kbd>M</Kbd>
          <span>目錄</span>
        </div>
        <NavButton label="閱讀模式（單欄捲動，手機適用）" onClick={onReader}>
          <BookOpen className="size-5" aria-hidden />
          <span className="hidden text-sm font-bold md:inline">閱讀</span>
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

/** 頁碼點：依篇章分組分色；滑鼠靠近時像 Mac Dock 放大，並立即浮出「頁碼・篇章・頁名」 */
function DockDots({ index, onGoTo }: { index: number; onGoTo: (index: number) => void }) {
  const [hover, setHover] = useState<number | null>(null)
  return (
    <div className="hidden h-14 items-end gap-3 md:flex" onMouseLeave={() => setHover(null)}>
      {dotGroups.map((group) => {
        const tone = toneStyles[parts[group.part].tone]
        const current = group.items.includes(index)
        return (
          <div key={group.part} className="flex min-w-max flex-col items-center">
            <span className={cn('whitespace-nowrap text-[13px] font-bold leading-4', current ? tone.text : 'text-slate-300')}>{groupLabel(group.part)}</span>
            <div className="flex items-end">
              {group.items.map((i) => {
                const s = slides[i]
                const d = hover === null ? 99 : Math.abs(i - hover)
                const scale = d === 0 ? 2.4 : d === 1 ? 1.75 : d === 2 ? 1.3 : 1
                const active = i === index
                const size = 9 * scale
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`第 ${i + 1} 頁：${s.title}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => onGoTo(i)}
                    onMouseDown={keepFocus}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    className="relative flex h-9 items-end justify-center px-[3px] pb-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                  >
                    {hover === i && (
                      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-navy-800 px-2.5 py-1 text-xs font-semibold text-slate-100 shadow-lg">
                        <span className="font-mono text-sky-300">P.{pad(i + 1)}</span>
                        <span className={cn('mx-1.5', tone.text)}>{parts[s.part].short}</span>
                        {s.title}
                      </span>
                    )}
                    <span
                      className={cn(
                        'flex items-center justify-center rounded-full font-mono font-bold leading-none text-navy-950 transition-all duration-150 ease-out',
                        active ? 'bg-sky-300' : d === 0 ? 'bg-slate-100' : cn(tone.dot, 'opacity-60'),
                      )}
                      style={{ width: active ? Math.max(size, 22) : size, height: size, fontSize: scale >= 1.75 ? 10 + (scale - 1.75) * 4 : 0 }}
                    >
                      {scale >= 1.75 ? i + 1 : ''}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}