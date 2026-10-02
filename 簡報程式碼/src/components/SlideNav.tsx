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
      <div className="flex min-w-0 flex-1 items-center gap-3">
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
        {hints.length > 0 ? (
          <p
            title={hints.join('；')}
            className="hidden items-center gap-2 overflow-hidden rounded-full bg-sky-400/10 px-3.5 py-1.5 text-sm font-semibold text-sky-100 min-[1600px]:flex"
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
        <ChapterBar index={index} onGoTo={onGoTo} />
        <span className="min-w-[72px] text-center font-mono text-sm font-bold tracking-wider text-slate-300" aria-live="polite">
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

/**
 * 篇章列（取代頁碼點）：九篇名稱一直看得到；目前這篇展開成頁碼膠囊，
 * 滑鼠移上去浮出「頁碼・篇章・頁名」；點篇名跳到該篇第一頁。
 */
function ChapterBar({ index, onGoTo }: { index: number; onGoTo: (index: number) => void }) {
  const [tip, setTip] = useState<number | null>(null)
  return (
    <div className="hidden items-center rounded-full bg-white/[0.06] p-1 lg:flex" onMouseLeave={() => setTip(null)}>
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
              onMouseEnter={() => setTip(group.items[0])}
              onFocus={() => setTip(group.items[0])}
              aria-label={`${part.short}：${group.items.length} 頁，跳到第一頁`}
              className="relative whitespace-nowrap rounded-full px-3 py-1.5 text-[14px] font-semibold text-slate-400 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              {groupLabel(group.part)}
              {tip === group.items[0] && <Tip i={group.items[0]} />}
            </button>
          )
        return (
          <div key={group.part} className="flex items-center gap-1 rounded-full bg-white/[0.1] py-0.5 pl-3 pr-1">
            <span className={cn('mr-1 whitespace-nowrap text-[14px] font-bold', tone.text)}>{groupLabel(group.part)}</span>
            {group.items.map((i, k) => {
              const active = i === index
              return (
                <button
                  key={slides[i].id}
                  type="button"
                  aria-label={`第 ${i + 1} 頁：${slides[i].title}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onGoTo(i)}
                  onMouseDown={keepFocus}
                  onMouseEnter={() => setTip(i)}
                  onFocus={() => setTip(i)}
                  className={cn(
                    'relative flex size-7 items-center justify-center rounded-full font-mono text-[13px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300',
                    active ? 'bg-sky-300 text-navy-950' : 'text-slate-300 hover:bg-white/[0.14] hover:text-white',
                  )}
                >
                  {k + 1}
                  {tip === i && <Tip i={i} />}
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

/** 篇章列的浮出說明 */
function Tip({ i }: { i: number }) {
  const s = slides[i]
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 -translate-x-1/2 whitespace-nowrap rounded-xl bg-navy-800/95 px-3 py-1.5 text-[13px] font-semibold text-slate-100 shadow-lg backdrop-blur">
      <span className="font-mono text-sky-300">P.{pad(i + 1)}</span>
      <span className={cn('mx-1.5', toneStyles[parts[s.part].tone].text)}>{parts[s.part].short}</span>
      {s.title}
    </span>
  )
}
