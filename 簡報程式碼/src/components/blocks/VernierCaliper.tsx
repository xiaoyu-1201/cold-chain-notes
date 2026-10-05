import { Camera, CheckCircle2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, GraduationCap, RotateCcw, XCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import caliperPhoto from '../../assets/1005-caliper.jpg'
import { cn } from '../../lib/cn'
import { Lightbox } from '../ui/Lightbox'
import { Segmented } from '../ui/Segmented'

/**
 * 互動游標卡尺（照 0.05 mm 的實物畫：主尺 1 mm、游尺 20 格 39 mm；下排英制 1/16″、游尺 1/128″）
 * 量外徑：銅管夾在下面的大量爪；量內徑：上面的小量爪伸進接頭。拖游尺、按微調鍵、點尺寸一鍵夾住。
 * 座標單位是 mm：x＝離固定量爪的距離，y 往下。
 */

const FEN = 3.175
const MAX = 150
const VERNIER_STEP = 1.95 // 游尺每格 1.95 mm（20 格＝39 mm，讀到 0.05 mm）
const INCH_V_STEP = (25.4 * 7) / 128 // 英制游尺每格 7/128″（8 格，讀到 1/128″）
const SIZES = [
  { fen: '2分', mm: 6.35 },
  { fen: '2分半', mm: 7.94 },
  { fen: '3分', mm: 9.52 },
  { fen: '4分', mm: 12.7 },
  { fen: '5分', mm: 15.88 },
  { fen: '6分', mm: 19.05 },
  { fen: '7分', mm: 22.22 },
  { fen: '1吋1分', mm: 28.58 },
  { fen: '1吋3分', mm: 34.92 },
]
type Mode = 'od' | 'id'
const snap = (v: number) => Math.round(Math.min(MAX, Math.max(0, v)) / 0.05) * 0.05
const fmt = (v: number) => v.toFixed(2)

/** 讀數拆解：主尺整數 mm＋游尺第幾條對齊 */
function reading(d: number) {
  const main = Math.floor(d + 1e-6)
  const k = Math.round((d - main) / 0.05)
  const sixteenths = Math.round(d / (25.4 / 16))
  const near = SIZES.reduce((a, b) => (Math.abs(b.mm - d) < Math.abs(a.mm - d) ? b : a))
  return { main, k, frac: k * 0.05, sixteenths, near: Math.abs(near.mm - d) < 0.3 ? near : null }
}

/** 幾個 1/16 吋 → 店裡講法（2分半、1吋3分） */
function fenName(sixteenths: number) {
  const inch = Math.floor(sixteenths / 16)
  const half = sixteenths % 16 // 半分為單位
  const fen = Math.floor(half / 2)
  const part = half % 2 ? (fen ? `分半` : '半分') : fen ? `分` : ''
  return (inch ? `吋` : '') + part || '0分'
}

/* ─────────── 卡尺本體（SVG） ─────────── */
// 照 10/5 拍的實物排：主尺上緣＝英制（1/16″，刻度往下長）、下緣＝公制（mm，刻度往上長）；
// 滑座上片＝英制游尺（1/128″）、下片＝公制游尺（0.05 mm）；固定螺絲在上、滾輪在下
const BEAM_END = 175
function Ticks({ d, hl }: { d: number; hl: boolean }) {
  const r = reading(d)
  const out: ReactNode[] = []
  for (let x = 0; x <= BEAM_END - 4; x++) {
    const len = x % 10 === 0 ? 4.6 : x % 5 === 0 ? 3.4 : 2.2
    const on = hl && (x === r.main || x === r.main + 2 * r.k)
    out.push(<line key={`m${x}`} x1={x} y1={18} x2={x} y2={18 - len} stroke={on ? (x === r.main + 2 * r.k && r.k ? '#f59e0b' : '#0284c7') : '#111827'} strokeWidth={on ? 0.42 : 0.16} />)
    if (x % 10 === 0 && x <= MAX)
      out.push(
        <text key={`n${x}`} x={x} y={12.2} fontSize={2.5} textAnchor="middle" fill="#1f2937" fontWeight={600}>
          {x}
        </text>,
      )
  }
  for (let i = 0; (i * 25.4) / 16 <= BEAM_END - 4; i++) {
    const x = (i * 25.4) / 16
    const len = i % 16 === 0 ? 4.4 : i % 8 === 0 ? 3.6 : i % 4 === 0 ? 3.0 : i % 2 === 0 ? 2.4 : 1.5
    const on = hl && i === r.sixteenths
    out.push(<line key={`i${i}`} x1={x} y1={0} x2={x} y2={len} stroke={on ? '#f59e0b' : '#111827'} strokeWidth={on ? 0.42 : 0.15} />)
    if (i % 16 === 0 && i > 0 && i <= 96)
      out.push(
        <text key={`in${i}`} x={x} y={7.3} fontSize={2.3} textAnchor="middle" fill="#1f2937" fontWeight={600}>
          {i / 16}
        </text>,
      )
  }
  return <g>{out}</g>
}

function Caliper({ d, mode, objectMm, hl, uid }: { d: number; mode: Mode; objectMm: number | null; hl: boolean; uid: string }) {
  const r = reading(d)
  const steel = `url(#${uid}-steel)`
  const plate = `url(#${uid}-plate)`
  const jaw = `url(#${uid}-jaw)`
  const cu = `url(#${uid}-cu)`
  const W = 52 // 滑座長度
  const vernier: ReactNode[] = []
  for (let k = 0; k <= 20; k++) {
    const x = d + k * VERNIER_STEP
    const on = hl && k === r.k && r.k > 0
    const zero = hl && k === 0
    vernier.push(<line key={k} x1={x} y1={18} x2={x} y2={18 + (k % 2 === 0 ? 2.2 : 1.5)} stroke={on ? '#f59e0b' : zero ? '#0284c7' : '#111827'} strokeWidth={on || zero ? 0.42 : 0.15} />)
    if (k % 2 === 0)
      vernier.push(
        <text key={`t${k}`} x={x} y={21.9} fontSize={1.5} textAnchor="middle" fill="#1f2937">
          {k / 2}
        </text>,
      )
  }
  const inchV: ReactNode[] = []
  for (let k = 0; k <= 8; k++) {
    const x = d + k * INCH_V_STEP
    inchV.push(<line key={k} x1={x} y1={0} x2={x} y2={k % 4 === 0 ? -2.1 : -1.4} stroke="#111827" strokeWidth={0.15} />)
    if (k % 4 === 0)
      inchV.push(
        <text key={`t${k}`} x={x} y={-2.6} fontSize={1.4} textAnchor="middle" fill="#1f2937">
          {k}
        </text>,
      )
  }
  const knurl = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2
    return <line key={i} x1={d + 46 + Math.cos(a) * 2.2} y1={25.4 + Math.sin(a) * 2.2} x2={d + 46 + Math.cos(a) * 3.4} y2={25.4 + Math.sin(a) * 3.4} stroke="#4b5563" strokeWidth={0.35} />
  })
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3f4f6" />
          <stop offset="0.45" stopColor="#d1d5db" />
          <stop offset="0.55" stopColor="#c4c9d1" />
          <stop offset="1" stopColor="#e5e7eb" />
        </linearGradient>
        <linearGradient id={`${uid}-plate`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2e6ec" />
          <stop offset="1" stopColor="#b6bec9" />
        </linearGradient>
        <linearGradient id={`${uid}-jaw`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#aeb6c1" />
          <stop offset="0.5" stopColor="#e5e7eb" />
          <stop offset="1" stopColor="#9aa3af" />
        </linearGradient>
        <linearGradient id={`${uid}-cu`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0b48a" />
          <stop offset="0.5" stopColor="#c27a4a" />
          <stop offset="1" stopColor="#8a4b25" />
        </linearGradient>
        <pattern id={`${uid}-brush`} width="6" height="0.6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0.3" x2="6" y2="0.3" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="0.12" />
        </pattern>
      </defs>
      {/* 影子 */}
      <path d="M-18,19 L-8,49 L0,53 L0,19 Z" fill="#000" opacity="0.18" transform="translate(1.2,1.2)" />
      <rect x={-24} y={0} width={BEAM_END + 24} height={18} rx={0.8} fill="#000" opacity="0.18" transform="translate(1.2,1.2)" />
      {/* 深度桿（跟著游尺伸出主尺尾端） */}
      <rect x={BEAM_END} y={8.4} width={Math.min(d, 40)} height={1.2} fill={steel} stroke="#6b7280" strokeWidth={0.12} />
      {/* 固定量爪：下（外徑）、上（內徑） */}
      <path d="M0,18 L0,52 L-1.5,52 L-8,48 L-18,18 Z" fill={jaw} stroke="#6b7280" strokeWidth={0.2} />
      <path d="M-12,0 L-2,0 L6,-10 L6,-14 L4.5,-15.2 L3,-14 L3,-9 Z" fill={jaw} stroke="#6b7280" strokeWidth={0.2} />
      {/* 主尺 */}
      <rect x={-24} y={0} width={BEAM_END + 24} height={18} rx={0.8} fill={steel} stroke="#6b7280" strokeWidth={0.2} />
      <rect x={-24} y={0} width={BEAM_END + 24} height={18} rx={0.8} fill={`url(#${uid}-brush)`} />
      <text x={157} y={7.3} fontSize={1.9} fill="#374151">
        in.
      </text>
      <text x={157} y={12.2} fontSize={1.9} fill="#374151">
        mm
      </text>
      <text x={163.5} y={8.4} fontSize={1.3} fill="#374151" letterSpacing={0.15}>
        STAINLESS
      </text>
      <text x={163.5} y={10.4} fontSize={1.3} fill="#374151" letterSpacing={0.15}>
        HARDENED
      </text>
      {[2.6, 15.4].map((y) => (
        <g key={y}>
          <circle cx={172.6} cy={y} r={0.9} fill="#9ca3af" stroke="#4b5563" strokeWidth={0.15} />
          <line x1={172} y1={y - 0.5} x2={173.2} y2={y + 0.5} stroke="#374151" strokeWidth={0.2} />
        </g>
      ))}
      <Ticks d={d} hl={hl} />
      {/* 要量的東西：銅管（端面）或接頭（剖面） */}
      {objectMm !== null && mode === 'od' && (
        <g>
          <circle cx={objectMm / 2} cy={36} r={objectMm / 2} fill={cu} stroke="#7c3f1d" strokeWidth={0.2} />
          <circle cx={objectMm / 2} cy={36} r={Math.max(objectMm / 2 - 0.8, 0.5)} fill="#1f2937" />
          <circle cx={objectMm / 2 - objectMm * 0.12} cy={36 - objectMm * 0.14} r={Math.max(objectMm / 2 - 0.8, 0.5) * 0.35} fill="#ffffff" opacity="0.06" />
        </g>
      )}
      {objectMm !== null && mode === 'id' && (
        <g>
          <rect x={3} y={-17} width={objectMm} height={12} fill="#c27a4a" opacity="0.18" />
          <rect x={0.8} y={-17} width={2.2} height={12} fill={cu} stroke="#7c3f1d" strokeWidth={0.15} />
          <rect x={3 + objectMm} y={-17} width={2.2} height={12} fill={cu} stroke="#7c3f1d" strokeWidth={0.15} />
        </g>
      )}
      {/* 游尺（滑座）＋可動量爪：上片、下片包住主尺，中間看得到主尺 */}
      <g>
        <path d={`M${d + 7},-4.5 L${d - 3},-4.5 L${d},-10 L${d},-14 L${d + 1.5},-15.2 L${d + 3},-14 L${d + 3},-9 Z`} fill={jaw} stroke="#6b7280" strokeWidth={0.2} opacity={0.96} />
        <path d={`M${d},22.5 L${d + 18},22.5 L${d + 8},48 L${d + 1.5},52 L${d},52 Z`} fill={jaw} stroke="#6b7280" strokeWidth={0.2} />
        <rect x={d - 3} y={-0.1} width={1.5} height={18.2} fill={plate} stroke="#6b7280" strokeWidth={0.15} />
        <rect x={d - 3} y={-4.5} width={W} height={4.5} rx={0.4} fill={plate} stroke="#6b7280" strokeWidth={0.2} />
        <rect x={d - 3} y={18} width={W} height={4.5} rx={0.4} fill={plate} stroke="#6b7280" strokeWidth={0.2} />
        <line x1={d - 1.5} y1={0.15} x2={d + W - 3} y2={0.15} stroke="#000" strokeOpacity={0.18} strokeWidth={0.3} />
        {vernier}
        {inchV}
        <text x={d + 13.5} y={-1.3} fontSize={1.4} fill="#374151">
          1/128 in.
        </text>
        <text x={d + 40.6} y={21.6} fontSize={1.4} fill="#374151">
          0.05mm
        </text>
        {/* 固定螺絲（上）、滾輪（下） */}
        <rect x={d + 22.5} y={-8.3} width={5} height={3.8} rx={1} fill="#9ca3af" stroke="#4b5563" strokeWidth={0.2} />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={d + 23.3 + i * 0.85} y1={-8.1} x2={d + 23.3 + i * 0.85} y2={-4.7} stroke="#4b5563" strokeWidth={0.18} />
        ))}
        <circle cx={d + 46} cy={25.4} r={3.4} fill="#cbd5e1" stroke="#4b5563" strokeWidth={0.25} />
        {knurl}
        <circle cx={d + 46} cy={25.4} r={1.1} fill="#9ca3af" />
      </g>
    </g>
  )
}

/* ─────────── 互動外殼 ─────────── */
function useHold(fn: () => void) {
  const timer = useRef<number | undefined>(undefined)
  const stop = useCallback(() => {
    window.clearTimeout(timer.current)
    window.clearInterval(timer.current)
  }, [])
  const start = useCallback(() => {
    fn()
    stop()
    timer.current = window.setTimeout(() => (timer.current = window.setInterval(fn, 60)), 380)
  }, [fn, stop])
  useEffect(() => stop, [stop])
  return { onPointerDown: start, onPointerUp: stop, onPointerLeave: stop, onPointerCancel: stop }
}

export function VernierCaliper({ mobile = false }: { mobile?: boolean }) {
  const [d, setD] = useState(9.5)
  const [mode, setMode] = useState<Mode>('od')
  const [obj, setObj] = useState<number | null>(9.52)
  const [quiz, setQuiz] = useState<{ answer: string; picked: string | null } | null>(null)
  const [photo, setPhoto] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ x0: number; d0: number } | null>(null)
  const anim = useRef(0)
  const dRef = useRef(d)
  dRef.current = d

  // 有東西夾著：外徑不能夾得比管子小、內徑不能撐得比接頭大
  const limit = useCallback((v: number) => {
    let x = snap(v)
    if (obj !== null && mode === 'od') x = Math.max(x, snap(obj))
    if (obj !== null && mode === 'id') x = Math.min(x, snap(obj))
    return x
  }, [obj, mode])
  const fallback = useRef<number | undefined>(undefined)
  const stopAnim = useCallback(() => {
    cancelAnimationFrame(anim.current)
    window.clearTimeout(fallback.current)
  }, [])
  /** 量爪滑過去（背景分頁 rAF 不跑時，最後由 timeout 補上終點） */
  const animateTo = useCallback((target: number, from = dRef.current) => {
    stopAnim()
    const t0 = performance.now()
    const step = () => {
      const k = Math.min((performance.now() - t0) / 450, 1)
      const e = 1 - (1 - k) ** 3
      setD(snap(from + (target - from) * e))
      if (k < 1) anim.current = requestAnimationFrame(step)
    }
    setD(from)
    anim.current = requestAnimationFrame(step)
    fallback.current = window.setTimeout(() => {
      cancelAnimationFrame(anim.current)
      setD(target)
    }, 600)
  }, [stopAnim])
  useEffect(() => stopAnim, [stopAnim])
  const toSvgX = (clientX: number) => {
    const svg = svgRef.current
    const m = svg?.getScreenCTM()
    if (!svg || !m) return 0
    const p = svg.createSVGPoint()
    p.x = clientX
    return p.matrixTransform(m.inverse()).x
  }
  const onDown = (e: ReactPointerEvent<SVGGElement>) => {
    stopAnim()
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    drag.current = { x0: toSvgX(e.clientX), d0: dRef.current }
  }
  const onMove = (e: ReactPointerEvent<SVGGElement>) => {
    if (!drag.current) return
    setD(limit(drag.current.d0 + toSvgX(e.clientX) - drag.current.x0))
  }
  const onUp = () => (drag.current = null)

  const nudge = (s: number) => () => {
    stopAnim()
    setD((v) => limit(v + s))
  }
  const hold = { m1: useHold(nudge(-1)), m005: useHold(nudge(-0.05)), p005: useHold(nudge(0.05)), p1: useHold(nudge(1)) }

  const place = (mm: number) => {
    setObj(mm)
    // 外徑：先張開再夾上；內徑：從合起來撐開
    animateTo(snap(mm), mode === 'od' ? Math.max(dRef.current, snap(mm + 4)) : 0)
  }
  const switchMode = (m: Mode) => {
    setMode(m)
    setQuiz(null)
    setObj(null)
  }
  const newQuiz = () => {
    const pick = SIZES[Math.floor(Math.random() * 7)]
    const m: Mode = Math.random() < 0.5 ? 'od' : 'id'
    setMode(m)
    setQuiz({ answer: pick.fen, picked: null })
    setObj(pick.mm)
    animateTo(snap(pick.mm), m === 'od' ? snap(pick.mm + 5) : 0)
  }

  const r = reading(d)
  const hidden = quiz !== null && quiz.picked === null
  const uid = mobile ? 'vcm' : 'vcd'
  const view = mobile ? '-22 -18 80 74' : '-27 -19 230 76'
  const t = mobile
    ? { h: 'text-[16px]', body: 'text-[14px]', small: 'text-[13px]', big: 'text-[34px]', chip: 'px-3 py-1.5 text-[14px]', btn: 'size-11' }
    : { h: 'text-[21px]', body: 'text-[18px]', small: 'text-[16px]', big: 'text-[46px]', chip: 'px-3.5 py-1.5 text-[17px]', btn: 'size-12' }
  const chip = (on: boolean) => cn('rounded-full font-semibold transition', t.chip, on ? 'bg-sky-400 text-navy-950' : 'bg-white/[0.08] text-slate-100 hover:bg-white/[0.15]')
  const btn = cn('grid place-items-center rounded-full bg-white/[0.1] text-slate-100 transition hover:bg-white/[0.18] active:scale-95', t.btn)

  const steps = [
    <>主尺：游尺的 <b className="text-sky-300">0</b> 在 {r.main} 和 {r.main + 1} mm 中間 → <b className="text-white">{r.main} mm</b></>,
    <>游尺：{r.k % 2 ? ` 和  中間那條` : ` 那條`}跟主尺對齊（<span className="text-amber-300">橘色</span>）→ <b className="text-white">＋{fmt(r.frac)} mm</b></>,
    <>加起來：{r.main} ＋ {fmt(r.frac)} ＝ <b className="text-white">{fmt(d)} mm</b>；÷ 3.175 ≈ {(d / FEN).toFixed(2)} 分</>,
    <>英制那排（老闆教的）：游尺 0 對到 {r.sixteenths}/16″ ＝ <b className="text-white">{fenName(r.sixteenths)}</b>（長的刻度是雙數）</>,
  ]

  return (
    <div className={cn('flex min-h-0 flex-col', mobile ? 'gap-3' : 'h-full gap-4')}>
      {/* 卡尺 */}
      <div className={cn('relative min-h-0 overflow-hidden rounded-[20px] bg-[radial-gradient(ellipse_at_center,rgba(148,163,184,0.18),transparent_75%)]', mobile ? 'h-[300px]' : 'flex-1')} onTouchStart={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()}>
        <svg ref={svgRef} viewBox={view} className="size-full touch-none select-none" role="img" aria-label={`游標卡尺，目前讀數 ${fmt(d)} mm`}>
          <g onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} className="cursor-ew-resize">
            <Caliper d={d} mode={mode} objectMm={obj} hl={!hidden} uid={uid} />
          </g>
        </svg>
        <p className={cn('pointer-events-none absolute left-4 top-3 rounded-full bg-black/45 px-3 py-1 text-slate-200', t.small)}>拖游尺（滾輪那塊）左右移；下面有微調鍵</p>
        <button type="button" onClick={() => setPhoto(true)} className={cn('absolute right-4 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 font-semibold text-slate-100 hover:bg-black/60', t.small)}>
          <Camera className="size-4" aria-hidden />
          看真的卡尺照片
        </button>
      </div>

      {/* 操作＋讀法 */}
      <div className={cn('grid min-h-0', mobile ? 'gap-3' : 'h-[296px] shrink-0 grid-cols-[minmax(0,0.95fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-4')}>
        <section className="flex flex-col gap-2.5 rounded-[20px] bg-white/[0.045] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Segmented size={mobile ? 'sm' : 'md'} value={mode} onChange={switchMode} options={[{ value: 'od', label: '銅管：量外徑' }, { value: 'id', label: '接頭：量內徑' }]} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SIZES.map((s) => (
              <button key={s.fen} type="button" onClick={() => (setQuiz(null), place(s.mm))} className={chip(!quiz && obj === s.mm)}>
                {s.fen}
              </button>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              <button type="button" aria-label="少 1 mm（按住連續）" className={btn} {...hold.m1}>
                <ChevronsLeft className="size-5" aria-hidden />
              </button>
              <button type="button" aria-label="少 0.05 mm（按住連續）" className={btn} {...hold.m005}>
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button type="button" aria-label="多 0.05 mm（按住連續）" className={btn} {...hold.p005}>
                <ChevronRight className="size-5" aria-hidden />
              </button>
              <button type="button" aria-label="多 1 mm（按住連續）" className={btn} {...hold.p1}>
                <ChevronsRight className="size-5" aria-hidden />
              </button>
            </div>
            <button type="button" onClick={() => (setQuiz(null), setObj(null), animateTo(0))} className={cn('flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1.5 font-semibold text-slate-200 hover:bg-white/[0.15]', t.small)}>
              <RotateCcw className="size-4" aria-hidden />
              歸零
            </button>
          </div>
          <p className={cn('text-slate-400', t.small)}>{mode === 'od' ? '銅管夾在下面的大量爪。管壁：2～5分 0.8 mm（21 番）、6分以上 1.0 mm（19 番）。' : '接頭、彎頭是銅管插在裡面，所以用上面的小量爪伸進去、往外撐。'}</p>
        </section>

        <section className="flex min-h-0 flex-col gap-2 rounded-[20px] bg-white/[0.045] p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className={cn('font-bold text-white', t.h)}>放大看公制游尺</p>
            <p className={cn('text-slate-400', t.small)}>
              <span className="text-sky-300">藍色</span>＝游尺的 0；<span className="text-amber-300">橘色</span>＝對齊的那一條
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-slate-200/[0.06]">
            <svg viewBox={`${d - 6} 8.2 ${mobile ? 40 : 50} 14.8`} className={cn('w-full', mobile ? 'h-[150px]' : 'h-full')} aria-hidden>
              <Caliper d={d} mode={mode} objectMm={null} hl={!hidden} uid={`${uid}z`} />
            </svg>
          </div>
        </section>

        <section className="flex min-h-0 flex-col gap-2 rounded-[20px] bg-white/[0.045] p-4">
          <div className="flex items-center justify-between gap-2">
            <p className={cn('font-bold text-white', t.h)}>{quiz ? '考考我：這是幾分？' : '讀數'}</p>
            <button type="button" onClick={newQuiz} className={cn('flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1.5 font-bold text-navy-950 hover:bg-amber-300', t.small)}>
              <GraduationCap className="size-4" aria-hidden />
              {quiz ? '下一題' : '考考我'}
            </button>
          </div>
          {hidden ? (
            <>
              <p className={cn('text-slate-300', t.body)}>先自己讀：看游尺的 0、找對齊的那一條，再換成分。</p>
              <div className="flex flex-wrap gap-1.5">
                {SIZES.slice(0, 7).map((s) => (
                  <button key={s.fen} type="button" onClick={() => setQuiz((q) => (q ? { ...q, picked: s.fen } : q))} className={chip(false)}>
                    {s.fen}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {quiz && (
                <p className={cn('flex items-center gap-2 font-bold', t.body, quiz.picked === quiz.answer ? 'text-emerald-300' : 'text-rose-300')}>
                  {quiz.picked === quiz.answer ? <CheckCircle2 className="size-5" aria-hidden /> : <XCircle className="size-5" aria-hidden />}
                  {quiz.picked === quiz.answer ? '答對了！' : `答案是 ${quiz.answer}`}
                </p>
              )}
              <p className="flex items-baseline gap-3">
                <span className={cn('font-black tabular-nums text-white', t.big)}>{fmt(d)}</span>
                <span className={cn('text-slate-300', t.body)}>mm</span>
                {r.near && <span className={cn('rounded-full bg-sky-400/15 px-3 py-0.5 font-bold text-sky-200', t.body)}>≈ {r.near.fen}（{r.near.mm}）</span>}
              </p>
              <ol className={cn('space-y-1 leading-snug text-slate-300', t.small)}>
                {steps.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold text-slate-500">{'①②③④'[i]}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      </div>
      {photo && <Lightbox src={caliperPhoto} label="10/5 上課拍的游標卡尺（名片已模糊）" onClose={() => setPhoto(false)} />}
    </div>
  )
}
