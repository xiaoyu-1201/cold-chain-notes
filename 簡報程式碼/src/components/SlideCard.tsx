import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { parts } from '../data/parts'
import { slides } from '../data/slides'
import type { SlideData } from '../data/types'
import { NEW_LABEL, isNew } from '../data/whatsNew'
import { cn } from '../lib/cn'
import { toneStyles } from '../lib/tone'
import { BlockRenderer } from './blocks/BlockRenderer'
import { CoverLayout } from './CoverLayout'
import { PracticeButton } from './Practice'
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
  // 在本篇的第幾頁（方便知道自己在哪）
  const siblings = slides.filter((s) => s.part === slide.part)
  const position = siblings.indexOf(slide) + 1

  return (
    <motion.article
      initial="hidden"
      animate="show"
      variants={staggerParent}
      className="absolute inset-0 flex flex-col px-[88px] pb-[44px] pt-[52px]"
    >
      <motion.header variants={fadeUp} className="relative flex items-end justify-between gap-10">
        <div className="min-w-0">
          {/* 眉標：篇章・小節・本篇第幾頁（安靜的一行字，取代一排標籤） */}
          <p className="flex min-w-0 items-center gap-2.5 text-[20px] font-semibold">
            <span className={toneStyles[part.tone].text}>{part.short}</span>
            {slide.chapter && <span className="text-slate-300">· {slide.chapter}</span>}
            <span className="text-slate-500">
              · {position}／{siblings.length}
            </span>
            {slide.source && (
              <span title={SOURCE_TIP[slide.source]} className="text-slate-500">
                · {SOURCE_LABEL[slide.source]}
              </span>
            )}
            {slide.advanced && <span className="text-amber-300">· 進階</span>}
            {slide.tier === 'ref' && (
              <span className="text-slate-400" title="查閱手冊：規格、對照、型號怎麼讀；需要時再翻，不用背">
                · 查閱
              </span>
            )}
            {isNew(slide.added) && (
              <span className="ml-1 rounded-md bg-emerald-400 px-2 py-0.5 text-[16px] font-black leading-none text-navy-950" title={NEW_LABEL}>
                新
              </span>
            )}
          </p>
          <h2 className="mt-2 text-[60px] font-bold leading-[1.1] tracking-tight text-white">{slide.title}</h2>
          {firstOfPart && part.goal && (
            // 每一篇第一頁：先講清楚這一篇學完要會什麼
            <p className="mt-2 flex min-w-0 items-center gap-2 text-[21px] text-slate-400">
              <Target className={cn('size-5 shrink-0', toneStyles[part.tone].text)} aria-hidden />
              <span className="truncate">學完你會：{part.goal}</span>
            </p>
          )}
        </div>
        {slide.store && <StoreTipCard store={slide.store} />}
      </motion.header>

      <div className="relative mt-7 grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)]">
        {slide.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>

      {/* 小結論＋「學完馬上練」（必讀頁才有一題；點了在畫布上開小視窗） */}
      <motion.div variants={fadeUp} className="mt-6 flex items-stretch gap-4">
        <div className="min-w-0 flex-1">
          <ConclusionCallout label={slide.conclusion.label} text={slide.conclusion.text} />
        </div>
        <PracticeButton id={slide.id} />
      </motion.div>
    </motion.article>
  )
}
