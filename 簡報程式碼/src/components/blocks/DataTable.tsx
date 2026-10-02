import { Image as ImageIcon, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { TableBlock } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

/** 原稿照片放大檢視（離線單檔版的圖片是內嵌資料，不能開新分頁，所以用覆蓋視窗） */
function Lightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/90 p-4 backdrop-blur-sm"
    >
      <img src={src} alt={label} className="max-h-full max-w-full rounded-xl bg-white object-contain" />
      <button type="button" aria-label="關閉" className={cn('absolute right-4 top-4 rounded-xl border border-white/20 bg-navy-900 p-2 text-white', focusRing)}>
        <X className="size-5" aria-hidden />
      </button>
    </div>,
    document.body,
  )
}

/** 資料表：電腦版表格、手機版每欄一張卡片 */
export function DataTable({ block, mobile = false }: { block: TableBlock; mobile?: boolean }) {
  const [zoom, setZoom] = useState(false)
  const t = toneStyles[block.tone]
  const badge = (col: number) => block.highlight?.find((h) => h.col === col)?.label

  const imageButton = block.image && (
    <button
      type="button"
      onClick={() => setZoom(true)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-dashed border-sky-400/50 bg-sky-400/10 font-semibold text-sky-100 hover:bg-sky-400/20',
        mobile ? 'px-3 py-1.5 text-[15px]' : 'px-3 py-1.5 text-[17px]',
        focusRing,
      )}
    >
      <ImageIcon className="size-4" aria-hidden />
      {block.image.label}
    </button>
  )

  return (
    <div className={cn('flex flex-col', mobile ? 'gap-3' : 'h-full gap-4')}>
      {mobile ? (
        <div className="space-y-2.5">
          {block.head.map((name, col) => (
            <div key={name} className={cn('rounded-2xl border p-3', badge(col) ? t.border : 'border-white/10')}>
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
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full table-fixed border-collapse text-center">
            <thead>
              <tr className="bg-white/[0.05]">
                <th className="w-[200px] px-4 py-3 text-left text-[18px] font-bold text-slate-400">冷媒</th>
                {block.head.map((name, col) => (
                  <th key={name} className={cn('px-2 py-3', badge(col) && t.soft)}>
                    <span className="block text-[26px] font-black text-white">{name}</span>
                    {badge(col) && <span className={cn('mt-1 inline-block rounded-md border px-2 text-[16px] font-bold', t.chip)}>{badge(col)}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.label} className="border-t border-white/10">
                  <th scope="row" className="px-4 py-3 text-left text-[19px] font-bold text-slate-300">
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
      )}

      {block.notes && (
        <ul className={cn('space-y-1.5', mobile ? 'text-[15px]' : 'text-[19px]')}>
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
