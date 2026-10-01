import { slides } from '../data/slides'

/** 篇章交界位置（在進度條上畫出分隔） */
const boundaries = slides.flatMap((s, i) => (i > 0 && s.part !== slides[i - 1].part ? [i] : []))

export function ProgressBar({ index, total }: { index: number; total: number }) {
  const pct = ((index + 1) / total) * 100
  return (
    <div
      className="relative h-1.5 w-full shrink-0 bg-slate-800/80"
      role="progressbar"
      aria-label="簡報進度"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={index + 1}
    >
      <div
        className="h-full bg-linear-to-r from-sky-500 via-sky-300 to-cyan-200 shadow-[0_0_12px_rgba(56,189,248,0.7)] transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
      {boundaries.map((b) => (
        <span key={b} aria-hidden className="absolute top-0 h-full w-0.5 bg-navy-950" style={{ left: `${(b / total) * 100}%` }} />
      ))}
    </div>
  )
}
