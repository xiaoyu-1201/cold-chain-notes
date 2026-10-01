import type { FormulaSpec, Tone } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'

export function Formula({ lhs, rhs, tone }: FormulaSpec & { tone: Tone }) {
  const t = toneStyles[tone]
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border px-5 py-3', t.border, t.soft)}>
      <span className={cn('font-mono text-[28px] font-extrabold', t.strong)}>{lhs}</span>
      <span className="font-mono text-[24px] text-slate-400">=</span>
      <span className="text-[23px] font-semibold text-slate-100">{rhs}</span>
    </div>
  )
}
