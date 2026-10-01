import type { LucideIcon } from 'lucide-react'
import type { Tone } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'

const sizes = {
  sm: { box: 'size-10 rounded-lg', icon: 'size-5' },
  md: { box: 'size-12 rounded-xl', icon: 'size-6' },
  lg: { box: 'size-14 rounded-2xl', icon: 'size-7' },
}

interface IconChipProps {
  icon: LucideIcon
  tone: Tone
  size?: keyof typeof sizes
}

export function IconChip({ icon: Icon, tone, size = 'md' }: IconChipProps) {
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center', sizes[size].box, toneStyles[tone].icon)}>
      <Icon className={sizes[size].icon} strokeWidth={2} aria-hidden />
    </span>
  )
}
