import { Box, Camera, Layers, RotateCw, X } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { photoCredits } from '../../data/photoCredits'
import { cn } from '../../lib/cn'
import { GlassButtonGroup } from '../ui/GlassButtonGroup'
import { Segmented } from '../ui/Segmented'
import type { LegendItem, Part3DId, PartControl } from './models'

const Part3D = lazy(() => import('./Part3D'))

/** 照片：src/assets/parts/<file>.jpg，對應與出處寫在 data/photoCredits.ts */
const photos = import.meta.glob<string>('../../assets/parts/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
const photoOf = (file?: string) => (file ? Object.entries(photos).find(([path]) => path.split('/').pop()?.split('.')[0] === file)?.[1] : undefined)

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

interface PartViewerProps {
  id: Part3DId
  title: string
  alias?: string
  onClose: () => void
}

/** 零件構造檢視（全螢幕）：3D 可轉可放大、可剖開；有照片時可切換看照片 */
export function PartViewer({ id, title, alias, onClose }: PartViewerProps) {
  const credit = photoCredits[id]
  const photo = photoOf(credit?.file)
  const [tab, setTab] = useState<'3d' | 'photo'>('3d')
  const [cut, setCut] = useState(false)
  const [spin, setSpin] = useState(true)
  const [legend, setLegend] = useState<LegendItem[]>([])
  const [control, setControl] = useState<PartControl | undefined>()
  const [op, setOp] = useState(0)
  const onControl = useCallback((c: PartControl | undefined) => {
    setControl(c)
    setOp(c?.initial ?? 0)
  }, [])
  /** 動手操作：機構在外殼裡的，第一次操作就自動剖開 */
  const operate = (v: number) => {
    if (control?.needsCut && !cut) setCut(true)
    setOp(v)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      } else if (['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', 'Backspace', ' '].includes(e.key)) {
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  const toggle = (on: boolean) =>
    cn(
      'flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-[15px] font-semibold transition',
      on ? 'bg-sky-400 text-navy-950' : 'bg-white/[0.1] text-slate-100 hover:bg-white/[0.16]',
      focusRing,
    )

  const floatToggle = (on: boolean) =>
    cn('flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-[15px] font-semibold transition', on ? 'border border-transparent bg-sky-400 text-navy-950' : 'glass text-slate-100', focusRing)

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/40 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} 構造`}
      // 事件不往簡報傳：避免在 3D 上滑動時被當成換頁
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        // 點視窗外的暗色背景就關閉
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex h-full max-h-[900px] w-full max-w-[1400px] flex-col overflow-hidden rounded-[20px] border border-line bg-paper shadow-[0_24px_64px_-24px_rgba(15,36,64,0.5)]">
        <header className="flex flex-wrap items-center gap-3 border-b border-line bg-card px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="text-[22px] font-black text-white sm:text-[26px]">{title}</p>
            {alias && <p className="text-[15px] font-semibold text-sky-300">{alias}</p>}
          </div>
          <div className="flex gap-2" role="tablist">
            <button type="button" role="tab" aria-selected={tab === '3d'} onClick={() => setTab('3d')} className={toggle(tab === '3d')}>
              <Box className="size-4" aria-hidden />
              3D 構造
            </button>
            <button type="button" role="tab" aria-selected={tab === 'photo'} onClick={() => setTab('photo')} className={toggle(tab === 'photo')}>
              <Camera className="size-4" aria-hidden />
              照片
            </button>
          </div>
          <button type="button" onClick={onClose} aria-label="關閉（Esc）" className={cn('rounded-xl border border-line bg-card p-2 text-slate-200 hover:border-sky-500/60', focusRing)}>
            <X className="size-5" aria-hidden />
          </button>
        </header>

        {tab === '3d' ? (
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <div className="viewport-blueprint relative min-h-[280px] flex-1">
              <Suspense fallback={<p className="absolute inset-0 flex items-center justify-center text-[16px] text-slate-400">3D 模型載入中…</p>}>
                <Part3D id={id} cut={cut} spin={spin} onLegend={setLegend} onControl={onControl} opValue={op} />
              </Suspense>
              <GlassButtonGroup className="absolute bottom-3 left-3 flex flex-wrap gap-2" label="3D 檢視">
                <button type="button" aria-pressed={cut} onClick={() => setCut((c) => !c)} className={floatToggle(cut)}>
                  <Layers className="size-4" aria-hidden />
                  {cut ? '合起來' : '剖開看內部'}
                </button>
                <button type="button" aria-pressed={spin} onClick={() => setSpin((s) => !s)} className={floatToggle(spin)}>
                  <RotateCw className="size-4" aria-hidden />
                  自動旋轉
                </button>
              </GlassButtonGroup>
              <p className="glass pointer-events-none absolute right-3 top-3 rounded-full px-3 py-1 text-[13px] text-slate-200">拖曳旋轉・滾輪往游標放大・雙擊還原</p>
            </div>
            <aside className="max-h-[42%] overflow-y-auto border-t border-line bg-card p-4 lg:max-h-none lg:w-[380px] lg:border-l lg:border-t-0">
              {control && (
                <section className="mb-4 rounded-2xl border border-sky-500/35 bg-sky-950 p-4">
                  <p className="text-[15px] font-bold text-sky-200">動手試試：{control.label}</p>
                  {control.kind === 'slider' ? (
                    <>
                      <input type="range" min={0} max={1} step={0.01} value={op} onChange={(e) => operate(Number(e.target.value))} aria-label={control.label} className="mt-3 w-full accent-sky-500" />
                      <div className="flex justify-between text-[13px] text-slate-400">
                        <span>{control.off}</span>
                        <span>{control.on}</span>
                      </div>
                    </>
                  ) : (
                    <div className="mt-3">
                      <Segmented size="sm" value={op > 0.5 ? 'on' : 'off'} onChange={(v) => operate(v === 'on' ? 1 : 0)} options={[{ value: 'off', label: control.off }, { value: 'on', label: control.on }]} />
                    </div>
                  )}
                  <p className="mt-2 text-[15px] leading-snug text-slate-100">{control.describe(op)}</p>
                </section>
              )}
              <p className="mb-2 text-[15px] font-bold text-slate-400">構造說明{cut ? '' : '（按「剖開看內部」看裡面）'}</p>
              <ul className="space-y-2.5">
                {legend.map((item) => (
                  <li key={item.name} className="flex gap-2.5">
                    <span className="mt-1.5 size-3.5 shrink-0 rounded-full border border-ink/25" style={{ background: item.color }} aria-hidden />
                    <span>
                      <span className="block text-[17px] font-bold text-white">{item.name}</span>
                      <span className="block text-[15px] leading-snug text-slate-300">{item.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[13px] text-slate-500">示意模型：重點是看懂構造，外型、比例與實品不同。</p>
            </aside>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-4">
            {photo && credit ? (
              <>
                <img src={photo} alt={title} className="min-h-0 max-w-full flex-1 rounded-2xl border border-line bg-card object-contain" />
                <p className="max-w-3xl text-center text-[17px] font-semibold leading-snug text-amber-100">{credit.note}</p>
                <p className="text-center text-[13px] text-slate-400">
                  照片：{credit.title}・{credit.author}・
                  <a href={credit.licenseUrl} target="_blank" rel="noreferrer" className="underline hover:text-sky-300">
                    {credit.license}
                  </a>
                  ・
                  <a href={credit.source} target="_blank" rel="noreferrer" className="underline hover:text-sky-300">
                    來源
                  </a>
                  （已縮圖）
                </p>
              </>
            ) : (
              <div className="max-w-md rounded-2xl border border-dashed border-line bg-card p-6 text-center">
                <Camera className="mx-auto size-10 text-slate-500" aria-hidden />
                <p className="mt-3 text-[18px] font-bold text-slate-200">照片待補</p>
                <p className="mt-1 text-[15px] text-slate-400">網路上找不到可自由使用的清楚照片；到店裡拍實品最準，拍好放進資料夾就會出現。先看「3D 構造」。</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
