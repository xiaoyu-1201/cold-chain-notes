import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Tone } from '../../data/types'
import { cn } from '../../lib/cn'
import { glyphFor } from '../../lib/partGlyph'
import { toneStyles } from '../../lib/tone'
import { PartGlyph } from './PartGlyph'

interface PanelProps {
  icon?: LucideIcon
  title?: ReactNode
  /** 英文副標（不顯示，保留欄位相容） */
  en?: string
  tone?: Tone
  right?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

/** 標準內容卡片：白底＋細框（技術藍圖），不用陰影、不用漸層；圖示直接上色 */
export function Panel({ icon: Icon, title, tone = 'ice', right, className, bodyClassName, children }: PanelProps) {
  // 標題講的是零件 → 用零件線稿取代通用圖示
  const glyph = glyphFor(title)
  return (
    <section className={cn('relative flex h-full min-h-0 flex-col rounded-[18px] border border-line bg-card p-7', className)}>
      {(title || Icon) && (
        <header className="mb-4 flex items-center gap-3">
          {glyph ? (
            <PartGlyph id={glyph} size={40} className="-my-1 shrink-0 text-ink-2" />
          ) : (
            Icon && <Icon className={cn('size-7 shrink-0', toneStyles[tone].text)} aria-hidden />
          )}
          <div className="min-w-0 flex-1">{title && <h3 className="text-[26px] font-semibold leading-tight text-ink">{title}</h3>}</div>
          {right}
        </header>
      )}
      <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
    </section>
  )
}
