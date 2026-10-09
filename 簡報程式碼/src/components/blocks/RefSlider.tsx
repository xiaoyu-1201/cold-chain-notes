import { RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from 'react'
import { ATM, isBlend, KG_PER_BAR, PSI_PER_BAR, pressureAt, PT_TEMPS, REFRIGERANTS, temperatureAt, type RefrigerantId } from '../../data/refrigerants'
import { useStickyState } from '../../hooks/useStickyState'
import { cn } from '../../lib/cn'
import { Segmented } from '../ui/Segmented'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
const IDS = Object.keys(REFRIGERANTS) as RefrigerantId[]
const T_MIN = PT_TEMPS[0]
const T_MAX = PT_TEMPS[PT_TEMPS.length - 1]
const clampT = (t: number) => Math.min(Math.max(t, T_MIN), T_MAX)
const fmt = (n: number) => n.toFixed(2)

type Unit = 'psig' | 'kg' | 'bar'
type Curve = 'dew' | 'bubble'
const UNIT_PER_BAR: Record<Unit, number> = { psig: PSI_PER_BAR, kg: KG_PER_BAR, bar: 1 }
const unitLabel = (u: Unit, abs: boolean) => (u === 'psig' ? (abs ? 'psia' : 'psig') : u === 'kg' ? (abs ? 'kg/cm²(a)' : 'kg/cm²') : abs ? 'bar(a)' : 'bar(g)')
/** 刻度間距只用這些「好讀的數字」 */
const NICE = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 25, 50, 100]

/** 按住不放會一直重複（先等一下再加速），放開就停 */
function useRepeat() {
  const timer = useRef<number | undefined>(undefined)
  const stop = () => window.clearTimeout(timer.current)
  useEffect(() => stop, [])
  return (fn: () => void) => ({
    onPointerDown: (e: PointerEvent) => {
      e.preventDefault()
      fn()
      const loop = (delay: number) => {
        timer.current = window.setTimeout(() => {
          fn()
          loop(Math.max(delay * 0.8, 40))
        }, delay)
      }
      loop(380)
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    // 鍵盤（Enter／空白鍵）也能按
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      fn()
    },
  })
}

const snap = (t: number, step: number) => Math.round(t / step) * step

/** 跟 Ref Tools「冷媒尺」一樣的直式雙刻度尺：左紅＝壓力（不等距）、右藍＝溫度；尺在中間細線下面上下滑 */
function Ruler({
  id,
  curve,
  unit,
  abs,
  temp,
  onTemp,
  onJump,
  mobile,
}: {
  id: RefrigerantId
  curve: Curve
  unit: Unit
  abs: boolean
  temp: number
  onTemp: (t: number) => void
  /** 平滑地跳到某個溫度（點尺、按按鈕） */
  onJump: (t: number) => void
  mobile: boolean
}) {
  const PX = mobile ? 6 : 8 // 每 1°C 幾 px
  const W = mobile ? 150 : 280
  const H = (T_MAX - T_MIN) * PX
  const viewRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number; t: number; moved: boolean } | null>(null)
  const repeat = useRepeat()
  const yOf = (t: number) => (t - T_MIN) * PX
  const spineP = W * 0.46
  const spineT = W * 0.54

  const pressureTicks = useMemo(() => {
    // 顯示單位的壓力 ↔ 溫度
    const toUnit = (pAbs: number) => (abs ? pAbs : pAbs - ATM) * UNIT_PER_BAR[unit]
    const fromUnit = (v: number) => v / UNIT_PER_BAR[unit] + (abs ? 0 : ATM)
    const yv = (v: number) => (temperatureAt(id, fromUnit(v), curve) - T_MIN) * PX
    const vMin = toUnit(pressureAt(id, T_MIN, curve))
    const vMax = toUnit(pressureAt(id, T_MAX, curve))
    const stepFor = (v: number, gapPx: number) => {
      const d = Math.max((vMax - vMin) / 2000, 0.01)
      const pxPerUnit = Math.max((yv(v + d) - yv(v)) / d, 1e-6)
      return NICE.find((s) => s * pxPerUnit >= gapPx) ?? 100
    }
    const ticks: { y: number; label?: string }[] = []
    let v = Math.ceil(vMin / stepFor(vMin, 6)) * stepFor(vMin, 6)
    let lastLabel = -Infinity
    for (let guard = 0; v <= vMax && guard < 2000; guard++) {
      const tick = stepFor(v, 6)
      const label = stepFor(v, mobile ? 24 : 30)
      const y = yv(v)
      const isLabel = Math.abs(v / label - Math.round(v / label)) < 1e-6 && y - lastLabel >= (mobile ? 20 : 26)
      if (isLabel) lastLabel = y
      ticks.push({ y, label: isLabel ? String(Math.round(v * 10) / 10) : undefined })
      v = Math.round((Math.floor(v / tick + 1e-6) + 1) * tick * 1000) / 1000
    }
    return ticks
  }, [id, curve, unit, abs, PX, mobile])

  // 畫布有縮放：用實際高度換算回設計 px
  const scaleOf = () => {
    const el = viewRef.current
    return el ? el.getBoundingClientRect().height / el.offsetHeight : 1
  }
  const onDown = (e: PointerEvent) => {
    drag.current = { y: e.clientY, t: temp, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d) return
    if (!d.moved && Math.abs(e.clientY - d.y) < 4) return
    d.moved = true
    // 拖曳時對齊 0.1°C，讀數比較好看
    onTemp(clampT(snap(d.t + (d.y - e.clientY) / (PX * scaleOf()), 0.1)))
  }
  const onUp = (e: PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d || d.moved) return
    // 沒拖曳＝點一下：跳到點的那一格（對齊 0.5°C）
    const rect = e.currentTarget.getBoundingClientRect()
    const dy = (e.clientY - (rect.top + rect.height / 2)) / scaleOf()
    onJump(clampT(snap(temp + dy / PX, 0.5)))
  }
  const onWheel = (e: WheelEvent) => {
    e.stopPropagation()
    // 滾一格（約 100）＝0.5°C；按住 Shift＝0.1°C
    onTemp(clampT(snap(temp + e.deltaY * (e.shiftKey ? 0.001 : 0.005), 0.1)))
  }
  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 1 : 0.1
    if (e.key === 'ArrowUp') onTemp(clampT(snap(temp - step, 0.1)))
    else if (e.key === 'ArrowDown') onTemp(clampT(snap(temp + step, 0.1)))
    else return
    e.preventDefault()
    e.stopPropagation()
  }
  // 微調按鈕用最新的溫度（按住時溫度一直在變）
  const tempRef = useRef(temp)
  tempRef.current = temp
  const nudge = (d: number) => () => onTemp(clampT(snap(tempRef.current + d, 0.1)))
  const STEPS: [string, number][] = mobile
    ? [['−1', -1], ['−0.1', -0.1], ['+0.1', 0.1], ['+1', 1]]
    : [['−1°C', -1], ['−0.1', -0.1], ['+0.1', 0.1], ['+1°C', 1]]

  const font = mobile ? 12 : 16
  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex justify-between px-3 pb-1 font-bold', mobile ? 'text-[13px]' : 'text-[18px]')}>
        <span className="text-red-300">{unitLabel(unit, abs)}</span>
        <span className="text-sky-300">°C</span>
      </div>
      <div
        ref={viewRef}
        role="slider"
        tabIndex={0}
        aria-label="冷媒尺：上下滑動調整溫度"
        aria-valuemin={T_MIN}
        aria-valuemax={T_MAX}
        aria-valuenow={Math.round(temp * 100) / 100}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={onWheel}
        onKeyDown={onKey}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className={cn('relative min-h-0 flex-1 cursor-ns-resize touch-none select-none overflow-hidden rounded-2xl border border-line bg-card', focusRing)}
      >
        {/* 尺：讓目前溫度永遠在中間細線 */}
        <svg width={W} height={H + 40} className="absolute left-1/2 -translate-x-1/2" style={{ top: `calc(50% - ${yOf(temp) + 20}px)` }} aria-hidden>
          <g transform="translate(0 20)">
            <line x1={spineP} x2={spineP} y1={0} y2={H} stroke="#d23f2e" strokeOpacity={0.55} />
            <line x1={spineT} x2={spineT} y1={0} y2={H} stroke="#2e7bc8" strokeOpacity={0.55} />
            {pressureTicks.map((p, i) => (
              <g key={i}>
                <line x1={spineP - (p.label ? 16 : 7)} x2={spineP} y1={p.y} y2={p.y} stroke="#d23f2e" strokeWidth={p.label ? 1.6 : 1} />
                {p.label && (
                  <text x={spineP - 22} y={p.y} fill="#8a2216" fontSize={font} fontWeight={600} textAnchor="end" dominantBaseline="middle">
                    {p.label}
                  </text>
                )}
              </g>
            ))}
            {PT_TEMPS.map((t) => (
              <g key={t}>
                <line x1={spineT} x2={spineT + (t % 10 === 0 ? 16 : t % 5 === 0 ? 11 : 6)} y1={yOf(t)} y2={yOf(t)} stroke="#2e7bc8" strokeWidth={t % 10 === 0 ? 1.6 : 1} />
                {t % 10 === 0 && (
                  <text x={spineT + 22} y={yOf(t)} fill="#164d84" fontSize={font} fontWeight={600} dominantBaseline="middle">
                    {t}
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>
        {/* 中間的讀數線（像 App 的透明遊標） */}
        <div className={cn('pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 bg-white/[0.1]', mobile ? 'h-8' : 'h-11')} aria-hidden>
          <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-white" />
        </div>
      </div>
      {/* 微調：按一下動一格，按住不放會一直動 */}
      <div className={cn('grid grid-cols-4', mobile ? 'mt-1.5 gap-1' : 'mt-2.5 gap-1.5')} role="group" aria-label="微調溫度">
        {STEPS.map(([label, d]) => (
          <button
            key={label}
            type="button"
            aria-label={`溫度 ${d > 0 ? '加' : '減'} ${Math.abs(d)}°C`}
            {...repeat(nudge(d))}
            className={cn(
              'touch-none select-none rounded-xl border border-line bg-card font-bold tabular-nums text-slate-100 transition hover:border-sky-500/50 active:bg-sky-950',
              mobile ? 'min-h-11 py-1.5 text-[14px]' : 'py-2 text-[16px]',
              focusRing,
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** 常用溫度：一鍵跳過去（冷凝 40–45°C 是錄音07 老闆說的範圍） */
const QUICK: { t: number; label: string }[] = [
  { t: -30, label: '−30' },
  { t: -20, label: '−20' },
  { t: -10, label: '−10' },
  { t: 0, label: '0' },
  { t: 40, label: '冷凝 40' },
  { t: 45, label: '冷凝 45' },
]

/** 網頁版 Ref Tools「冷媒尺」：選冷媒，滑動尺或直接輸入壓力／溫度；下面是冷媒資料 */
export function RefSlider({ mobile = false }: { mobile?: boolean }) {
  const [stickyId, setId] = useStickyState<RefrigerantId>('refslider:id', 'R22')
  const id: RefrigerantId = stickyId in REFRIGERANTS ? stickyId : 'R22'
  const [temp, setTemp] = useStickyState('refslider:temp', 40.417)
  const [unit, setUnit] = useStickyState<Unit>('refslider:unit', 'psig')
  const [abs, setAbs] = useStickyState('refslider:abs', false)
  const [curveSel, setCurve] = useStickyState<Curve>('refslider:curve', 'dew')
  const [editing, setEditing] = useState<{ field: 'p' | 't'; text: string } | null>(null)
  const blend = isBlend(id)
  const curve: Curve = blend ? curveSel : 'dew'
  const info = REFRIGERANTS[id].info

  const t = clampT(typeof temp === 'number' ? temp : 40.417)
  // 跳到某個溫度時用 0.3 秒滑過去，看得出尺往哪邊走；手動拖曳會中斷動畫
  const tween = useRef(0)
  useEffect(() => () => cancelAnimationFrame(tween.current), [])
  const setTempNow = (v: number) => {
    cancelAnimationFrame(tween.current)
    setTemp(v)
  }
  const jumpTo = (target: number) => {
    cancelAnimationFrame(tween.current)
    const from = t
    const start = performance.now()
    const step = (now: number) => {
      const k = Math.min((now - start) / 300, 1)
      setTemp(from + (target - from) * (1 - (1 - k) ** 3))
      if (k < 1) tween.current = requestAnimationFrame(step)
    }
    tween.current = requestAnimationFrame(step)
  }
  const pAbs = pressureAt(id, t, curve)
  const pShown = (abs ? pAbs : pAbs - ATM) * UNIT_PER_BAR[unit]
  const setPressure = (v: number) => setTempNow(clampT(temperatureAt(id, v / UNIT_PER_BAR[unit] + (abs ? 0 : ATM), curve)))

  const s = mobile
    ? { small: 'text-[13px]', value: 'text-[24px]', chip: 'px-3 py-1.5 text-[14px]', card: 'p-3' }
    : { small: 'text-[17px]', value: 'text-[40px]', chip: 'px-4 py-1.5 text-[19px]', card: 'px-5 py-3' }

  const valueCard = (field: 'p' | 't', value: number, unitText: string, tone: string) => (
    <label className={cn('block rounded-2xl', s.card, tone)}>
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        value={editing?.field === field ? editing.text : fmt(value)}
        aria-label={field === 'p' ? `壓力（${unitText}）` : '飽和溫度（°C）'}
        onFocus={(e) => {
          setEditing({ field, text: fmt(value) })
          e.currentTarget.select()
        }}
        onChange={(e) => {
          const text = e.target.value
          setEditing({ field, text })
          const n = Number(text)
          if (text.trim() === '' || !Number.isFinite(n)) return
          if (field === 'p') setPressure(n)
          else setTempNow(clampT(n))
        }}
        onBlur={() => setEditing(null)}
        className={cn('w-full min-w-0 bg-transparent text-right font-black tabular-nums text-white outline-none', s.value)}
      />
      <span className={cn('block text-right font-semibold text-slate-300', s.small)}>{unitText}</span>
    </label>
  )

  const infoRows: [string, string, string?][] = [
    ['安全類別', info.safety === 'A2L' ? 'A2L（微燃）' : info.safety],
    ['全球暖化潛勢 GWP（AR4）', String(info.gwp)],
    ['臭氧層破壞潛勢 ODP', String(info.odp)],
    ['臨界溫度', info.tcrit !== null ? `${fmt(info.tcrit)} °C` : '—'],
    ['沸點（錶壓 0）', `${fmt(info.nbp)} °C`],
    ['鋼瓶／標籤顏色', info.colorName ?? '—', info.color ?? undefined],
  ]

  return (
    <div className={cn('grid min-h-0', mobile ? 'grid-cols-[150px_minmax(0,1fr)] gap-3' : 'h-full grid-cols-[280px_minmax(0,1fr)] gap-6')}>
      <div className={mobile ? 'h-[460px]' : 'min-h-0'}>
        <Ruler id={id} curve={curve} unit={unit} abs={abs} temp={t} onTemp={setTempNow} onJump={jumpTo} mobile={mobile} />
      </div>

      <div className={cn('flex min-w-0 flex-col', mobile ? 'gap-2.5' : 'gap-3.5')}>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="選冷媒">
          {IDS.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={id === r}
              onClick={() => setId(r)}
              className={cn('rounded-full font-bold transition', s.chip, id === r ? 'bg-sky-400 text-paper' : 'border border-line bg-card text-slate-200 hover:border-sky-500/50', focusRing)}
            >
              {r}
            </button>
          ))}
        </div>
        <p className={cn('text-slate-400', s.small)}>{REFRIGERANTS[id].use}</p>

        <div className={cn('flex flex-wrap items-center', mobile ? 'gap-2' : 'gap-3')}>
          <Segmented size={mobile ? 'sm' : 'md'} value={abs ? 'abs' : 'gauge'} onChange={(v) => setAbs(v === 'abs')} options={[{ value: 'gauge', label: '錶壓' }, { value: 'abs', label: '絕對壓力' }]} />
          <Segmented size={mobile ? 'sm' : 'md'} value={unit} onChange={setUnit} options={[{ value: 'psig', label: 'psi' }, { value: 'kg', label: '公斤' }, { value: 'bar', label: 'bar' }]} />
          {blend && <Segmented size={mobile ? 'sm' : 'md'} value={curve} onChange={setCurve} options={[{ value: 'dew', label: '露點' }, { value: 'bubble', label: '泡點' }]} />}
        </div>

        <div className={cn('grid', mobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-3')}>
          {valueCard('p', pShown, unitLabel(unit, abs), 'border border-red-500/35 bg-red-950')}
          {valueCard('t', t, blend ? `°C（${curve === 'dew' ? '露點' : '泡點'}）` : '°C', 'border border-sky-500/35 bg-sky-950')}
        </div>
        {!abs && pShown < 0 && <p className={cn('text-amber-200', s.small)}>錶壓是負的＝真空（低於 1 大氣壓）</p>}

        <div className={cn('flex flex-wrap items-center', mobile ? 'gap-1.5' : 'gap-2')} role="group" aria-label="跳到常用溫度">
          <span className={cn('font-semibold text-slate-400', s.small)}>跳到（°C）</span>
          {QUICK.map((q) => (
            <button
              key={q.t}
              type="button"
              onClick={() => jumpTo(q.t)}
              aria-pressed={Math.abs(t - q.t) < 0.005}
              className={cn(
                'rounded-full font-semibold tabular-nums transition',
                mobile ? 'px-2.5 py-1 text-[13px]' : 'px-3.5 py-1 text-[17px]',
                Math.abs(t - q.t) < 0.005 ? 'border border-sky-500 bg-sky-950 text-sky-200' : 'border border-line bg-card text-slate-200 hover:border-sky-500/50',
                focusRing,
              )}
            >
              {q.label}
            </button>
          ))}
        </div>

        <dl className={cn('rounded-2xl border border-line bg-card', mobile ? 'p-3 text-[13px]' : 'px-5 py-3 text-[17px]')}>
          {infoRows.map(([k, v, color]) => (
            <div key={k} className="flex items-center justify-between gap-3 py-0.5">
              <dt className="text-slate-300">{k}</dt>
              <dd className="flex items-center gap-2 font-semibold tabular-nums text-white">
                {v}
                {color && <span className="size-4 rounded-full" style={{ background: color }} aria-hidden />}
              </dd>
            </div>
          ))}
        </dl>

        <div className={cn('flex flex-wrap items-center gap-3', !mobile && 'mt-auto')}>
          <button
            type="button"
            onClick={() => {
              setId('R22')
              setUnit('psig')
              setAbs(false)
              setTempNow(temperatureAt('R22', 210 / PSI_PER_BAR + ATM))
            }}
            className={cn('flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-950 font-semibold text-sky-200 transition hover:border-sky-500', s.chip, focusRing)}
          >
            <RotateCcw className="size-4" aria-hidden />
            預設
          </button>
          <p className={cn('min-w-0 flex-1 text-slate-500', mobile ? 'text-[12px]' : 'text-[16px]')}>
            CoolProp 計算（與 NIST 交叉比對）；混合冷媒預設露點，跟 Ref Tools 相同。R438A、R408A 請用 App。
          </p>
        </div>
      </div>
    </div>
  )
}
