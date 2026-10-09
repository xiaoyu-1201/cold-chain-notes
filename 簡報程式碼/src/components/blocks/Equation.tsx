import { Fragment, type ReactNode } from 'react'
import type { EquationBlock, EquationTerm } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'
import { Panel } from '../ui/Panel'

function Term({ term, compact, emphasis }: { term: EquationTerm; compact?: boolean; emphasis?: boolean }) {
  const t = toneStyles[term.tone]
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl border text-center',
        compact ? 'px-2 py-3' : 'px-4 py-5',
        t.border,
        emphasis ? t.soft : 'bg-card',
      )}
    >
      <span className={cn('font-mono font-extrabold leading-none', compact ? 'text-[30px]' : 'text-[44px]', t.strong)}>
        {term.symbol}
      </span>
      <span className={cn('mt-2 leading-snug text-slate-300', compact ? 'text-[16px]' : 'text-[19px]')}>{term.label}</span>
    </div>
  )
}

function Op({ children, compact }: { children: ReactNode; compact?: boolean }) {
  return (
    <span className={cn('shrink-0 self-center font-mono font-bold text-slate-400', compact ? 'text-[26px]' : 'text-[36px]')} aria-hidden>
      {children}
    </span>
  )
}

export function Equation({ block }: { block: EquationBlock }) {
  const terms = block.terms.map((term, i) => (
    <Fragment key={i}>
      {i > 0 && <Op compact={block.compact}>+</Op>}
      <Term term={term} compact={block.compact} />
    </Fragment>
  ))

  // 精簡版：各項 + … = 結果
  if (block.compact) {
    return (
      <div className="flex items-stretch gap-2">
        {terms}
        <Op compact>=</Op>
        <Term term={block.result} compact emphasis />
      </div>
    )
  }

  return (
    <Panel icon={block.icon} title={block.title} en={block.en} tone={block.tone}>
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-1 items-stretch gap-3">
          <Term term={block.result} emphasis />
          <Op>=</Op>
          {terms}
        </div>
        {block.note && (
          <div className="flex items-center gap-4 rounded-xl border border-amber-500/50 bg-amber-950 px-4 py-3">
            {block.highlight && (
              <span className="shrink-0 rounded-lg bg-card px-3 py-1 font-mono text-[24px] font-extrabold text-amber-200 ring-1 ring-inset ring-amber-500/60">
                {block.highlight}
              </span>
            )}
            <p className="text-[20px] leading-normal text-slate-100">{block.note}</p>
          </div>
        )}
      </div>
    </Panel>
  )
}
