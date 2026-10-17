import { memo } from 'react'
import { cn } from '../../lib/cn'

/**
 * 頁面底色。10/18 設計健檢：拿掉工程方格紙的格線和圖框刻度（使用者：「藍圖格線背景可以換」），
 * 改成一整片平的淺藍灰，卡片用白底跟它分層，不再靠框線。
 */
export const BlueprintBackground = memo(function BlueprintBackground({ className, fixed = false }: { className?: string; fixed?: boolean }) {
  return <div aria-hidden className={cn('blueprint-paper pointer-events-none inset-0', fixed ? 'fixed' : 'absolute', className)} />
})
