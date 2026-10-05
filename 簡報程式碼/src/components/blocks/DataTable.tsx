import { Image as ImageIcon, Thermometer } from 'lucide-react'
import { useState } from 'react'
import type { TableBlock } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'
import { Lightbox } from '../ui/Lightbox'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

/** 跟基準比：↑ 11%、↓ 12.8% */
function delta(v: number, base: number) {
  const pct = ((v - base) / base) * 100
  const s = Math.abs(pct).toFixed(1).replace(/\.0$/, '')
  return `${pct > 0 ? '↑' : '↓'} ${s}%`
}

/** 比基準高＝琥珀、低＝藍、基準本身＝主題色 */
function barColor(v: number, base: number, isBase: boolean, baseBar: string) {
  if (isBase) return baseBar
  return v > base ? 'bg-amber-400/80' : 'bg-sky-400/80'
}
function deltaColor(v: number, base: number) {
  return v > base ? 'text-amber-300' : 'text-sky-300'
}

const BAR_H = 210

/** 資料表：電腦版表格、手機版每欄一張卡片；可加「共同比較條件」和長條圖列 */
export function DataTable({ block, mobile = false }: { block: TableBlock; mobile?: boolean }) {
  const [zoom, setZoom] = useState(false)
  const t = toneStyles[block.tone]
  const badge = (col: number) => block.highlight?.find((h) => h.col === col)?.label
  const bars = block.bars
  const max = bars ? Math.max(...bars.values) : 1
  const base = bars ? bars.values[bars.baseCol] : 0
  const baseBar = 'bg-emerald-400/85'

  const imageButton = block.image && (
    <button
      type="button"
      onClick={() => setZoom(true)}
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-sky-400/15 font-semibold text-sky-200 transition hover:bg-sky-400/25',
        mobile ? 'px-4 py-1.5 text-[15px]' : 'px-5 py-2 text-[18px]',
        focusRing,
      )}
    >
      <ImageIcon className="size-4" aria-hidden />
      {block.image.label}
    </button>
  )

  const standard = block.standard && (
    <span className={cn('flex items-center justify-center', mobile ? 'flex-wrap gap-x-3 gap-y-1' : 'gap-5')}>
      <Thermometer className={cn('shrink-0 text-amber-300', mobile ? 'size-5' : 'size-8')} aria-hidden />
      <span className={cn('font-black tabular-nums text-amber-200', mobile ? 'text-[24px]' : 'text-[34px]')}>{block.standard.value}</span>
      <span className={cn('font-semibold text-amber-50', mobile ? 'text-[15px]' : 'text-[22px]')}>{block.standard.note}</span>
    </span>
  )

  if (mobile) {
    return (
      <div className="flex flex-col gap-3">
        {block.standard && (
          <div className="rounded-2xl bg-amber-400/[0.12] px-3 py-3 text-center">
            <p className="mb-1 text-[14px] font-bold text-amber-300">{block.standard.label}</p>
            {standard}
          </div>
        )}
        {bars && (
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <p className="mb-2 text-[15px] font-bold text-slate-200">
              {bars.label}
              <span className="ml-2 text-[13px] font-medium text-slate-400">
                虛線＝{block.head[bars.baseCol]} {base}
              </span>
            </p>
            <div className="space-y-2">
              {bars.values.map((v, col) => (
                <div key={col} className="flex items-center gap-2">
                  <span className="w-[4.2em] shrink-0 text-[15px] font-bold text-white">{block.head[col]}</span>
                  <div className="relative h-5 flex-1">
                    <div className={cn('h-full rounded-r-md', barColor(v, base, col === bars.baseCol, baseBar))} style={{ width: `${(v / max) * 100}%` }} />
                    <div aria-hidden className="absolute inset-y-[-3px] border-l-2 border-dashed border-slate-200/80" style={{ left: `${(base / max) * 100}%` }} />
                  </div>
                  <span className="w-[6.4em] shrink-0 text-right text-[14px] tabular-nums text-slate-100">
                    {v}
                    <span className={cn('ml-1 text-[12px]', col === bars.baseCol ? 'text-emerald-300' : deltaColor(v, base))}>
                      {col === bars.baseCol ? '基準' : delta(v, base)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2.5">
          {block.head.map((name, col) => (
            <div key={name} className={cn('rounded-2xl p-3', badge(col) ? t.soft : 'bg-white/[0.04]')}>
              <p className="flex items-center gap-2 text-[19px] font-black text-white">
                {name}
                {badge(col) && <span className={cn('rounded-md border px-1.5 text-[13px] font-bold', t.chip)}>{badge(col)}</span>}
              </p>
              <dl className="mt-1 space-y-0.5 text-[15px]">
                {block.rows.map((row) => (
                  <div key={row.label} className="flex gap-2">
                    <dt className="w-[6.5em] shrink-0 text-slate-400">{row.label}</dt>
                    <dd className="text-slate-100">{row.cells[col]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        {block.notes && (
          <ul className="space-y-1.5 text-[15px]">
            {block.notes.map((note, i) => (
              <li key={i} className="flex gap-2.5 text-slate-200">
                <span className={cn('mt-[0.6em] size-1.5 shrink-0 rounded-full', t.dot)} aria-hidden />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}
        {imageButton && <div>{imageButton}</div>}
        {zoom && block.image && <Lightbox src={block.image.src} label={block.image.label} onClose={() => setZoom(false)} />}
      </div>
    )
  }

  const rowHead = 'px-5 py-3 text-left text-[19px] font-bold text-slate-300'

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="overflow-hidden rounded-[24px] bg-white/[0.04]">
        <table className="w-full table-fixed border-collapse text-center">
          <thead>
            <tr>
              <th className="w-[210px] px-5 py-3 text-left text-[18px] font-bold text-slate-400">{block.corner ?? '冷媒'}</th>
              {block.head.map((name, col) => (
                <th key={name} className={cn('px-2 py-3', badge(col) && t.soft)}>
                  <span className="block text-[26px] font-black text-white">{name}</span>
                  {badge(col) && <span className={cn('mt-1 inline-block rounded-md border px-2 text-[16px] font-bold', t.chip)}>{badge(col)}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.standard && (
              <tr className="border-t border-white/[0.06]">
                <th scope="row" className={cn(rowHead, 'text-amber-200')}>
                  {block.standard.label}
                </th>
                <td colSpan={block.head.length} className="bg-amber-400/[0.12] px-4 py-3.5">
                  {standard}
                </td>
              </tr>
            )}
            {bars && (
              <tr className="border-t border-white/[0.06]">
                <th scope="row" className={cn(rowHead, 'align-bottom')}>
                  {bars.label}
                  <span className="mt-1 block text-[16px] font-medium leading-snug text-slate-400">
                    虛線＝{block.head[bars.baseCol]} 的 {base}
                  </span>
                </th>
                {bars.values.map((v, col) => {
                  const isBase = col === bars.baseCol
                  return (
                    <td key={col} className={cn('px-2 pb-3 pt-4', badge(col) && t.soft)}>
                      <div className="relative" style={{ height: BAR_H }}>
                        <div
                          className={cn('absolute bottom-0 left-1/2 w-[72px] -translate-x-1/2 rounded-t-[12px]', barColor(v, base, isBase, baseBar))}
                          style={{ height: (v / max) * BAR_H }}
                        />
                        {/* 每格畫同一高度的虛線，連起來就是一條橫跨整列的基準線 */}
                        <div aria-hidden className="absolute -inset-x-2 border-t-2 border-dashed border-slate-200/80" style={{ bottom: (base / max) * BAR_H }} />
                      </div>
                      <p className="mt-2 text-[28px] font-black tabular-nums leading-none text-white">{v}</p>
                      <p className={cn('mt-1 text-[18px] font-bold', isBase ? 'text-emerald-300' : deltaColor(v, base))}>
                        {isBase ? '基準' : delta(v, base)}
                      </p>
                    </td>
                  )
                })}
              </tr>
            )}
            {block.rows.map((row) => (
              <tr key={row.label} className="border-t border-white/[0.06]">
                <th scope="row" className={rowHead}>
                  {row.label}
                </th>
                {row.cells.map((cell, col) => (
                  <td key={col} className={cn('px-2 py-3 text-[21px] font-semibold text-slate-100', badge(col) && t.soft)}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(block.notes || imageButton) && (
        <div className="flex min-h-0 items-start gap-8">
          {block.notes && (
            <ul className="min-w-0 flex-1 space-y-1.5 text-[19px]">
              {block.notes.map((note, i) => (
                <li key={i} className="flex gap-2.5 text-slate-200">
                  <span className={cn('mt-[0.6em] size-1.5 shrink-0 rounded-full', t.dot)} aria-hidden />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}
          {imageButton && <div className="shrink-0">{imageButton}</div>}
        </div>
      )}
      {zoom && block.image && <Lightbox src={block.image.src} label={block.image.label} onClose={() => setZoom(false)} />}
    </div>
  )
}
