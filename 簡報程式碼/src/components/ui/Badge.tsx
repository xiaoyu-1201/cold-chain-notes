import type { ReactNode } from 'react'
import type { Tone } from '../../data/types'
import { cn } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'

const sizes = {
  sm: 'px-2.5 py-0.5 text-[15px]',
  md: 'px-3 py-1 text-[17px]',
  lg: 'px-4 py-1.5 text-[19px]',
}

interface BadgeProps {
  tone?: Tone
  size?: keyof typeof sizes
  className?: string
  children: ReactNode
}

export function Badge({ tone = 'ice', size = 'md', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-semibold leading-snug',
        sizes[size],
        toneStyles[tone].chip,
        className,
      )}
    >
      {children}
    </span>
  )
}
