import { memo } from 'react'
import { cn } from '../../lib/cn'

/** 圖框邊上的分區刻度（像工程圖紙的邊框）：每 160px 一格 */
function ticks(len: number, step: number) {
  const out: number[] = []
  for (let v = step; v < len; v += step) out.push(v)
  return out
}

/**
 * 主題背景「工程方格紙」（10/09 技術藍圖改版，取代霜花）：淡色紙＋16px 細格線。
 * frame：電腦版畫布再加一圈細圖框和邊上的刻度（像圖紙），只有裝飾、不能點。
 */
export const BlueprintBackground = memo(function BlueprintBackground({
  className,
  fixed = false,
  frame = false,
  width = 1920,
  height = 1080,
}: {
  className?: string
  fixed?: boolean
  frame?: boolean
  width?: number
  height?: number
}) {
  const inset = 22
  return (
    <div aria-hidden className={cn('blueprint-paper pointer-events-none inset-0 overflow-hidden', fixed ? 'fixed' : 'absolute', className)}>
      {frame && (
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <g fill="none" stroke="#c9d6e5" strokeWidth={1}>
            <rect x={inset} y={inset} width={width - inset * 2} height={height - inset * 2} />
            {ticks(width, 160).map((x) => (
              <path key={`t${x}`} d={`M${x} ${inset}v-8M${x} ${height - inset}v8`} />
            ))}
            {ticks(height, 160).map((y) => (
              <path key={`l${y}`} d={`M${inset} ${y}h-8M${width - inset} ${y}h8`} />
            ))}
          </g>
        </svg>
      )}
    </div>
  )
})
