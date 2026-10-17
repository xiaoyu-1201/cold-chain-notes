import { ScanSearch } from 'lucide-react'
import { useSyncExternalStore, type MouseEvent } from 'react'
import { cn } from '../../lib/cn'
import { flashNew } from '../../lib/anim'

/**
 * 「圈出新的」開關（10/13 使用者：「做一個按鈕，我按下去是紅色框框標示出來，直接在頁面上圈出來」）。
 * 開著時 <html> 有 class「show-new」，index.css 讓 .new-frame（改過的那一點）出現紅框。10/18：「新・日期」和這個開關合成一顆。
 * 狀態放在模組變數（存不進 localStorage 也不會跟畫面對不上）；記在這台電腦，別的分頁改了也會跟著變；預設開著。
 */
const KEY = 'cold-chain-deck:show-new'
const listeners = new Set<() => void>()

const readStored = () => {
  try {
    return window.localStorage.getItem(KEY) !== '0'
  } catch {
    return true
  }
}
let on = typeof window === 'undefined' ? true : readStored()
const apply = () => {
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('show-new', on)
  listeners.forEach((l) => l())
}
apply()
if (typeof window !== 'undefined')
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    on = readStored()
    apply()
  })

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** label：按鈕上的字（10/18 起寫「新・10/17」，跟開關合成一顆；沒給就是「圈出新的」） */
export function NewToggle({ mobile, label = '圈出新的' }: { mobile?: boolean; label?: string }) {
  const value = useSyncExternalStore(subscribe, () => on, () => true)
  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    on = !on
    try {
      window.localStorage.setItem(KEY, on ? '1' : '0')
    } catch {
      // 存不了只影響這次
    }
    apply()
    // 打開時，這頁改過的地方依序閃一下
    if (on) flashNew(e.currentTarget.closest('.deck-canvas, .reader-mode article'))
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={value}
      title="這頁有新內容；按一下開關紅框（圈出改過的地方）"
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-lg border-2 font-black leading-none transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
        mobile ? 'min-h-11 px-3 text-[14px]' : 'min-h-[40px] px-3 text-[20px]',
        value ? 'border-red-400 bg-red-400 text-paper' : 'border-red-400 bg-card text-red-400 hover:bg-red-950',
      )}
    >
      <ScanSearch className={mobile ? 'size-4' : 'size-5'} aria-hidden />
      {label}
      <span className="sr-only">，用紅框圈出這頁改過的地方</span>
    </button>
  )
}
