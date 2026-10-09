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
      {/* 垂直置中交給外層 div；<p> 本身不能是 flex，不然有重點字的句子會被拆成好幾欄、變直排（10/10 QA） */}
      <div className="flex min-w-0 flex-1 items-center px-7 py-5">
        <p className="text-[25px] font-medium leading-normal text-ink">{text}</p>
      </div>
    </aside>
  )
}
