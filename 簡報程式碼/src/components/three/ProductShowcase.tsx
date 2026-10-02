import { Box, Camera, Layers, RotateCw } from 'lucide-react'
import { lazy, Suspense, useCallback, useState } from 'react'
import { photoCredits } from '../../data/photoCredits'
import { cn } from '../../lib/cn'
import { Deferred } from '../ui/Deferred'
import { Segmented } from '../ui/Segmented'
import { part3DFor } from './ids'
import type { LegendItem, PartControl } from './models'

const Part3D = lazy(() => import('./Part3D'))
const photos = import.meta.glob<string>('../../assets/parts/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
const photoOf = (file?: string) => (file ? Object.entries(photos).find(([path]) => path.split('/').pop()?.split('.')[0] === file)?.[1] : undefined)
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

/**
 * 產品展示（元件章節的主角）：大的 3D 模型／實物照片、剖開、動手試試、構造圖例；
 * 一章有多個零件時（第 5 章），上面用膠囊按鈕切換。
 */
export function ProductShowcase({ parts, mobile = false }: { parts: { id: string; label: string }[]; mobile?: boolean }) {
  const [index, setIndex] = useState(0)
  const part = parts[Math.min(index, parts.length - 1)]
  const id = part3DFor(part.id)
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
  const operate = (v: number) => {
    if (control?.needsCut && !cut) setCut(true)
    setSpin(false)
    setOp(v)
  }
  const credit = id ? photoCredits[id] : undefined
  const photo = photoOf(credit?.file)

  const t = mobile
    ? { title: 'text-[17px]', small: 'text-[13px]', body: 'text-[14px]', pill: 'px-3 py-1.5 text-[13px]' }
    : { title: 'text-[24px]', small: 'text-[16px]', body: 'text-[17px]', pill: 'px-4 py-2 text-[16px]' }
  const pill = (on: boolean) => cn('flex items-center gap-1.5 rounded-full font-semibold transition', t.pill, on ? 'bg-sky-400 text-navy-950' : 'bg-white/[0.1] text-slate-100 hover:bg-white/[0.16]', focusRing)
  const loading = <p className={cn('absolute inset-0 flex items-center justify-center text-slate-400', t.body)}>3D 模型載入中…</p>

  return (
    <section className={cn('flex min-h-0 flex-col rounded-[28px] bg-white/[0.045]', mobile ? 'gap-2.5 p-3' : 'h-full gap-3 p-6')}>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <p className={cn('font-semibold text-white', t.title)}>產品展示：{part.label}</p>
        <Segmented
          size={mobile ? 'sm' : 'md'}
          value={tab}
          onChange={setTab}
          options={[
            { value: '3d', label: '3D 構造' },
            { value: 'photo', label: '實物照片' },
          ]}
        />
      </header>
      {parts.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {parts.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setIndex(i)
                setCut(false)
                setSpin(true)
              }}
              className={cn('rounded-full font-semibold transition', t.pill, i === index ? 'bg-slate-100 text-navy-950' : 'bg-white/[0.08] text-slate-200 hover:bg-white/[0.14]', focusRing)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {tab === '3d' && id ? (
        <>
          <div
            className={cn('relative min-h-0 overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.14),transparent_70%)]', mobile ? 'h-[300px]' : 'flex-1')}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <Deferred fallback={loading}>
              <Suspense fallback={loading}>
                <Part3D key={id} id={id} cut={cut} spin={spin} onLegend={setLegend} onControl={onControl} opValue={op} />
              </Suspense>
            </Deferred>
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
              <button type="button" aria-pressed={cut} onClick={() => setCut((c) => !c)} className={pill(cut)}>
                <Layers className="size-4" aria-hidden />
                {cut ? '合起來' : '剖開看內部'}
              </button>
              <button type="button" aria-pressed={spin} onClick={() => setSpin((s) => !s)} className={pill(spin)}>
                <RotateCw className="size-4" aria-hidden />
                自動旋轉
              </button>
            </div>
            <p className={cn('pointer-events-none absolute right-3 top-3 rounded-full bg-black/40 px-3 py-1 text-slate-300', t.small)}>拖曳旋轉・滾輪縮放</p>
          </div>

          {control && (
            <div className={cn('rounded-2xl bg-sky-400/[0.1]', mobile ? 'p-3' : 'px-5 py-3')}>
              <div className="flex flex-wrap items-center gap-3">
                <p className={cn('font-bold text-sky-200', t.body)}>動手試試：{control.label}</p>
                {control.kind !== 'slider' && (
                  <Segmented size={mobile ? 'sm' : 'md'} value={op > 0.5 ? 'on' : 'off'} onChange={(v) => operate(v === 'on' ? 1 : 0)} options={[{ value: 'off', label: control.off }, { value: 'on', label: control.on }]} />
                )}
              </div>
              {control.kind === 'slider' && (
                <div className="mt-1.5">
                  <input type="range" min={0} max={1} step={0.01} value={op} onChange={(e) => operate(Number(e.target.value))} aria-label={control.label} className="w-full accent-sky-400" />
                  <div className={cn('flex justify-between text-slate-400', t.small)}>
                    <span>{control.off}</span>
                    <span>{control.on}</span>
                  </div>
                </div>
              )}
              <p className={cn('mt-1.5 leading-snug text-slate-100', t.body)}>{control.describe(op)}</p>
            </div>
          )}

          {legend.length > 0 && (
            <ul className={cn('grid grid-cols-2 gap-x-4 gap-y-1', t.small)}>
              {legend.map((item) => (
                <li key={item.name} className="flex min-w-0 items-center gap-2" title={item.desc}>
                  <span className="size-3 shrink-0 rounded-full" style={{ background: item.color }} aria-hidden />
                  <span className="truncate text-slate-200">
                    <b className="font-semibold text-white">{item.name}</b>
                    <span className="text-slate-400">・{item.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div className={cn('flex min-h-0 flex-col items-center justify-center gap-2', mobile ? 'min-h-[240px]' : 'flex-1')}>
          {photo && credit ? (
            <>
              <img src={photo} alt={part.label} className="min-h-0 max-w-full flex-1 rounded-2xl bg-white object-contain" />
              <p className={cn('text-center font-semibold leading-snug text-amber-100', t.body)}>{credit.note}</p>
              <p className={cn('text-center text-slate-500', mobile ? 'text-[12px]' : 'text-[16px]')}>
                照片：{credit.author}・
                <a href={credit.licenseUrl} target="_blank" rel="noreferrer" className="underline hover:text-sky-300">
                  {credit.license}
                </a>
              </p>
            </>
          ) : (
            <div className="max-w-md text-center">
              <Camera className="mx-auto size-10 text-slate-500" aria-hidden />
              <p className={cn('mt-2 font-bold text-slate-200', t.body)}>照片待補</p>
              <p className={cn('mt-1 text-slate-400', t.small)}>到店裡拍實品最準；拍好放進資料夾就會出現。先看「3D 構造」。</p>
              <button type="button" onClick={() => setTab('3d')} className={cn(pill(false), 'mx-auto mt-3')}>
                <Box className="size-4" aria-hidden />
                看 3D 構造
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
