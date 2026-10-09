import type { SVGProps } from 'react'

/**
 * 零件線稿（技術藍圖風格，10/09 改版）：不用網路上大家都在用的通用圖示，
 * 改成冷凍材料行自己的零件長相。線寬 2、48×48、顏色跟著文字（currentColor）；
 * 接管用管路三色（紅＝吐出管、黃＝液管、藍＝吸氣管），跟老闆講義一樣。
 */
export type PartGlyphId =
  | 'compressor'
  | 'condenser'
  | 'evaporator'
  | 'txv'
  | 'drier'
  | 'sightglass'
  | 'solenoid'
  | 'receiver'
  | 'accumulator'
  | 'switch'
  | 'ballvalve'
  | 'insulation'
  | 'flare'
  | 'caliper'

export const PIPE = { discharge: '#D23F2E', liquid: '#E0A01B', suction: '#2E7BC8' } as const

const Pipe = ({ d, c }: { d: string; c: string }) => <path d={d} stroke={c} strokeWidth={3} strokeLinecap="round" fill="none" />

export function PartGlyph({ id, size = 40, ...rest }: { id: PartGlyphId; size?: number } & Omit<SVGProps<SVGSVGElement>, 'id'>) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      {GLYPHS[id]}
    </svg>
  )
}

/** 零件線稿放在一格「圖紙小方格」裡（像零件型錄的縮圖）：細框、紙色底，不是彩色方塊 */
export function GlyphCell({ id, size = 56, className }: { id: PartGlyphId; size?: number; className?: string }) {
  return (
    <span
      className={'inline-flex shrink-0 items-center justify-center rounded-[10px] border border-line bg-paper text-ink-2 ' + (className ?? '')}
      style={{ width: size, height: size }}
    >
      <PartGlyph id={id} size={Math.round(size * 0.78)} />
    </span>
  )
}

const GLYPHS: Record<PartGlyphId, React.ReactNode> = {
  // 壓縮機：圓頂的機身＋底座，吸氣（藍）進、吐出（紅）出
  compressor: (
    <>
      <path d="M14 38V20a10 10 0 0 1 20 0v18" />
      <path d="M10 38h28" />
      <path d="M17 26h14" />
      <Pipe d="M6 22h8" c={PIPE.suction} />
      <Pipe d="M34 16h8V8" c={PIPE.discharge} />
    </>
  ),
  // 冷凝器（熱排）：一排鰭片＋風扇，紅進黃出
  condenser: (
    <>
      <rect x="8" y="10" width="32" height="28" rx="2" />
      <path d="M14 10v28M20 10v28M26 10v28M32 10v28" opacity={0.5} />
      <circle cx="24" cy="24" r="7" />
      <path d="M24 17v14M17 24h14" />
      <Pipe d="M4 14h4" c={PIPE.discharge} />
      <Pipe d="M40 34h4" c={PIPE.liquid} />
    </>
  ),
  // 蒸發器（冷排）：吊頂冷風機＋往下吹的冷風
  evaporator: (
    <>
      <rect x="8" y="8" width="32" height="16" rx="2" />
      <path d="M14 8v16M20 8v16M26 8v16M32 8v16" opacity={0.5} />
      <path d="M16 30l-2 6M24 30v6M32 30l2 6" />
      <Pipe d="M4 12h4" c={PIPE.liquid} />
      <Pipe d="M40 20h4" c={PIPE.suction} />
    </>
  ),
  // 膨脹閥：閥體＋感溫包的細管
  txv: (
    <>
      <path d="M18 18h12v12H18z" />
      <path d="M24 18v-6h-4" />
      <path d="M30 22c6 0 8 4 8 10v4" />
      <rect x="35" y="36" width="6" height="6" rx="3" />
      <Pipe d="M6 24h12" c={PIPE.liquid} />
      <Pipe d="M24 30v12" c={PIPE.suction} />
    </>
  ),
  // 乾燥過濾器：膠囊形＋流向箭頭
  drier: (
    <>
      <rect x="12" y="16" width="24" height="16" rx="8" />
      <path d="M20 24h8M25 21l3 3-3 3" />
      <Pipe d="M4 24h8" c={PIPE.liquid} />
      <Pipe d="M36 24h8" c={PIPE.liquid} />
    </>
  ),
  // 視液鏡：圓形玻璃窗＋含水指示環
  sightglass: (
    <>
      <circle cx="24" cy="24" r="10" />
      <circle cx="24" cy="24" r="5" />
      <Pipe d="M4 24h10" c={PIPE.liquid} />
      <Pipe d="M34 24h10" c={PIPE.liquid} />
    </>
  ),
  // 電磁閥：閥體＋上面的線圈
  solenoid: (
    <>
      <rect x="17" y="8" width="14" height="14" rx="2" />
      <path d="M20 13h8M20 17h8" opacity={0.6} />
      <path d="M16 26h16l-2 8H18z" />
      <Pipe d="M4 30h12" c={PIPE.liquid} />
      <Pipe d="M32 30h12" c={PIPE.liquid} />
    </>
  ),
  // 儲液器：直立的桶子，液體沉在底下
  receiver: (
    <>
      <rect x="16" y="8" width="16" height="32" rx="8" />
      <path d="M17 30h14" />
      <path d="M20 34h8" opacity={0.5} />
      <Pipe d="M6 12h10" c={PIPE.liquid} />
      <Pipe d="M24 36v8" c={PIPE.liquid} />
    </>
  ),
  // 液氣分離器：桶子裡的 U 形管，只取上面的氣體
  accumulator: (
    <>
      <rect x="14" y="8" width="20" height="32" rx="10" />
      <path d="M20 14v18a4 4 0 0 0 8 0V14" />
      <Pipe d="M6 14h8" c={PIPE.suction} />
      <Pipe d="M28 4v10" c={PIPE.suction} />
    </>
  ),
  // 高低壓開關：盒子＋兩個錶盤
  switch: (
    <>
      <rect x="8" y="12" width="32" height="24" rx="3" />
      <circle cx="18" cy="24" r="5" />
      <circle cx="30" cy="24" r="5" />
      <path d="M18 24l2-3M30 24l-2-3" />
      <path d="M18 36v6M30 36v6" />
    </>
  ),
  // 球閥（手閥）：管子中間一顆球＋把手
  ballvalve: (
    <>
      <circle cx="24" cy="26" r="7" />
      <path d="M24 19v-7M18 12h12" />
      <Pipe d="M4 26h13" c={PIPE.liquid} />
      <Pipe d="M31 26h13" c={PIPE.liquid} />
    </>
  ),
  // 保溫管：回管外面包一層厚的
  insulation: (
    <>
      <rect x="6" y="15" width="36" height="18" rx="9" />
      <Pipe d="M2 24h44" c={PIPE.suction} />
      <path d="M14 15v18M24 15v18M34 15v18" opacity={0.35} />
    </>
  ),
  // 喇叭頭：螺帽（六角）＋喇叭口
  flare: (
    <>
      <path d="M18 14l12 0 6 10-6 10H18l-6-10z" />
      <path d="M21 24h6" />
      <Pipe d="M36 24h8" c={PIPE.liquid} />
      <path d="M4 20l8 4-8 4" />
    </>
  ),
  // 游標卡尺：主尺＋游尺＋兩個量爪
  caliper: (
    <>
      <path d="M4 18h40v6H4z" />
      <path d="M8 18v-8M8 24v14l4-4V24" />
      <path d="M26 16h8v12h-8z" />
      <path d="M30 28v10l-4-4" />
      <path d="M14 21h2M20 21h2M38 21h2" opacity={0.6} />
    </>
  ),
}
