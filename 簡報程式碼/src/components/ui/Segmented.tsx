import { useRef } from 'react'
import { lensBindings, useLensTrack, useLiquidLens } from '../../hooks/useLiquidLens'
import { cn } from '../../lib/cn'
import { LensMagnify, LensView } from './LiquidLens'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

/**
 * Apple 風格分段切換（模式切換、開關都用這個，全站長一樣）。
 * 選中的那一項後面是液態玻璃鏡片（10/10）：換項時彈簧滑過去；按住左右拖鏡片跟著走、放開選那一項。
 * 電腦版在縮放畫布裡也對得準（useLensTrack 會換算縮放比例）。
 */
export function Segmented<T extends string>({ value, options, onChange, size = 'lg' }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; size?: 'lg' | 'md' | 'sm' }) {
  const lens = useLiquidLens({ liftScale: 1.04 })
  const box = useRef<HTMLDivElement>(null)
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const current = options.findIndex((o) => o.value === value)
  const track = useLensTrack({ lens, container: box, items, rest: current, pressMoves: true, onCommit: (i) => onChange(options[i].value) })
  return (
    <div
      ref={box}
      role="radiogroup"
      data-no-swipe
      data-lens-group
      {...lensBindings(track)}
      className="relative inline-flex touch-pan-y select-none rounded-full bg-white/[0.07] p-1"
    >
      <LensView lens={lens} className="inset-y-1" restClassName="bg-card" />
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => {
            items.current[i] = el
          }}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'relative whitespace-nowrap rounded-full font-semibold transition-colors',
            // sm＝手機：按鈕至少 44px 高（手指點得到）
            size === 'lg' ? 'px-6 py-2 text-[20px]' : size === 'md' ? 'px-4 py-1.5 text-[17px]' : 'min-h-11 px-4 py-1.5 text-[15px]',
            value === o.value ? 'text-ink' : 'text-slate-300 hover:bg-[rgba(15,36,64,0.05)] hover:text-ink',
            focusRing,
          )}
        >
          <LensMagnify lens={lens} geom={track.geom} index={i}>
            {o.label}
          </LensMagnify>
        </button>
      ))}
    </div>
  )
}
