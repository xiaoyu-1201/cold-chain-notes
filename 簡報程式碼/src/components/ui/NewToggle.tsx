import { ScanSearch } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'

/**
 * 「圈出新的」開關（10/13 使用者：「做一個按鈕，我按下去是紅色框框標示出來，直接在頁面上圈出來」）。
 * 開著時 <html> 有 class「show-new」，index.css 讓 .new-frame（改過的那一點）、.new-frame-page（整頁新的內容區）出現紅框。
 * 記在這台電腦；預設開著。
 */
const KEY = 'cold-chain-deck:show-new'
const EVENT = 'show-new-change'

const read = () => {
  try {
    return window.localStorage.getItem(KEY) !== '0'
  } catch {
    return true
  }
}
const apply = (on: boolean) => document.documentElement.classList.toggle('show-new', on)
if (typeof document !== 'undefined') apply(read())

export function NewToggle({ mobile }: { mobile?: boolean }) {
  const [on, setOn] = useState(read)
  useEffect(() => {
    const sync = () => setOn(read())
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])
  const toggle = () => {
    const next = !on
    try {
      window.localStorage.setItem(KEY, next ? '1' : '0')
    } catch {
      // 存不了只影響這次
    }
    apply(next)
    setOn(next)
    window.dispatchEvent(new Event(EVENT))
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      title={on ? '關掉紅框' : '用紅框圈出這頁新的地方'}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-lg border-2 font-black leading-none transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
        mobile ? 'min-h-9 px-2.5 text-[14px]' : 'min-h-[40px] px-3 text-[20px]',
        on ? 'border-red-400 bg-red-400 text-paper' : 'border-red-400 bg-card text-red-400 hover:bg-red-950',
      )}
    >
      <ScanSearch className={mobile ? 'size-4' : 'size-5'} aria-hidden />
      {on ? '圈出新的：開' : '圈出新的'}
    </button>
  )
}
