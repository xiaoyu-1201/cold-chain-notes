import type { ReactNode } from 'react'

interface ConclusionCalloutProps {
  label?: string
  text: ReactNode
}

/** 每頁底部固定的「📌 本章小結論」 */
export function ConclusionCallout({ label = '本章小結論', text }: ConclusionCalloutProps) {
  return (
    <aside className="relative flex items-center gap-6 overflow-hidden rounded-[18px] border border-sky-300/30 bg-linear-to-r from-sky-500/[0.18] via-sky-500/[0.07] to-sky-500/[0.02] py-5 pl-8 pr-7">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-linear-to-b from-sky-300 to-cyan-400" />
      <span className="flex shrink-0 items-center gap-2 rounded-xl bg-sky-300/15 px-4 py-2 text-[21px] font-bold text-sky-100 ring-1 ring-inset ring-sky-300/30">
        <span aria-hidden>📌</span>
        {label}
      </span>
      <p className="text-[25px] font-medium leading-normal text-slate-50">{text}</p>
    </aside>
  )
}
