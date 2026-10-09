import { ArrowRight, Check, PencilLine, X } from 'lucide-react'
import { useEffect, useRef, useState, type Ref } from 'react'
import { createPortal } from 'react-dom'
import { useDeck } from '../context/deck'
import { PRACTICE } from '../data/practice'
import { cn } from '../lib/cn'
import { answer, useLearn } from '../lib/learn'

/** 洗牌（選項每次打開順序都不一樣，記位置沒有用） */
function shuffled(n: number) {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 「學完馬上練」的一題：選一個答案 → 馬上告訴你對不對、為什麼（附出處）。
 * 選項順序每次打開都洗牌；答錯會公布正確答案＋原因，並自動放進「今天」的錯題複習（沒有「再試一次」：看著答案按沒有意義）。
 * size：canvas＝電腦版畫布裡（1920 寬的字級）；screen＝手機版、進度視窗（實際字級）。
 * firstRef：給視窗把焦點放到第一個選項。
 */
export function PracticeQuestion({
  id,
  size = 'screen',
  onCorrect,
  onAnswered,
  firstRef,
}: {
  id: string
  size?: 'canvas' | 'screen'
  onCorrect?: () => void
  onAnswered?: (correct: boolean) => void
  firstRef?: Ref<HTMLButtonElement>
}) {
  const p = PRACTICE[id]
  const [picked, setPicked] = useState<number | null>(null)
  // 打開時洗一次牌（之後不再變，答完也不會跳）
  const [order] = useState(() => shuffled(p?.options.length ?? 0))
  if (!p) return null
  const big = size === 'canvas'
  const done = picked !== null
  const right = picked === p.answer
  const choose = (i: number) => {
    if (done) return
    setPicked(i)
    answer(id, i === p.answer)
    onAnswered?.(i === p.answer)
    if (i === p.answer) onCorrect?.()
  }
  return (
    <div>
      <p className={cn('font-bold leading-snug text-ink', big ? 'text-[30px]' : 'text-[17px]')}>{p.q}</p>
      <div className={cn('flex flex-col', big ? 'mt-5 gap-3' : 'mt-3 gap-2')}>
        {order.map((i, k) => {
          const o = p.options[i]
          const isAns = i === p.answer
          const isPicked = i === picked
          return (
            <button
              key={o}
              ref={k === 0 ? firstRef : undefined}
              type="button"
              onClick={() => choose(i)}
              disabled={done}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl border text-left font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
                big ? 'min-h-[68px] px-6 py-3 text-[24px]' : 'min-h-[48px] px-4 py-2.5 text-[16px]',
                !done && 'border-line bg-card text-slate-100 hover:border-sky-500/60 hover:bg-sky-950 active:scale-[0.99]',
                done && isAns && 'border-emerald-500/70 bg-emerald-950 text-emerald-50',
                done && isPicked && !isAns && 'border-red-500/70 bg-red-950 text-red-50',
                done && !isAns && !isPicked && 'border-line bg-card text-slate-500',
              )}
            >
              <span className={cn('flex shrink-0 items-center justify-center rounded-full font-mono font-bold', big ? 'size-9 text-[18px]' : 'size-7 text-[13px]', done && isAns ? 'bg-emerald-400 text-paper' : done && isPicked ? 'bg-red-400 text-paper' : 'bg-white/[0.07] text-slate-300')}>
                {done && isAns ? <Check className={big ? 'size-5' : 'size-4'} aria-hidden /> : done && isPicked ? <X className={big ? 'size-5' : 'size-4'} aria-hidden /> : String.fromCharCode(65 + k)}
              </span>
              <span className="min-w-0 flex-1">{o}</span>
            </button>
          )
        })}
      </div>
      {done && (
        <div className={cn('rounded-2xl', big ? 'mt-5 px-6 py-4' : 'mt-3 px-4 py-3', right ? 'bg-emerald-950' : 'bg-red-950')} role="status">
          <p className={cn('font-bold', big ? 'text-[24px]' : 'text-[16px]', right ? 'text-emerald-300' : 'text-red-300')}>{right ? '答對了！' : '答錯了：正確答案是綠色那個'}</p>
          <p className={cn('mt-1 leading-relaxed text-slate-200', big ? 'text-[21px]' : 'text-[15px]')}>{p.why}</p>
          {!right && <p className={cn('mt-2 text-slate-400', big ? 'text-[19px]' : 'text-[14px]')}>已放進「今天」的錯題複習，下次再答對就會拿掉。</p>}
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
  if (!PRACTICE[id]) return null
  const overlay = typeof document !== 'undefined' ? document.getElementById('canvas-overlay') : null
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseDown={(e) => e.preventDefault()}
        className={cn(
          'flex shrink-0 items-center gap-3 rounded-[14px] px-7 text-[22px] font-bold transition',
          passed ? 'border border-emerald-500/45 bg-emerald-950 text-emerald-200 hover:border-emerald-500' : 'border border-sky-500/50 bg-sky-950 text-sky-200 hover:border-sky-500',
        )}
      >
        {passed ? <Check className="size-6" aria-hidden /> : <PencilLine className="size-6" aria-hidden />}
        {passed ? '已練過' : '學完馬上練'}
      </button>
      {open && overlay && createPortal(<PracticeDialog id={id} onClose={() => setOpen(false)} />, overlay)}
    </>
  )
}

/** 練習視窗：打開時焦點移到第一個選項、關掉時焦點還原；Esc／點旁邊關閉；答對後可以直接「下一頁」 */
function PracticeDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { next } = useDeck()
  const first = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const [correct, setCorrect] = useState(false)
  // onClose 每次都是新的函式：放進 ref，焦點只在打開／關閉時各處理一次
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    first.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeRef.current()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      prev?.focus?.({ preventScroll: true })
    }
  }, [])
  useEffect(() => {
    if (correct) nextRef.current?.focus({ preventScroll: true })
  }, [correct])
  return (
    // 畫在畫布的覆蓋層（#canvas-overlay）：跟著畫布等比例縮放，不受卡片動畫的 transform 影響
    <div data-no-swipe className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-ink/25" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="學完馬上練" onClick={(e) => e.stopPropagation()} className="w-[1000px] rounded-[22px] border border-line bg-paper p-10 shadow-[0_24px_64px_-24px_rgba(15,36,64,0.45)]">
        <div className="mb-6 flex items-center justify-between">
          <p className="flex items-center gap-3 text-[24px] font-bold text-sky-400">
            <PencilLine className="size-7" aria-hidden />
            學完馬上練：這一頁一題
          </p>
          <button type="button" onClick={onClose} aria-label="關閉 (Esc)" className="flex size-12 items-center justify-center rounded-full border border-line bg-card text-slate-300 hover:text-ink">
            <X className="size-6" aria-hidden />
          </button>
        </div>
        <PracticeQuestion id={id} size="canvas" firstRef={first} onCorrect={() => setCorrect(true)} />
        {correct && (
          <div className="mt-6 flex justify-end">
            <button
              ref={nextRef}
              type="button"
              onClick={() => {
                onClose()
                next()
              }}
              className="flex min-h-[60px] items-center gap-2 rounded-full bg-sky-400 px-8 text-[22px] font-bold text-paper transition hover:bg-sky-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              下一頁
              <ArrowRight className="size-6" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
