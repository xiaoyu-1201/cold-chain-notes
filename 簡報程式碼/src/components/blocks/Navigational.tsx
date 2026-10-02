import { ArrowUpRight, ChevronRight, CornerDownRight, Flag, MessageCircle, Quote } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PartsBlock, ProductsBlock, QABlock, QuoteBlock, ScenarioBlock } from '../../data/types'
import { parts } from '../../data/parts'
import { useDeck } from '../../context/deck'
import { cn, pad } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'
import { Badge } from '../ui/Badge'
import { IconChip } from '../ui/IconChip'
import { Panel } from '../ui/Panel'
import { fadeUp, staggerParent } from '../ui/motion'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

/** 簡報架構：各篇章卡片，點擊章節直接跳頁 */
export function PartsOverview({ block }: { block: PartsBlock }) {
  const { goToId, numberOf } = useDeck()
  return (
    <div className="grid h-full grid-rows-[minmax(0,1fr)_auto] gap-5">
      <motion.div
        variants={staggerParent}
        className="grid min-h-0 gap-6"
        style={{ gridTemplateColumns: `repeat(${block.items.length}, minmax(0, 1fr))` }}
      >
        {block.items.map((item, index) => {
          const part = parts[item.part]
          const t = toneStyles[part.tone]
          return (
            <motion.div key={item.part} variants={fadeUp} className="relative min-h-0">
              {/* 步驟之間的箭頭：提示學習先後順序 */}
              {index < block.items.length - 1 && (
                <ChevronRight aria-hidden className="absolute -right-[23px] top-[86px] z-10 size-6 text-slate-500" />
              )}
            <section className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-white/10 bg-linear-to-b from-white/[0.06] to-white/[0.015] p-5">
              <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1 bg-linear-to-r', t.gradient)} />
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[16px] font-bold tracking-[0.2em] text-slate-400">STEP {item.no}</span>
                <Badge tone={part.tone} size="sm">
                  {item.range}
                </Badge>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <IconChip icon={item.icon} tone={part.tone} />
                <div className="min-w-0">
                  <p className={cn('text-[16px] font-bold', t.text)}>{part.ordinal}</p>
                  <h3 className="text-[25px] font-black leading-tight text-white">{part.title}</h3>
                </div>
              </div>
              {part.goal && (
                <p className="mt-3 text-[17px] leading-snug text-slate-300">
                  <span className={cn('mr-1.5 font-bold', t.text)}>學完你會</span>
                  {part.goal}
                </p>
              )}
              <ul className="mt-4 flex flex-1 flex-col gap-2">
                {item.chapters.map((ch) => (
                  <li key={ch.code + ch.title}>
                    <button
                      type="button"
                      onClick={() => goToId(ch.slide)}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-navy-900/50 px-3.5 py-2.5 text-left transition hover:border-sky-400/40 hover:bg-sky-400/10',
                        focusRing,
                      )}
                    >
                      <span className={cn('w-[52px] shrink-0 font-mono text-[16px] font-bold', t.text)}>{ch.code}</span>
                      <span className="min-w-0 flex-1 text-[18px] font-semibold leading-snug text-slate-100">{ch.title}</span>
                      <span className="font-mono text-[16px] text-slate-500">P.{pad(numberOf(ch.slide))}</span>
                      <ArrowUpRight className="size-4 shrink-0 text-slate-500 transition group-hover:text-sky-300" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            </motion.div>
          )
        })}
      </motion.div>
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] px-6 py-3.5"
      >
        <Flag className="size-6 text-emerald-300" aria-hidden />
        <span className="text-[20px] font-bold text-emerald-200">{block.finale.label}</span>
        {block.finale.links.map((link) => (
          <button
            key={link.slide}
            type="button"
            onClick={() => goToId(link.slide)}
            className={cn(
              'group flex items-center gap-2 rounded-xl border border-white/10 bg-navy-900/50 px-4 py-2 text-[19px] font-semibold text-slate-100 transition hover:border-emerald-400/40 hover:bg-emerald-400/10',
              focusRing,
            )}
          >
            {link.title}
            <span className="font-mono text-[16px] text-slate-500">P.{pad(numberOf(link.slide))}</span>
            <ArrowUpRight className="size-4 text-slate-500 group-hover:text-emerald-300" aria-hidden />
          </button>
        ))}
        {block.finale.note && <p className="ml-auto text-right text-[16px] leading-snug text-slate-400">{block.finale.note}</p>}
      </motion.div>
    </div>
  )
}

/** 店內產品地圖 */
export function ProductMap({ block }: { block: ProductsBlock }) {
  const { goToId, numberOf } = useDeck()
  return (
    <motion.div variants={staggerParent} className="grid h-full grid-cols-5 grid-rows-2 gap-4">
      {block.items.map((item) => {
        const t = toneStyles[item.tone]
        return (
          <motion.button
            key={item.title}
            variants={fadeUp}
            type="button"
            onClick={() => goToId(item.slide)}
            className={cn(
              'group relative flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-white/10 bg-linear-to-b from-white/[0.06] to-white/[0.015] p-5 text-left transition hover:border-sky-400/40 hover:from-sky-400/[0.08]',
              focusRing,
            )}
          >
            <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1 bg-linear-to-r', t.gradient)} />
            <div className="flex items-start justify-between gap-2">
              <IconChip icon={item.icon} tone={item.tone} />
              <span className="flex items-center gap-1 rounded-full border border-white/10 bg-navy-900/60 px-2.5 py-1 text-[16px] font-semibold text-slate-300 transition group-hover:border-sky-400/40 group-hover:text-sky-200">
                {item.chapter}
                <span className="font-mono text-slate-500">P.{pad(numberOf(item.slide))}</span>
                <ArrowUpRight className="size-3.5" aria-hidden />
              </span>
            </div>
            <h3 className="mt-4 text-[23px] font-black leading-tight text-white">{item.title}</h3>
            <p className="mt-0.5 font-mono text-[16px] uppercase tracking-[0.14em] text-slate-400">{item.en}</p>
            <p className="mt-3 text-[18px] leading-normal text-slate-300">{item.items}</p>
            <span className={cn('mt-auto self-start rounded-md border px-2.5 py-0.5 text-[17px] font-semibold', t.chip)}>{item.side}</span>
          </motion.button>
        )
      })}
    </motion.div>
  )
}

/** 門市情境卡 */
export function ScenarioCard({ block }: { block: ScenarioBlock }) {
  const { goToId, numberOf } = useDeck()
  const t = toneStyles[block.tone]
  return (
    <div className="flex h-full flex-col rounded-[20px] border border-white/10 bg-linear-to-b from-white/[0.055] to-white/[0.015] p-5">
      <div className="flex items-center justify-between gap-2">
        <Badge tone={block.tone} size="sm">
          {block.label}
        </Badge>
        {block.slide && (
          <button
            type="button"
            onClick={() => goToId(block.slide!)}
            className={cn(
              'flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-0.5 text-[16px] font-semibold text-slate-400 transition hover:border-sky-400/40 hover:text-sky-200',
              focusRing,
            )}
          >
            {block.chapter} <span className="font-mono">P.{pad(numberOf(block.slide))}</span>
            <ArrowUpRight className="size-3.5" aria-hidden />
          </button>
        )}
      </div>
      <p className={cn('mt-3 flex gap-2 text-[21px] font-bold leading-snug', t.strong)}>
        <MessageCircle className={cn('mt-1 size-5 shrink-0', t.text)} aria-hidden />
        {block.customer}
      </p>
      <p className="mt-2.5 flex gap-2 text-[18px] leading-normal text-slate-300">
        <CornerDownRight className="mt-1 size-4 shrink-0 text-slate-500" aria-hidden />
        <span>{block.ask}</span>
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
        <span className="mr-1 text-[17px] font-bold text-emerald-300">推薦</span>
        {block.recommend.map((r) => (
          <span key={r} className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[17px] font-semibold text-emerald-100">
            {r}
          </span>
        ))}
      </div>
    </div>
  )
}

/** 引言大字卡 */
export function QuoteCard({ block }: { block: QuoteBlock }) {
  return (
    <figure className="relative overflow-hidden rounded-[24px] border border-sky-300/20 bg-linear-to-r from-sky-500/[0.14] via-navy-800/40 to-transparent px-10 py-7">
      <Quote aria-hidden className="absolute -left-2 -top-4 size-28 text-sky-300/10" />
      <blockquote className="relative text-[44px] font-black leading-tight text-white">{block.text}</blockquote>
      <figcaption className="relative mt-3 font-mono text-[17px] tracking-[0.12em] text-sky-300/80">— {block.author}</figcaption>
    </figure>
  )
}

/** Q&A 區塊 */
export function QAPanel({ block }: { block: QABlock }) {
  const { goToId, numberOf } = useDeck()
  return (
    <Panel icon={block.icon} title={block.title} en={block.en} tone={block.tone}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-center py-1">
          <span className="bg-linear-to-br from-sky-100 via-sky-300 to-cyan-400 bg-clip-text pb-4 font-mono text-[104px] font-black leading-none tracking-tight text-transparent">
            Q&amp;A
          </span>
        </div>
        <p className="mt-3 text-[17px] font-bold text-slate-400">建議討論方向</p>
        <ul className="mt-2 space-y-1.5">
          {block.prompts.map((p) => (
            <li key={p} className="flex gap-2.5 text-[19px] leading-snug text-slate-200">
              <MessageCircle className="mt-1 size-4 shrink-0 text-sky-300" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
        <p className="mt-auto pt-4 text-[17px] font-bold text-slate-400">快速回顧</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {block.links.map((link) => (
            <button
              key={link.slide}
              type="button"
              onClick={() => goToId(link.slide)}
              className={cn(
                'group flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-navy-900/50 px-3.5 py-2 text-left text-[17px] font-semibold text-slate-100 transition hover:border-sky-400/40 hover:bg-sky-400/10',
                focusRing,
              )}
            >
              <span className="truncate">{link.label}</span>
              <span className="flex shrink-0 items-center gap-1 font-mono text-[16px] text-slate-500 group-hover:text-sky-300">
                P.{pad(numberOf(link.slide))}
                <ArrowUpRight className="size-3.5" aria-hidden />
              </span>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  )
}
