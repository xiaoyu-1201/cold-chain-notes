import { ArrowRight, MapPin, Target, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { CompareBlock, CompareSide, InfoBlock, ListBlock, TilesBlock, TimelineBlock, Tone } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'
import { Badge } from '../ui/Badge'
import { glyphFor } from '../../lib/partGlyph'
import { GlyphCell } from '../ui/PartGlyph'
import { Panel } from '../ui/Panel'

/** 資訊卡：元件、角色、規格說明 */
export function InfoCard({ block }: { block: InfoBlock }) {
  return (
    // 內容比卡片短時整組垂直置中（上下留白一樣），不會上面擠、下面空一大塊
    <div className="flex h-full flex-col justify-center rounded-[18px] border border-line bg-card p-5">
      <div className="flex items-start gap-3.5">
        <ItemIcon icon={block.icon} title={block.title} tone={block.tone} size="md" />
        <div className="min-w-0 flex-1">
          <h4 className="text-[23px] font-bold leading-tight text-slate-50">{block.title}</h4>
          {block.en && <p className="mt-1 font-mono text-[16px] uppercase tracking-[0.14em] text-slate-400">{block.en}</p>}
        </div>
        {block.tag && (
          <Badge tone={block.tone} size="sm">
            {block.tag}
          </Badge>
        )}
      </div>
      <div className="mt-3 text-[20px] leading-[1.55] text-slate-300">{block.body}</div>
      {(block.warn || block.meta) && (
        <div className="flex flex-col gap-2 pt-4">
          {block.warn && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/50 bg-amber-950 px-3.5 py-2.5 text-[19px] leading-snug text-amber-100">
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-300" aria-hidden />
              <span>{block.warn}</span>
            </div>
          )}
          {block.meta && (
            <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-slate-500/25 bg-slate-500/10 px-3 py-1 text-[17px] font-semibold text-slate-300">
              <MapPin className="size-4" aria-hidden />
              {block.meta}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/** 編號清單 */
export function ItemList({ block }: { block: ListBlock }) {
  return (
    <Panel icon={block.icon} title={block.title} en={block.en} tone={block.tone}>
      {/* 像零件表（BOM）：一列一項、細線分隔，不再一列一個框 */}
      <ol className="flex h-full flex-col divide-y divide-line border-y border-line">
        {block.items.map((item, i) => (
          <li key={item.title} className="flex flex-1 items-center gap-4 px-1 py-2">
            <span className="w-6 shrink-0 font-mono text-[17px] font-bold text-slate-500">{i + 1}</span>
            <ItemIcon icon={item.icon} title={item.title} tone={block.tone} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-[22px] font-bold leading-snug text-slate-50">{item.title}</h4>
                {item.badge && (
                  <Badge tone={item.badge.tone} size="sm">
                    {item.badge.label}
                  </Badge>
                )}
              </div>
              <p className="text-[18px] leading-snug text-slate-300">{item.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  )
}

/** 小方磚網格 */
export function Tiles({ block }: { block: TilesBlock }) {
  return (
    <Panel icon={block.icon} title={block.title} en={block.en} tone={block.tone}>
      <div className={cn('grid h-full auto-rows-fr gap-3', block.cols === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
        {block.items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="flex flex-col justify-center rounded-xl border border-line bg-paper px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Icon className={cn('size-6 shrink-0', toneStyles[block.tone].text)} aria-hidden />
                <h4 className="text-[21px] font-bold text-slate-50">{item.title}</h4>
              </div>
              <p className="mt-1.5 text-[17px] leading-snug text-slate-300">{item.desc}</p>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function CompareCard({ side }: { side: CompareSide }) {
  const t = toneStyles[side.tone]
  return (
    <div className={cn('flex min-w-0 flex-col rounded-2xl border bg-card p-5', t.border)}>
      <div className="flex items-center justify-between gap-3">
        <Badge tone={side.tone} size="lg">
          {side.badge}
        </Badge>
        <span className={cn('font-mono text-[34px] font-extrabold', t.strong)}>{side.value}</span>
      </div>
      <dl className="mt-4 space-y-2">
        {side.rows.map((row) => (
          <div key={row.k} className="flex gap-3 text-[20px]">
            <dt className="w-[92px] shrink-0 text-slate-400">{row.k}</dt>
            <dd className="text-slate-100">{row.v}</dd>
          </div>
        ))}
      </dl>
      <div className={cn('mt-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-[20px] font-semibold', t.soft, t.strong)}>
        <Target className="size-5 shrink-0" aria-hidden />
        {side.use}
      </div>
    </div>
  )
}

/** 左右對照 */
export function Compare({ block }: { block: CompareBlock }) {
  return (
    <Panel icon={block.icon} title={block.title} en={block.en} tone={block.tone}>
      <div className="grid h-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4">
        <CompareCard side={block.left} />
        <div className="flex flex-col items-center justify-center gap-2" aria-hidden>
          {block.axis.map((label) => (
            <span key={label} className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-[16px] font-bold text-slate-300">
              {label}
            </span>
          ))}
          <ArrowRight className="mt-1 size-8 text-slate-500" />
        </div>
        <CompareCard side={block.right} />
      </div>
    </Panel>
  )
}

/** 水平時間軸 */
export function Timeline({ block }: { block: TimelineBlock }) {
  return (
    <Panel icon={block.icon} title={block.title} en={block.en} tone={block.tone}>
      <ol className="relative grid h-full grid-cols-4 gap-3">
        <span
          aria-hidden
          className="absolute left-[12.5%] right-[12.5%] top-[17px] h-0.5 bg-line"
        />
        {block.items.map((item, i) => {
          const t = toneStyles[item.tone]
          return (
            <li key={item.gen} className="relative flex flex-col items-center text-center">
              <span
                className={cn(
                  'relative z-10 flex size-9 items-center justify-center rounded-full border-2 bg-card font-mono text-[17px] font-bold',
                  t.border,
                  t.text,
                )}
              >
                {i + 1}
              </span>
              <div className={cn('mt-2 font-mono text-[21px] font-extrabold leading-tight', t.strong)}>{item.gen}</div>
              <div className="text-[18px] font-semibold text-slate-200">{item.example}</div>
              <div className="mt-0.5 text-[16px] leading-snug text-slate-400">{item.note}</div>
            </li>
          )
        })}
      </ol>
    </Panel>
  )
}

/**
 * 卡片／清單左邊的圖示：講的是零件 → 零件線稿（圖紙小方格）；不是零件 → 單色線條圖示（不加彩色方塊，
 * 彩色方塊只留給真的「分類」）。
 */
export function ItemIcon({ icon: Icon, title, tone, size }: { icon: LucideIcon; title: ReactNode; tone: Tone; size: 'sm' | 'md' }) {
  const glyph = glyphFor(title)
  if (glyph) return <GlyphCell id={glyph} size={size === 'md' ? 56 : 46} />
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center', size === 'md' ? 'size-14' : 'size-10')}>
      <Icon className={cn(size === 'md' ? 'size-8' : 'size-6', toneStyles[tone].text)} strokeWidth={1.8} aria-hidden />
    </span>
  )
}