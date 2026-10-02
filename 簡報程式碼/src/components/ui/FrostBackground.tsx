import { memo } from 'react'
import { cn } from '../../lib/cn'

/** 固定種子的亂數：每次畫出來的霜花都一樣 */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** 一朵六角冰晶：六支主枝，每支主枝兩側長出 60° 的小枝（像冷凍庫玻璃上的霜） */
function crystal(cx: number, cy: number, r: number, rand: () => number) {
  const d: string[] = []
  const tilt = rand() * Math.PI
  for (let k = 0; k < 6; k++) {
    const a = tilt + (k * Math.PI) / 3
    const ex = cx + Math.cos(a) * r
    const ey = cy + Math.sin(a) * r
    d.push(`M${cx.toFixed(1)} ${cy.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`)
    for (const t of [0.32, 0.52, 0.72]) {
      const bx = cx + Math.cos(a) * r * t
      const by = cy + Math.sin(a) * r * t
      const len = r * (0.42 * (1 - t) + 0.06) * (0.8 + rand() * 0.4)
      for (const side of [-1, 1]) {
        const b = a + (side * Math.PI) / 3
        d.push(`M${bx.toFixed(1)} ${by.toFixed(1)}L${(bx + Math.cos(b) * len).toFixed(1)} ${(by + Math.sin(b) * len).toFixed(1)}`)
      }
    }
  }
  return d.join('')
}

/** 霜從邊角長進來：越靠邊越密、越大 */
function frostPaths() {
  const rand = rng(20261002)
  const flakes: { d: string; o: number; w: number }[] = []
  const add = (x: number, y: number, r: number) => flakes.push({ d: crystal(x, y, r, rand), o: 0.08 + rand() * 0.1, w: r > 120 ? 1.8 : 1.2 })
  // 左上角
  for (let i = 0; i < 9; i++) add(-40 + rand() * 420, -40 + rand() * 260, 50 + rand() * 170)
  // 右下角
  for (let i = 0; i < 10; i++) add(1500 + rand() * 460, 820 + rand() * 300, 50 + rand() * 190)
  // 右上、左下零星幾朵
  for (let i = 0; i < 4; i++) add(1650 + rand() * 300, -30 + rand() * 160, 30 + rand() * 80)
  for (let i = 0; i < 4; i++) add(-30 + rand() * 260, 900 + rand() * 200, 30 + rand() * 90)
  return flakes
}
const FLAKES = frostPaths()

/**
 * 主題背景「冷凍庫玻璃」：深冷藍底＋右上冷光＋邊角結霜。
 * 只有裝飾，不能點（pointer-events-none）；放在畫布或閱讀模式最底層。
 */
export const FrostBackground = memo(function FrostBackground({ className, fixed = false }: { className?: string; fixed?: boolean }) {
  return (
    <div aria-hidden className={cn('pointer-events-none inset-0 overflow-hidden', fixed ? 'fixed' : 'absolute', className)}>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1100px 680px at 88% -12%, rgba(125,211,252,0.20), transparent 62%),' +
            // 結霜的角落有一層白霧（玻璃上的凝結）
            'radial-gradient(520px 360px at 0% 0%, rgba(224,242,254,0.07), transparent 70%),' +
            'radial-gradient(620px 400px at 100% 100%, rgba(224,242,254,0.07), transparent 70%),' +
            'radial-gradient(900px 620px at -8% 112%, rgba(45,212,191,0.10), transparent 60%),' +
            'linear-gradient(180deg, #0b1d33 0%, #081526 55%, #07111f 100%)',
        }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#bae6fd" strokeLinecap="round">
          {FLAKES.map((f, i) => (
            <path key={i} d={f.d} strokeOpacity={f.o} strokeWidth={f.w} />
          ))}
        </g>
      </svg>
    </div>
  )
})
