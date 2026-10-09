import { Pin } from 'lucide-react'
import type { ReactNode } from 'react'

interface ConclusionCalloutProps {
  label?: string
  text: ReactNode
}

/** 每頁底部的「本章小結論」：像圖紙的註記欄（白底細框，左邊標籤一格），重點靠字本身 */
export function ConclusionCallout({ label = '本章小結論', text }: ConclusionCalloutProps) {
  return (
    <aside className="flex h-full items-stretch overflow-hidden rounded-[14px] border border-line bg-card">
      <span className="flex shrink-0 items-center gap-2 border-r border-line px-7 text-[20px] font-semibold text-sky-300">
        <Pin className="size-5" aria-hidden />
        {label}
      </span>
      <p className="flex items-center px-7 py-5 text-[25px] font-medium leading-normal text-ink">{text}</p>
    </aside>
  )
}
