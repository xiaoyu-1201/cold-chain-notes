import type { ReactNode } from 'react'
import type { Block, CycleBlock, InsightBlock, SectionBlock, TxvBlock } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'
import { BulbClock } from '../diagrams/BulbClock'
import { CycleExplorer } from '../diagrams/CycleExplorer'
import { IconChip } from '../ui/IconChip'
import { Panel } from '../ui/Panel'

type RenderChild = (child: Block, index: number) => ReactNode

/** 帶標題外框的子網格 */
export function SectionPanel({ block, renderChild }: { block: SectionBlock; renderChild: RenderChild }) {
  return (
    <Panel icon={block.icon} title={block.title} en={block.en} tone={block.tone}>
      <div className={cn('grid h-full', block.className)}>{block.children.map(renderChild)}</div>
    </Panel>
  )
}

/** 總結頁的 Insight 卡 */
export function InsightCard({ block, renderChild }: { block: InsightBlock; renderChild: RenderChild }) {
  const t = toneStyles[block.tone]
  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-linear-to-b from-white/[0.06] to-white/[0.015] p-7">
      <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1 bg-linear-to-r', t.gradient)} />
      <div className="flex items-start justify-between">
        <IconChip icon={block.icon} tone={block.tone} size="lg" />
        <span className={cn('bg-linear-to-br bg-clip-text font-mono text-[64px] font-black leading-none text-transparent', t.gradient)}>
          {block.no}
        </span>
      </div>
      <h3 className="mt-4 text-[32px] font-black leading-tight text-white">{block.title}</h3>
      <p className={cn('mt-1 font-mono text-[16px] uppercase tracking-[0.2em]', t.text)}>{block.en}</p>
      {block.subtitle && <p className={cn('mt-3 text-[22px] font-bold', t.strong)}>{block.subtitle}</p>}
      {block.body && <p className="mt-3 text-[21px] leading-[1.6] text-slate-300">{block.body}</p>}
      {block.children && <div className="mt-5 min-h-0 flex-1">{block.children.map(renderChild)}</div>}
    </section>
  )
}

/** 感溫膨脹閥規則 + 感溫包方位圖 */
export function TxvPanel({ block }: { block: TxvBlock }) {
  return (
    <Panel icon={block.icon} title={block.title} en={block.en} tone={block.tone}>
      <div className="grid h-full grid-cols-[250px_minmax(0,1fr)] items-center gap-5">
        <figure className="small-fig">
          <BulbClock className="w-full" />
          <figcaption className="mt-1 text-center text-[17px] text-slate-400">吸氣管截面・感溫包方位</figcaption>
        </figure>
        <ul className="flex flex-col gap-3">
          {block.rules.map((rule, i) => {
            const t = toneStyles[rule.tone]
            const Icon = rule.icon
            return (
              <li key={i} className={cn('rounded-xl border px-4 py-2.5', t.border, t.soft)}>
                <div className={cn('flex items-center gap-2 text-[20px] font-bold', t.strong)}>
                  <Icon className={cn('size-5 shrink-0', t.text)} aria-hidden />
                  {rule.title}
                </div>
                <p className="mt-0.5 text-[18px] leading-snug text-slate-200">{rule.desc}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </Panel>
  )
}

/** 冷凍循環圖卡片（可點選、可放大） */
export function CyclePanel({ block }: { block: CycleBlock }) {
  return (
    <Panel icon={block.icon} title={block.title} en={block.en} tone={block.tone}>
      <div className="flex h-full flex-col">
        <div className="cq-box relative flex min-h-0 flex-1 items-center justify-center" style={{ containerType: 'size' }}>
          <CycleExplorer className="cq-fit" style={{ width: 'min(100cqw, calc(100cqh * 820 / 560))' }} />
        </div>
        <p className="mt-2 text-center text-[16px] text-slate-400">
          虛線框都可以點、會跳出說明；中間虛線為高低壓分界：<span className="text-slate-200">壓縮機</span>升壓、<span className="text-slate-200">膨脹閥</span>降壓
        </p>
      </div>
    </Panel>
  )
}

