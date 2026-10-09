import { Check, PencilLine, RotateCcw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PRACTICE } from '../data/practice'
import { cn } from '../lib/cn'
import { answer, useLearn } from '../lib/learn'

/**
 * 「學完馬上練」的一題：選一個答案 → 馬上告訴你對不對、為什麼（附出處）。
 * 答錯的會自動放進「錯題複習」；可以再試一次。
 * size：canvas＝電腦版畫布裡（1920 寬的字級）；screen＝手機版、進度視窗（實際字級）。
 */
export function PracticeQuestion({ id, size = 'screen', onCorrect }: { id: string; size?: 'canvas' | 'screen'; onCorrect?: () => void }) {
  const p = PRACTICE[id]
  const [picked, setPicked] = useState<number | null>(null)
  if (!p) return null
  const big = size === 'canvas'
  const done = picked !== null
  const right = picked === p.answer
  const choose = (i: number) => {
    if (done) return
    setPicked(i)
    answer(id, i === p.answer)
    if (i === p.answer) onCorrect?.()
  }
  return (
    <div>
      <p className={cn('font-bold leading-snug text-white', big ? 'text-[30px]' : 'text-[17px]')}>{p.q}</p>
      <div className={cn('flex flex-col', big ? 'mt-5 gap-3' : 'mt-3 gap-2')}>
        {p.options.map((o, i) => {
          const isAns = i === p.answer
          const isPicked = i === picked
          return (
            <button
              key={o}
              type="button"
              onClick={() => choose(i)}
              disabled={done}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl border text-left font-semibold transition',
                big ? 'min-h-[68px] px-6 py-3 text-[24px]' : 'min-h-[48px] px-4 py-2.5 text-[16px]',
                !done && 'border-white/15 bg-white/[0.04] text-slate-100 hover:border-sky-400/50 hover:bg-sky-400/10 active:scale-[0.99]',
                done && isAns && 'border-emerald-400/60 bg-emerald-400/15 text-emerald-50',
                done && isPicked && !isAns && 'border-red-400/60 bg-red-500/15 text-red-50',
                done && !isAns && !isPicked && 'border-white/10 text-slate-500',
              )}
            >
              <span className={cn('flex shrink-0 items-center justify-center rounded-full font-mono font-bold', big ? 'size-9 text-[18px]' : 'size-7 text-[13px]', done && isAns ? 'bg-emerald-400 text-navy-950' : done && isPicked ? 'bg-red-400 text-navy-950' : 'bg-white/10 text-slate-300')}>
                {done && isAns ? <Check className={big ? 'size-5' : 'size-4'} aria-hidden /> : done && isPicked ? <X className={big ? 'size-5' : 'size-4'} aria-hidden /> : String.fromCharCode(65 + i)}
              </span>
              <span className="min-w-0 flex-1">{o}</span>
            </button>
          )
        })}
      </div>
      {done && (
        <div className={cn('rounded-2xl', big ? 'mt-5 px-6 py-4' : 'mt-3 px-4 py-3', right ? 'bg-emerald-400/10' : 'bg-red-500/10')} role="status">
          <p className={cn('font-bold', big ? 'text-[24px]' : 'text-[16px]', right ? 'text-emerald-300' : 'text-red-300')}>{right ? '答對了！' : '再想一下：正確答案是綠色那個'}</p>
          <p className={cn('mt-1 leading-relaxed text-slate-200', big ? 'text-[21px]' : 'text-[15px]')}>{p.why}</p>
          {!right && (
            <div className={cn('mt-2 flex flex-wrap items-center gap-3', big ? 'text-[19px]' : 'text-[14px]')}>
              <span className="text-slate-400">已放進「今天」裡的錯題複習。</span>
              <button type="button" onClick={() => setPicked(null)} className="inline-flex items-center gap-1 font-bold text-sky-300 hover:text-sky-200">
                <RotateCcw className={big ? 'size-5' : 'size-4'} aria-hidden />
                再試一次
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** 電腦版：小結論旁邊的「學完馬上練」按鈕＋畫布上的小視窗 */
export function PracticeButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const learn = useLearn()
  const passed = !!learn.done[id]
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open])
  if (!PRACTICE[id]) return null
  const overlay = typeof document !== 'undefined' ? document.getElementById('canvas-overlay') : null
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseDown={(e) => e.preventDefault()}
        className={cn(
          'flex shrink-0 items-center gap-3 rounded-[24px] px-7 text-[22px] font-bold transition',
          passed ? 'bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25' : 'bg-sky-400/20 text-sky-50 ring-1 ring-sky-300/40 hover:bg-sky-400/30',
        )}
      >
        {passed ? <Check className="size-6" aria-hidden /> : <PencilLine className="size-6" aria-hidden />}
        {passed ? '已練過' : '學完馬上練'}
      </button>
      {open && overlay && createPortal(
        // 畫在畫布的覆蓋層（#canvas-overlay）：跟著畫布等比例縮放，不受卡片動畫的 transform 影響
        <div data-no-swipe className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-navy-950/70" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="學完馬上練" onClick={(e) => e.stopPropagation()} className="w-[1000px] rounded-[32px] border border-white/10 bg-[#0b1626] p-10 shadow-2xl shadow-black/60">
            <div className="mb-6 flex items-center justify-between">
              <p className="flex items-center gap-3 text-[24px] font-bold text-sky-300">
                <PencilLine className="size-7" aria-hidden />
                學完馬上練：這一頁一題
              </p>
              <button type="button" onClick={() => setOpen(false)} aria-label="關閉 (Esc)" className="flex size-12 items-center justify-center rounded-full bg-white/[0.08] text-slate-300 hover:bg-white/[0.14] hover:text-white">
                <X className="size-6" aria-hidden />
              </button>
            </div>
            <PracticeQuestion id={id} size="canvas" />
          </div>
        </div>,
        overlay,
      )}
    </>
  )
}
