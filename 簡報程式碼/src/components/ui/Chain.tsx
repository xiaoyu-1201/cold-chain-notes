import { ArrowRight } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'
import type { Tone } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'

interface ChainProps {
  steps: ReactNode[]
  tone: Tone
  /** 最後一個節點的色調（例如結果、警示） */
  lastTone?: Tone
}

/** 因果鏈：標籤 → 標籤 → 標籤 */
export function Chain({ steps, tone, lastTone }: ChainProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2.5">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        const t = toneStyles[isLast && lastTone ? lastTone : tone]
        return (
          <Fragment key={i}>
            {i > 0 && <ArrowRight className="size-5 shrink-0 text-slate-500" aria-hidden />}
            <span className={cn('rounded-lg border px-3 py-1.5 text-[19px] font-semibold leading-snug', t.chip)}>
              {step}
            </span>
          </Fragment>
        )
      })}
    </div>
  )
}
