import { X } from 'lucide-react'
import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useModal } from '../../hooks/useModal'
import { cn } from '../../lib/cn'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

/**
 * 照片放大檢視（離線單檔版的圖片是內嵌資料，不能開新分頁，所以用覆蓋視窗）；點任何地方、按 Esc 關閉。
 * 深色底直接寫色碼：Tailwind 的半透明色在舊版 Chrome（109）會退回淺色版的值（10/10 code review）。
 */
export function Lightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null)
  useModal(true, onClose, closeBtn)
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className="theme-dark fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(5,10,23,0.9)] p-4"
    >
      <img src={src} alt={label} className="max-h-full max-w-full rounded-xl bg-[#fff] object-contain" />
      <button
        ref={closeBtn}
        type="button"
        aria-label="關閉 (Esc)"
        className={cn('glass glass-dark absolute right-4 top-4 flex size-11 items-center justify-center rounded-full text-[#fff]', focusRing)}
      >
        <X className="size-5" aria-hidden />
      </button>
    </div>,
    document.body,
  )
}
