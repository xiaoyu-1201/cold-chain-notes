import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Tone } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'

interface PanelProps {
  icon?: LucideIcon
  title?: ReactNode
  /** 英文副標（Apple 風格不顯示，保留欄位相容） */
  en?: string
  tone?: Tone
  right?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

/** 標準內容卡片：填色底、無框、大圓角；圖示直接上色 */
export function Panel({ icon: Icon, title, tone = 'ice', right, className, bodyClassName, children }: PanelProps) {
  return (
    <section className={cn('relative flex h-full min-h-0 flex-col rounded-[28px] bg-white/[0.045] p-7', className)}>
      {(title || Icon) && (
        <header className="mb-4 flex items-center gap-3">
          {Icon && <Icon className={cn('size-7 shrink-0', toneStyles[tone].text)} aria-hidden />}
          <div className="min-w-0 flex-1">{title && <h3 className="text-[26px] font-semibold leading-tight text-white">{title}</h3>}</div>
          {right}
        </header>
      )}
      <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
    </section>
  )
}
