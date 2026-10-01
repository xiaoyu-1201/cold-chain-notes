import { motion } from 'framer-motion'
import { Snowflake } from 'lucide-react'
import type { CoverData, SlideData } from '../data/types'
import { slides } from '../data/slides'
import { ConclusionCallout } from './ui/ConclusionCallout'
import { fadeUp, staggerParent } from './ui/motion'
import { CycleExplorer } from './diagrams/CycleExplorer'

/** 封面版型 */
export function CoverLayout({ slide, cover }: { slide: SlideData; cover: CoverData }) {
  const stats = [
    { value: String(slides.length), label: '張投影片' },
    { value: '4', label: '大篇章' },
    { value: '0–9', label: '技術章節' },
  ]

  return (
    <motion.article
      initial="hidden"
      animate="show"
      variants={staggerParent}
      className="absolute inset-0 flex flex-col px-[96px] pb-[48px] pt-[64px]"
    >
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center gap-14">
        <div>
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300 ring-1 ring-inset ring-sky-400/30">
              <Snowflake className="size-6" aria-hidden />
            </span>
            <span className="font-mono text-[16px] uppercase tracking-[0.26em] text-sky-300/90">{cover.kicker}</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="mt-7 text-[112px] font-black leading-[1.04] tracking-tight text-white">
            {cover.titleLead}
            <br />
            <span className="bg-linear-to-r from-sky-100 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
              {cover.titleAccent}
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 text-[38px] font-bold leading-snug text-slate-100">
            {cover.subtitle}
          </motion.p>
          <motion.p variants={fadeUp} className="mt-2 text-[22px] font-semibold text-emerald-200">
            {cover.audience}
          </motion.p>
          <motion.p variants={fadeUp} className="mt-1 text-[19px] text-slate-400">
            （{cover.source}）
          </motion.p>

          <motion.ul variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            {cover.tags.map((tag) => {
              const Icon = tag.icon
              return (
                <li
                  key={tag.label}
                  className="flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-5 py-2 text-[20px] font-semibold text-sky-100"
                >
                  <Icon className="size-5 text-sky-300" aria-hidden />
                  {tag.label}
                </li>
              )
            })}
          </motion.ul>

          <motion.div variants={fadeUp} className="mt-9 flex items-center gap-10">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-mono text-[40px] font-extrabold leading-none text-white">{s.value}</div>
                <div className="mt-1.5 text-[17px] text-slate-400">{s.label}</div>
              </div>
            ))}
            <div className="ml-2 h-12 w-px bg-white/10" aria-hidden />
            <p className="text-[18px] text-slate-400">
              按 <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-slate-200">→</span> 或{' '}
              <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-slate-200">Space</span> 開始
            </p>
          </motion.div>
        </div>

        <motion.div variants={fadeUp}>
          <div className="rounded-[28px] border border-white/10 bg-navy-900/70 p-6 shadow-[0_30px_80px_-30px_rgba(56,189,248,0.35)]">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[14px] uppercase tracking-[0.2em] text-slate-400">Vapor-Compression Cycle</span>
              <span className="flex items-center gap-2 text-[15px] font-semibold text-emerald-300">
                <span className="size-2 animate-pulse rounded-full bg-emerald-400" aria-hidden />
                系統運轉中
              </span>
            </div>
            <CycleExplorer className="w-full" showHint={false} />
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="mt-8">
        <ConclusionCallout label={slide.conclusion.label} text={slide.conclusion.text} />
      </motion.div>
    </motion.article>
  )
}
