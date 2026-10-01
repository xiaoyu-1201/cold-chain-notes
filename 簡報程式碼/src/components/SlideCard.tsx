import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { parts } from '../data/parts'
import { slides } from '../data/slides'
import type { SlideData } from '../data/types'
import { cn } from '../lib/cn'
import { toneStyles } from '../lib/tone'
import { BlockRenderer } from './blocks/BlockRenderer'
import { CoverLayout } from './CoverLayout'
import { Badge } from './ui/Badge'
import { ConclusionCallout } from './ui/ConclusionCallout'
import { fadeUp, staggerParent } from './ui/motion'
import { StoreTipCard } from './ui/StoreTipCard'

/** 內容來源標示（沒標＝課堂錄音／講義，最優先學） */
export const SOURCE_LABEL = { handbook: '手冊延伸', extra: '延伸補充' } as const
export const SOURCE_TIP = {
  handbook: '整理自一丞工程手冊，比課堂更深；先以課堂錄音為主',
  extra: '依業界常識補充，課堂沒講到；先以課堂錄音為主',
} as const

/** 單張投影片：標題列 + 內容區塊 + 📌 本章小結論 */
export function SlideCard({ slide }: { slide: SlideData }) {
  if (slide.layout === 'cover' && slide.cover) return <CoverLayout slide={slide} cover={slide.cover} />

  const part = parts[slide.part]
  const index = slides.indexOf(slide)
  const firstOfPart = index <= 0 || slides[index - 1].part !== slide.part

  return (
    <motion.article
      initial="hidden"
      animate="show"
      variants={staggerParent}
      className="absolute inset-0 flex flex-col px-[88px] pb-[44px] pt-[52px]"
    >
      {slide.mark && !slide.store && (
        <div
          aria-hidden
          className="pointer-events-none absolute right-[72px] top-[22px] select-none font-mono text-[150px] font-extrabold leading-none tracking-tighter text-white/[0.035]"
        >
          {slide.mark}
        </div>
      )}

      <motion.header variants={fadeUp} className="relative flex items-end justify-between gap-10">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Badge tone={part.tone} size="lg">
              {part.short}
            </Badge>
            {slide.chapter && (
              <Badge tone="slate" size="lg">
                {slide.chapter}
              </Badge>
            )}
            {slide.source && (
              <span title={SOURCE_TIP[slide.source]}>
                <Badge tone="slate" size="lg">
                  {SOURCE_LABEL[slide.source]}
                </Badge>
              </span>
            )}
            {slide.advanced && (
              <Badge tone="amber" size="lg">
                進階・第二階段
              </Badge>
            )}
            {firstOfPart && part.goal ? (
              // 每一篇第一頁：先講清楚這一篇學完要會什麼
              <span className="flex min-w-0 items-center gap-2 text-[19px] font-semibold text-slate-200">
                <Target className={cn('size-5 shrink-0', toneStyles[part.tone].text)} aria-hidden />
                <span className={toneStyles[part.tone].text}>學完你會</span>
                <span className="truncate">{part.goal}</span>
              </span>
            ) : (
              slide.en && <span className="font-mono text-[16px] uppercase tracking-[0.2em] text-slate-400">{slide.en}</span>
            )}
          </div>
          <h2 className="mt-4 text-[56px] font-black leading-[1.1] tracking-tight text-white">{slide.title}</h2>
        </div>
        {slide.store && <StoreTipCard store={slide.store} />}
      </motion.header>

      <div className="relative mt-7 grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)]">
        {slide.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>

      <motion.div variants={fadeUp} className="relative mt-6">
        <ConclusionCallout label={slide.conclusion.label} text={slide.conclusion.text} />
      </motion.div>
    </motion.article>
  )
}
