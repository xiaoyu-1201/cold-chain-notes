import { ArrowUpRight, Headphones } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
  // 清單可以捲：標題允許兩行（不截斷），底部淡出表示下面還有；打開時捲到選到的那段
  const listRef = useRef<HTMLUListElement>(null)
  const [more, setMore] = useState({ top: false, bottom: false })
  const measure = () => {
    const el = listRef.current
    if (el) setMore({ top: el.scrollTop > 4, bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 4 })
  }
  useEffect(() => {
    listRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' })
    const el = listRef.current
    if (el) setMore({ top: el.scrollTop > 4, bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 4 })
  }, [])
  const mask = more.top || more.bottom ? `linear-gradient(to bottom, ${more.top ? 'transparent, #000 40px' : '#000'}, ${more.bottom ? '#000 calc(100% - 48px), transparent' : '#000'})` : undefined
  return (
    <div className="grid h-full grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] gap-6">
      <ul
        ref={listRef}
        onScroll={measure}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto overscroll-contain rounded-[18px] border border-line bg-card p-3 [scrollbar-width:thin]"
        data-no-swipe
      >
        {block.items.map((item, i) => {
          const r = recordingOf(item.slide)
          const on = i === sel
          return (
            <li key={item.slide} className="flex shrink-0 grow">
              <button
                type="button"
                onClick={() => setSel(i)}
                aria-current={on ? 'true' : undefined}
                className={cn('flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition', on ? 'bg-emerald-950 text-ink ring-1 ring-inset ring-emerald-500/40' : 'text-slate-200 hover:bg-white/[0.04]', focusRing)}
              >
                <span className={cn('w-[92px] shrink-0 font-mono text-[16px] font-bold', on ? 'text-emerald-300' : 'text-slate-400')}>{item.code}</span>
                <span className="line-clamp-2 min-w-0 flex-1 text-[17px] font-semibold leading-snug">{r?.title ?? item.slide}</span>
                <span className="shrink-0 font-mono text-[16px] text-slate-500">{r?.duration}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[16px] text-slate-300">
          <Headphones className="size-5 text-emerald-300" aria-hidden />
          <span className="font-bold text-ink">{picked.code}</span>
          <span className="text-slate-500">對應內容頁：</span>
          {picked.related.map((l) => (
            <button
              key={l.slide}
              type="button"
              onClick={() => goToId(l.slide)}
              className={cn('inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-[16px] font-semibold text-slate-100 transition hover:border-sky-500/50 hover:bg-sky-950', focusRing)}
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
