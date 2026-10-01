import { ArrowLeftRight } from 'lucide-react'
import { useState } from 'react'
import { ATM, pressureAt, REFRIGERANTS, temperatureAt, type RefrigerantId } from '../../data/refrigerants'
import { cn } from '../../lib/cn'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
const IDS = Object.keys(REFRIGERANTS) as RefrigerantId[]

/** 網頁版 Ref Tools「冷媒滑尺」：選冷媒，拖溫度或錶壓，互相換算 */
export function RefSlider({ mobile = false }: { mobile?: boolean }) {
  const [id, setId] = useState<RefrigerantId>('R134a')
  const [mode, setMode] = useState<'temp' | 'gauge'>('gauge')
  const [temp, setTemp] = useState(-10)
  const [gauge, setGauge] = useState(1)

  const maxGauge = Math.floor(pressureAt(id, 60) - ATM)
  const t = mode === 'temp' ? temp : temperatureAt(id, Math.min(gauge, maxGauge) + ATM)
  const pAbs = mode === 'temp' ? pressureAt(id, temp) : Math.min(gauge, maxGauge) + ATM
  const g = pAbs - ATM

  /** 切換要拖的是錶壓還是溫度（數值接續目前的換算結果） */
  const switchTo = (m: 'temp' | 'gauge') => {
    if (m === mode) return
    if (m === 'temp') setTemp(Math.round(t))
    else setGauge(Math.round(g * 10) / 10)
    setMode(m)
  }

  /** 結果卡片：點了就改成拖這一個 */
  const cardClass = (m: 'temp' | 'gauge', tone: string) =>
    cn(
      'rounded-2xl border text-left transition',
      mobile ? 'p-3' : 'p-5',
      tone,
      mode === m ? 'ring-2 ring-white/40' : 'border-dashed opacity-80 hover:opacity-100',
      focusRing,
    )
  const cardTag = (m: 'temp' | 'gauge') => (
    <span className={cn('ml-2 rounded-md px-1.5 py-0.5 font-semibold', mobile ? 'text-[11px]' : 'text-[14px]', mode === m ? 'bg-white/15 text-white' : 'border border-dashed border-white/30 text-slate-300')}>
      {mode === m ? '拖動中' : '點這張改拖'}
    </span>
  )

  const big = mobile ? 'text-[30px]' : 'text-[54px]'
  const small = mobile ? 'text-[14px]' : 'text-[19px]'

  return (
    <div className={cn('flex flex-col', mobile ? 'gap-3' : 'h-full gap-4')}>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="選冷媒">
        <span className={cn('font-bold text-slate-400', small)}>① 選冷媒</span>
        {IDS.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={id === r}
            onClick={() => setId(r)}
            className={cn(
              'rounded-xl border font-black transition',
              mobile ? 'px-3 py-1.5 text-[15px]' : 'px-5 py-2 text-[22px]',
              id === r ? 'border-sky-300 bg-sky-400/20 text-sky-100' : 'border-dashed border-white/25 text-slate-300 hover:border-sky-300/60',
              focusRing,
            )}
          >
            {r}
          </button>
        ))}
        <span className={cn('text-slate-500', small)}>{REFRIGERANTS[id].use}</span>
      </div>

      <div className={cn('rounded-2xl border border-white/10 bg-white/[0.03]', mobile ? 'p-3' : 'p-5')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={cn('font-bold text-slate-400', small)}>② 拖動{mode === 'gauge' ? '錶壓' : '溫度'}</span>
          <button
            type="button"
            onClick={() => switchTo(mode === 'gauge' ? 'temp' : 'gauge')}
            className={cn('flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1 font-semibold text-slate-200 hover:border-sky-300/60', small, focusRing)}
          >
            <ArrowLeftRight className="size-4" aria-hidden />
            改成拖{mode === 'gauge' ? '溫度' : '錶壓'}
          </button>
        </div>
        {mode === 'gauge' ? (
          <input
            type="range"
            min={0}
            max={maxGauge}
            step={0.1}
            value={Math.min(gauge, maxGauge)}
            onChange={(e) => setGauge(Number(e.target.value))}
            aria-label="錶壓（bar）"
            className="mt-3 w-full accent-sky-400"
          />
        ) : (
          <input
            type="range"
            min={-40}
            max={60}
            step={1}
            value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            aria-label="飽和溫度（°C）"
            className="mt-3 w-full accent-amber-400"
          />
        )}
      </div>

      <div className={cn('grid grid-cols-2', mobile ? 'gap-2' : 'gap-4')}>
        <button type="button" aria-pressed={mode === 'gauge'} onClick={() => switchTo('gauge')} className={cardClass('gauge', 'border-sky-400/40 bg-sky-500/[0.08]')}>
          <p className={cn('flex flex-wrap items-center font-bold text-sky-300', small)}>
            錶壓（壓力錶讀數）
            {cardTag('gauge')}
          </p>
          <p className={cn('font-black text-white', big)}>
            {g.toFixed(1)} <span className={cn('font-bold text-slate-400', small)}>bar</span>
          </p>
          <p className={cn('text-slate-300', small)}>
            ≈ {(g * 14.5038).toFixed(0)} psi・{(g * 1.01972).toFixed(1)} kg/cm²
          </p>
        </button>
        <button type="button" aria-pressed={mode === 'temp'} onClick={() => switchTo('temp')} className={cardClass('temp', 'border-amber-400/40 bg-amber-500/[0.08]')}>
          <p className={cn('flex flex-wrap items-center font-bold text-amber-300', small)}>
            管內飽和溫度
            {cardTag('temp')}
          </p>
          <p className={cn('font-black text-white', big)}>
            {t.toFixed(1)} <span className={cn('font-bold text-slate-400', small)}>°C</span>
          </p>
          <p className={cn('text-slate-300', small)}>絕對壓力 {pAbs.toFixed(2)} bar（錶壓＋1）</p>
        </button>
      </div>

      <p className={cn('text-slate-500', mobile ? 'text-[12px]' : 'text-[15px]')}>
        資料：NIST Chemistry WebBook（SRD 69）飽和數據，每 5°C 內插；R404A、R410A 等混合冷媒之後依廠商 PT 表補上。
      </p>
    </div>
  )
}
