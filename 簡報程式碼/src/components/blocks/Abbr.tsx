import { ArrowUpRight } from 'lucide-react'
import type { AbbrBlock, AbbrItem, Tone } from '../../data/types'
import { useDeck } from '../../context/deck'
import { cn, pad } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'

const focusRing = 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-300'

/**
 * 英文縮寫全稱：每組一欄，一列一個縮寫（大字縮寫＋英文全稱，下面中文＋一句話）。
 * 有相關頁的列可以點，跳過去看。手機版：單欄、一列一張卡。
 */
export function Abbr({ block, mobile }: { block: AbbrBlock; mobile?: boolean }) {
  return (
    <div className={cn(mobile ? 'space-y-5' : 'grid h-full min-h-0 gap-6', !mobile && (block.groups.length > 1 ? 'grid-cols-2' : 'grid-cols-1'))}>
      {block.groups.map((g) => (
        <section key={g.label} className={cn('flex min-h-0 flex-col', !mobile && 'rounded-[18px] border border-line bg-card p-5')}>
          <h3 className={cn('flex items-center gap-2 font-bold text-slate-100', mobile ? 'text-[17px]' : 'text-[21px]')}>
            <span aria-hidden className={cn('size-2.5 rounded-full', toneStyles[g.tone].dot)} />
            {g.label}
          </h3>
          <ul className={cn('flex min-h-0 flex-1 flex-col', mobile ? 'mt-2 gap-2' : 'mt-3 justify-between gap-1.5')}>
            {g.items.map((item) => (
              <Row key={item.abbr} item={item} tone={g.tone} mobile={mobile} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Row({ item, tone, mobile }: { item: AbbrItem; tone: Tone; mobile?: boolean }) {
  const { goToId, numberOf } = useDeck()
  const t = toneStyles[tone]
  const body = (
    <>
      <span className={cn('shrink-0 font-mono font-black leading-none', t.text, mobile ? 'w-[88px] text-[16px]' : 'w-[150px] text-[21px]')}>{item.abbr}</span>
      <span className="min-w-0 flex-1">
        <span className={cn('block font-bold leading-snug text-white', mobile ? 'text-[16px]' : 'text-[20px]')}>{item.en}</span>
        <span className={cn('block leading-snug text-slate-300', mobile ? 'text-[15px]' : 'text-[17px]')}>
          <span className={cn('font-semibold', t.strong)}>{item.zh}</span>
          {item.tip && <span className="ml-2 text-slate-400">{item.tip}</span>}
        </span>
      </span>
      {item.slide && (
        <span className={cn('shrink-0 flex items-center gap-0.5 font-mono text-slate-500', mobile ? 'text-[13px]' : 'text-[16px]')}>
          P.{pad(numberOf(item.slide))}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </span>
      )}
    </>
  )
  const cls = cn('flex w-full items-start gap-3 rounded-xl text-left', mobile ? 'border border-line bg-white/[0.03] px-3 py-2.5' : 'bg-navy-900/40 px-4 py-2')
  return (
    <li className="min-h-0">
      {item.slide ? (
        <button type="button" onClick={() => goToId(item.slide!)} className={cn(cls, 'transition hover:bg-sky-950', focusRing)}>
          {body}
        </button>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </li>
  )
}
