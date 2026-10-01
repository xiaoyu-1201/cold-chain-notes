import { ArrowUpRight, Eye, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useDeck } from '../../context/deck'
import type { QuizBlock } from '../../data/types'
import { cn, pad } from '../../lib/cn'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

/** 自我檢測卡：先自己回想，點開才看答案（提取練習） */
export function QuizCards({ block }: { block: QuizBlock }) {
  const { goToId, numberOf } = useDeck()
  const [open, setOpen] = useState<number[]>([])
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]))
  // 題目少（各步小測驗）用單欄大字；題目多（總複習）用兩欄
  const big = block.items.length <= 4
  const cols = big ? 1 : 2
  const rows = Math.ceil(block.items.length / cols)

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between text-[18px] text-slate-400">
        <p>每題先在心裡說出答案，再點卡片翻開對照。</p>
        <button
          type="button"
          onClick={() => setOpen([])}
          className={cn('flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 font-semibold text-slate-200 hover:border-sky-400/40', focusRing)}
        >
          <RotateCcw className="size-4" aria-hidden />
          全部蓋回去
        </button>
      </div>
      <ol
        className="grid min-h-0 flex-1 gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
      >
        {block.items.map((item, i) => {
          const shown = open.includes(i)
          return (
            <li key={i} className="min-h-0">
              <div
                role="button"
                tabIndex={0}
                aria-expanded={shown}
                onClick={() => toggle(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') toggle(i)
                }}
                className={cn(
                  'flex h-full cursor-pointer gap-4 rounded-2xl border transition',
                  big ? 'items-center px-8 py-5' : 'px-5 py-3',
                  shown ? 'border-emerald-400/40 bg-emerald-400/[0.07]' : 'border-white/10 bg-white/[0.03] hover:border-sky-400/40',
                  focusRing,
                )}
              >
                <span className={cn('font-mono font-black text-sky-300', big ? 'text-[30px]' : 'text-[20px]')}>{pad(i + 1)}</span>
                <div className="min-w-0 flex-1">
                  <p className={cn('font-bold leading-snug text-white', big ? 'text-[30px]' : 'text-[21px]')}>{item.q}</p>
                  {shown ? (
                    <p className={cn('mt-1 leading-snug text-emerald-100', big ? 'text-[25px]' : 'text-[18px]')}>
                      {item.a}
                      {item.slide && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            goToId(item.slide!)
                          }}
                          className={cn('ml-2 inline-flex items-center gap-0.5 font-mono text-[16px] text-slate-400 hover:text-sky-300', focusRing)}
                        >
                          P.{pad(numberOf(item.slide))}
                          <ArrowUpRight className="size-3.5" aria-hidden />
                        </button>
                      )}
                    </p>
                  ) : (
                    <p className="mt-1 flex items-center gap-1.5 text-[16px] text-slate-500">
                      <Eye className="size-4" aria-hidden />
                      點一下看答案
                    </p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
