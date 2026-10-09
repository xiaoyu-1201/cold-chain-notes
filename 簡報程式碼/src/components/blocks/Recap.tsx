import { ArrowRight, ArrowUpRight, BookOpen, ClipboardCheck, Target } from 'lucide-react'
import type { RecapBlock } from '../../data/types'
import { parts } from '../../data/parts'
import { slides } from '../../data/slides'
import { useDeck } from '../../context/deck'
import { cn, pad } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500'

/**
 * 每篇結尾：左邊三件事（大字、可點回那一頁，三列平均撐滿）；
 * 右邊一欄：這一篇學完會什麼 → 查閱頁（有的話）→ 下一步（自我檢測、下一篇）。
 */
export function Recap({ block }: { block: RecapBlock }) {
  const { goToId, numberOf } = useDeck()
  const t = toneStyles[block.tone]
  // 這個區塊在哪一頁：找出這一篇的學習目標、自我檢測頁、下一篇第一頁
  const me = slides.find((s) => s.blocks.includes(block))
  const part = me ? parts[me.part] : null
  const check = me ? slides.find((s) => s.part === me.part && s.id.startsWith('check-')) : undefined
  const lastOfPart = me ? slides.map((s) => s.part).lastIndexOf(me.part) : -1
  const nextSlide = lastOfPart >= 0 ? slides[lastOfPart + 1] : undefined
  const nextPart = nextSlide ? parts[nextSlide.part] : null
  const partPages = me ? slides.filter((s) => s.part === me.part && s !== me && !s.id.startsWith('check-') && !s.id.startsWith('recap-')) : []

  return (
    <div className="grid h-full grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-6">
      <ol className="flex h-full min-h-0 flex-col gap-5">
        {block.items.map((item, i) => (
          <li key={item.title} className="flex min-h-0 flex-1">
            <button
              type="button"
              disabled={!item.slide}
              onClick={() => item.slide && goToId(item.slide)}
              className={cn(
                'group flex w-full items-center gap-6 rounded-[18px] border border-line bg-card px-8 py-5 text-left transition enabled:hover:border-sky-500/50',
                focusRing,
              )}
            >
              <span className={cn('flex size-16 shrink-0 items-center justify-center rounded-2xl font-mono text-[32px] font-black', t.soft, t.text)}>{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[32px] font-bold leading-tight text-ink">{item.title}</span>
                <span className="mt-2 block text-[22px] leading-snug text-slate-300">{item.desc}</span>
              </span>
              {item.slide && (
                <span className="flex shrink-0 items-center gap-1 font-mono text-[17px] text-slate-500 transition group-hover:text-sky-400">
                  P.{pad(numberOf(item.slide))}
                  <ArrowUpRight className="size-4" aria-hidden />
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>

      {/* 右欄整組垂直置中：目標 → 查閱頁或這篇的頁 → 下一步 */}
      <section className="flex h-full min-h-0 flex-col justify-center gap-5 rounded-[18px] border border-line bg-card p-6">
        {part?.goal && (
          <div className="border-b border-line pb-5">
            <p className={cn('flex items-center gap-2 text-[19px] font-bold', t.text)}>
              <Target className="size-5" aria-hidden />
              這一篇學完，你會
            </p>
            <p className="mt-2 text-[23px] font-semibold leading-snug text-ink">{part.goal}</p>
          </div>
        )}

        {block.refs.length > 0 ? (
          <div className="flex min-h-0 flex-col">
            <h3 className="flex items-center gap-2 text-[20px] font-bold text-slate-100">
              <BookOpen className="size-5 text-slate-400" aria-hidden />
              查閱頁：需要時再翻
            </h3>
            <p className="mt-1 text-[16px] text-slate-400">規格、對照、型號怎麼讀；不用背，知道在哪裡就好。</p>
            {/* 查閱頁多（元件篇 8 頁）就排兩欄，不會把「下一步」擠出去 */}
            <ul className={cn('mt-3 min-h-0 gap-2 overflow-hidden', block.refs.length > 4 ? 'grid grid-cols-2' : 'flex flex-col')}>
              {block.refs.map((r) => (
                <li key={r.slide}>
                  <button
                    type="button"
                    onClick={() => goToId(r.slide)}
                    className={cn('group flex min-h-11 w-full items-center gap-3 rounded-xl border border-dashed border-line bg-paper px-4 py-2 text-left text-[18px] font-semibold text-slate-100 transition hover:border-sky-500/50 hover:bg-sky-950', focusRing)}
                  >
                    <span className="min-w-0 flex-1">{r.label}</span>
                    <span className="font-mono text-[16px] text-slate-500">P.{pad(numberOf(r.slide))}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          // 沒有查閱頁的篇：列出這一篇的內容頁，想回去看哪一頁直接點
          <div className="flex min-h-0 flex-col">
            <h3 className="flex items-center gap-2 text-[20px] font-bold text-slate-100">
              <BookOpen className="size-5 text-slate-400" aria-hidden />
              這一篇的頁
            </h3>
            <ul className="mt-3 flex min-h-0 flex-col gap-2 overflow-hidden">
              {partPages.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goToId(s.id)}
                    className={cn('group flex min-h-11 w-full items-center gap-3 rounded-xl border border-line bg-paper px-4 py-2 text-left text-[18px] font-semibold text-slate-100 transition hover:border-sky-500/50 hover:bg-sky-950', focusRing)}
                  >
                    <span className="min-w-0 flex-1">{s.title}</span>
                    <span className="font-mono text-[16px] text-slate-500">P.{pad(numberOf(s.id))}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 下一步：先自己考一次，再往下一篇 */}
        <div className="flex flex-col gap-2 border-t border-line pt-5">
          <p className="text-[17px] font-bold text-slate-400">下一步</p>
          {check && (
            <button
              type="button"
              onClick={() => goToId(check.id)}
              className={cn('flex min-h-[56px] items-center gap-3 rounded-xl border border-emerald-500/45 bg-emerald-950 px-4 text-left text-[19px] font-bold text-emerald-100 transition hover:border-emerald-500', focusRing)}
            >
              <ClipboardCheck className="size-5 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1">自我檢測：先自己想答案</span>
              <span className="font-mono text-[16px] font-semibold text-emerald-300">P.{pad(numberOf(check.id))}</span>
            </button>
          )}
          {nextSlide && nextPart && nextSlide.id !== check?.id && (
            <button
              type="button"
              onClick={() => goToId(nextSlide.id)}
              className={cn('flex min-h-[56px] items-center gap-3 rounded-xl border border-line bg-paper px-4 text-left text-[19px] font-bold text-slate-100 transition hover:border-sky-500/50 hover:bg-sky-950', focusRing)}
            >
              <ArrowRight className="size-5 shrink-0 text-sky-400" aria-hidden />
              <span className="min-w-0 flex-1">下一篇：{nextPart.short}</span>
              <span className="font-mono text-[16px] font-semibold text-slate-500">P.{pad(numberOf(nextSlide.id))}</span>
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
