import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Headphones, Maximize2, Pause, Quote, X } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useDeck } from '../../context/deck'
import { cycleNotes, type CycleNodeId } from '../../data/cycleNotes'
import { CLASS_AUDIO, CLASS_AUDIO_2 } from '../../data/media'
import { cn, pad } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'
import { CycleDiagram } from './CycleDiagram'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

function formatTime(sec: number) {
  return `${pad(Math.floor(sec / 60))}:${pad(Math.floor(sec % 60))}`
}

interface CycleExplorerProps {
  /** 受控選取（給旁邊清單同步用）；不傳則自行管理 */
  selected?: CycleNodeId | null
  onSelect?: (id: CycleNodeId | null) => void
  /** 顯示放大按鈕 */
  expandable?: boolean
  /** 放大檢視中的大尺寸版本 */
  large?: boolean
  className?: string
  style?: CSSProperties
}

/** 可點選的冷凍循環圖：點零件或管路 → 小視窗顯示講解，可播放錄音、可放大 */
export function CycleExplorer({ selected, onSelect, expandable = true, large = false, className, style }: CycleExplorerProps) {
  const [innerSelected, setInnerSelected] = useState<CycleNodeId | null>(null)
  const [expanded, setExpanded] = useState(false)
  const current = selected !== undefined ? selected : innerSelected
  const select = (id: CycleNodeId | null) => {
    if (onSelect) onSelect(id)
    else setInnerSelected(id)
  }

  return (
    <div className={cn('relative', className)} style={{ aspectRatio: '820 / 560', ...style }}>
      <CycleDiagram className="absolute inset-0 h-full w-full" interactive selected={current} onSelect={(id) => select(current === id ? null : id)} />

      {expandable && (
        <button
          type="button"
          data-expand
          onClick={() => setExpanded(true)}
          title="放大檢視"
          className={cn(
            'absolute right-2 top-2 flex items-center gap-1.5 rounded-lg border border-white/15 bg-navy-950/80 px-2.5 py-1.5 text-[14px] font-semibold text-slate-100 transition hover:border-sky-400/50 hover:text-white',
            focusRing,
          )}
        >
          <Maximize2 className="size-4" aria-hidden />
          放大
        </button>
      )}

      <AnimatePresence>{current && <NotePopover key={current} id={current} large={large} onClose={() => select(null)} />}</AnimatePresence>

      {expanded && <ExpandedView initial={current} onClose={() => setExpanded(false)} />}
    </div>
  )
}

/** 小視窗：講解 */
function NotePopover({ id, large, onClose }: { id: CycleNodeId; large: boolean; onClose: () => void }) {
  const note = cycleNotes[id]
  const t = toneStyles[note.tone]
  const { goToId, numberOf } = useDeck()

  const { x, y, place } = note.anchor
  const width = large ? 520 : 380
  const height = large ? 400 : 300
  const sideTop = `clamp(8px, calc(${y}% - ${height / 2}px), calc(100% - ${height}px))`
  const centeredLeft = `calc(${x}% - ${width / 2}px)`
  const placement: Record<typeof place, CSSProperties> = {
    left: { right: `calc(${100 - x}% + 12px)`, top: sideTop },
    right: { left: `calc(${x}% + 12px)`, top: sideTop },
    above: { bottom: `calc(${100 - y}% + 12px)`, left: centeredLeft },
    below: { top: `calc(${y}% + 12px)`, left: centeredLeft },
  }
  const position: CSSProperties = { width, ...placement[place] }

  return (
    <motion.div
      role="dialog"
      aria-label={`${note.title} 說明`}
      initial={{ opacity: 0, scale: 0.94, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'absolute z-20 rounded-2xl border bg-navy-900/95 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur',
        large ? 'p-6' : 'p-4',
        t.border,
      )}
      style={position}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn('font-black leading-tight text-white', large ? 'text-[30px]' : 'text-[22px]')}>{note.title}</p>
          <p className={cn('mt-0.5 font-semibold', t.text, large ? 'text-[18px]' : 'text-[14px]')}>{note.alias}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="關閉說明"
          className={cn('rounded-lg border border-white/10 p-1 text-slate-300 transition hover:text-white', focusRing)}
        >
          <X className={large ? 'size-5' : 'size-4'} aria-hidden />
        </button>
      </div>

      <div className={cn('mt-3 inline-flex rounded-lg border px-2.5 py-1 font-mono font-bold', t.chip, large ? 'text-[18px]' : 'text-[14px]')}>{note.state}</div>

      <blockquote className={cn('mt-3 flex gap-2 rounded-xl bg-white/[0.04] px-3 py-2.5 leading-snug text-slate-100', large ? 'text-[20px]' : 'text-[15px]')}>
        <Quote className={cn('mt-0.5 shrink-0 text-emerald-300', large ? 'size-5' : 'size-4')} aria-hidden />
        <span>
          {note.quote}
        </span>
      </blockquote>

      {note.analogy && (
        <p className={cn('mt-2.5 leading-snug text-slate-300', large ? 'text-[18px]' : 'text-[14px]')}>
          <span className="mr-2 font-bold text-amber-300">比喻</span>
          {note.analogy}
        </p>
      )}
      <p className={cn('mt-1.5 leading-snug text-slate-300', large ? 'text-[18px]' : 'text-[14px]')}>
        <span className="mr-2 font-bold text-sky-300">重點</span>
        {note.point}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {note.audioAt !== undefined && <ClipButton src={CLASS_AUDIO} at={note.audioAt} label="錄音01" large={large} />}
        {note.audio2At !== undefined && <ClipButton src={CLASS_AUDIO_2} at={note.audio2At} label="錄音02" large={large} />}
        {note.slide && (
          <button
            type="button"
            onClick={() => goToId(note.slide!)}
            className={cn(
              'flex items-center gap-1 rounded-lg border border-white/15 font-semibold text-slate-100 transition hover:border-sky-400/50',
              large ? 'px-3.5 py-2 text-[17px]' : 'px-2.5 py-1 text-[13px]',
              focusRing,
            )}
          >
            {note.chapter} <span className="font-mono text-slate-400">P.{pad(numberOf(note.slide))}</span>
            <ArrowUpRight className="size-3.5" aria-hidden />
          </button>
        )}
      </div>
    </motion.div>
  )
}

/** 放大檢視：覆蓋整張投影片 */
function ExpandedView({ initial, onClose }: { initial: CycleNodeId | null; onClose: () => void }) {
  const [selected, setSelected] = useState<CycleNodeId | null>(initial)
  const target = document.getElementById('canvas-overlay')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      } else if (['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', 'Backspace'].includes(e.key)) {
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  if (!target) return null
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pointer-events-auto absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-navy-950/92 p-10 backdrop-blur-sm"
    >
      <div className="flex w-full max-w-[1500px] items-center justify-between">
        <p className="text-[28px] font-black text-white">
          冷凍循環一圈
          <span className="ml-3 text-[20px] font-semibold text-slate-400">點零件或管路，看怎麼說</span>
        </p>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[18px] font-semibold text-slate-100 hover:border-sky-400/50',
            focusRing,
          )}
        >
          <X className="size-5" aria-hidden />
          關閉（Esc）
        </button>
      </div>
      <div className="rounded-[28px] border border-white/10 bg-navy-900/80 p-4">
        <CycleExplorer large expandable={false} selected={selected} onSelect={setSelected} style={{ height: 880 }} />
      </div>
    </motion.div>,
    target,
  )
}

/** 播放某段錄音的按鈕（各自擁有播放器，關閉小視窗時自動停止） */
function ClipButton({ src, at, label, large }: { src: string; at: number; label: string; large: boolean }) {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const audio = ref.current
    return () => audio?.pause()
  }, [])

  const toggle = () => {
    const audio = ref.current
    if (!audio) return
    if (playing) {
      audio.pause()
      return
    }
    audio.currentTime = at
    audio.play().catch(() => setError(true))
  }

  if (error) return <span className="text-[13px] text-amber-200">錄音無法播放（請改用 Chrome 或 Edge）</span>
  return (
    <>
      <audio ref={ref} src={src} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setError(true)} />
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 font-semibold text-emerald-100 transition hover:bg-emerald-400/20',
          large ? 'px-3.5 py-2 text-[17px]' : 'px-2.5 py-1 text-[13px]',
          focusRing,
        )}
      >
        {playing ? <Pause className="size-4" aria-hidden /> : <Headphones className="size-4" aria-hidden />}
        {playing ? '暫停' : label} <span className="font-mono">{formatTime(at)}</span>
      </button>
    </>
  )
}