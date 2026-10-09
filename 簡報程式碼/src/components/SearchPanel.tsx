import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { parts } from '../data/parts'
import { isNew } from '../data/whatsNew'
import { cn, pad } from '../lib/cn'
import { parseQuery, search, snippet, type SearchHit } from '../lib/searchIndex'
import { toneStyles } from '../lib/tone'
import { Kbd } from './ui/Kbd'

const EXAMPLES = ['膨脹閥', 'R404A', 'ODF', '黑金剛', '保溫管', 'Copeland', '過熱度']

interface SearchPanelProps {
  open: boolean
  onClose: () => void
  /** 選了一筆：跳到那一頁（index 從 0 起算） */
  onSelect: (index: number) => void
  mobile?: boolean
}

/**
 * 關鍵字搜尋：找標題、內文、小結論、名詞翻卡、縮寫、錄音段落。
 * 多個關鍵字用空白隔開要同時對到；↑↓ 選、Enter 跳頁、Esc 關閉。
 */
export function SearchPanel({ open, onClose, onSelect, mobile }: SearchPanelProps) {
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLOListElement>(null)
  const hits = useMemo(() => search(q), [q])
  const terms = useMemo(() => parseQuery(q), [q])

  useEffect(() => {
    if (!open) return
    setCursor(0)
    const t = window.setTimeout(() => input.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open])
  // Esc：焦點不在輸入框（點了「試試看」、清除鈕之後）也要關得掉（10/10 code review）
  useEffect(() => {
    if (!open) return
    const onEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      onClose()
    }
    window.addEventListener('keydown', onEsc, true)
    return () => window.removeEventListener('keydown', onEsc, true)
  }, [open, onClose])
  useEffect(() => setCursor(0), [q])
  /** 點了按鈕之後把焦點放回輸入框：↑↓、Enter 才能繼續用 */
  const setQuery = (v: string) => {
    setQ(v)
    input.current?.focus()
  }
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${cursor}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const pick = (hit: SearchHit) => {
    onSelect(hit.entry.index)
    onClose()
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, hits.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (e.key === 'Enter') {
      if (hits[cursor]) pick(hits[cursor])
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 只有進場動畫、沒有退場：退場動畫在背景分頁會跑不完，視窗會留在畫面上關不掉 */}
          <motion.div key="overlay" className="fixed inset-0 z-[60] bg-ink/25" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="搜尋"
            data-search-panel
            className={cn(
              'fixed z-[70] flex flex-col bg-paper shadow-[0_24px_64px_-24px_rgba(15,36,64,0.45)]',
              mobile ? 'inset-0' : 'inset-x-0 top-[7vh] mx-auto max-h-[82vh] w-[min(760px,94vw)] rounded-[18px] border border-line',
            )}
            initial={mobile ? { opacity: 0, y: 24 } : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18 }}
          >
            <div className={cn('flex items-center gap-3 border-b border-line bg-card', mobile ? 'rounded-none px-3 py-2.5' : 'rounded-t-[18px] px-5 py-4')}>
              <Search className="size-5 shrink-0 text-sky-400" aria-hidden />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="搜尋關鍵字（例：膨脹閥、R404A、ODF）"
                aria-label="搜尋關鍵字"
                autoComplete="off"
                enterKeyHint="search"
                className={cn('min-w-0 flex-1 bg-transparent font-semibold text-white outline-none placeholder:text-slate-500', mobile ? 'h-10 text-[17px]' : 'h-11 text-[19px]')}
              />
              {q && (
                <button type="button" onClick={() => setQuery('')} aria-label="清除" className="-my-1 flex size-11 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-white/[0.06] hover:text-ink">
                  <X className="size-4" aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="關閉搜尋 (Esc)"
                className={cn('shrink-0 rounded-full border border-line bg-card font-bold text-slate-200 hover:text-ink', mobile ? 'h-11 px-3 text-[15px]' : 'flex size-11 items-center justify-center')}
              >
                {mobile ? '取消' : <X className="size-5" aria-hidden />}
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {terms.length === 0 ? (
                <div className={cn('text-slate-400', mobile ? 'px-4 py-5 text-[15px]' : 'px-6 py-6 text-[15px]')}>
                  <p>可以找：每一頁的標題、內文、小結論、門市實戰、名詞翻卡、英文縮寫、錄音段落。</p>
                  <p className="mt-1">多個關鍵字用空白隔開，會找同時出現的頁。</p>
                  <p className="mt-4 text-[13px] font-bold text-slate-500">試試看</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {EXAMPLES.map((e) => (
                      <button key={e} type="button" onClick={() => setQuery(e)} className="rounded-full border border-line bg-card px-3 py-1 text-[14px] font-semibold text-slate-200 hover:border-sky-500/50 hover:bg-sky-950">
                        {e}
                      </button>
                    ))}
                  </div>
                  {!mobile && (
                    <p className="mt-5 flex items-center gap-1.5 text-[13px] text-slate-500">
                      <Kbd>↑</Kbd>
                      <Kbd>↓</Kbd> 選 <Kbd>Enter</Kbd> 跳頁 <Kbd>Esc</Kbd> 關閉；隨時按 <Kbd>/</Kbd> 開搜尋
                    </p>
                  )}
                </div>
              ) : hits.length === 0 ? (
                <div className={cn('text-slate-400', mobile ? 'px-4 py-6' : 'px-6 py-8')}>
                  <p className="text-[16px]">找不到「{q}」。</p>
                  <p className="mt-1 text-[14px]">換個說法試試：例如「熱排」也叫「散熱器」、「冷排」也叫「蒸發器」；型號可以只打一部分（例：KVL、404）。</p>
                </div>
              ) : (
                <>
                  <p className={cn('text-[13px] font-bold text-slate-500', mobile ? 'px-4 pt-3' : 'px-6 pt-4')}>找到 {hits.length} 頁</p>
                  <ol ref={list} className={cn('pb-3', mobile ? 'px-2 pt-1' : 'px-3 pt-2')}>
                    {hits.map((hit, i) => (
                      <Result key={hit.entry.slide.id} hit={hit} terms={terms} active={i === cursor} i={i} onHover={() => setCursor(i)} onPick={() => pick(hit)} mobile={mobile} />
                    ))}
                  </ol>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Result({ hit, terms, active, i, onHover, onPick, mobile }: { hit: SearchHit; terms: string[]; active: boolean; i: number; onHover: () => void; onPick: () => void; mobile?: boolean }) {
  const s = hit.entry.slide
  const part = parts[s.part]
  return (
    <li data-i={i}>
      <button
        type="button"
        onClick={onPick}
        onMouseMove={onHover}
        aria-current={active ? 'true' : undefined}
        className={cn('flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition', active ? 'bg-sky-950 ring-1 ring-inset ring-sky-500/30' : 'hover:bg-white/[0.04]')}
      >
        <span className={cn('mt-0.5 w-10 shrink-0 font-mono text-[14px] font-bold', active ? 'text-sky-400' : 'text-slate-500')}>P.{pad(hit.entry.index + 1)}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className={cn('text-[13px] font-semibold', toneStyles[part.tone].text)}>{part.short}</span>
            {isNew(s.added) && <span className="rounded bg-emerald-400 px-1.5 text-[13px] font-black text-paper">新</span>}
            {s.tier === 'ref' && <span className="text-[13px] text-slate-500">查閱</span>}
          </span>
          <span className={cn('block font-bold leading-snug text-white', mobile ? 'text-[16px]' : 'text-[17px]')}>
            <Mark text={s.title} terms={terms} />
          </span>
          {(mobile ? hit.chunks.slice(0, 1) : hit.chunks).map((c, k) => (
            <span key={k} className={cn('mt-1 block leading-snug text-slate-300', mobile ? 'text-[14px]' : 'text-[14px]')}>
              {c.label && <span className="mr-1.5 text-slate-500">{c.label} ·</span>}
              <Mark text={snippet(c.text, terms)} terms={terms} />
            </span>
          ))}
        </span>
      </button>
    </li>
  )
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** 把對到的關鍵字標亮 */
function Mark({ text, terms }: { text: string; terms: string[] }): ReactNode {
  if (!terms.length) return text
  const re = new RegExp(`(${terms.map(escapeRe).join('|')})`, 'gi')
  const parts = text.split(re)
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded-sm bg-amber-500/35 px-0.5 text-amber-50">
        {p}
      </mark>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  )
}
