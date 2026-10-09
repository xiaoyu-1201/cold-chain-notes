import { motion } from 'framer-motion'
import type { CoverData, SlideData } from '../data/types'
import { slides } from '../data/slides'
import { PART_NO } from '../data/parts'
import { ConclusionCallout } from './ui/ConclusionCallout'
import { fadeUp, staggerParent } from './ui/motion'
import { CycleExplorer } from './diagrams/CycleExplorer'

/** 封面上的數字都從資料算（加頁、加篇章會自動跟著變） */
const partCount = new Set(slides.map((s) => s.part)).size
const coreCount = slides.filter((s) => s.tier !== 'ref' && !s.advanced).length

/** 封面版型（技術藍圖：左邊像圖紙標題欄，右邊是冷凍循環圖） */
export function CoverLayout({ slide, cover }: { slide: SlideData; cover: CoverData }) {
  const stats = [
    { value: String(slides.length), label: '頁' },
    { value: String(partCount), label: '篇' },
    { value: String(coreCount), label: '頁必讀' },
  ]
  const siblings = slides.filter((s) => s.part === slide.part)

  return (
    <motion.article
      initial="hidden"
      animate="show"
      variants={staggerParent}
      className="absolute inset-0 flex flex-col px-[96px] pb-[48px] pt-[64px]"
    >
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center gap-14">
        <div>
          <motion.p variants={fadeUp} className="flex items-center gap-3 text-[20px] font-semibold text-slate-300">
            <span className="drawing-no inline-flex items-stretch overflow-hidden rounded-[4px] border border-ink/45 text-[18px] leading-none text-ink">
              <span className="px-2.5 py-1.5 font-bold">
                圖 {PART_NO[slide.part]}-{siblings.indexOf(slide) + 1}
              </span>
              <span className="border-l border-ink/30 px-2 py-1.5 text-ink-3">共 {siblings.length}</span>
            </span>
            冷凍材料行培訓筆記
          </motion.p>

          <motion.h1 variants={fadeUp} className="mt-7 text-[112px] font-black leading-[1.04] tracking-tight text-ink">
            {cover.titleLead}
            <br />
            <span className="text-sky-300">{cover.titleAccent}</span>
          </motion.h1>
          {/* 管路三色：紅＝吐出管、黃＝液管、藍＝吸氣管（全站的顏色語言） */}
          <motion.div variants={fadeUp} className="mt-6 flex w-[420px] gap-1.5" aria-hidden>
            <span className="h-1.5 flex-1 rounded-full bg-pipe-red" />
            <span className="h-1.5 flex-1 rounded-full bg-pipe-yellow" />
            <span className="h-1.5 flex-1 rounded-full bg-pipe-blue" />
          </motion.div>

          <motion.p variants={fadeUp} className="mt-6 text-[38px] font-bold leading-snug text-slate-100">
            {cover.subtitle}
          </motion.p>
          <motion.p variants={fadeUp} className="mt-2 text-[22px] font-semibold text-emerald-300">
            {cover.audience}
          </motion.p>
          <motion.p variants={fadeUp} className="mt-1 text-[19px] text-slate-400">
            （{cover.source}）
          </motion.p>

          <motion.ul variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            {cover.tags.map((tag) => {
              const Icon = tag.icon
              return (
                <li key={tag.label} className="flex items-center gap-2 rounded-full border border-line bg-card px-5 py-2 text-[20px] font-semibold text-slate-100">
                  <Icon className="size-5 text-sky-400" aria-hidden />
                  {tag.label}
                </li>
              )
            })}
          </motion.ul>

          <motion.div variants={fadeUp} className="mt-9 flex items-center gap-10">
            {stats.map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <span className="font-mono text-[40px] font-extrabold leading-none text-ink">{s.value}</span>
                <span className="text-[19px] font-semibold text-slate-400">{s.label}</span>
              </div>
            ))}
            <div className="ml-2 h-12 w-px bg-line" aria-hidden />
            <p className="text-[18px] text-slate-400">
              按 <span className="rounded-md border border-line bg-card px-2 py-0.5 font-mono text-slate-200">→</span> 或{' '}
              <span className="rounded-md border border-line bg-card px-2 py-0.5 font-mono text-slate-200">Space</span> 開始
            </p>
          </motion.div>
        </div>

        <motion.div variants={fadeUp}>
          <div className="rounded-[18px] border border-line bg-card p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[20px] font-bold text-ink">冷凍循環：冷媒一圈</span>
              <span className="flex items-center gap-2 text-[17px] font-semibold text-emerald-300">
                <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
                系統運轉中
              </span>
            </div>
            <CycleExplorer className="w-full" />
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="mt-8">
        <ConclusionCallout label={slide.conclusion.label} text={slide.conclusion.text} />
      </motion.div>
    </motion.article>
  )
}
