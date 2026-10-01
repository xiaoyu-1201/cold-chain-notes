import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Tone } from '../../data/types'
import { cn } from '../../lib/cn'
import { IconChip } from './IconChip'

interface PanelProps {
  icon?: LucideIcon
  title?: ReactNode
  en?: string
  tone?: Tone
  right?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

/** 標準內容卡片：圖示 + 標題 + 英文副標 */
export function Panel({ icon, title, en, tone = 'ice', right, className, bodyClassName, children }: PanelProps) {
  return (
    <section
      className={cn(
        'relative flex h-full min-h-0 flex-col rounded-[22px] border border-white/10 bg-linear-to-b from-white/[0.055] to-white/[0.015] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
        className,
      )}
    >
      {(title || icon) && (
        <header className="mb-4 flex items-center gap-4">
          {icon && <IconChip icon={icon} tone={tone} />}
          <div className="min-w-0 flex-1">
            {title && <h3 className="text-[26px] font-bold leading-tight text-slate-50">{title}</h3>}
            {en && (
              <p className="mt-1 truncate font-mono text-[16px] uppercase tracking-[0.18em] text-slate-400">{en}</p>
            )}
          </div>
          {right}
        </header>
      )}
      <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
    </section>
  )
}
