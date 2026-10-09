import { cn } from '../../lib/cn'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

/** Apple 風格分段切換（模式切換、開關都用這個，全站長一樣） */
export function Segmented<T extends string>({ value, options, onChange, size = 'lg' }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; size?: 'lg' | 'md' | 'sm' }) {
  return (
    <div role="tablist" className="inline-flex rounded-full bg-white/[0.07] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-full font-semibold transition',
            size === 'lg' ? 'px-6 py-2 text-[20px]' : size === 'md' ? 'px-4 py-1.5 text-[17px]' : 'px-4 py-1.5 text-[15px]',
            value === o.value ? 'bg-card text-ink shadow-[0_1px_3px_rgba(15,36,64,0.2)] ring-1 ring-line' : 'text-slate-300 hover:text-ink',
            focusRing,
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
