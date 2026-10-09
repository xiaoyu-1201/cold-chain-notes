import { motion } from 'framer-motion'
import { ArrowRight, BookOpenCheck, Check, ChevronDown, CornerDownRight, RotateCcw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { parts } from '../data/parts'
import { PRACTICE } from '../data/practice'
import { slides } from '../data/slides'
import { cn, pad } from '../lib/cn'
import { PRACTICE_IDS, resetLearn, todayPages, useLearn } from '../lib/learn'
import { toneStyles } from '../lib/tone'
import { PracticeQuestion } from './Practice'

const indexOf = (id: string) => slides.findIndex((s) => s.id === id)

/**
 * 「今天」：讀到哪、今天讀這 3 頁、錯題複習（AI 軟體課：學一段、馬上練、錯的再回來）。
 * 進度只存在這台裝置的瀏覽器。
 */
export function ProgressPanel({ open, onClose, onSelect, mobile }: { open: boolean; onClose: () => void; onSelect: (index: number) => void; mobile?: boolean }) {
  const learn = useLearn()
  const [openWrong, setOpenWrong] = useState<string | null>(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])
  if (!open) return null

  const total = PRACTICE_IDS.length
  const doneN = PRACTICE_IDS.filter((id) => learn.done[id]).length
  const today = todayPages(learn)
  const wrongIds = PRACTICE_IDS.filter((id) => learn.wrong[id])
  const last = learn.last && indexOf(learn.last) >= 0 ? learn.last : null
  const go = (id: string) => {
    onSelect(indexOf(id))
    onClose()
  }
  const rowCls = 'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-white/[0.06] active:bg-white/10'

  return (
    <>
      {/* 只有進場動畫：退場動畫在背景分頁會跑不完 */}
      <motion.div className="fixed inset-0 z-[60] bg-navy-950/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="今天讀什麼"
        data-no-swipe
        initial={mobile ? { opacity: 0, y: 24 } : { opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18 }}
        className={cn(
          'fixed z-[70] flex flex-col bg-[#0b1626]/95 text-slate-200 shadow-2xl shadow-black/60 backdrop-blur-xl',
          mobile ? 'inset-0' : 'inset-x-0 top-[6vh] mx-auto max-h-[86vh] w-[min(640px,94vw)] rounded-[24px] border border-white/10',
        )}
      >
        <header className={cn('flex items-center gap-3 border-b border-white/10', mobile ? 'px-4 py-3' : 'px-6 py-4')}>
          <BookOpenCheck className="size-6 shrink-0 text-emerald-300" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="text-[19px] font-bold text-white">今天讀什麼</h2>
            <p className="text-[13px] text-slate-400">必讀 {total} 頁，學會 {doneN} 頁（每頁「學完馬上練」答對才算）</p>
          </div>
          <button type="button" onClick={onClose} aria-label="關閉 (Esc)" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-slate-300 hover:bg-white/[0.14] hover:text-white">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="h-1.5 bg-white/[0.06]">
          <div className="h-full bg-emerald-400 transition-all" style={{ width: `${total ? (doneN / total) * 100 : 0}%` }} />
        </div>

        <div className={cn('min-h-0 flex-1 overflow-y-auto', mobile ? 'px-3 py-4' : 'px-4 py-5')}>
          {last && (
            <button type="button" onClick={() => go(last)} className="mb-5 flex w-full items-center gap-3 rounded-2xl bg-sky-400/15 px-4 py-3 text-left ring-1 ring-sky-300/30 transition hover:bg-sky-400/25">
              <CornerDownRight className="size-5 shrink-0 text-sky-300" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-sky-300">繼續上次</span>
                <span className="block truncate text-[16px] font-semibold text-white">
                  P.{pad(indexOf(last) + 1)} {slides[indexOf(last)].title}
                </span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-sky-300" aria-hidden />
            </button>
          )}

          <h3 className="px-1 text-[14px] font-bold text-slate-300">今天讀這 {today.length || 3} 頁</h3>
          {today.length === 0 ? (
            <p className="mt-2 rounded-2xl bg-emerald-400/10 px-4 py-3 text-[15px] text-emerald-200">必讀頁全部練過了！接下來看查閱頁、聽錄音，或做錯題複習。</p>
          ) : (
            <ol className="mt-1.5">
              {today.map((id, k) => {
                const i = indexOf(id)
                const s = slides[i]
                const part = parts[s.part]
                return (
                  <li key={id}>
                    <button type="button" onClick={() => go(id)} className={rowCls}>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] font-mono text-[14px] font-bold text-slate-200">{k + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-[12px] font-semibold', toneStyles[part.tone].text)}>
                          {part.short} · P.{pad(i + 1)}
                          {learn.seen[id] && <span className="ml-1.5 text-slate-500">看過，還沒練</span>}
                        </span>
                        <span className="block truncate text-[16px] font-semibold text-white">{s.title}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-slate-500" aria-hidden />
                    </button>
                  </li>
                )
              })}
            </ol>
          )}
          <p className="mt-1 px-1 text-[13px] text-slate-500">
            讀完那一頁，{mobile ? '捲到最下面' : '按小結論右邊'}的「學完馬上練」答一題；答對了，這裡就換成下一頁。
          </p>

          <h3 className="mt-6 px-1 text-[14px] font-bold text-slate-300">錯題複習（{wrongIds.length}）</h3>
          {wrongIds.length === 0 ? (
            <p className="mt-2 px-1 text-[14px] text-slate-500">目前沒有錯題。答錯的題目會自動放到這裡，答對了就拿掉。</p>
          ) : (
            <ul className="mt-1.5 space-y-2">
              {wrongIds.map((id) => {
                const i = indexOf(id)
                const isOpen = openWrong === id
                return (
                  <li key={id} className="rounded-2xl bg-white/[0.04]">
                    <button type="button" onClick={() => setOpenWrong(isOpen ? null : id)} aria-expanded={isOpen} className={rowCls}>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-semibold text-red-300">
                          P.{pad(i + 1)} · 答錯 {learn.wrong[id].n} 次
                        </span>
                        <span className="block text-[15px] font-semibold text-white">{PRACTICE[id].q}</span>
                      </span>
                      <ChevronDown className={cn('size-5 shrink-0 text-slate-400 transition', isOpen && 'rotate-180')} aria-hidden />
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3">
                        <PracticeQuestion key={id} id={id} onCorrect={() => window.setTimeout(() => setOpenWrong(null), 1600)} />
                        <button type="button" onClick={() => go(id)} className="mt-2 text-[14px] font-bold text-sky-300 hover:text-sky-200">
                          回去看 P.{pad(i + 1)} →
                        </button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 px-1 pt-4 text-[12px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5" aria-hidden />
              進度只記在這台裝置的瀏覽器
            </span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('要清掉這台裝置的學習進度嗎？（看過的頁、練過的題、錯題都會清掉）')) resetLearn()
              }}
              className="inline-flex items-center gap-1 font-semibold text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              重新開始
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
