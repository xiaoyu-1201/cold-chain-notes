import { Check, ClipboardCheck, PartyPopper, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChecklistBlock } from '../../data/types'
import { cn } from '../../lib/cn'
import { Panel } from '../ui/Panel'

function loadChecked(key: string, length: number): boolean[] {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length === length) return parsed.map(Boolean)
    }
  } catch {
    // 無法讀取瀏覽器儲存空間時，直接使用預設值
  }
  return Array.from({ length }, () => false)
}

/** 可勾選的新人檢核清單（勾選狀態暫存在本機瀏覽器） */
export function Checklist({ block }: { block: ChecklistBlock }) {
  const storageKey = `cold-chain-deck:${block.id}`
  const [checked, setChecked] = useState(() => loadChecked(storageKey, block.items.length))

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(checked))
    } catch {
      // 忽略儲存失敗（例如無痕模式）
    }
  }, [storageKey, checked])

  const done = checked.filter(Boolean).length
  const total = block.items.length
  const allDone = done === total

  const toggle = (index: number) => setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)))

  return (
    <Panel
      icon={ClipboardCheck}
      tone="emerald"
      title={block.title}
      en={block.en}
      right={
        <div className="flex items-center gap-3">
          <span className="font-mono text-[22px] font-extrabold text-emerald-300">
            {done} / {total}
          </span>
          <button
            type="button"
            onClick={() => setChecked(Array.from({ length: total }, () => false))}
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[17px] font-semibold text-slate-400 transition hover:border-white/25 hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-sky-300"
          >
            <RotateCcw className="size-4" aria-hidden />
            重設
          </button>
        </div>
      }
    >
      <div className="flex h-full flex-col gap-3">
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]" aria-hidden>
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
        <ul className="flex min-h-0 flex-1 flex-col gap-2">
          {block.items.map((item, i) => {
            const on = checked[i]
            return (
              <li key={i} className="flex flex-1">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggle(i)}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-xl border px-4 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300',
                    on
                      ? 'border-emerald-500/50 bg-emerald-950'
                      : 'border-line bg-card hover:border-white/20',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg border-2 transition',
                      on ? 'border-emerald-400 bg-emerald-400 text-paper' : 'border-slate-500 bg-card',
                    )}
                  >
                    {on && <Check className="size-5" strokeWidth={3} aria-hidden />}
                  </span>
                  <span className={cn('text-[20px] leading-snug', on ? 'text-emerald-50' : 'text-slate-200')}>{item}</span>
                </button>
              </li>
            )
          })}
        </ul>
        {allDone && (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-950 px-4 py-2 text-[19px] font-bold text-emerald-200">
            <PartyPopper className="size-5" aria-hidden />
            全部完成！具備上線跟班的基本功。
          </p>
        )}
      </div>
    </Panel>
  )
}
