import { ArrowLeftRight, Keyboard } from 'lucide-react'
import { useState } from 'react'
import { useStickyState } from '../../hooks/useStickyState'
import { ATM, isBlend, KG_PER_BAR, PSI_PER_BAR, pressureAt, PT_TEMPS, REFRIGERANTS, temperatureAt, type RefrigerantId } from '../../data/refrigerants'
import { cn } from '../../lib/cn'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
const IDS = Object.keys(REFRIGERANTS) as RefrigerantId[]

type Field = 'psig' | 'kg' | 'temp'
const fmt = (n: number) => n.toFixed(2)

/** 網頁版 Ref Tools「冷媒滑尺」：選冷媒，拖滑桿或直接輸入 psig／公斤／溫度，互相換算 */
export function RefSlider({ mobile = false }: { mobile?: boolean }) {
  const [stickyId, setId] = useStickyState<RefrigerantId>('refslider:id', 'R22')
  // 舊版存的冷媒如果已移除，退回 R22
  const id: RefrigerantId = stickyId in REFRIGERANTS ? stickyId : 'R22'
  /** 目前以哪個欄位為準（使用者最後輸入或拖動的） */
  const [src, setSrc] = useStickyState<{ field: Field; value: number }>('refslider:src', { field: 'psig', value: 30 })
  const [editing, setEditing] = useState<{ field: Field; text: string } | null>(null)
  const [drag, setDrag] = useStickyState<'psig' | 'temp'>('refslider:drag', 'psig')

  // 資料範圍：-40～60°C 的飽和壓力
  const tMin = PT_TEMPS[0]
  const tMax = PT_TEMPS[PT_TEMPS.length - 1]
  const gMin = pressureAt(id, tMin) - ATM
  const gMax = pressureAt(id, tMax) - ATM
  const clampG = (g: number) => Math.min(Math.max(g, gMin), gMax)

  const gauge =
    src.field === 'psig' ? clampG(src.value / PSI_PER_BAR) : src.field === 'kg' ? clampG(src.value / KG_PER_BAR) : pressureAt(id, Math.min(Math.max(src.value, tMin), tMax)) - ATM
  const temp = src.field === 'temp' ? Math.min(Math.max(src.value, tMin), tMax) : temperatureAt(id, gauge + ATM)
  const values: Record<Field, number> = { psig: gauge * PSI_PER_BAR, kg: gauge * KG_PER_BAR, temp }

  const small = mobile ? 'text-[14px]' : 'text-[19px]'

  /** 可直接輸入的數值卡（用函式產生，不當元件，避免每次輸入都重建而失去焦點） */
  const renderInput = (field: Field, label: string, unit: string, tone: string) => {
    const shown = editing?.field === field ? editing.text : fmt(values[field])
    return (
      <label key={field} className={cn('block rounded-2xl border transition', mobile ? 'p-3' : 'p-4', tone, src.field === field ? 'ring-2 ring-white/40' : 'border-dashed')}>
        <span className={cn('flex items-center gap-1.5 font-bold', small)}>
          {label}
          <Keyboard className="size-4 opacity-70" aria-hidden />
        </span>
        <span className="mt-1 flex items-baseline gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={shown}
            aria-label={`${label}（${unit}）`}
            onFocus={(e) => {
              setEditing({ field, text: fmt(values[field]) })
              e.currentTarget.select()
            }}
            onChange={(e) => {
              const text = e.target.value
              setEditing({ field, text })
              const n = Number(text)
              if (text.trim() !== '' && Number.isFinite(n)) setSrc({ field, value: n })
            }}
            onBlur={() => setEditing(null)}
            className={cn(
              'w-full min-w-0 rounded-lg border border-white/15 bg-navy-950/60 px-2 font-black text-white outline-none focus:border-sky-300',
              mobile ? 'py-1 text-[24px]' : 'py-1 text-[40px]',
            )}
          />
          <span className={cn('shrink-0 font-bold text-slate-300', small)}>{unit}</span>
        </span>
      </label>
    )
  }

  return (
    <div className={cn('flex flex-col', mobile ? 'gap-3' : 'h-full gap-4')}>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="選冷媒">
        <span className={cn('font-bold text-slate-400', small)}>① 選冷媒</span>
        {IDS.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={id === r}
            onClick={() => {
              // 換冷媒時保留目前的錶壓，重新換算溫度
              if (src.field === 'temp') setSrc({ field: 'psig', value: values.psig })
              setId(r)
            }}
            className={cn(
              'rounded-xl border font-black transition',
              mobile ? 'px-3 py-1.5 text-[15px]' : 'px-4 py-1.5 text-[20px]',
              id === r ? 'border-sky-300 bg-sky-400/20 text-sky-100' : 'border-dashed border-white/25 text-slate-300 hover:border-sky-300/60',
              focusRing,
            )}
          >
            {r}
          </button>
        ))}
      </div>
      <p className={cn('-mt-1 text-slate-400', small)}>{REFRIGERANTS[id].use}</p>

      <div className={cn('rounded-2xl border border-white/10 bg-white/[0.03]', mobile ? 'p-3' : 'px-5 py-3')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={cn('font-bold text-slate-400', small)}>② 拖滑桿，或直接在下面輸入數字</span>
          <button
            type="button"
            onClick={() => setDrag(drag === 'psig' ? 'temp' : 'psig')}
            className={cn('flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1 font-semibold text-slate-200 hover:border-sky-300/60', small, focusRing)}
          >
            <ArrowLeftRight className="size-4" aria-hidden />
            改成拖{drag === 'psig' ? '溫度' : '錶壓'}
          </button>
        </div>
        {drag === 'psig' ? (
          <input
            type="range"
            min={Math.ceil(gMin * PSI_PER_BAR)}
            max={Math.floor(gMax * PSI_PER_BAR)}
            step={0.5}
            value={values.psig}
            onChange={(e) => setSrc({ field: 'psig', value: Number(e.target.value) })}
            aria-label="錶壓（psig）"
            className="mt-2 w-full accent-sky-400"
          />
        ) : (
          <input
            type="range"
            min={tMin}
            max={tMax}
            step={0.1}
            value={temp}
            onChange={(e) => setSrc({ field: 'temp', value: Number(e.target.value) })}
            aria-label="飽和溫度（°C）"
            className="mt-2 w-full accent-amber-400"
          />
        )}
      </div>

      <div className={cn('grid', mobile ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-3')}>
        {renderInput('psig', '錶壓', 'psig', 'border-sky-400/40 bg-sky-500/[0.08] text-sky-300')}
        {renderInput('kg', '錶壓（公斤）', 'kg/cm²', 'border-sky-400/40 bg-sky-500/[0.08] text-sky-300')}
        {renderInput('temp', '管內飽和溫度', '°C', 'border-amber-400/40 bg-amber-500/[0.08] text-amber-300')}
      </div>

      <div className={cn('text-slate-300', small)}>
        <p>
          ＝ 錶壓 {fmt(gauge)} bar・絕對壓力 {fmt(gauge + ATM)} bar（錶壓＋1 大氣壓）
          {gauge < 0 && <span className="ml-2 text-amber-200">錶壓是負的＝真空</span>}
        </p>
        {isBlend(id) && (
          <p className="text-amber-200/90">混合冷媒：上面溫度是露點（看低壓）；泡點 {fmt(temperatureAt(id, gauge + ATM, 'bubble'))}°C（看高壓）</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          setId('R22')
          setSrc({ field: 'psig', value: 210 })
        }}
        className={cn('self-start rounded-full bg-sky-400/15 font-semibold text-sky-200 transition hover:bg-sky-400/25', mobile ? 'px-3 py-1.5 text-[14px]' : 'px-5 py-2 text-[18px]', focusRing)}
      >
        對照老闆的手寫表：R22 210 psig → 40.42°C
      </button>

      <p className={cn('text-slate-500', mobile ? 'text-[12px]' : 'text-[16px]')}>
        資料：CoolProp 計算（R22、R134a、R32 與 NIST 交叉比對），-40～60°C 每 1°C 一筆；跟 Ref Tools 一樣，混合冷媒以露點為準。R438A、R408A 還沒收錄，請用 Ref Tools App。
      </p>
    </div>
  )
}
