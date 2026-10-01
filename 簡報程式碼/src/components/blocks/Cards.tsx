import { ArrowRight, MapPin, Target, TriangleAlert } from 'lucide-react'
import type { CompareBlock, CompareSide, InfoBlock, ListBlock, TilesBlock, TimelineBlock } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'
import { Badge } from '../ui/Badge'
import { IconChip } from '../ui/IconChip'
import { Panel } from '../ui/Panel'

/** 資訊卡：元件、角色、規格說明 */
export function InfoCard({ block }: { block: InfoBlock }) {
  return (
    <div className="flex h-full flex-col rounded-[20px] border border-white/10 bg-linear-to-b from-white/[0.055] to-white/[0.015] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="flex items-start gap-3.5">
        <IconChip icon={block.icon} tone={block.tone} />
        <div className="min-w-0 flex-1">
          <h4 className="text-[23px] font-bold leading-tight text-slate-50">{block.title}</h4>
          {block.en && <p className="mt-1 font-mono text-[14px] uppercase tracking-[0.14em] text-slate-400">{block.en}</p>}
        </div>
        {block.tag && (
          <Badge tone={block.tone} size="sm">
            {block.tag}
          </Badge>
        )}
      </div>
      <div className="mt-3 text-[20px] leading-[1.55] text-slate-300">{block.body}</div>
      {(block.warn || block.meta) && (
        <div className="mt-auto flex flex-col gap-2 pt-3">
          {block.warn && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2.5 text-[19px] leading-snug text-amber-100">
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-300" aria-hidden />
              <span>{block.warn}</span>
            </div>
          )}
          {block.meta && (
            <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-slate-400/25 bg-slate-400/10 px-3 py-1 text-[15px] font-semibold text-slate-300">
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
      <ol className="flex h-full flex-col gap-2.5">
        {block.items.map((item, i) => (
          <li key={item.title} className="flex flex-1 items-center gap-4 rounded-xl border border-white/[0.08] bg-navy-900/50 px-4 py-2">
            <span className="w-5 shrink-0 font-mono text-[17px] font-bold text-slate-500">{i + 1}</span>
            <IconChip icon={item.icon} tone={block.tone} size="sm" />
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
            <div key={item.title} className="flex flex-col justify-center rounded-xl border border-white/[0.08] bg-navy-900/50 px-4 py-3">
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
    <div className={cn('flex min-w-0 flex-col rounded-2xl border bg-white/[0.03] p-5', t.border)}>
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
            <span key={label} className="rounded-md bg-white/5 px-2.5 py-1 font-mono text-[16px] font-bold text-slate-300">
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
          className="absolute left-[12.5%] right-[12.5%] top-[17px] h-0.5 bg-linear-to-r from-slate-600 via-indigo-400/60 to-emerald-400"
        />
        {block.items.map((item, i) => {
          const t = toneStyles[item.tone]
          return (
            <li key={item.gen} className="relative flex flex-col items-center text-center">
              <span
                className={cn(
                  'relative z-10 flex size-9 items-center justify-center rounded-full border-2 bg-navy-900 font-mono text-[15px] font-bold',
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
