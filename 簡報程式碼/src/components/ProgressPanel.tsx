import { motion } from 'framer-motion'
import { ArrowRight, BookOpenCheck, Check, ChevronDown, CornerDownRight, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { parts } from '../data/parts'
import { PRACTICE } from '../data/practice'
import { slides } from '../data/slides'
import { cn, pad } from '../lib/cn'
import { PRACTICE_IDS, resetLearn, resumeId, todayPages, useLearn } from '../lib/learn'
import { toneStyles } from '../lib/tone'
import { PracticeQuestion } from './Practice'

const indexOf = (id: string) => slides.findIndex((s) => s.id === id)

/**
 * 「今天」：讀到哪、今天讀這 3 頁、錯題複習（AI 軟體課：學一段、馬上練、錯的再回來）。
 * 進度只存在這台裝置的瀏覽器。
 * currentId：目前在哪一頁（「繼續上次」「今天讀這 3 頁」不重複列目前這頁）。
 */
export function ProgressPanel({ open, onClose, onSelect, mobile, currentId }: { open: boolean; onClose: () => void; onSelect: (index: number) => void; mobile?: boolean; currentId: string }) {
  if (!open) return null
  return <ProgressDialog onClose={onClose} onSelect={onSelect} mobile={mobile} currentId={currentId} />
}

function ProgressDialog({ onClose, onSelect, mobile, currentId }: { onClose: () => void; onSelect: (index: number) => void; mobile?: boolean; currentId: string }) {
  const learn = useLearn()
  // 打開當下拍一張快照：視窗開著的時候清單不重排；答對的錯題留著顯示「答對了＋原因」，關掉才拿掉
  const [snap] = useState(() => {
    const resume = resumeId(currentId)
    return {
      resume,
      today: todayPages(learn, 3, [currentId, ...(resume ? [resume] : [])]),
      wrong: PRACTICE_IDS.filter((id) => learn.wrong[id]),
    }
  })
  const [openWrong, setOpenWrong] = useState<string | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })
  // 打開時焦點移進視窗（關閉鈕）、關掉時還原；Esc 關閉
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeBtn.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeRef.current()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      prev?.focus?.({ preventScroll: true })
    }
  }, [])

  const total = PRACTICE_IDS.length
  const doneN = PRACTICE_IDS.filter((id) => learn.done[id]).length
  const go = (id: string) => {
    onSelect(indexOf(id))
    onClose()
  }
  const nextWrong = (id: string) => {
    const k = snap.wrong.indexOf(id)
    setOpenWrong(snap.wrong.slice(k + 1).find((w) => learn.wrong[w]) ?? null)
  }
  const rowCls = 'flex min-h-[52px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.04] active:bg-white/[0.07]'

  return (
    <>
      {/* 只有進場動畫：退場動畫在背景分頁會跑不完 */}
      <motion.div className="fixed inset-0 z-[60] bg-ink/25" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="今天讀什麼"
        data-no-swipe
        initial={mobile ? { opacity: 0, y: 24 } : { opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18 }}
        className={cn(
          'fixed z-[70] flex flex-col bg-paper text-slate-200 shadow-[0_24px_64px_-24px_rgba(15,36,64,0.45)]',
          mobile ? 'inset-0' : 'inset-x-0 top-[6vh] mx-auto max-h-[86vh] w-[min(640px,94vw)] overflow-hidden rounded-[18px] border border-line',
        )}
      >
        <header className={cn('flex items-center gap-3 border-b border-line bg-card', mobile ? 'px-4 py-3' : 'px-6 py-4')}>
          <BookOpenCheck className="size-6 shrink-0 text-emerald-300" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-bold text-ink">今天讀什麼</h2>
            <p className="text-[14px] text-slate-400">
              有練習題的 {total} 頁，學會 {doneN} 頁（每頁「學完馬上練」答對才算）
            </p>
          </div>
          <button ref={closeBtn} type="button" onClick={onClose} aria-label="關閉 (Esc)" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-card text-slate-300 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="h-1.5 bg-white/[0.07]">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${total ? (doneN / total) * 100 : 0}%` }} />
        </div>

        <div className={cn('min-h-0 flex-1 overflow-y-auto', mobile ? 'px-3 py-4' : 'px-4 py-5')}>
          {snap.resume && (
            <button type="button" onClick={() => go(snap.resume!)} className="mb-5 flex w-full items-center gap-3 rounded-[14px] border border-sky-500/40 bg-sky-950 px-4 py-3 text-left transition hover:border-sky-500">
              <CornerDownRight className="size-5 shrink-0 text-sky-400" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold text-sky-300">繼續上次</span>
                <span className="block truncate text-[16px] font-semibold text-ink">
                  P.{pad(indexOf(snap.resume) + 1)} {slides[indexOf(snap.resume)].title}
                </span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-sky-400" aria-hidden />
            </button>
          )}

          <h3 className="px-1 text-[15px] font-bold text-slate-300">今天讀這 {snap.today.length || 3} 頁</h3>
          {snap.today.length === 0 ? (
            <p className="mt-2 rounded-xl bg-emerald-950 px-4 py-3 text-[15px] text-emerald-200">有練習題的頁全部練過了！接下來看查閱頁、聽錄音，或做錯題複習。</p>
          ) : (
            <ol className="mt-1.5">
              {snap.today.map((id, k) => {
                const i = indexOf(id)
                const s = slides[i]
                const part = parts[s.part]
                const passed = !!learn.done[id]
                return (
                  <li key={id}>
                    <button type="button" onClick={() => go(id)} className={rowCls}>
                      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-[14px] font-bold', passed ? 'border-emerald-500 bg-emerald-950 text-emerald-300' : 'border-line bg-card text-slate-200')}>
                        {passed ? <Check className="size-4" aria-hidden /> : k + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-[14px] font-semibold', toneStyles[part.tone].text)}>
                          {part.short} · P.{pad(i + 1)}
                          {passed ? <span className="ml-1.5 text-emerald-300">剛剛練過了</span> : learn.seen[id] && <span className="ml-1.5 text-slate-500">看過，還沒練</span>}
                        </span>
                        <span className="block truncate text-[16px] font-semibold text-ink">{s.title}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-slate-500" aria-hidden />
                    </button>
                  </li>
                )
              })}
            </ol>
          )}
          <p className="mt-1 px-1 text-[14px] text-slate-500">
            讀完那一頁，{mobile ? '捲到最下面' : '按小結論右邊'}的「學完馬上練」答一題；答對了，下次打開這裡就換成下一頁。
          </p>

          <h3 className="mt-6 px-1 text-[15px] font-bold text-slate-300">錯題複習（{snap.wrong.length}）</h3>
          {snap.wrong.length === 0 ? (
            <p className="mt-2 px-1 text-[14px] text-slate-500">目前沒有錯題。答錯的題目會自動放到這裡，答對了就拿掉。</p>
          ) : (
            <ul className="mt-1.5 space-y-2">
              {snap.wrong.map((id) => {
                const i = indexOf(id)
                const isOpen = openWrong === id
                const fixed = !learn.wrong[id]
                return (
                  <li key={id} className={cn('rounded-[14px] border bg-card', fixed ? 'border-emerald-500/45' : 'border-line')}>
                    <button type="button" onClick={() => setOpenWrong(isOpen ? null : id)} aria-expanded={isOpen} className={rowCls}>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-[14px] font-semibold', fixed ? 'text-emerald-300' : 'text-red-300')}>
                          P.{pad(i + 1)} · {fixed ? '這次答對了（關掉視窗後拿掉）' : `答錯 ${learn.wrong[id].n} 次`}
                        </span>
                        <span className="block text-[15px] font-semibold text-ink">{PRACTICE[id].q}</span>
                      </span>
                      <ChevronDown className={cn('size-5 shrink-0 text-slate-400 transition', isOpen && 'rotate-180')} aria-hidden />
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3">
                        <PracticeQuestion key={id} id={id} />
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <button type="button" onClick={() => go(id)} className="inline-flex min-h-11 items-center rounded-xl px-3 text-[15px] font-bold text-sky-300 hover:bg-sky-950">
                            回去看 P.{pad(i + 1)} →
                          </button>
                          {snap.wrong.slice(snap.wrong.indexOf(id) + 1).some((w) => learn.wrong[w]) && (
                            <button type="button" onClick={() => nextWrong(id)} className="ml-auto inline-flex min-h-11 items-center gap-1 rounded-xl border border-line bg-card px-4 text-[15px] font-bold text-slate-200 hover:border-sky-500/50">
                              下一題
                              <ArrowRight className="size-4" aria-hidden />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-line px-1 pt-3 text-[14px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check className="size-4" aria-hidden />
              進度只記在這台裝置的瀏覽器
            </span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('要清掉這台裝置的學習進度嗎？（看過的頁、練過的題、錯題都會清掉）')) {
                  resetLearn()
                  onClose()
                }
              }}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 font-semibold text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
            >
              <RotateCcw className="size-4" aria-hidden />
              重新開始
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
