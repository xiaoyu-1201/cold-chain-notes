import { ArrowUpRight, ChevronRight, CornerDownRight, Flag, MessageCircle, Quote } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PartsBlock, ProductsBlock, QABlock, QuoteBlock, ScenarioBlock } from '../../data/types'
import { PART_NO, parts } from '../../data/parts'
import { slides } from '../../data/slides'
import { NEW_LABEL, isNew } from '../../data/whatsNew'
import { useDeck } from '../../context/deck'
import { useStickyState } from '../../hooks/useStickyState'
import { cn, pad } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'
import { Badge } from '../ui/Badge'
import { IconChip } from '../ui/IconChip'
import { Panel } from '../ui/Panel'
import { Segmented } from '../ui/Segmented'
import { GlyphCell, PartGlyph } from '../ui/PartGlyph'
import { glyphFor } from '../../lib/partGlyph'
import { fadeUp, staggerParent } from '../ui/motion'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500'

/** 這一批新增的頁（標題、學習地圖、目錄都標「新」） */
const newSlides = slides.filter((s) => isNew(s.added))
const newIds = new Set(newSlides.map((s) => s.id))
/** 查閱手冊的頁（學習地圖標「查閱」、可以收起來只看必讀） */
const refIds = new Set(slides.filter((s) => s.tier === 'ref').map((s) => s.id))
const coreCount = slides.filter((s) => s.tier !== 'ref' && !s.advanced).length

/** 每一篇的「小結」「自我檢測」頁（不在章節清單裡，放在卡片最下面當固定出口） */
const tailLinks = (part: string) =>
  slides.filter((s) => s.part === part && (s.id.startsWith('recap-') || s.id.startsWith('check-'))).map((s) => ({ id: s.id, label: s.id.startsWith('recap-') ? '小結' : '自我檢測' }))

/**
 * 學習地圖：五步卡片，點章節直接跳頁。
 * 一列＝代號｜（元件篇的零件線稿）｜標題（可以兩行，後面跟「新」「查閱」）｜頁碼；
 * 標題不再被小標籤擠成直排。上面「必讀／全部」切換；必讀模式列寬鬆一點，全部模式排緊一點。
 */
export function PartsOverview({ block }: { block: PartsBlock }) {
  const { goToId, numberOf } = useDeck()
  const [coreOnly, setCoreOnly] = useStickyState('overview-core-only', false)
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
          const chapters = item.chapters.filter((ch) => !coreOnly || !refIds.has(ch.slide))
          const hasGlyph = chapters.some((c) => glyphFor(c.title))
          const tight = chapters.length > 5
          // 很多列的篇（全部模式的配件篇）：字小一級，1440 寬（畫布 1920）才放得下、不疊字（10/10 QA）
          const dense = chapters.length > 7
          // 一列可能代表好幾頁（例：「壓縮機：牌子、電壓、拿貨」＝P.21～24）：其中一頁是新的，這列就標「新」
          const starts = item.chapters.map((c) => slides.findIndex((s) => s.id === c.slide))
          const rowIsNew = (slideId: string) => {
            const start = slides.findIndex((s) => s.id === slideId)
            for (let j = start; j >= 0 && j < slides.length; j++) {
              const s = slides[j]
              if (j > start && (starts.includes(j) || s.part !== item.part || s.id.startsWith('recap-') || s.id.startsWith('check-'))) break
              if (newIds.has(s.id)) return true
            }
            return false
          }
          // 章節少的篇（兩、三頁）：每列多放一句「這頁的小結論」當預覽，卡片不會下半部空一大塊
          const previewLines = chapters.length <= 2 ? 4 : chapters.length <= 4 ? 1 : 0
          return (
            <motion.div key={item.part} variants={fadeUp} className="relative min-h-0">
              {/* 步驟之間的箭頭：提示學習先後順序 */}
              {index < block.items.length - 1 && (
                <ChevronRight aria-hidden className="absolute -right-[23px] top-[86px] z-10 size-6 text-slate-500" />
              )}
              <section className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] border border-line bg-card p-5">
                <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1', t.bar)} />
                <div className="flex items-center justify-between gap-2">
                  <span className="drawing-no rounded-[4px] border border-ink/45 px-2 py-0.5 text-[16px] font-bold leading-6 text-ink">圖 {PART_NO[item.part]}</span>
                  <Badge tone={part.tone} size="sm">
                    {item.range}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <IconChip icon={item.icon} tone={part.tone} />
                  <div className="min-w-0">
                    <p className={cn('text-[16px] font-bold', t.text)}>{part.ordinal}</p>
                    <h3 className="text-[24px] font-black leading-tight text-ink">{part.title}</h3>
                  </div>
                </div>
                {part.goal && (
                  <p className={cn('mt-2.5 text-[17px] leading-snug text-slate-300', tight && 'line-clamp-2')}>
                    <span className={cn('mr-1.5 font-bold', t.text)}>學完你會</span>
                    {/* goal 本身多半是「會…」開頭：去掉一個，不會變成「學完你會會…」（10/10 QA） */}
                    {part.goal.replace(/^會/, '')}
                  </p>
                )}
                <ul className={cn('flex min-h-0 flex-col', tight ? 'mt-2 gap-1' : 'mt-3 gap-2')}>
                  {chapters.map((ch) => {
                    const g = glyphFor(ch.title)
                    const isRef = refIds.has(ch.slide)
                    const preview = previewLines ? slides.find((s) => s.id === ch.slide)?.conclusion.text : null
                    return (
                      <li key={ch.code + ch.title}>
                        <button
                          type="button"
                          onClick={() => goToId(ch.slide)}
                          className={cn(
                            'flex w-full gap-2.5 rounded-xl border px-3 text-left transition hover:border-sky-500/60 hover:bg-sky-950',
                            preview ? 'items-start py-2.5' : tight ? 'min-h-[40px] items-center py-1' : 'min-h-[52px] items-center py-2',
                            isRef ? 'border-dashed border-line bg-card' : 'border-line bg-paper',
                            focusRing,
                          )}
                        >
                          <span className={cn('w-12 shrink-0 font-mono text-[16px] font-bold', t.text)}>{ch.code}</span>
                          {hasGlyph && <span className="flex w-6 shrink-0 justify-center text-ink-2">{g && <PartGlyph id={g} size={26} />}</span>}
                          <span className={cn('min-w-0 flex-1 text-balance font-semibold leading-snug text-slate-100', dense ? 'text-[17px]' : 'text-[18px]')}>
                            {ch.title}
                            {rowIsNew(ch.slide) && <span className="ml-1.5 inline-block rounded bg-emerald-400 px-1.5 align-[1px] text-[16px] font-black leading-6 text-paper">新</span>}
                            {isRef && <span className="ml-1.5 inline-block text-[16px] font-semibold text-slate-500">查閱</span>}
                            {preview && (
                              <span className={cn('mt-1 text-[16px] font-normal leading-snug text-slate-400', previewLines === 4 ? 'line-clamp-4' : 'line-clamp-1')}>{preview}</span>
                            )}
                          </span>
                          <span className="shrink-0 font-mono text-[16px] text-slate-500">P.{pad(numberOf(ch.slide))}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {/* 每篇的出口：小結＋自我檢測（固定在卡片底部，各篇對齊） */}
                <div className="mt-auto flex gap-2 border-t border-line pt-2">
                  {tailLinks(item.part).map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => goToId(l.id)}
                      className={cn('flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-[17px] font-semibold text-slate-200 transition hover:bg-sky-950 hover:text-sky-300', focusRing)}
                    >
                      {l.label}
                      <span className="font-mono text-[16px] text-slate-500">P.{pad(numberOf(l.id))}</span>
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          )
        })}
      </motion.div>
      <motion.div variants={fadeUp} className="flex items-center gap-4 rounded-[14px] border border-line bg-card px-6 py-3">
        {/* 必讀／全部：分段切換，看得出現在是哪一種 */}
        <span title="第一週必讀：原理、單位、裝置、四大元件、拿貨、服務心法；查閱：規格、對照、型號讀法，需要時再翻">
          <Segmented
            size="md"
            value={coreOnly ? 'core' : 'all'}
            onChange={(v) => setCoreOnly(v === 'core')}
            options={[
              { value: 'core', label: `必讀 ${coreCount} 頁` },
              { value: 'all', label: `全部 ${coreCount + refIds.size} 頁` },
            ]}
          />
        </span>
        <span className="h-8 w-px bg-line" aria-hidden />
        <Flag className="size-6 text-emerald-300" aria-hidden />
        <span className="text-[20px] font-bold text-emerald-200">{block.finale.label}</span>
        {newSlides.length > 0 && (
          <button
            type="button"
            onClick={() => goToId(newSlides[0].id)}
            title={newSlides.map((s) => `P.${pad(numberOf(s.id))} ${s.title}`).join('\n')}
            className={cn('group flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-[19px] font-bold text-paper transition hover:bg-emerald-300', focusRing)}
          >
            {NEW_LABEL} {newSlides.length} 頁
            <ArrowUpRight className="size-4" aria-hidden />
          </button>
        )}
        {block.finale.links.map((link) => (
          <button
            key={link.slide}
            type="button"
            onClick={() => goToId(link.slide)}
            className={cn(
              'group flex min-h-[44px] items-center gap-2 rounded-xl border border-line bg-paper px-4 py-2 text-[19px] font-semibold text-slate-100 transition hover:border-emerald-500/50 hover:bg-emerald-950',
              focusRing,
            )}
          >
            {link.title}
            {newIds.has(link.slide) && <span className="inline-block rounded bg-emerald-400 px-1.5 text-[16px] font-black leading-6 text-paper">新</span>}
            <span className="font-mono text-[16px] text-slate-500">P.{pad(numberOf(link.slide))}</span>
          </button>
        ))}
        {block.finale.note && <p className="ml-auto hidden max-w-[300px] text-right text-[16px] leading-snug text-slate-400 2xl:block">{block.finale.note}</p>}
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
        // 產品類別用零件線稿：先看標題，標題沒有就看內容（「保護配件」→ 乾燥過濾器）
        const glyph = glyphFor(item.title) ?? glyphFor(item.items)
        return (
          <motion.button
            key={item.title}
            variants={fadeUp}
            type="button"
            onClick={() => goToId(item.slide)}
            className={cn(
              'group relative flex min-h-0 flex-col overflow-hidden rounded-[18px] border border-line bg-card p-5 text-left transition hover:border-sky-500/50',
              focusRing,
            )}
          >
            <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1', t.bar)} />
            <div className="flex items-start justify-between gap-2">
              {glyph ? (
                <GlyphCell id={glyph} size={64} />
              ) : (
                <span className="inline-flex size-16 shrink-0 items-center justify-center rounded-[10px] border border-line bg-paper text-ink-2">
                  <item.icon className="size-8" strokeWidth={1.8} aria-hidden />
                </span>
              )}
              <span className="flex items-center gap-1 rounded-full border border-line bg-paper px-2.5 py-1 text-[16px] font-semibold text-slate-300 transition group-hover:border-sky-500/50 group-hover:text-sky-300">
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
    <div className="flex h-full flex-col justify-center rounded-[18px] border border-line bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <Badge tone={block.tone} size="sm">
          {block.label}
        </Badge>
        {block.slide && (
          <button
            type="button"
            onClick={() => goToId(block.slide!)}
            className={cn(
              'flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-[16px] font-semibold text-slate-400 transition hover:border-sky-500/50 hover:text-sky-300',
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
      <div className="flex flex-wrap items-center gap-1.5 pt-4">
        <span className="mr-1 text-[17px] font-bold text-emerald-300">推薦</span>
        {block.recommend.map((r) => (
          <span key={r} className="rounded-md border border-emerald-500/40 bg-emerald-950 px-2 py-0.5 text-[17px] font-semibold text-emerald-100">
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
    <figure className="relative overflow-hidden rounded-[18px] border border-line border-l-4 border-l-pipe-blue bg-card px-10 py-7">
      <Quote aria-hidden className="absolute right-6 top-4 size-20 text-sky-500/15" />
      <blockquote className="relative text-[44px] font-black leading-tight text-white">{block.text}</blockquote>
      <figcaption className="relative mt-3 text-[18px] font-semibold text-sky-300">— {block.author}</figcaption>
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
          <span className="pb-4 font-mono text-[104px] font-black leading-none tracking-tight text-sky-300">
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
                'group flex items-center justify-between gap-2 rounded-xl border border-line bg-paper px-3.5 py-2 text-left text-[17px] font-semibold text-slate-100 transition hover:border-sky-500/50 hover:bg-sky-950',
                focusRing,
              )}
            >
              <span className="truncate">{link.label}</span>
              <span className="flex shrink-0 items-center gap-1 font-mono text-[16px] text-slate-500 group-hover:text-sky-400">
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
