import { Layers, X } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import { isTopDialog } from './topDialog'

const CycleSystem3D = lazy(() => import('./CycleSystem3D'))

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

type Cycle3DProps = ComponentProps<typeof CycleSystem3D>

interface Props extends Omit<Cycle3DProps, 'compact'> {
  onCut: (cut: boolean) => void
  onClose: () => void
  /** 右邊（手機在下面）放零件說明 */
  side?: ReactNode
  /** 側欄內容是照投影片畫布字級寫的（電腦版 Inspector）才縮小；手機閱讀版的內容本來就是小字，不縮（10/13 QA：iPad 只剩 12px） */
  sideZoom?: number
}

/**
 * 核心圖解的 3D 放大看（10/13 使用者：「也要可以把小視窗放大」）：整個畫面的視窗，3D 跟零件說明並排；
 * Esc／右上 ×／點外面關閉，跟零件的「放大看」一樣。
 */
export function CycleBigViewer({ onCut, onClose, side, sideZoom, ...cycle }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  // 呼叫端每次重畫都給新的 onClose：存在 ref 裡，下面的 effect 只跑一次（不然焦點會一直被搶回 ×，10/13 code review）
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  // 跟版面換成左右排的寬度（lg＝1024）一致：小於這個是上下排、用小一號的字（10/13 QA：iPad 橫放寫「看下面說明」但說明在右邊）
  const [narrow, setNarrow] = useState(() => window.innerWidth < 1024)
  // 3D 的大小字只看打開時：跟著視窗變會整個 3D 重建（縮放、導覽進度全部重來，10/13 code review）
  const [compactAtOpen] = useState(() => window.innerWidth < 1024)
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 1024)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      // 上面又開了別的視窗（例：側欄的「3D 看構造」）：鍵盤交給最上面那個，按一次 Esc 只關一層
      if (!isTopDialog(dialogRef.current)) return
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
      } else if (['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', 'Backspace', ' '].includes(e.key)) {
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      prev?.focus?.({ preventScroll: true })
    }
  }, [])

  return createPortal(
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/40 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="冷凍循環 3D 放大看"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex h-full max-h-[1000px] w-full max-w-[1600px] flex-col overflow-hidden rounded-[20px] border border-line bg-paper shadow-[0_24px_64px_-24px_rgba(15,36,64,0.5)]">
        <header className="flex items-center gap-3 border-b border-line bg-card px-4 py-3 sm:px-6">
          <p className="min-w-0 flex-1 text-[22px] font-black text-white sm:text-[26px]">冷凍循環 3D</p>
          <button
            type="button"
            aria-pressed={cycle.cut}
            onClick={() => onCut(!cycle.cut)}
            className={cn('flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-[15px] font-semibold transition', cycle.cut ? 'bg-sky-400 text-navy-950' : 'border border-line bg-card text-sky-300 hover:border-sky-500/50', focusRing)}
          >
            <Layers className="size-4" aria-hidden />
            {cycle.cut ? '合起來' : '剖開看內部'}
          </button>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="關閉（Esc）" className={cn('grid size-11 place-items-center rounded-xl border border-line bg-card text-slate-200 hover:border-sky-500/60', focusRing)}>
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="relative min-h-[320px] flex-1 bg-card">
            <Suspense fallback={<p className="absolute inset-0 flex items-center justify-center text-[16px] text-slate-400">3D 載入中…</p>}>
              {/* 放大視窗沒有縮放：視窗不夠寬（手機、平板直放）時用小一號的字和按鈕 */}
              <CycleSystem3D {...cycle} compact={compactAtOpen} />
            </Suspense>
          </div>
          {side && (
            <aside className="max-h-[50%] overflow-y-auto border-t border-line bg-card p-4 lg:max-h-none lg:w-[440px] lg:border-l lg:border-t-0 lg:p-5">
              {/* 側欄的說明是照投影片畫布的字級寫的；放大視窗沒有縮放，寬螢幕縮成 0.8 倍才不會太大 */}
              <div style={narrow || !sideZoom ? undefined : { zoom: sideZoom }}>{side}</div>
            </aside>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
