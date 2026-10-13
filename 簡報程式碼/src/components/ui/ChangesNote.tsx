import type { SlideData } from '../../data/types'
import { isNew, shortDate } from '../../data/whatsNew'
import { cn } from '../../lib/cn'

/**
 * 標題下面一行紅字：這頁那天改了什麼（10/13 使用者：紅點太多，頁面上要講哪裡是新的）。
 * 只有這一批（added ≥ NEW_SINCE）而且有寫 changes 的頁才出現；改過的卡片另外有 NewChip。
 */
export function ChangesNote({ slide, mobile, className }: { slide: SlideData; mobile?: boolean; className?: string }) {
  if (!slide.added || !isNew(slide.added) || !slide.changes) return null
  return (
    <p
      className={cn(
        // new-keep：「圈出新的」關掉時看不見，但位置留著（標題和開關才不會跳動）
        'new-keep flex rounded-lg border-l-4 border-red-400 bg-red-950 text-slate-100',
        // 手機：標題一行、內容下一行（並排會變成很窄的一欄）
        mobile ? 'mt-2 flex-col gap-0.5 px-3 py-2 text-[15px] leading-snug' : 'mt-2 items-baseline gap-3 px-4 py-1.5 text-[20px] leading-snug',
        className,
      )}
    >
      <b className="shrink-0 font-black text-red-400">{shortDate(slide.added)} 改了什麼</b>
      <span className="min-w-0">{slide.changes}</span>
    </p>
  )
}
