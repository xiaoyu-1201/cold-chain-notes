import { ArrowRight, CircleCheck, Siren, TriangleAlert } from 'lucide-react'
import { Fragment } from 'react'
import type { AlertBlock, SizingBlock, TrapBlock } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'

/** 紅色警戒框：運轉紅線 */
export function AlertPanel({ block }: { block: AlertBlock }) {
  return (
    <section
      role="note"
      className="relative flex h-full flex-col overflow-hidden rounded-[18px] border-2 border-red-500/60 bg-card p-6 pt-8"
    >
      <div aria-hidden className="hazard-red absolute inset-x-0 top-0 h-2.5" />
      <header className="mb-5 flex items-center gap-4">
        <span className="relative flex size-14 items-center justify-center rounded-2xl bg-red-950 text-red-300 ring-1 ring-inset ring-red-500/40">
          <Siren className="size-7" aria-hidden />
          <span className="absolute -right-1 -top-1 flex size-3.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-70" />
            <span className="relative inline-flex size-3.5 rounded-full bg-red-500" />
          </span>
        </span>
        <div>
          <h3 className="text-[28px] font-black leading-tight text-red-50">{block.title}</h3>
          {block.en && <p className="mt-1 font-mono text-[16px] uppercase tracking-[0.2em] text-red-300/80">{block.en}</p>}
        </div>
      </header>
      {/* 項目照內容高度、整組在剩下的空間垂直置中（不再把每一格撐高、裡面空一大塊） */}
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-4">
        {block.items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="flex max-h-[240px] flex-1 flex-col justify-center rounded-2xl border border-red-500/30 bg-red-950/45 px-5 py-4">
              <div className="flex items-center gap-3">
                <Icon className="size-7 shrink-0 text-red-300" aria-hidden />
                <h4 className="text-[25px] font-bold text-red-50">{item.title}</h4>
                {item.value && (
                  <span className="ml-auto rounded-xl bg-card px-3 py-1 font-mono text-[30px] font-extrabold leading-none text-red-300 ring-1 ring-inset ring-red-500/50">
                    {item.value}
                  </span>
                )}
              </div>
              <p className="mt-3 text-[21px] leading-[1.6] text-slate-200">{item.desc}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** 琥珀警示：連鎖成因 + 對策 */
export function TrapPanel({ block }: { block: TrapBlock }) {
  const Icon = block.icon
  return (
    <section
      role="note"
      className="relative flex h-full flex-col justify-center overflow-hidden rounded-[18px] border-2 border-amber-500/70 bg-card p-6 pt-8"
    >
      <div aria-hidden className="hazard-amber absolute inset-x-0 top-0 h-2" />
      <header className="flex items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-xl bg-amber-950 text-amber-300 ring-1 ring-inset ring-amber-500/50">
          <Icon className="size-6" aria-hidden />
        </span>
        <div>
          <h3 className="text-[26px] font-black leading-tight text-amber-50">{block.title}</h3>
          {block.en && <p className="mt-1 font-mono text-[16px] uppercase tracking-[0.2em] text-amber-300/80">{block.en}</p>}
        </div>
      </header>
      <div className="mt-5 flex items-center gap-4">
        <span className="w-[92px] shrink-0 text-[18px] font-bold text-amber-300">成因連鎖</span>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          {block.chain.map((step, i) => (
            <Fragment key={i}>
              {i > 0 && <ArrowRight className="size-5 shrink-0 text-amber-400" aria-hidden />}
              <span
                className={cn(
                  'rounded-lg border px-3.5 py-1.5 text-[20px] font-semibold',
                  i === block.chain.length - 1
                    ? 'border-red-500/55 bg-red-950 text-red-100'
                    : 'border-amber-500/55 bg-amber-950 text-amber-50',
                )}
              >
                {step}
              </span>
            </Fragment>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className="w-[92px] shrink-0 text-[18px] font-bold text-emerald-300">對策</span>
        <div className="flex flex-wrap gap-2.5">
          {block.fixes.map((fix) => (
            <span
              key={fix}
              className="flex items-center gap-2 rounded-lg border border-emerald-500/45 bg-emerald-950 px-3.5 py-1.5 text-[20px] font-semibold text-emerald-50"
            >
              <CircleCheck className="size-5 text-emerald-300" aria-hidden />
              {fix}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/** 琥珀警示：選型時數陷阱 + 公式 + 試算 */
export function SizingPanel({ block }: { block: SizingBlock }) {
  const Icon = block.icon
  return (
    <section
      role="note"
      className="relative flex h-full flex-col overflow-hidden rounded-[18px] border-2 border-amber-500/70 bg-card p-6 pt-7"
    >
      <div aria-hidden className="hazard-amber absolute inset-x-0 top-0 h-2" />
      <header className="flex items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-xl bg-amber-950 text-amber-300 ring-1 ring-inset ring-amber-500/50">
          <Icon className="size-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[25px] font-black leading-tight text-amber-50">{block.title}</h3>
          {block.en && <p className="mt-1 font-mono text-[16px] uppercase tracking-[0.2em] text-amber-300/80">{block.en}</p>}
        </div>
        {block.badge && (
          <span className="rounded-full border border-red-500/55 bg-red-950 px-3 py-1 text-[16px] font-bold text-red-200">
            {block.badge}
          </span>
        )}
      </header>
      <ul className="mt-3 space-y-1">
        {block.points.map((point, i) => (
          <li key={i} className="flex gap-2.5 text-[19px] leading-snug text-slate-200">
            <TriangleAlert className="mt-1 size-5 shrink-0 text-amber-300" aria-hidden />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-center rounded-xl border border-amber-500/50 bg-amber-950 px-6 py-2 font-mono text-[24px] font-bold text-amber-50">
        <span>{block.formula}</span>
      </div>
      {block.example && (
        <div className="mt-auto pt-3">
          <p className="mb-2 font-mono text-[17px] text-amber-200">{block.example.caption}</p>
          <div className="grid grid-cols-2 gap-3">
            {block.example.rows.map((row) => {
              const t = toneStyles[row.tone]
              return (
                <div key={row.label} className={cn('rounded-xl border bg-card px-4 py-2.5', t.border)}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={cn('text-[17px] font-bold', t.text)}>{row.label}</span>
                    <span className={cn('font-mono text-[22px] font-extrabold', t.strong)}>{row.value}</span>
                  </div>
                  <p className="mt-0.5 text-[16px] text-slate-300">{row.note}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
