import { ArrowUpRight, BookOpen, Star } from 'lucide-react'
import type { RecapBlock } from '../../data/types'
import { useDeck } from '../../context/deck'
import { cn, pad } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

/** 每篇結尾：三件事（大字、可點回那一頁）＋ 右邊一欄「查閱頁」 */
export function Recap({ block }: { block: RecapBlock }) {
  const { goToId, numberOf } = useDeck()
  const t = toneStyles[block.tone]
  return (
    <div className={cn('grid h-full gap-6', block.refs.length ? 'grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]' : 'grid-cols-1')}>
      <ol className="flex h-full flex-col justify-center gap-5">
        {block.items.map((item, i) => (
          <li key={item.title}>
            <button
              type="button"
              disabled={!item.slide}
              onClick={() => item.slide && goToId(item.slide)}
              className={cn(
                'group flex w-full items-start gap-5 rounded-[24px] border border-white/10 bg-white/[0.04] px-7 py-6 text-left transition enabled:hover:border-sky-400/40 enabled:hover:bg-sky-400/10',
                focusRing,
              )}
            >
              <span className={cn('flex size-14 shrink-0 items-center justify-center rounded-2xl text-[30px] font-black', t.soft, t.text)}>{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[30px] font-bold leading-tight text-white">{item.title}</span>
                <span className="mt-2 block text-[21px] leading-snug text-slate-300">{item.desc}</span>
              </span>
              {item.slide && (
                <span className="mt-2 flex shrink-0 items-center gap-1 font-mono text-[16px] text-slate-500 transition group-hover:text-sky-300">
                  P.{pad(numberOf(item.slide))}
                  <ArrowUpRight className="size-4" aria-hidden />
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>
      {block.refs.length > 0 && (
        <section className="flex h-full min-h-0 flex-col rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
          <h3 className="flex items-center gap-2 text-[22px] font-bold text-slate-100">
            <BookOpen className="size-6 text-slate-400" aria-hidden />
            查閱頁：需要時再翻
          </h3>
          <p className="mt-1 text-[16px] text-slate-400">規格、對照、型號怎麼讀；不用背，知道在哪裡就好。</p>
          <ul className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
            {block.refs.map((r) => (
              <li key={r.slide}>
                <button
                  type="button"
                  onClick={() => goToId(r.slide)}
                  className={cn('group flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-navy-900/50 px-4 py-2.5 text-left text-[18px] font-semibold text-slate-100 transition hover:border-sky-400/40 hover:bg-sky-400/10', focusRing)}
                >
                  <span className="min-w-0 flex-1">{r.label}</span>
                  <span className="font-mono text-[16px] text-slate-500">P.{pad(numberOf(r.slide))}</span>
                  <ArrowUpRight className="size-4 shrink-0 text-slate-500 group-hover:text-sky-300" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-[16px] text-slate-500">
            <Star className="size-4" aria-hidden />
            左邊三件事才是要記的。
          </p>
        </section>
      )}
    </div>
  )
}
