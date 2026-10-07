import { ArrowUpRight, Headphones } from 'lucide-react'
import { useState } from 'react'
import { recordingOf } from '../../data/recordings'
import type { RecordingsIndexBlock } from '../../data/types'
import { useDeck } from '../../context/deck'
import { cn, pad } from '../../lib/cn'
import { AudioChapters } from './Media'

const focusRing = 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-300'

/** 電腦版：左邊清單（點一段）、右邊那一段的章節＋播放器 */
export function RecordingsIndex({ block }: { block: RecordingsIndexBlock }) {
  const { goToId, numberOf } = useDeck()
  const [sel, setSel] = useState(block.items.length - 1)
  const picked = block.items[sel]
  const rec = recordingOf(picked.slide)
  return (
    <div className="grid h-full grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] gap-6">
      <ul className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03] p-3">
        {block.items.map((item, i) => {
          const r = recordingOf(item.slide)
          const on = i === sel
          return (
            <li key={item.slide} className="min-h-0">
              <button
                type="button"
                onClick={() => setSel(i)}
                aria-current={on ? 'true' : undefined}
                className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition', on ? 'bg-emerald-400/15 text-white' : 'text-slate-200 hover:bg-white/[0.06]', focusRing)}
              >
                <span className={cn('w-[92px] shrink-0 font-mono text-[16px] font-bold', on ? 'text-emerald-300' : 'text-slate-400')}>{item.code}</span>
                <span className="min-w-0 flex-1 truncate text-[17px] font-semibold">{r?.title ?? item.slide}</span>
                <span className="shrink-0 font-mono text-[16px] text-slate-500">{r?.duration}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[16px] text-slate-300">
          <Headphones className="size-5 text-emerald-300" aria-hidden />
          <span className="font-bold text-white">
            {picked.code}｜{rec?.title}
          </span>
          <span className="text-slate-500">· 對應內容頁：</span>
          {picked.related.map((l) => (
            <button
              key={l.slide}
              type="button"
              onClick={() => goToId(l.slide)}
              className={cn('inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1 text-[16px] font-semibold text-slate-100 transition hover:border-sky-400/40 hover:bg-sky-400/10', focusRing)}
            >
              {l.label}
              <span className="font-mono text-[16px] text-slate-500">P.{pad(numberOf(l.slide))}</span>
              <ArrowUpRight className="size-3.5" aria-hidden />
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1">{rec && <AudioChapters key={picked.slide} block={rec.audio} />}</div>
      </div>
    </div>
  )
}
