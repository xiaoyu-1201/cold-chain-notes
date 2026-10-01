import { Check, Repeat, RotateCcw, Shuffle } from 'lucide-react'
import { useState } from 'react'
import type { FlashcardsBlock } from '../../data/types'
import { cn } from '../../lib/cn'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

const shuffled = (n: number) => {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 名詞翻卡：先看國語名稱想其他叫法，再翻面；「會了」移出、「還不熟」放回後面（間隔重複） */
export function Flashcards({ block, mobile = false }: { block: FlashcardsBlock; mobile?: boolean }) {
  const total = block.cards.length
  const [queue, setQueue] = useState(() => Array.from({ length: total }, (_, i) => i))
  const [flipped, setFlipped] = useState(false)
  const current = queue[0]
  const card = current !== undefined ? block.cards[current] : null

  const next = (known: boolean) => {
    setFlipped(false)
    setQueue((q) => (known ? q.slice(1) : [...q.slice(1), q[0]]))
  }
  const restart = (shuffle: boolean) => {
    setFlipped(false)
    setQueue(shuffle ? shuffled(total) : Array.from({ length: total }, (_, i) => i))
  }

  const btn = cn('flex items-center gap-1.5 rounded-xl border font-bold transition', mobile ? 'px-3 py-2 text-[15px]' : 'px-5 py-2.5 text-[20px]', focusRing)

  return (
    <div className={cn('flex flex-col items-center', mobile ? 'gap-3' : 'h-full justify-center gap-5')}>
      <p className={cn('text-slate-400', mobile ? 'text-[14px]' : 'text-[19px]')}>
        會了 {total - queue.length} / {total}・先看名稱，說出台語、英文和型號，再點卡片翻面
      </p>

      {card ? (
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? '翻回正面' : '翻面看答案'}
          className={cn(
            'flex w-full flex-col items-center justify-center rounded-3xl border text-center transition',
            mobile ? 'min-h-[220px] p-5' : 'h-[440px] max-w-[1000px] p-10',
            flipped ? 'border-emerald-400/50 bg-emerald-400/[0.07]' : 'border-dashed border-sky-400/50 bg-sky-400/[0.06] hover:bg-sky-400/10',
            focusRing,
          )}
        >
          <span className={cn('font-black text-white', mobile ? 'text-[34px]' : 'text-[72px]')}>{card.term}</span>
          {flipped ? (
            <span className={cn('mt-4 space-y-2', mobile ? 'text-[17px]' : 'text-[30px]')}>
              <span className="block text-amber-200">也叫：{card.alias}</span>
              <span className="block font-mono text-sky-200">{card.en}</span>
              <span className="block text-emerald-100">{card.tip}</span>
            </span>
          ) : (
            <span className={cn('mt-4 text-slate-500', mobile ? 'text-[15px]' : 'text-[22px]')}>點一下翻面</span>
          )}
        </button>
      ) : (
        <div className={cn('flex w-full flex-col items-center justify-center rounded-3xl border border-emerald-400/50 bg-emerald-400/[0.07] text-center', mobile ? 'min-h-[220px] p-5' : 'h-[440px] max-w-[1000px]')}>
          <span className={cn('font-black text-emerald-200', mobile ? 'text-[26px]' : 'text-[52px]')}>全部會了！</span>
          <span className={cn('mt-2 text-slate-300', mobile ? 'text-[15px]' : 'text-[22px]')}>隔幾天再來一次，記得更牢</span>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {card ? (
          <>
            <button type="button" onClick={() => next(false)} className={cn(btn, 'border-amber-400/50 text-amber-100 hover:bg-amber-400/10')}>
              <Repeat className="size-5" aria-hidden />
              還不熟
            </button>
            <button type="button" onClick={() => next(true)} className={cn(btn, 'border-emerald-400/50 text-emerald-100 hover:bg-emerald-400/10')}>
              <Check className="size-5" aria-hidden />
              會了
            </button>
          </>
        ) : (
          <button type="button" onClick={() => restart(false)} className={cn(btn, 'border-white/20 text-slate-100')}>
            <RotateCcw className="size-5" aria-hidden />
            再來一次
          </button>
        )}
        <button type="button" onClick={() => restart(true)} className={cn(btn, 'border-white/20 text-slate-200 hover:border-sky-300/60')}>
          <Shuffle className="size-5" aria-hidden />
          洗牌重來
        </button>
      </div>
    </div>
  )
}
