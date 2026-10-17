import { isNew, NEW_LABEL } from '../../data/whatsNew'
import { cn } from '../../lib/cn'

/**
 * 卡片／清單裡「這一點是新的」的小紅標（10/13 使用者：紅點太多，頁面上要講哪裡是新的）。
 * added 早於 NEW_SINCE 就不顯示，下一批上線自動退掉。
 */
export function NewChip({ added, mobile, className }: { added?: string; mobile?: boolean; className?: string }) {
  if (!isNew(added)) return null
  return (
    <span
      title={NEW_LABEL}
      className={cn(
        // new-chip：「圈出新的」關掉時一起藏起來（index.css）
        'new-chip inline-flex shrink-0 items-center rounded-md bg-red-400 font-black text-paper',
        mobile ? 'px-1.5 text-[13px] leading-5' : 'px-2 text-[16px] leading-6',
        className,
      )}
    >
      新
      <span className="sr-only">（{NEW_LABEL}）</span>
    </span>
  )
}
