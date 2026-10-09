import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

/** 照片放大檢視（離線單檔版的圖片是內嵌資料，不能開新分頁，所以用覆蓋視窗）；點任何地方關閉 */
export function Lightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className="theme-dark fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/90 p-4"
    >
      <img src={src} alt={label} className="max-h-full max-w-full rounded-xl bg-white object-contain" />
      <button type="button" aria-label="關閉" className={cn('absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white', focusRing)}>
        <X className="size-5" aria-hidden />
      </button>
    </div>,
    document.body,
  )
}
