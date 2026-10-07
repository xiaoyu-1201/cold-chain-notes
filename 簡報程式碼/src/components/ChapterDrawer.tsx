import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { parts } from '../data/parts'
import { slides } from '../data/slides'
import type { Part, SlideData } from '../data/types'
import { isNew } from '../data/whatsNew'
import { cn, pad } from '../lib/cn'
import { toneStyles } from '../lib/tone'
import { Kbd } from './ui/Kbd'

/** 依篇章分組（保持投影片順序） */
const groups = slides.reduce<{ part: Part; items: { slide: SlideData; index: number }[] }[]>((acc, slide, index) => {
  const last = acc[acc.length - 1]
  if (last && last.part.id === slide.part) last.items.push({ slide, index })
  else acc.push({ part: parts[slide.part], items: [{ slide, index }] })
  return acc
}, [])

const shortcuts: { keys: string[]; label: string }[] = [
  { keys: ['→', 'Space'], label: '下一頁' },
  { keys: ['←'], label: '上一頁' },
  { keys: ['Home'], label: '回首頁' },
  { keys: ['F'], label: '全螢幕' },
  { keys: ['M'], label: '開關目錄' },
  { keys: ['Esc'], label: '關閉目錄' },
]

interface ChapterDrawerProps {
  open: boolean
  index: number
  onClose: () => void
  onSelect: (index: number) => void
}

export function ChapterDrawer({ open, index, onClose, onSelect }: ChapterDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="章節導覽"
            className="fixed inset-y-0 left-0 z-50 flex w-[min(460px,92vw)] flex-col bg-[#0b1626]/85 shadow-2xl shadow-black/60 backdrop-blur-xl"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <header className="flex items-center justify-between px-6 pb-3 pt-6">
              <div>

                <h2 className="text-[30px] font-bold text-white">目錄</h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="關閉目錄 (Esc)"
                className="flex size-10 items-center justify-center rounded-full bg-white/[0.08] text-slate-300 transition hover:bg-white/[0.14] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
              >
                <X className="size-5" aria-hidden />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {groups.map((group) => (
                <section key={group.part.id} className="mb-5 last:mb-0">
                  <h3 className="mb-1.5 flex items-center gap-2 px-3 text-[14px] font-semibold text-slate-300">
                    <span aria-hidden className={cn('size-2 rounded-full', toneStyles[group.part.tone].dot)} />
                    {group.part.label}
                  </h3>
                  {group.part.goal && <p className="mb-2 px-3 text-[13px] leading-relaxed text-slate-500">學完你會：{group.part.goal}</p>}
                  <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl bg-white/[0.05]">
                    {group.items.map(({ slide, index: i }) => {
                      const active = i === index
                      return (
                        <li key={slide.id}>
                          <button
                            type="button"
                            onClick={() => onSelect(i)}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'flex w-full items-center gap-3 px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-300',
                              active ? 'bg-sky-400/20' : 'hover:bg-white/[0.06]',
                            )}
                          >
                            <span className={cn('font-mono text-sm font-bold', active ? 'text-sky-300' : 'text-slate-500')}>
                              {pad(i + 1)}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={cn('block truncate text-[16px] font-semibold', active ? 'text-sky-100' : 'text-slate-100')}>
                                {isNew(slide.added) && <span className="mr-1.5 rounded bg-emerald-400 px-1.5 text-[12px] font-black text-navy-950">新</span>}
                                {slide.title}
                              </span>
                              {slide.chapter && (
                                <span className="block text-[13px] text-slate-400">
                                  {slide.chapter}
                                  {slide.advanced && <span className="ml-1.5 font-bold text-amber-300">進階</span>}
                                </span>
                              )}
                            </span>
                            {active && <span className="shrink-0 rounded-full bg-sky-400 px-2 py-0.5 text-[12px] font-bold text-navy-950">目前</span>}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>

            <footer className="px-6 pb-5 pt-3">
              <p className="mb-2 text-xs font-bold text-slate-400">鍵盤快捷鍵</p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-400">
                {shortcuts.map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <dt className="flex gap-1">
                      {s.keys.map((k) => (
                        <Kbd key={k}>{k}</Kbd>
                      ))}
                    </dt>
                    <dd>{s.label}</dd>
                  </div>
                ))}
              </dl>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
