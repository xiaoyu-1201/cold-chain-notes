import { Search } from 'lucide-react'
import { useState } from 'react'
import type { MatrixBlock, MatrixGroup } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'
import { Badge } from '../ui/Badge'
import { IconChip } from '../ui/IconChip'

type Focus = 'all' | MatrixGroup

const groupTone = { physical: 'emerald', thermal: 'amber' } as const

/** 四大故障診斷矩陣（可依「先查 / 後查」聚焦） */
export function DiagnosisMatrix({ block }: { block: MatrixBlock }) {
  const [focus, setFocus] = useState<Focus>('all')
  const catMap = new Map(block.categories.map((c) => [c.id, c]))

  const filters: { id: Focus; label: string; hint?: string; tone: 'slate' | 'emerald' | 'amber' }[] = [
    { id: 'all', label: '全部原因', tone: 'slate' },
    { id: 'physical', label: `① ${block.groups.physical.label}`, hint: block.groups.physical.hint, tone: 'emerald' },
    { id: 'thermal', label: `② ${block.groups.thermal.label}`, hint: block.groups.thermal.hint, tone: 'amber' },
  ]

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-3" role="group" aria-label="排查聚焦">
        <span className="text-[18px] font-semibold text-slate-400">排查聚焦：</span>
        {filters.map((f) => {
          const active = focus === f.id
          const t = toneStyles[f.tone]
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFocus(f.id)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-1.5 text-[18px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300',
                active ? t.chip : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-slate-200',
              )}
            >
              {f.label}
              {f.hint && <span className="text-[15px] font-medium opacity-75">（{f.hint}）</span>}
            </button>
          )
        })}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-4 gap-5">
        {block.columns.map((col) => {
          const t = toneStyles[col.tone]
          return (
            <section key={col.title} className="flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.025]">
              <header className={cn('relative border-b border-white/10 bg-linear-to-br px-5 py-4', t.wash)}>
                <div className="flex items-center gap-3">
                  <IconChip icon={col.icon} tone={col.tone} />
                  <div className="min-w-0">
                    <h3 className="text-[26px] font-black leading-tight text-white">{col.title}</h3>
                    <p className="mt-0.5 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-300/80">{col.en}</p>
                  </div>
                </div>
                {col.flag && (
                  <Badge tone={col.tone} size="sm" className="absolute right-4 top-4">
                    {col.flag}
                  </Badge>
                )}
              </header>
              <ol className="flex flex-1 flex-col gap-2.5 p-4">
                {col.causes.map((cause, i) => {
                  const cat = catMap.get(cause.cat)
                  const group = cat?.group ?? 'thermal'
                  const dimmed = focus !== 'all' && group !== focus
                  return (
                    <li
                      key={i}
                      className={cn(
                        'rounded-xl border px-4 py-3 transition duration-300',
                        dimmed ? 'border-white/5 bg-transparent opacity-25' : 'border-white/[0.08] bg-navy-900/70',
                        focus !== 'all' && !dimmed && toneStyles[groupTone[group]].border,
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="pt-0.5 font-mono text-[16px] font-bold text-slate-500">{i + 1}</span>
                        <p className="flex-1 text-[20px] font-medium leading-snug text-slate-100">{cause.text}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 pl-7">
                        {cat && (
                          <Badge tone={groupTone[group]} size="sm">
                            {cat.label}
                          </Badge>
                        )}
                        {cause.top && (
                          <Badge tone="red" size="sm">
                            最常見
                          </Badge>
                        )}
                      </div>
                    </li>
                  )
                })}
                {col.firstCheck && (
                  <li
                    className={cn(
                      'mt-auto flex items-start gap-2.5 rounded-xl border border-dashed px-4 py-3 transition duration-300',
                      t.border,
                      focus === 'thermal' && 'opacity-25',
                    )}
                  >
                    <Search className={cn('mt-0.5 size-5 shrink-0', t.text)} aria-hidden />
                    <p className="text-[18px] leading-snug text-slate-200">
                      <span className={cn('mr-1.5 font-bold', t.strong)}>現場第一步</span>
                      {col.firstCheck}
                    </p>
                  </li>
                )}
              </ol>
            </section>
          )
        })}
      </div>
    </div>
  )
}
