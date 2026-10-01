import { Check, Shuffle, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/cn'

/** 管徑「分」：1 吋＝8 分＝25.4 mm */
const SIZES = [
  { fen: 1, inch: '1/8″', mm: '3.175' },
  { fen: 2, inch: '1/4″', mm: '6.35' },
  { fen: 3, inch: '3/8″', mm: '9.52' },
  { fen: 4, inch: '1/2″', mm: '12.7' },
  { fen: 5, inch: '5/8″', mm: '15.88' },
  { fen: 6, inch: '3/4″', mm: '19.05' },
  { fen: 7, inch: '7/8″', mm: '22.2' },
  { fen: 8, inch: '1″', mm: '25.4' },
]

const randomQuestion = (exclude?: number) => {
  const pool = SIZES.filter((s) => s.fen > 1 && s.fen !== exclude)
  const answer = pool[Math.floor(Math.random() * pool.length)]
  const near = [answer.fen - 1, answer.fen + 1].filter((n) => n >= 1 && n <= 8)
  const options = [answer.fen, ...near].sort((a, b) => a - b)
  return { answer, options }
}

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

/** 互動換算器：點幾分看 mm／英吋與管徑大小；「考考我」練習反推 */
export function FenConverter({ mobile = false }: { mobile?: boolean }) {
  const [fen, setFen] = useState(4)
  const [quiz, setQuiz] = useState(() => randomQuestion())
  const [picked, setPicked] = useState<number | null>(null)
  const size = SIZES[fen - 1]
  const maxDia = mobile ? 96 : 150
  const dia = Math.max(10, (fen / 8) * maxDia)

  const next = () => {
    setQuiz(randomQuestion(quiz.answer.fen))
    setPicked(null)
  }

  return (
    <div className={cn('flex flex-col', mobile ? 'gap-3' : 'h-full gap-4')}>
      <div className={cn('grid grid-cols-8', mobile ? 'gap-1' : 'gap-2')} role="group" aria-label="選擇幾分">
        {SIZES.map((s) => (
          <button
            key={s.fen}
            type="button"
            onClick={() => setFen(s.fen)}
            aria-pressed={fen === s.fen}
            className={cn(
              'rounded-xl border font-black transition',
              mobile ? 'py-2 text-[15px]' : 'py-2.5 text-[22px]',
              fen === s.fen
                ? 'border-amber-300 bg-amber-400/20 text-amber-100'
                : 'border-dashed border-white/20 text-slate-300 hover:border-amber-300/60 hover:text-white',
              focusRing,
            )}
          >
            {s.fen}
            <span className={cn('font-bold', mobile ? 'text-[11px]' : 'text-[15px]')}>分</span>
          </button>
        ))}
      </div>

      <div className={cn('flex items-center rounded-2xl bg-white/[0.04]', mobile ? 'gap-4 p-3' : 'gap-6 p-5')}>
        <div className="flex shrink-0 items-center justify-center" style={{ width: maxDia, height: maxDia }}>
          <div
            className="rounded-full border-[3px] border-amber-300/80 bg-amber-400/10 transition-all duration-300"
            style={{ width: dia, height: dia }}
            aria-hidden
          />
        </div>
        <div className="min-w-0">
          <p className={cn('font-black leading-tight text-white', mobile ? 'text-[24px]' : 'text-[40px]')}>
            {size.fen} 分 ＝ <span className="text-amber-200">{size.mm} mm</span>
          </p>
          <p className={cn('mt-1 text-slate-300', mobile ? 'text-[15px]' : 'text-[22px]')}>
            英吋 {size.inch}｜算法：{size.fen} × 3.175 mm
          </p>
          <p className={cn('mt-1 text-slate-500', mobile ? 'text-[13px]' : 'text-[17px]')}>圓圈＝管徑大小比例</p>
        </div>
      </div>

      <div className={cn('rounded-2xl border border-dashed border-emerald-400/40 bg-emerald-400/[0.05]', mobile ? 'p-3' : 'mt-auto p-5')}>
        <div className="flex items-center justify-between gap-2">
          <p className={cn('font-bold text-emerald-200', mobile ? 'text-[16px]' : 'text-[22px]')}>
            考考我：銅管量起來 <span className="text-white">{quiz.answer.mm} mm</span>，是幾分？
          </p>
          <button
            type="button"
            onClick={next}
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-lg border border-white/15 font-semibold text-slate-200 hover:border-emerald-300/60',
              mobile ? 'px-2 py-1 text-[13px]' : 'px-3 py-1.5 text-[16px]',
              focusRing,
            )}
          >
            <Shuffle className="size-4" aria-hidden />
            換一題
          </button>
        </div>
        <div className={cn('flex flex-wrap items-center', mobile ? 'mt-2 gap-2' : 'mt-3 gap-3')}>
          {quiz.options.map((n) => {
            const isAnswer = n === quiz.answer.fen
            const show = picked !== null
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPicked(n)}
                disabled={show}
                className={cn(
                  'rounded-xl border font-black transition',
                  mobile ? 'px-4 py-1.5 text-[16px]' : 'px-6 py-2 text-[22px]',
                  !show && 'border-white/20 text-slate-100 hover:border-emerald-300/60',
                  show && isAnswer && 'border-emerald-300 bg-emerald-400/20 text-emerald-100',
                  show && !isAnswer && picked === n && 'border-red-400/60 bg-red-500/15 text-red-200',
                  show && !isAnswer && picked !== n && 'border-white/10 text-slate-500',
                  focusRing,
                )}
              >
                {n} 分
              </button>
            )
          })}
          {picked !== null && (
            <p className={cn('flex items-center gap-1.5 font-semibold', mobile ? 'text-[15px]' : 'text-[20px]', picked === quiz.answer.fen ? 'text-emerald-300' : 'text-red-300')}>
              {picked === quiz.answer.fen ? <Check className="size-5" aria-hidden /> : <X className="size-5" aria-hidden />}
              {picked === quiz.answer.fen ? '答對了！' : `是 ${quiz.answer.fen} 分（${quiz.answer.mm} ÷ 3.175）`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
