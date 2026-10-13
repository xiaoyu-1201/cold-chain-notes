import { Box, Camera, Layers, Maximize2, RotateCw, Tags } from 'lucide-react'
import { PartGlyph } from '../ui/PartGlyph'
import { glyphFor } from '../../lib/partGlyph'
import { lazy, Suspense, useCallback, useState } from 'react'
import { photoCredits, photoSets } from '../../data/photoCredits'
import { cn } from '../../lib/cn'
import { Deferred } from '../ui/Deferred'
import { InView } from '../ui/InView'
import { GlassButtonGroup } from '../ui/GlassButtonGroup'
import { Segmented } from '../ui/Segmented'
import { part3DFor } from './ids'
import type { LegendItem, PartControl } from './models'
import { PartViewer } from './PartViewer'

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
  const [pi, setPi] = useState(0)
  const [cut, setCut] = useState(false)
  const [spin, setSpin] = useState(true)
  const [legend, setLegend] = useState<LegendItem[]>([])
  const [control, setControl] = useState<PartControl | undefined>()
  const [op, setOp] = useState(0)
  // 10/13 使用者：「這種 3D 可以拉大視窗吧」→ 放大看＝整個畫面的 3D 視窗
  const [big, setBig] = useState(false)
  // 構造說明：點哪一個名稱就顯示哪一個（換零件時清掉）
  const [legendOpen, setLegendOpen] = useState<string | null>(null)
  // 一鍵在 3D 上標名稱；滑鼠移到名稱或零件上，那個零件亮起來（10/13 使用者）
  const [labels, setLabels] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const onControl = useCallback((c: PartControl | undefined) => {
    setControl(c)
    setOp(c?.initial ?? 0)
  }, [])
  const operate = (v: number) => {
    if (control?.needsCut && !cut) setCut(true)
    setSpin(false)
    setOp(v)
  }
  /** 換產品（頁面上的膠囊、放大視窗裡的膠囊共用） */
  const pick = (i: number) => {
    setIndex(i)
    setLegendOpen(null)
    setPi(0)
    setCut(false)
    setSpin(true)
  }
  const credits = photoSets[part.id] ?? (id && photoCredits[id] ? [photoCredits[id]] : [])
  const credit = credits[Math.min(pi, credits.length - 1)]
  const photo = photoOf(credit?.file)

  const t = mobile
    ? { title: 'text-[17px]', small: 'text-[13px]', body: 'text-[14px]', pill: 'px-3 py-1.5 text-[13px]' }
    : { title: 'text-[24px]', small: 'text-[16px]', body: 'text-[17px]', pill: 'px-4 py-2 text-[16px]' }
  // 觸控範圍：手機 ≥44px；電腦畫布會縮放，給 52 畫布 px（10/10 QA：原本 34／29px）
  const pill = (on: boolean) => cn('flex items-center gap-1.5 rounded-full font-semibold transition', t.pill, mobile ? 'min-h-11' : 'min-h-[48px]', on ? 'bg-sky-400 text-navy-950' : 'bg-white/[0.1] text-slate-100 hover:bg-white/[0.16]', focusRing)
  /** 浮在 3D 上的按鈕：沒按＝玻璃、按下＝實心藍 */
  const floatPill = (on: boolean) => cn('flex items-center gap-1.5 rounded-full font-semibold transition', t.pill, mobile ? 'min-h-11' : 'min-h-[52px]', on ? 'border border-transparent bg-sky-400 text-navy-950' : 'glass text-slate-100', focusRing)
  const loading = <p className={cn('absolute inset-0 flex items-center justify-center text-slate-400', t.body)}>3D 模型載入中…</p>

  // 3D 底下那排按鈕：電腦疊在 3D 左下（3D 畫面往上挪讓出位置）；手機放在 3D 下面
  const viewButtons = (
    <GlassButtonGroup className={mobile ? 'flex flex-wrap gap-2' : 'absolute bottom-3 left-3 flex flex-wrap gap-2'} label="3D 檢視" avoid={!mobile}>
      <button type="button" aria-pressed={cut} onClick={() => setCut((c) => !c)} className={floatPill(cut)}>
        <Layers className="size-4" aria-hidden />
        {cut ? '合起來' : '剖開看內部'}
      </button>
      <button type="button" aria-pressed={spin} onClick={() => setSpin((s) => !s)} className={floatPill(spin)}>
        <RotateCw className="size-4" aria-hidden />
        自動旋轉
      </button>
      <button type="button" aria-pressed={labels} onClick={() => setLabels((v) => !v)} className={floatPill(labels)}>
        <Tags className="size-4" aria-hidden />
        標出構造
      </button>
    </GlassButtonGroup>
  )

  return (    <section className={cn('flex min-h-0 flex-col rounded-[18px] border border-line bg-card', mobile ? 'gap-2.5 p-3' : 'h-full gap-3 p-6')}>
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
              onClick={() => pick(i)}
              className={cn('flex min-h-11 items-center gap-1.5 rounded-full font-semibold transition', mobile ? t.pill : 'px-3 py-1 text-[20px]', i === index ? 'bg-slate-100 text-paper' : 'border border-line bg-card text-slate-200 hover:border-sky-500/50', focusRing)}
            >
              {glyphFor(p.label) && <PartGlyph id={glyphFor(p.label)!} size={mobile ? 18 : 22} strokeWidth={2.4} />}
              {p.label}
            </button>
          ))}
        </div>
      )}

      {tab === '3d' && id ? (
        <>
          <div
            className={cn('viewport-blueprint relative min-h-0 overflow-hidden rounded-2xl', mobile ? 'h-[300px]' : 'min-h-[220px] flex-1')}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <InView fallback={loading}>
              <Deferred fallback={loading}>
                <Suspense fallback={loading}>
                  {/* 放大看的時候先停掉這個（同時兩個 3D 在手機上容易卡、掉畫面） */}
                  {!big && <Part3D key={id} id={id} cut={cut} spin={spin} onLegend={setLegend} onControl={onControl} opValue={op} highlight={hover ?? legendOpen} labels={labels} onHoverPart={setHover} liftPx={mobile ? 0 : 28} />}
                </Suspense>
              </Deferred>
            </InView>
            {!mobile && viewButtons}

            {/* 放大看放左上角：下面一排按鈕才不會擠成兩排、蓋住 3D */}
            <button type="button" onClick={() => setBig(true)} data-3d-avoid className={cn(floatPill(false), 'absolute left-3 top-3')}>
              <Maximize2 className="size-4" aria-hidden />
              放大看
            </button>
            <p data-3d-avoid className={cn('glass pointer-events-none absolute right-3 top-3 rounded-full px-3 py-1 text-slate-200', t.small)}>{mobile ? '拖曳旋轉・兩指放大' : '拖曳旋轉・滾輪縮放'}</p>
          </div>
          {/* 手機：按鈕放在 3D 下面（疊在上面會擠成兩排、蓋住模型；10/13 QA） */}
          {mobile && viewButtons}

          {control && (
            <div className={cn('rounded-2xl border border-sky-500/35 bg-sky-950', mobile ? 'p-3' : 'px-5 py-3')}>
              <div className="flex flex-wrap items-center gap-3">
                <p className={cn('font-bold text-sky-200', t.body)}>動手試試：{control.label}</p>
                {control.kind !== 'slider' && (
                  <Segmented size={mobile ? 'sm' : 'md'} value={op > 0.5 ? 'on' : 'off'} onChange={(v) => operate(v === 'on' ? 1 : 0)} options={[{ value: 'off', label: control.off }, { value: 'on', label: control.on }]} />
                )}
                {/* 電腦版：滑桿跟標題同一行，3D 視窗才不會被擠小（10/13 使用者：3D 視窗被壓太窄） */}
                {control.kind === 'slider' && !mobile && (
                  // 至少 480px：放不下就整排換到標題下面，滑桿才不會被兩邊的字擠到拉不動（10/13 QA：只剩 18px）
                  <div className="flex min-w-[480px] flex-1 items-center gap-2 text-[20px] text-slate-400">
                    <span className="shrink-0">{control.off}</span>
                    <input type="range" min={0} max={1} step={0.01} value={op} onChange={(e) => operate(Number(e.target.value))} aria-label={control.label} className="min-w-0 flex-1 accent-sky-500" />
                    <span className="shrink-0">{control.on}</span>
                  </div>
                )}
              </div>
              {control.kind === 'slider' && mobile && (
                <div className="mt-1.5">
                  <input type="range" min={0} max={1} step={0.01} value={op} onChange={(e) => operate(Number(e.target.value))} aria-label={control.label} className="w-full accent-sky-500" />
                  <div className={cn('flex justify-between text-slate-400', t.small)}>
                    <span>{control.off}</span>
                    <span>{control.on}</span>
                  </div>
                </div>
              )}
              <p className={cn('mt-1.5 leading-snug text-slate-100', t.body)}>{control.describe(op)}</p>
            </div>
          )}

          {legend.length > 0 &&
            (mobile ? (
              <ul className={cn('grid grid-cols-1 gap-x-4 gap-y-1', t.small)}>
                {legend.map((item) => (
                  <li key={item.name} className="flex min-w-0 items-start gap-2" title={item.desc}>
                    <span className="mt-1.5 size-3 shrink-0 rounded-full" style={{ background: item.color }} aria-hidden />
                    <span className="leading-snug text-slate-200">
                      <b className="font-semibold text-white">{item.name}</b>
                      <span className="text-slate-400">・{item.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              // 電腦版只列名稱、排成一兩行（10/13 使用者：3D 視窗被壓太窄）；完整說明滑過看得到，「放大看」裡也有
              // 點一下名稱就在下面顯示說明（10/13 使用者：iPad 手指摸不到滑鼠提示）
              <div className="relative text-[20px]">
                <ul className="flex flex-wrap gap-x-2 gap-y-1">
                  {legend.map((item) => (
                    <li key={item.name}>
                      <button
                        type="button"
                        onClick={() => setLegendOpen((cur) => (cur === item.name ? null : item.name))}
                        onMouseEnter={() => setHover(item.name)}
                        onMouseLeave={() => setHover(null)}
                        aria-pressed={legendOpen === item.name}
                        title={item.desc}
                        className={cn('flex min-h-[36px] items-center gap-1.5 rounded-full px-2.5 font-semibold transition', legendOpen === item.name ? 'bg-sky-950 text-sky-100 ring-1 ring-sky-500' : 'text-white hover:bg-white/[0.08]', focusRing)}
                      >
                        <span className="size-3 shrink-0 rounded-full" style={{ background: item.color }} aria-hidden />
                        {item.name}
                      </button>
                    </li>
                  ))}
                  {!legendOpen && <li className="flex items-center px-1 text-slate-400">點名稱看說明</li>}
                </ul>
                {/* 說明浮在名稱上方（蓋在 3D 下緣），不把 3D 擠小；再點一次或點別的名稱就換掉 */}
                {legendOpen && (
                  <p className="absolute inset-x-0 bottom-full mb-2 rounded-xl border border-sky-500/50 bg-card px-4 py-2.5 leading-snug text-slate-200 shadow-[0_8px_24px_-10px_rgba(15,36,64,0.45)]">
                    <b className="text-white">{legendOpen}</b>・{legend.find((l) => l.name === legendOpen)?.desc}
                  </p>
                )}
              </div>
            ))}
        </>
      ) : (
        <div className={cn('flex min-h-0 flex-col items-center justify-center gap-2', mobile ? 'min-h-[240px]' : 'flex-1')}>
          {photo && credit ? (
            <>
              {credits.length > 1 && (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {credits.map((c, i) => (
                    <button key={c.file + i} type="button" onClick={() => setPi(i)} className={cn('rounded-full font-semibold transition', t.pill, i === pi ? 'bg-slate-100 text-paper' : 'border border-line bg-card text-slate-200 hover:border-sky-500/50', focusRing)}>
                      {c.label ?? `照片 ${i + 1}`}
                    </button>
                  ))}
                </div>
              )}
              <img src={photo} alt={part.label} className="min-h-0 max-w-full flex-1 rounded-2xl border border-line bg-card object-contain" />
              <p className={cn('text-center font-semibold leading-snug text-amber-100', t.body)}>{credit.note}</p>
              <p className={cn('text-center text-slate-500', mobile ? 'text-[13px]' : 'text-[16px]')}>
                照片：{credit.author}
                {credit.licenseUrl && (
                  <>
                    ・
                    <a href={credit.licenseUrl} target="_blank" rel="noreferrer" className="underline hover:text-sky-300">
                      {credit.license}
                    </a>
                  </>
                )}
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
      {big && id && (
        <PartViewer
          id={id}
          title={part.label}
          onClose={() => setBig(false)}
          choices={parts.map((p) => ({ label: p.label, glyph: glyphFor(p.label) && <PartGlyph id={glyphFor(p.label)!} size={20} strokeWidth={2.4} />, disabled: !part3DFor(p.id) }))}
          current={index}
          onPick={pick}
        />
      )}
    </section>
  )
}
