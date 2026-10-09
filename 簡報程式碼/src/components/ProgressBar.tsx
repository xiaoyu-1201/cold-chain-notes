import { slides } from '../data/slides'

/** 篇章交界位置（在進度條上畫出分隔） */
const boundaries = slides.flatMap((s, i) => (i > 0 && s.part !== slides[i - 1].part ? [i] : []))

export function ProgressBar({ index, total }: { index: number; total: number }) {
  const pct = ((index + 1) / total) * 100
  return (
    <div
      className="relative h-1 w-full shrink-0 bg-grid"
      role="progressbar"
      aria-label="簡報進度"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={index + 1}
    >
      <div
        className="h-full bg-pipe-blue transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
      {boundaries.map((b) => (
        <span key={b} aria-hidden className="absolute top-0 h-full w-0.5 bg-desk" style={{ left: `${(b / total) * 100}%` }} />
      ))}
    </div>
  )
}
