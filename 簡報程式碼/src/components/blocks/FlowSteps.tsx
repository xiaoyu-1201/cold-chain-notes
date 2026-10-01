import { ArrowRight, ChevronRight, Target } from 'lucide-react'
import { Fragment } from 'react'
import type { FlowBlock } from '../../data/types'
import { cn, pad } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'
import { Badge } from '../ui/Badge'
import { IconChip } from '../ui/IconChip'
import { Panel } from '../ui/Panel'

export function FlowSteps({ block }: { block: FlowBlock }) {
  if (block.direction === 'row' && block.compact) return <CompactRow block={block} />

  const body = block.direction === 'row' ? <RowFlow block={block} /> : <ColFlow block={block} />
  if (block.bare) return body
  return (
    <Panel icon={block.icon} title={block.title} en={block.en} tone={block.tone}>
      {body}
    </Panel>
  )
}

/** 水平流程卡片 */
function RowFlow({ block }: { block: FlowBlock }) {
  return (
    <div className="flow-row flex h-full items-stretch gap-2">
      {block.steps.map((step, i) => {
        const tone = step.tone ?? block.tone
        const t = toneStyles[tone]
        const Icon = step.icon
        return (
          <Fragment key={i}>
            {i > 0 && (
              <div className="flow-arrow flex shrink-0 items-center" aria-hidden>
                <ChevronRight className="size-7 text-slate-500" />
              </div>
            )}
            <div className={cn('relative flex min-w-0 flex-1 flex-col rounded-2xl border bg-white/[0.03] px-5 py-4', t.border)}>
              <div className="flex items-center justify-between gap-2">
                <span className={cn('font-mono text-[17px] font-bold tracking-wider', t.text)}>STEP {pad(i + 1)}</span>
                {step.tag ? (
                  <Badge tone={tone} size="sm">
                    {step.tag}
                  </Badge>
                ) : (
                  Icon && <Icon className={cn('size-6', t.text)} aria-hidden />
                )}
              </div>
              <h4 className="mt-2 flex items-center gap-2 text-[23px] font-bold leading-snug text-slate-50">
                {step.tag && Icon && <Icon className={cn('size-6 shrink-0', t.text)} aria-hidden />}
                {step.title}
              </h4>
              {step.desc && <p className="mt-1.5 text-[19px] leading-normal text-slate-300">{step.desc}</p>}
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

/** 垂直編號流程 */
function ColFlow({ block }: { block: FlowBlock }) {
  const compact = block.compact
  return (
    <ol className={cn('flex h-full flex-col', compact ? 'justify-between gap-2' : 'justify-between gap-3')}>
      {block.steps.map((step, i) => {
        const tone = step.tone ?? block.tone
        const t = toneStyles[tone]
        const isLast = i === block.steps.length - 1
        return (
          <li key={i} className="relative flex items-stretch gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex shrink-0 items-center justify-center rounded-full border-2 font-mono font-bold',
                  compact ? 'size-9 text-[15px]' : 'size-11 text-[18px]',
                  t.border,
                  t.soft,
                  t.strong,
                )}
              >
                {i + 1}
              </span>
              {!isLast && <span className="mt-1 w-0.5 flex-1 rounded bg-linear-to-b from-slate-500/60 to-slate-500/10" />}
            </div>
            <div className={cn('min-w-0 flex-1', compact ? 'pt-1' : 'pb-1 pt-1.5')}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h4 className={cn('font-bold leading-snug', compact ? 'text-[21px]' : 'text-[23px]', isLast && step.tone ? t.strong : 'text-slate-50')}>
                  {step.title}
                </h4>
                {step.en && <span className="font-mono text-[14px] uppercase tracking-wider text-slate-400">{step.en}</span>}
                {step.tag && (
                  <Badge tone={tone} size="sm">
                    {step.tag}
                  </Badge>
                )}
              </div>
              {step.desc && <p className="mt-0.5 text-[19px] leading-normal text-slate-300">{step.desc}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** 單列精簡流程（標題在左、步驟在右） */
function CompactRow({ block }: { block: FlowBlock }) {
  const t = toneStyles[block.tone]
  return (
    <section className="flow-row flex h-full items-center gap-6 rounded-[22px] border border-white/10 bg-linear-to-r from-white/[0.055] to-white/[0.015] px-6 py-4">
      <div className="flex shrink-0 items-center gap-4">
        {block.icon && <IconChip icon={block.icon} tone={block.tone} />}
        <div>
          <h3 className="text-[25px] font-bold leading-tight text-slate-50">{block.title}</h3>
          {block.en && <p className="mt-0.5 font-mono text-[14px] uppercase tracking-[0.18em] text-slate-400">{block.en}</p>}
        </div>
      </div>
      <div className="h-12 w-px shrink-0 bg-white/10" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-2">
        {block.steps.map((step, i) => (
          <Fragment key={i}>
            {i > 0 && <ArrowRight className="size-5 shrink-0 text-slate-500" aria-hidden />}
            <span className={cn('flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[20px] font-semibold', t.chip)}>
              <span className="font-mono text-[15px] opacity-70">{i + 1}</span>
              {step.title}
            </span>
          </Fragment>
        ))}
      </div>
      {block.result && (
        <div className="flex shrink-0 items-center gap-2.5 rounded-xl border border-emerald-400/35 bg-emerald-400/10 px-4 py-2.5">
          <Target className="size-5 text-emerald-300" aria-hidden />
          <span className="text-[17px] font-bold text-emerald-300">{block.result.label}</span>
          <span className="text-[19px] font-semibold text-emerald-50">{block.result.text}</span>
        </div>
      )}
    </section>
  )
}
