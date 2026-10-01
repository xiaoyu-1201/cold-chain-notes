import type { BoundariesBlock, MetricsBlock, StatBlock } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'
import { Badge } from '../ui/Badge'
import { Formula } from '../ui/Formula'
import { Panel } from '../ui/Panel'
import { ArrowRight } from 'lucide-react'

const colClass = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' } as const

/** 規格數值磚 */
export function Metrics({ block }: { block: MetricsBlock }) {
  const lg = block.size === 'lg'
  return (
    <Panel icon={block.icon} title={block.title} en={block.en} tone={block.tone}>
      <div className="flex h-full flex-col gap-3">
        {block.formula && <Formula {...block.formula} tone={block.tone} />}
        <div className={cn('grid min-h-0 flex-1 auto-rows-fr gap-3', colClass[block.cols])}>
          {block.items.map((item, i) => {
            const t = toneStyles[item.tone]
            return (
              <div
                key={i}
                className={cn(
                  'relative flex flex-col justify-center overflow-hidden rounded-2xl border bg-white/[0.03]',
                  lg ? 'px-6 py-4' : 'px-5 py-3',
                  t.border,
                )}
              >
                <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1', t.dot)} />
                <div className="flex items-center gap-2">
                  <span className={cn('font-semibold text-slate-200', lg ? 'text-[22px]' : 'text-[20px]')}>{item.label}</span>
                  {item.tag && (
                    <Badge tone={item.tone} size="sm">
                      {item.tag}
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className={cn('font-mono font-extrabold tracking-tight', lg ? 'text-[64px] leading-[1.05]' : 'text-[40px] leading-none', t.strong)}>
                    {item.value}
                  </span>
                  {item.unit && <span className={cn('font-mono text-slate-400', lg ? 'text-[26px]' : 'text-[22px]')}>{item.unit}</span>}
                </div>
                {item.note && <p className={cn('mt-1 text-slate-400', lg ? 'text-[18px]' : 'text-[17px]')}>{item.note}</p>}
              </div>
            )
          })}
        </div>
        {block.footnote && <p className="text-[18px] leading-snug text-slate-400">{block.footnote}</p>}
      </div>
    </Panel>
  )
}

/** 前後對照的大數字：例如 +1°C → +1% */
export function StatCard({ block }: { block: StatBlock }) {
  const t = toneStyles[block.tone]
  return (
    <Panel icon={block.icon} title={block.title} en={block.en} tone={block.tone}>
      <div className="flex h-full flex-col justify-center gap-4">
        <div className={cn('flex items-center justify-around gap-3 rounded-2xl border px-4 py-4', t.border, t.soft)}>
          <div className="text-center">
            <div className={cn('font-mono text-[46px] font-extrabold leading-none', t.strong)}>{block.from.value}</div>
            <div className="mt-2 text-[17px] text-slate-300">{block.from.label}</div>
          </div>
          <ArrowRight className={cn('size-9 shrink-0', t.text)} aria-hidden />
          <div className="text-center">
            <div className={cn('font-mono text-[46px] font-extrabold leading-none', t.strong)}>{block.to.value}</div>
            <div className="mt-2 text-[17px] text-slate-300">{block.to.label}</div>
          </div>
        </div>
        <p className="text-[20px] leading-normal text-slate-300">{block.desc}</p>
      </div>
    </Panel>
  )
}

/** 安全邊界清單 */
export function Boundaries({ block }: { block: BoundariesBlock }) {
  return (
    <ul className="flex h-full flex-col gap-3">
      {block.items.map((item) => {
        const t = toneStyles[item.tone]
        return (
          <li key={item.label} className={cn('flex flex-1 items-center gap-4 rounded-xl border bg-navy-900/60 px-4 py-2.5', t.border)}>
            <span aria-hidden className={cn('h-10 w-1.5 shrink-0 rounded-full', t.dot)} />
            <div className="min-w-0 flex-1">
              <div className="text-[21px] font-bold text-slate-100">{item.label}</div>
              <div className="text-[16px] text-slate-400">{item.note}</div>
            </div>
            <span className={cn('font-mono text-[27px] font-extrabold', t.strong)}>{item.value}</span>
          </li>
        )
      })}
    </ul>
  )
}
