/** 蒸氣壓縮式冷凍循環示意圖（動態冷媒流向；可選擇開啟點選互動） */
import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactElement, type RefObject } from 'react'
import type { CycleNodeId } from '../../data/cycleNotes'
import { cn } from '../../lib/cn'

function wave(x1: number, x2: number, y: number, amp: number, n: number) {
  const step = (x2 - x1) / n
  let d = `M ${x1} ${y}`
  for (let i = 0; i < n; i++) {
    const cx = x1 + step * (i + 0.5)
    const cy = y + (i % 2 === 0 ? -amp : amp)
    d += ` Q ${cx} ${cy} ${x1 + step * (i + 1)} ${y}`
  }
  return d
}

const COLORS = {
  discharge: '#f87171',
  liquid: '#fbbf24',
  mixture: '#67e8f9',
  suction: '#38bdf8',
}

const PIPE_PATHS: Record<'discharge' | 'liquid' | 'mixture' | 'suction', string> = {
  discharge: 'M 680 222 V 92 H 570',
  liquid: 'M 250 92 H 140 V 250',
  mixture: 'M 140 310 V 468 H 250',
  suction: 'M 570 468 H 680 V 338',
}

const PIPES = [
  { d: PIPE_PATHS.discharge, stroke: COLORS.discharge, width: 10 },
  { d: wave(570, 250, 92, 40, 8), stroke: 'url(#cycle-cond)', width: 6 },
  { d: PIPE_PATHS.liquid, stroke: COLORS.liquid, width: 10 },
  { d: PIPE_PATHS.mixture, stroke: COLORS.mixture, width: 10 },
  { d: wave(250, 570, 468, 40, 8), stroke: 'url(#cycle-evap)', width: 6 },
  { d: PIPE_PATHS.suction, stroke: COLORS.suction, width: 10 },
]

/** 點選熱區（零件外框 + 標籤） */
const PART_HITS: Record<'comp' | 'cond' | 'txv' | 'evap', { label: string; shapes: ReactElement }> = {
  comp: {
    label: '壓縮機',
    shapes: (
      <>
        <circle cx={680} cy={280} r={62} />
        <rect x={466} y={250} width={148} height={60} rx={12} />
      </>
    ),
  },
  cond: {
    label: '冷凝器',
    shapes: <rect x={248} y={44} width={324} height={96} rx={16} />,
  },
  txv: {
    label: '膨脹閥',
    shapes: (
      <>
        <rect x={102} y={242} width={76} height={76} rx={10} />
        <rect x={176} y={250} width={158} height={60} rx={12} />
      </>
    ),
  },
  evap: {
    label: '蒸發器',
    shapes: <rect x={248} y={420} width={324} height={96} rx={16} />,
  },
}

/** 冷凝器、蒸發器的文字標籤點選框（量測前的預設值） */
const LABEL_FALLBACK: Record<'cond' | 'evap', Box> = {
  cond: { x: 330, y: 146, w: 160, h: 48 },
  evap: { x: 330, y: 364, w: 160, h: 48 },
}

const PIPE_LABEL_HITS: Record<'discharge' | 'liquid' | 'mixture' | 'suction', { x: number; y: number; w: number; h: number }> = {
  discharge: { x: 694, y: 126, w: 90, h: 50 },
  liquid: { x: 40, y: 141, w: 90, h: 50 },
  mixture: { x: 40, y: 359, w: 90, h: 50 },
  suction: { x: 694, y: 373, w: 90, h: 50 },
}

type SmallId = 'oub' | 'kp15' | 'receiver' | 'gbc' | 'dml' | 'sgi' | 'evr' | 'tc' | 'acc'

/** 管路上的小零件：點選熱區 */
const SMALL_HITS: Record<SmallId, { label: string; x: number; y: number; w: number; h: number }> = {
  oub: { label: '油分離器', x: 662, y: 162, w: 100, h: 46 },
  kp15: { label: '壓力開關', x: 742, y: 262, w: 74, h: 54 },
  receiver: { label: '儲液器', x: 199, y: 60, w: 44, h: 46 },
  gbc: { label: '手閥', x: 156, y: 60, w: 34, h: 46 },
  dml: { label: '乾燥過濾器', x: 126, y: 108, w: 98, h: 34 },
  sgi: { label: '視液鏡', x: 126, y: 148, w: 78, h: 26 },
  evr: { label: '電磁閥', x: 120, y: 184, w: 84, h: 32 },
  tc: { label: '溫控器', x: 30, y: 194, w: 88, h: 32 },
  acc: { label: '液氣分離器', x: 660, y: 398, w: 110, h: 50 },
}

function SmallLabel({ x, y, text, anchor = 'start' }: { x: number; y: number; text: string; anchor?: 'start' | 'middle' }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={13} fontWeight={700} className="fill-slate-200">
      {text}
    </text>
  )
}

/** 小零件圖示（依錄音提到的零件） */
function SmallParts() {
  return (
    <g>
      {/* 每個 data-hit 群組會被量測，用來畫置中的點選虛線框 */}
      {/* 油分離器：排氣管上 */}
      <g data-hit="oub">
        <rect x={670} y={168} width={20} height={34} rx={8} fill="#1f2937" stroke="#f87171" strokeWidth={2.5} />
        <SmallLabel x={698} y={190} text="油分離器" />
      </g>
      {/* 壓力開關：接壓縮機 */}
      <line x1={738} y1={280} x2={754} y2={280} stroke="#c4b5fd" strokeWidth={2} strokeDasharray="3 3" />
      <g data-hit="kp15">
        <rect x={754} y={268} width={44} height={24} rx={5} fill="#1e1b4b" stroke="#c4b5fd" strokeWidth={2} />
        <text x={776} y={285} textAnchor="middle" fontSize={12} fontWeight={800} className="fill-violet-200">
          KP
        </text>
        <SmallLabel x={776} y={309} text="壓力開關" anchor="middle" />
      </g>
      {/* 儲液器、手閥：液管水平段 */}
      <g data-hit="receiver">
        <rect x={204} y={83} width={34} height={18} rx={8} fill="#1f2937" stroke="#fbbf24" strokeWidth={2.5} />
        <SmallLabel x={221} y={74} text="儲液器" anchor="middle" />
      </g>
      <g data-hit="gbc">
        <polygon points="164,85 172,92 164,99" fill="#1f2937" stroke="#fbbf24" strokeWidth={2} strokeLinejoin="round" />
        <polygon points="180,85 172,92 180,99" fill="#1f2937" stroke="#fbbf24" strokeWidth={2} strokeLinejoin="round" />
        <line x1={172} y1={92} x2={172} y2={81} stroke="#fbbf24" strokeWidth={2} />
        <SmallLabel x={172} y={74} text="手閥" anchor="middle" />
      </g>
      {/* 乾燥過濾器、視液鏡、電磁閥：液管垂直段 */}
      <g data-hit="dml">
        <rect x={132} y={110} width={16} height={30} rx={6} fill="#1f2937" stroke="#fbbf24" strokeWidth={2.5} />
        <SmallLabel x={156} y={130} text="乾燥過濾器" />
      </g>
      <g data-hit="sgi">
        <circle cx={140} cy={161} r={9} fill="#0f172a" stroke="#fbbf24" strokeWidth={2.5} />
        <circle cx={140} cy={161} r={4} fill="#fde68a" fillOpacity={0.7} />
        <SmallLabel x={156} y={166} text="視液鏡" />
      </g>
      <g data-hit="evr">
        <rect x={134} y={186} width={12} height={8} rx={2} fill="#64748b" />
        <rect x={131} y={194} width={18} height={18} rx={3} fill="#1f2937" stroke="#fbbf24" strokeWidth={2.5} />
        <SmallLabel x={156} y={208} text="電磁閥" />
      </g>
      {/* 溫控器：控制電磁閥與壓縮機 */}
      <line x1={114} y1={210} x2={130} y2={204} stroke="#c4b5fd" strokeWidth={2} strokeDasharray="3 3" />
      <g data-hit="tc">
        <rect x={34} y={198} width={80} height={24} rx={6} fill="#1e1b4b" stroke="#c4b5fd" strokeWidth={2} />
        <text x={74} y={215} textAnchor="middle" fontSize={13} fontWeight={800} className="fill-violet-200">
          溫控器
        </text>
      </g>
      {/* 液氣分離器：吸氣管上 */}
      <g data-hit="acc">
        <rect x={667} y={402} width={26} height={38} rx={9} fill="#1f2937" stroke="#38bdf8" strokeWidth={2.5} />
        <SmallLabel x={700} y={426} text="液氣分離器" />
      </g>
    </g>
  )
}

function Arrow({ x, y, rotate, color }: { x: number; y: number; rotate: number; color: string }) {
  return <polygon points="-8,-7 8,0 -8,7" transform={`translate(${x} ${y}) rotate(${rotate})`} fill={color} />
}

function HeatArrow({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g stroke={color} strokeWidth={3} fill="none" strokeLinecap="round">
      <path d={`M ${x} ${y} q -7 -8 0 -16 q 7 -8 0 -16`} />
      <polyline points={`${x - 6},${y - 26} ${x},${y - 34} ${x + 6},${y - 26}`} />
    </g>
  )
}

function Label({ x, y, title, sub, hit }: { x: number; y: number; title: string; sub: string; hit?: string }) {
  return (
    <g data-hit={hit}>
      <text x={x} y={y} textAnchor="middle" fontSize={21} fontWeight={800} className="fill-slate-50">
        {title}
      </text>
      <text x={x} y={y + 22} textAnchor="middle" fontSize={14} className="fill-slate-400 font-mono" letterSpacing={1.5}>
        {sub}
      </text>
    </g>
  )
}

type Box = { x: number; y: number; w: number; h: number }

/** 量測各 data-hit 群組的實際外框（不同電腦字型寬度不同），回傳加上留白後的點選框 */
function useHitBoxes(svgRef: RefObject<SVGSVGElement | null>, enabled: boolean) {
  const [boxes, setBoxes] = useState<Record<string, Box>>({})
  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!enabled || !svg) return
    const measure = () => {
      const next: Record<string, Box> = {}
      svg.querySelectorAll<SVGGraphicsElement>('[data-hit]').forEach((el) => {
        const id = el.dataset.hit
        if (!id) return
        const b = el.getBBox()
        const [px, py] = id.endsWith('-label') ? [14, 6] : [7, 5]
        next[id] = { x: b.x - px, y: b.y - py, w: b.width + px * 2, h: b.height + py * 2 }
      })
      setBoxes(next)
    }
    measure()
    let alive = true
    document.fonts?.ready.then(() => alive && measure())
    return () => {
      alive = false
    }
  }, [svgRef, enabled])
  return boxes
}

function StateText({ x, y, lines, anchor, color }: { x: number; y: number; lines: string[]; anchor: 'start' | 'end'; color: string }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={16} fontWeight={700} fill={color}>
      {lines.map((line, i) => (
        <tspan key={line} x={x} dy={i === 0 ? 0 : 20}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

interface CycleDiagramProps {
  className?: string
  /** 開啟後零件與管路可點選 */
  interactive?: boolean
  selected?: CycleNodeId | null
  onSelect?: (id: CycleNodeId) => void
}

export function CycleDiagram({ className, interactive = false, selected = null, onSelect }: CycleDiagramProps) {
  const hitProps = (id: CycleNodeId, label: string) => ({
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': `${label}：查看說明`,
    'aria-pressed': selected === id,
    className: cn('cycle-hit cursor-pointer outline-none', selected !== id && !(id in PIPE_PATHS) && 'cycle-idle'),
    onClick: () => onSelect?.(id),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect?.(id)
      }
    },
  })

  const selectedPipe = selected && selected in PIPE_PATHS ? PIPE_PATHS[selected as keyof typeof PIPE_PATHS] : null
  const svgRef = useRef<SVGSVGElement>(null)
  const boxes = useHitBoxes(svgRef, interactive)

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 820 560"
      className={className}
      role="img"
      aria-label="冷凍循環示意圖：壓縮機 → 冷凝器 → 膨脹閥 → 蒸發器，壓縮機與膨脹閥劃分高低壓側"
    >
      <defs>
        <linearGradient id="cycle-cond" gradientUnits="userSpaceOnUse" x1="570" y1="0" x2="250" y2="0">
          <stop offset="0" stopColor={COLORS.discharge} />
          <stop offset="1" stopColor={COLORS.liquid} />
        </linearGradient>
        <linearGradient id="cycle-evap" gradientUnits="userSpaceOnUse" x1="250" y1="0" x2="570" y2="0">
          <stop offset="0" stopColor={COLORS.mixture} />
          <stop offset="1" stopColor={COLORS.suction} />
        </linearGradient>
        <linearGradient id="cycle-comp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7f1d1d" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0c4a6e" stopOpacity="0.6" />
        </linearGradient>
        <filter id="cycle-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 高低壓分區 */}
      <rect x="0" y="0" width="820" height="280" rx="18" fill="#ef4444" fillOpacity="0.045" />
      <rect x="0" y="280" width="820" height="280" rx="18" fill="#0ea5e9" fillOpacity="0.055" />
      <line x1="16" x2="804" y1="280" y2="280" stroke="#94a3b8" strokeOpacity="0.45" strokeDasharray="6 8" strokeWidth={2} />
      <text x="20" y="32" fontSize={15} fontWeight={800} className="fill-red-300/80 font-mono" letterSpacing={2}>
        HIGH SIDE 高壓側
      </text>
      <text x="20" y="546" fontSize={15} fontWeight={800} className="fill-sky-300/80 font-mono" letterSpacing={2}>
        LOW SIDE 低壓側
      </text>

      {/* 熱量進出 */}
      {[340, 410, 480].map((x) => (
        <HeatArrow key={`out-${x}`} x={x} y={44} color="#fca5a5" />
      ))}
      <text x="506" y="28" fontSize={16} fontWeight={700} className="fill-red-200">
        放熱 → 室外
      </text>
      {[340, 410, 480].map((x) => (
        <HeatArrow key={`in-${x}`} x={x} y={556} color="#7dd3fc" />
      ))}
      <text x="506" y="546" fontSize={16} fontWeight={700} className="fill-sky-200">
        吸熱 ← 庫內
      </text>

      {/* 管路（底色 + 流動虛線） */}
      {PIPES.map((p, i) => (
        <g key={i} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={p.d} stroke={p.stroke} strokeOpacity={0.22} strokeWidth={p.width + 4} />
          <path d={p.d} stroke={p.stroke} strokeWidth={4} className="pipe-flow" />
        </g>
      ))}
      {selectedPipe && (
        <path d={selectedPipe} fill="none" stroke="#fbbf24" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" filter="url(#cycle-glow)" opacity={0.9} />
      )}
      <Arrow x={680} y={150} rotate={-90} color={COLORS.discharge} />
      <Arrow x={195} y={92} rotate={180} color={COLORS.liquid} />
      <Arrow x={140} y={372} rotate={90} color={COLORS.mixture} />
      <Arrow x={625} y={468} rotate={0} color={COLORS.suction} />

      {/* 管路狀態 */}
      <StateText x={700} y={116} lines={['高溫高壓', '氣態']} anchor="start" color="#fca5a5" />
      <StateText x={122} y={160} lines={['中溫中壓', '液態']} anchor="end" color="#fcd34d" />
      <StateText x={122} y={378} lines={['液氣', '混合']} anchor="end" color="#a5f3fc" />
      <StateText x={700} y={358} lines={['低溫低壓', '氣態']} anchor="start" color="#7dd3fc" />

      {/* 冷凝器 */}
      <rect x="250" y="50" width="320" height="84" rx="14" fill="#f97316" fillOpacity="0.08" stroke="#fb923c" strokeOpacity="0.55" strokeWidth={2} />
      <Label x={410} y={166} title="② 冷凝器" sub="CONDENSER" hit="cond-label" />

      {/* 蒸發器 */}
      <rect x="250" y="426" width="320" height="84" rx="14" fill="#0ea5e9" fillOpacity="0.08" stroke="#38bdf8" strokeOpacity="0.55" strokeWidth={2} />
      <Label x={410} y={384} title="④ 蒸發器" sub="EVAPORATOR" hit="evap-label" />

      {/* 壓縮機 */}
      <circle cx="680" cy="280" r="58" fill="url(#cycle-comp)" stroke="#cbd5e1" strokeWidth={3} />
      <path d="M 648 312 L 666 250 M 712 312 L 694 250" stroke="#e2e8f0" strokeWidth={3} strokeLinecap="round" />
      <rect x="470" y="254" width="140" height="52" rx="12" fill="#0a1328" stroke="#ffffff" strokeOpacity="0.12" />
      <Label x={540} y={276} title="① 壓縮機" sub="COMPRESSOR" />

      {/* 膨脹閥 */}
      <polygon points="114,250 166,250 140,280" fill="#0f1b36" stroke="#5eead4" strokeWidth={3} strokeLinejoin="round" />
      <polygon points="114,310 166,310 140,280" fill="#0f1b36" stroke="#5eead4" strokeWidth={3} strokeLinejoin="round" />
      <rect x="180" y="254" width="150" height="52" rx="12" fill="#0a1328" stroke="#ffffff" strokeOpacity="0.12" />
      <Label x={255} y={276} title="③ 膨脹閥" sub="EXPANSION" />

      <SmallParts />

      {/* 點選熱區（在最上層） */}
      {interactive && (
        <g>
          {(Object.keys(PIPE_PATHS) as (keyof typeof PIPE_PATHS)[]).map((id) => {
            const box = PIPE_LABEL_HITS[id]
            return (
              <g key={id} {...hitProps(id, { discharge: '高壓氣管', liquid: '液管', mixture: '液氣混合段', suction: '吸氣管' }[id])}>
                <path d={PIPE_PATHS[id]} fill="none" stroke="transparent" strokeWidth={34} strokeLinecap="round" pointerEvents="stroke" />
                <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="transparent" />
              </g>
            )
          })}
          {(Object.keys(PART_HITS) as (keyof typeof PART_HITS)[]).map((id) => {
            const labelBox = id === 'cond' || id === 'evap' ? (boxes[`${id}-label`] ?? LABEL_FALLBACK[id]) : null
            return (
              <g key={id} {...hitProps(id, PART_HITS[id].label)} fill={selected === id ? 'rgba(251,191,36,0.12)' : 'transparent'} stroke={selected === id ? '#fbbf24' : 'transparent'} strokeWidth={3}>
                {PART_HITS[id].shapes}
                {labelBox && <rect x={labelBox.x} y={labelBox.y} width={labelBox.w} height={labelBox.h} rx={10} />}
              </g>
            )
          })}
          {(Object.keys(SMALL_HITS) as SmallId[]).map((id) => {
            const h = boxes[id] ?? SMALL_HITS[id]
            return (
              <g key={id} {...hitProps(id, SMALL_HITS[id].label)}>
                <rect
                  x={h.x}
                  y={h.y}
                  width={h.w}
                  height={h.h}
                  rx={8}
                  fill={selected === id ? 'rgba(251,191,36,0.14)' : 'transparent'}
                  stroke={selected === id ? '#fbbf24' : 'transparent'}
                  strokeWidth={2.5}
                />
              </g>
            )
          })}
        </g>
      )}
    </svg>
  )
}
