import { Check, MessageCircle, RotateCcw, X } from 'lucide-react'
import { useDeck } from '../../context/deck'
import { useStickyState } from '../../hooks/useStickyState'
import type { EstimateBlock } from '../../data/types'
import { cn, pad } from '../../lib/cn'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

/** 估價練習：選情境，一題一題幫客人配出整套（選完顯示理由與出處） */
export function EstimatePractice({ block, mobile = false }: { block: EstimateBlock; mobile?: boolean }) {
  const { goToId, numberOf } = useDeck()
  const [scenario, setScenario] = useStickyState('estimate:scenario', 0)
  const [picks, setPicks] = useStickyState<Record<string, number>>('estimate:picks', {})
  const s = block.scenarios[scenario]
  const key = (qi: number) => `${scenario}-${qi}`
  const answered = s.questions.filter((_, qi) => picks[key(qi)] !== undefined).length
  const correct = s.questions.filter((q, qi) => picks[key(qi)] === q.answer).length
  const reset = () => setPicks((p) => Object.fromEntries(Object.entries(p).filter(([k]) => !k.startsWith(`${scenario}-`))))

  return (
    <div className={cn('flex flex-col', mobile ? 'gap-3' : 'h-full gap-4')}>
      <div className="flex flex-wrap gap-2" role="tablist">
        {block.scenarios.map((sc, i) => (
          <button
            key={sc.title}
            type="button"
            role="tab"
            aria-selected={i === scenario}
            onClick={() => setScenario(i)}
            className={cn(
              'rounded-xl border font-bold transition',
              mobile ? 'px-3 py-1.5 text-[15px]' : 'px-5 py-2 text-[20px]',
              i === scenario ? 'border-sky-500 bg-sky-950 text-sky-200' : 'border-dashed border-white/25 bg-card text-slate-300 hover:border-sky-500/60',
              focusRing,
            )}
          >
            情境 {i + 1}｜{sc.title}
          </button>
        ))}
      </div>

      <div className={cn('min-h-0', mobile ? 'space-y-3' : 'grid flex-1 grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] gap-5')}>
        <div className={cn('rounded-2xl border border-sky-500/40 bg-sky-950/70', mobile ? 'p-4' : 'flex flex-col p-6')}>
          <p className={cn('flex items-center gap-2 font-bold text-sky-200', mobile ? 'text-[15px]' : 'text-[19px]')}>
            <MessageCircle className="size-5" aria-hidden />
            客人說
          </p>
          <p className={cn('mt-2 font-semibold leading-relaxed text-white', mobile ? 'text-[17px]' : 'text-[24px]')}>{s.story}</p>
          {/* 這一套目前配了什麼：右邊每答一題，這裡就填上一列（像估價單），答錯的標紅 */}
          {!mobile && (
            <div className="mt-5 rounded-xl border border-line bg-card px-4 py-3">
              <p className="text-[17px] font-bold text-slate-300">這一套目前配了</p>
              <ol className="mt-1 divide-y divide-line">
                {s.questions.map((q, qi) => {
                  const pick = picks[key(qi)]
                  const ok = pick === q.answer
                  return (
                    <li key={q.q} className="flex items-baseline gap-2.5 py-1.5 text-[18px] leading-snug">
                      <span className="font-mono text-[16px] font-bold text-slate-500">{pad(qi + 1)}</span>
                      {pick === undefined ? (
                        <span className="text-slate-400">還沒選</span>
                      ) : (
                        <span className={cn('min-w-0 flex-1 font-semibold', ok ? 'text-emerald-300' : 'text-red-300')}>
                          {q.options[pick]}
                          {!ok && <span className="ml-1.5 text-slate-400">→ {q.options[q.answer]}</span>}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ol>
            </div>
          )}
          <div className={cn('flex items-center gap-3', mobile ? 'mt-3' : 'mt-auto pt-4')}>
            <p className={cn('font-bold', mobile ? 'text-[15px]' : 'text-[20px]', correct === s.questions.length ? 'text-emerald-300' : 'text-slate-300')}>
              答對 {correct} / {s.questions.length}
              {answered === s.questions.length && correct === s.questions.length && <span className="ml-2">整套配好了！</span>}
            </p>
            {answered > 0 && (
              <button
                type="button"
                onClick={reset}
                className={cn('flex min-h-11 items-center gap-1 rounded-lg border border-line bg-card px-3 py-1 text-[16px] font-semibold text-slate-200 hover:border-sky-500/50', focusRing)}
              >
                <RotateCcw className="size-3.5" aria-hidden />
                重來
              </button>
            )}
          </div>
        </div>

        <ol className={cn('min-h-0 space-y-2.5', !mobile && 'overflow-y-auto pr-1')}>
          {s.questions.map((q, qi) => {
            const pick = picks[key(qi)]
            const done = pick !== undefined
            return (
              <li key={q.q} className={cn('rounded-2xl border bg-card', mobile ? 'p-3' : 'px-5 py-3', done ? (pick === q.answer ? 'border-emerald-500/40' : 'border-red-500/40') : 'border-line')}>
                <p className={cn('font-bold text-white', mobile ? 'text-[16px]' : 'text-[21px]')}>
                  <span className="mr-2 font-mono text-sky-300">{pad(qi + 1)}</span>
                  {q.q}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={done}
                      onClick={() => setPicks((p) => ({ ...p, [key(qi)]: oi }))}
                      className={cn(
                        'rounded-lg border font-semibold transition',
                        mobile ? 'min-h-11 px-3 py-1 text-[15px]' : 'min-h-[56px] px-5 py-2 text-[20px]',
                        !done && 'border-dashed border-white/30 bg-card text-slate-100 hover:border-sky-500/70',
                        done && oi === q.answer && 'border-emerald-500 bg-emerald-950 text-emerald-100',
                        done && oi !== q.answer && oi === pick && 'border-red-500/70 bg-red-950 text-red-200',
                        done && oi !== q.answer && oi !== pick && 'border-line text-slate-500',
                        focusRing,
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {done && (
                  <p className={cn('mt-2 flex gap-1.5 leading-snug', mobile ? 'text-[15px]' : 'text-[18px]', pick === q.answer ? 'text-emerald-100' : 'text-red-100')}>
                    {pick === q.answer ? <Check className="mt-1 size-4 shrink-0" aria-hidden /> : <X className="mt-1 size-4 shrink-0" aria-hidden />}
                    <span>
                      {q.why}
                      {q.slide && (
                        <button
                          type="button"
                          onClick={() => goToId(q.slide!)}
                          className={cn('ml-2 font-mono text-[16px] text-slate-400 hover:text-sky-300', focusRing)}
                        >
                          P.{pad(numberOf(q.slide))}↗
                        </button>
                      )}
                    </span>
                  </p>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
