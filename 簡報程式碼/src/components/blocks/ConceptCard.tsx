import { ShieldCheck } from 'lucide-react'
import type { ConceptBlock } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'
import { Badge } from '../ui/Badge'
import { Chain } from '../ui/Chain'
import { Formula } from '../ui/Formula'
import { Panel } from '../ui/Panel'

export function ConceptCard({ block }: { block: ConceptBlock }) {
  const t = toneStyles[block.tone]
  return (
    <Panel
      icon={block.icon}
      tone={block.tone}
      title={block.title}
      en={block.en}
      right={block.badge && <Badge tone={block.badge.tone}>{block.badge.label}</Badge>}
    >
      <div className="flex h-full flex-col gap-4">
        {block.formula && <Formula {...block.formula} tone={block.tone} />}
        {block.body && <p className="text-[22px] leading-[1.6] text-slate-300">{block.body}</p>}
        {block.points && (
          <ul className="space-y-2">
            {block.points.map((point, i) => (
              <li key={i} className="flex gap-3 text-[21px] leading-[1.55] text-slate-300">
                <span className={cn('mt-[0.62em] size-2 shrink-0 rounded-full', t.dot)} aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
        {block.pairs && (
          <div className="mt-auto grid grid-cols-2 gap-3">
            {block.pairs.map((pair) => {
              const pt = toneStyles[pair.tone]
              return (
                <div key={pair.label} className={cn('rounded-xl border px-4 py-3', pt.border, pt.soft)}>
                  <div className="flex items-baseline gap-2">
                    <span className={cn('text-[22px] font-bold', pt.strong)}>{pair.label}</span>
                    <span className="font-mono text-[14px] uppercase tracking-wider text-slate-400">{pair.en}</span>
                  </div>
                  <p className="mt-1 text-[19px] text-slate-200">{pair.desc}</p>
                </div>
              )
            })}
          </div>
        )}
        {block.chain && (
          <div className="mt-auto">
            <Chain steps={block.chain} tone={block.tone} />
          </div>
        )}
        {block.guard && (
          <div
            className={cn(
              'mt-auto inline-flex items-center gap-2 self-start rounded-lg border px-3.5 py-1.5 text-[19px] font-semibold',
              t.chip,
            )}
          >
            <ShieldCheck className="size-5" aria-hidden />
            {block.guard}
          </div>
        )}
      </div>
    </Panel>
  )
}
