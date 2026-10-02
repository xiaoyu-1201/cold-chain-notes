import { Pin } from 'lucide-react'
import type { ReactNode } from 'react'

interface ConclusionCalloutProps {
  label?: string
  text: ReactNode
}

/** 每頁底部的「本章小結論」：安靜的填色列，重點靠字本身 */
export function ConclusionCallout({ label = '本章小結論', text }: ConclusionCalloutProps) {
  return (
    <aside className="flex items-center gap-6 rounded-[24px] bg-white/[0.045] px-8 py-5">
      <span className="flex shrink-0 items-center gap-2 text-[20px] font-semibold text-sky-300">
        <Pin className="size-5" aria-hidden />
        {label}
      </span>
      <p className="text-[25px] font-medium leading-normal text-slate-50">{text}</p>
    </aside>
  )
}
