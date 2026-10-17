import { motion } from 'framer-motion'
import { ArrowLeft, Check, Copy, KeyRound, Loader2, MessageCircleQuestion, RotateCcw, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { recordingOf } from '../data/recordings'
import { useStickyState } from '../hooks/useStickyState'
import { cn, pad } from '../lib/cn'
import { callTutor, closeTutor, contextFor, isPage, openTutor, pageNo, pageTitle, setPass, setTutorTab, TUTOR_JUMP, TUTOR_URL, TutorError, useTutor, type TutorJob, type TutorTab } from '../lib/tutor'
import { Segmented } from './ui/Segmented'

/** 開單前問客人總表（角色扮演、客人說…都先參考這頁） */
const HUB = 'ask-first'

const TABS: { value: TutorTab; label: string }[] = [
  { value: 'ask', label: '問問題' },
  { value: 'triage', label: '客人說' },
  { value: 'roleplay', label: '接客練習' },
  { value: 'boss', label: '問老闆' },
  { value: 'weekly', label: '老闆看' },
]

/**
 * AI 助教面板（10/17）：問問題、客人說一句話→要問什麼、接客角色扮演、要問老闆清單、老闆看的每週統計；
 * 答錯題「為什麼錯」、幾匹換算器「講給客人聽」、導讀也在這裡顯示結果。只根據筆記回答、附頁碼。
 */
export function TutorPanel({ currentId, mobile, onSelect }: { currentId: string; mobile?: boolean; onSelect: (index: number) => void }) {
  const t = useTutor()
  if (!t.open) return null
  return <TutorDialog currentId={currentId} mobile={mobile} onSelect={onSelect} />
}

function TutorDialog({ currentId, mobile, onSelect }: { currentId: string; mobile?: boolean; onSelect: (index: number) => void }) {
  const t = useTutor()
  const closeBtn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeBtn.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      // 注音輸入法按 Esc 是取消選字，不是關視窗
      if (e.key !== 'Escape' || e.isComposing) return
      e.preventDefault()
      e.stopImmediatePropagation()
      closeTutor()
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      prev?.focus?.({ preventScroll: true })
    }
  }, [])
  const go = (id: string) => {
    if (!isPage(id)) return
    window.dispatchEvent(new Event(TUTOR_JUMP))
    onSelect(pageNo(id) - 1)
    closeTutor()
  }

  let body: ReactNode
  if (!TUTOR_URL) body = <SetupNote />
  else if (!t.pass) body = <PassForm />
  else if (t.job) body = <JobView key={t.seq} job={t.job} go={go} />
  else if (t.tab === 'ask') body = <AskTab currentId={currentId} go={go} />
  else if (t.tab === 'triage') body = <TriageTab currentId={currentId} go={go} />
  else if (t.tab === 'roleplay') body = <RoleplayTab go={go} />
  else if (t.tab === 'boss') body = <BossTab currentId={currentId} go={go} />
  else body = <WeeklyTab go={go} />

  return (
    <>
      <motion.div className="fixed inset-0 z-[80] bg-ink/25" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={closeTutor} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="AI 助教"
        data-tutor-panel
        data-no-swipe
        initial={mobile ? { opacity: 0, y: 24 } : { opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18 }}
        className={cn('glass glass-strong fixed z-[90] flex flex-col text-slate-200', mobile ? 'inset-0 pt-[env(safe-area-inset-top)]' : 'inset-x-0 top-[5vh] mx-auto h-[88vh] w-[min(820px,94vw)] overflow-hidden rounded-[18px]')}
      >
        <header className={cn('flex items-center gap-3 border-b border-line', mobile ? 'px-4 py-3' : 'px-6 py-4')}>
          <Sparkles className="size-6 shrink-0 text-violet-300" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-bold text-ink">AI 助教</h2>
            <p className="text-[14px] text-slate-400">
              {mobile ? '只根據筆記回答' : '只根據筆記回答；筆記沒有的，幫你記下來問老闆'}{t.left !== null && <span className="whitespace-nowrap">・今天還能問 {t.left} 次</span>}
            </p>
          </div>
          <button ref={closeBtn} type="button" onClick={closeTutor} aria-label="關閉 (Esc)" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-card text-slate-300 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        {TUTOR_URL && t.pass && (
          <div className={cn('border-b border-line', mobile ? 'px-3 py-2' : 'px-6 py-3')}>
            {t.job ? (
              <button type="button" onClick={() => setTutorTab(t.tab)} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-[15px] font-bold text-sky-300 hover:bg-sky-950">
                <ArrowLeft className="size-4" aria-hidden />
                回到助教
              </button>
            ) : (
              <Segmented size="sm" fill={mobile} value={t.tab} onChange={setTutorTab} options={TABS} />
            )}
          </div>
        )}
        <div className={cn('min-h-0 flex-1 overflow-y-auto', mobile ? 'px-4 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-4' : 'px-6 py-5')}>{body}</div>
      </motion.div>
    </>
  )
}

/* ───────── 共用小元件 ───────── */

const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:opacity-40'
const btnMain = cn(btn, 'bg-sky-400 text-paper hover:bg-sky-300')
const btnSub = cn(btn, 'border border-line bg-card text-slate-200 hover:border-sky-500/50')
const box = 'rounded-[14px] border border-line bg-card p-4'
const h = 'text-[15px] font-bold text-slate-300'

/** 頁碼連結（只顯示真的存在的頁） */
function Pages({ ids, go }: { ids: string[]; go: (id: string) => void }) {
  const ok = [...new Set(ids)].filter(isPage)
  if (!ok.length) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {ok.map((id) => (
        <button key={id} type="button" onClick={() => go(id)} className="inline-flex min-h-11 max-w-full items-center rounded-full border border-sky-500/40 bg-sky-950 px-3 text-[14px] font-semibold text-sky-200 hover:border-sky-500">
          <span className="truncate">
            去看 P.{pad(pageNo(id))} {pageTitle(id)}
          </span>
        </button>
      ))}
    </div>
  )
}

function Loading({ text = '助教在翻筆記…' }: { text?: string }) {
  return (
    <p role="status" className="flex items-center gap-2 py-3 text-[15px] text-slate-300">
      <Loader2 className="size-5 animate-spin text-violet-300" aria-hidden />
      {text}
    </p>
  )
}

function ErrorBox({ err, retry }: { err: unknown; retry?: () => void }) {
  const msg = err instanceof Error ? err.message : String(err)
  return (
    <div role="alert" className="rounded-[14px] border border-red-500/50 bg-red-950 p-4 text-[15px] text-red-100">
      <p>{msg}</p>
      {retry && err instanceof TutorError && err.kind === 'net' && (
        <button type="button" onClick={retry} className={cn(btnSub, 'mt-2')}>
          <RotateCcw className="size-4" aria-hidden />
          再試一次
        </button>
      )}
    </div>
  )
}

/** 一次呼叫的狀態：loading → data／err */
function useCall<T>() {
  const [s, setS] = useState<{ loading: boolean; data: T | null; err: unknown }>({ loading: false, data: null, err: null })
  // 連按：state 還沒更新前的第二下，用 ref 擋（10/17 QA：一次觸發 3 下送了 3 次）
  const busy = useRef(false)
  const run = async (action: string, body: Record<string, unknown>, passTry?: string) => {
    if (busy.current) return null
    busy.current = true
    setS({ loading: true, data: null, err: null })
    try {
      const r = await callTutor<T>(action, body, passTry)
      setS({ loading: false, data: r.data, err: null })
      return r
    } catch (err) {
      setS({ loading: false, data: null, err })
      return null
    } finally {
      busy.current = false
    }
  }
  return { ...s, run, reset: () => setS({ loading: false, data: null, err: null }) }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function CopyButton({ text, label = '複製' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true)
          window.setTimeout(() => setDone(false), 1500)
        }
      }}
      className={btnSub}
    >
      {done ? <Check className="size-4 text-emerald-300" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {done ? '複製好了' : label}
    </button>
  )
}

/** 加到要問老闆（按一次就好，加完變灰） */
function AddBoss({ q, page, onAdded }: { q: string; page?: string; onAdded?: () => void }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'err'>('idle')
  const [text, setText] = useState(q)
  if (state === 'done')
    return (
      <p className="mt-2 flex items-center gap-1.5 text-[15px] font-semibold text-emerald-300">
        <Check className="size-4" aria-hidden />
        加到「問老闆」清單了
      </p>
    )
  return (
    <div className="mt-2 flex flex-col gap-2">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={600} aria-label="要問老闆的問題" className="w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 text-[16px] text-ink outline-none focus:border-sky-500" />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!text.trim() || state === 'busy'}
          onClick={async () => {
            setState('busy')
            try {
              await callTutor('bossAdd', { q: text.trim(), page })
              setState('done')
              onAdded?.()
            } catch {
              setState('err')
            }
          }}
          className={btnSub}
        >
          <MessageCircleQuestion className="size-4" aria-hidden />
          加到要問老闆
        </button>
        {state === 'err' && <span className="text-[14px] text-red-300">沒加成功，再按一次</span>}
      </div>
    </div>
  )
}

/** 四選一小題（助教出的）：選了馬上對答案 */
function QuizCard({ quiz, n }: { quiz: Quiz; n?: number }) {
  const [picked, setPicked] = useState<number | null>(null)
  // AI 出的題目格式不對（答案超出選項）就不顯示，免得「正確是綠色那個」卻沒有綠色
  if (!quiz || quiz.options.length < 2 || !Number.isInteger(quiz.answer) || quiz.answer < 0 || quiz.answer >= quiz.options.length) return null
  const done = picked !== null
  return (
    <div className={box}>
      <p className="text-[16px] font-bold text-ink">
        {n ? `${n}. ` : ''}
        {quiz.q}
      </p>
      <div className="mt-2 flex flex-col gap-1.5">
        {quiz.options.map((o, i) => (
          <button
            key={i}
            type="button"
            disabled={done}
            onClick={() => setPicked(i)}
            className={cn(
              'min-h-11 rounded-xl border px-3 py-2 text-left text-[15px] font-semibold',
              !done && 'border-line bg-paper text-slate-100 hover:border-sky-500/60',
              done && i === quiz.answer && 'border-emerald-500/70 bg-emerald-950 text-emerald-50',
              done && i === picked && i !== quiz.answer && 'border-red-500/70 bg-red-950 text-red-50',
              done && i !== quiz.answer && i !== picked && 'border-line text-slate-500',
            )}
          >
            {String.fromCharCode(65 + i)}. {o}
          </button>
        ))}
      </div>
      {done && (
        <p role="status" className={cn('mt-2 text-[15px]', picked === quiz.answer ? 'text-emerald-200' : 'text-red-200')}>
          {picked === quiz.answer ? '答對了！' : '答錯了，正確是綠色那個。'}
          {quiz.why}
        </p>
      )}
    </div>
  )
}
interface Quiz {
  q: string
  options: string[]
  answer: number
  why: string
}

/* ───────── 還沒開通、通行碼 ───────── */

function SetupNote() {
  return (
    <div className="space-y-3 text-[16px] leading-relaxed">
      <p className="font-bold text-ink">助教還沒開通</p>
      <p>要先在你自己的 Google 帳號架一個小後端（放 Claude 金鑰、通行碼、每天次數上限），網站才能問助教。步驟寫在「助教部署說明」，大約 10 分鐘。</p>
      <p className="text-slate-400">金鑰只放在你的 Apps Script 裡，網頁上看不到；問答紀錄存在你的 Google 試算表。</p>
    </div>
  )
}

function PassForm() {
  const [v, setV] = useState('')
  const call = useCall<unknown>()
  // 先用輸入的試，對了才存：錯的話表單留著、看得到錯誤訊息
  const submit = async () => {
    const r = await call.run('ping', {}, v.trim())
    if (r) setPass(v.trim())
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
      className="mx-auto flex max-w-[460px] flex-col gap-3 py-4"
    >
      <p className="flex items-center gap-2 text-[17px] font-bold text-ink">
        <KeyRound className="size-5 text-amber-300" aria-hidden />
        輸入助教通行碼
      </p>
      <p className="text-[15px] text-slate-400">第一次用要輸入；這台裝置會記住，之後不用再打。</p>
      <input type="password" value={v} onChange={(e) => setV(e.target.value)} autoComplete="off" aria-label="助教通行碼" className="h-12 rounded-xl border border-line bg-paper px-4 text-[17px] text-ink outline-none focus:border-sky-500" />
      <button type="submit" disabled={v.trim().length < 6 || call.loading} className={btnMain}>
        {call.loading ? '確認中…' : '確定'}
      </button>
      {call.err != null && <ErrorBox err={call.err} />}
    </form>
  )
}

/* ───────── ① 問問題 ───────── */

interface AskData {
  answer: string
  pages: string[]
  covered: boolean
  bossQuestion: string
}
interface AskItem extends AskData {
  id: number
  q: string
  page: string
}

function AskTab({ currentId, go }: { currentId: string; go: (id: string) => void }) {
  const [q, setQ] = useState('')
  const [hist, setHist] = useStickyState<AskItem[]>('tutor:asks', [])
  const call = useCall<AskData>()
  const rec = recordingOf(currentId)
  // example：按範例題直接問，不用先打字（範例不一定跟這頁有關，就不附這一頁）
  const send = async (example?: string) => {
    const text = (example ?? q).trim()
    if (!text || call.loading) return
    const r = await call.run('ask', { input: text, page: currentId, context: contextFor(text, example ? undefined : currentId) })
    if (r) {
      setHist((h) => [{ ...r.data, id: Date.now(), q: text, page: currentId }, ...h].slice(0, 20))
      if (!example) setQ('')
    }
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <span className="w-full text-[14px] text-slate-400">
          你在看 P.{pad(pageNo(currentId))} {pageTitle(currentId)}
        </span>
        {rec && <Chip onClick={() => openJob({ kind: 'digest', slideId: currentId, mode: '錄音導讀' })}>錄音導讀＋考 3 題</Chip>}
        <Chip onClick={() => openJob({ kind: 'digest', slideId: currentId, mode: '白話講這頁' })}>用白話講這頁</Chip>
        <Chip onClick={() => openJob({ kind: 'digest', slideId: currentId, mode: '考我' })}>這頁考我 3 題</Chip>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void send()
        }}
        className="flex flex-col gap-2"
      >
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void send()
          }}
          rows={3}
          maxLength={500}
          placeholder="例：R404A 跟 R134a 的壓縮機可以互換嗎？"
          aria-label="問助教"
          className="w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-[16px] text-ink outline-none placeholder:text-slate-500 focus:border-sky-500"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={!q.trim() || call.loading} className={btnMain}>
            <Send className="size-4" aria-hidden />
            問助教
          </button>
          <span className="text-[14px] text-slate-500">會先看這一頁，再找筆記裡相關的頁</span>
        </div>
      </form>
      <Examples title="常問的問題（點了直接問）" groups={ASK_EX} disabled={call.loading} onPick={(x) => void send(x)} />
      {call.loading && <Loading />}
      {call.err != null && <ErrorBox err={call.err} retry={send} />}
      {hist.map((it, i) => (
        <article key={it.id ?? i} className={box}>
          <p className="break-words text-[15px] font-bold text-sky-300 [overflow-wrap:anywhere]">問：{it.q}</p>
          <p className="mt-1.5 whitespace-pre-line text-[16px] leading-relaxed text-ink">{it.answer}</p>
          <Pages ids={it.pages} go={go} />
          {!it.covered ? (
            <div className="mt-3 rounded-xl bg-amber-950 p-3">
              <p className="text-[15px] font-bold text-amber-200">筆記沒有寫到，建議問老闆</p>
              <AddBoss q={it.bossQuestion || it.q} page={it.page} />
            </div>
          ) : (
            <details className="mt-2 text-[14px] text-slate-400">
              <summary className="min-h-9 cursor-pointer py-1.5">還是想問老闆</summary>
              <AddBoss q={it.q} page={it.page} />
            </details>
          )}
        </article>
      ))}
      {hist.length > 0 && (
        <button type="button" onClick={() => setHist([])} className="self-start text-[14px] text-slate-500 underline underline-offset-2">
          清掉問過的紀錄（只清這台）
        </button>
      )}
    </div>
  )
}

function Chip({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-violet-400/45 bg-violet-950 px-3.5 text-[15px] font-semibold text-violet-100 hover:border-violet-400">
      <Sparkles className="size-4" aria-hidden />
      {children}
    </button>
  )
}
const openJob = (job: TutorJob) => openTutor('ask', job)

/**
 * 範例題（10/18 使用者：「原來那幾個很不錯，但太少了」「要有含金量」）。
 * 都是筆記教過、門市真的會遇到的問題：問完會附頁碼，也是很好的複習。
 */
const ASK_EX: { group: string; items: string[] }[] = [
  { group: '壓縮機', items: ['礦物油的壓縮機可以灌 R404A 嗎？', '客人要冷藏一匹，可以給丹佛斯 21G 嗎？', '低溫的「一匹」為什麼有大有小？要怎麼問客人？', '大陸型錄寫 50 Hz，能力要怎麼換算？', '鐵甲 7512 是幾匹？怎麼看出來的？', '往復式和渦捲式差在哪？什麼時候用哪一種？'] },
  { group: '散熱器、冷排', items: ['散熱器什麼時候要加大？最多加到多少？', '為什麼跟客人講散熱器要說「以上」？', '冷排結冰很厚，一定要換蒸發器嗎？', '散熱外移、管子很長，散熱器可以配小一點嗎？'] },
  { group: '冷媒、配件', items: ['R22 現在還能用嗎？以後會怎樣？', '冷藏要灌 R404A 還是 R438A？', '保溫管灰色和黑色差在哪？', '客人說「兩分」的乾燥過濾器，要再問什麼？'] },
  { group: '門市、客訴', items: ['材料為什麼不保固？要怎麼跟客人講？', '客人一直來補冷媒，該推什麼？', '換壓縮機開單前一定要問哪幾件事？', '壓縮機燒掉，換新的之前要先做什麼？'] },
]

/** 一組一組的範例按鈕（按了直接用） */
function Examples({ title, groups, disabled, onPick }: { title: string; groups: { group: string; items: string[] }[]; disabled?: boolean; onPick: (x: string) => void }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className={h}>{title}</h3>
      {groups.map((g) => (
        <div key={g.group}>
          <p className="mb-1 text-[13px] font-bold text-slate-500">{g.group}</p>
          <div className="flex flex-wrap gap-1.5">
            {g.items.map((x) => (
              <button key={x} type="button" disabled={disabled} onClick={() => onPick(x)} className="min-h-11 rounded-full border border-line bg-card px-3.5 py-1.5 text-left text-[15px] font-semibold leading-snug text-slate-200 hover:border-sky-500/50 disabled:opacity-40">
                {x}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

/* ───────── ⑥ 客人說一句話 ───────── */

interface TriageData {
  causes: { text: string; page: string }[]
  ask: { q: string; why: string }[]
  sell: { item: string; page: string }[]
  covered: boolean
  bossQuestion: string
}
const TRIAGE_EX = [
  '我冰箱不冷了',
  '壓縮機一直跳 Over Load',
  '我要換一顆壓縮機',
  '冷凍庫的散熱器要買多大',
  '冷媒補了，過幾天又不冷',
  '冷排一直結冰、越來越不冷',
  '壓縮機嗡嗡叫，但是轉不動',
  '新的壓縮機才裝沒多久就壞了',
  '壓縮機外殼一直冒汗，回氣管結霜很厚',
  '壓縮機很吵、一直在抖',
  '我要兩瓶冷媒',
  '我要兩分的乾燥過濾器',
  '我要買保溫管',
  '冷氣的銅管跟機器的牙對不上',
]

function TriageTab({ currentId, go }: { currentId: string; go: (id: string) => void }) {
  const [q, setQ] = useStickyState('tutor:triage', '')
  const call = useCall<TriageData>()
  const send = (text = q) => {
    if (!text.trim() || call.loading) return
    setQ(text)
    void call.run('triage', { input: text.trim(), page: currentId, context: contextFor(text, undefined, [HUB, 'comp-fault'], 3) })
  }
  const d = call.data
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] text-slate-300">客人在門市、電話裡講一句話，助教幫你列：可能原因、要先問客人什麼、可以推什麼材料。</p>
      <div className="flex flex-wrap gap-2">
        {TRIAGE_EX.map((x) => (
          <button key={x} type="button" disabled={call.loading} onClick={() => send(x)} className="min-h-11 rounded-full disabled:opacity-40 border border-line bg-card px-3.5 text-[15px] font-semibold text-slate-200 hover:border-sky-500/50">
            {x}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
        className="flex gap-2"
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={300} placeholder="客人說…" aria-label="客人說了什麼" className="h-12 min-w-0 flex-1 rounded-xl border border-line bg-paper px-4 text-[16px] text-ink outline-none placeholder:text-slate-500 focus:border-sky-500" />
        <button type="submit" disabled={!q.trim() || call.loading} className={btnMain}>
          列出來
        </button>
      </form>
      {call.loading && <Loading />}
      {call.err != null && <ErrorBox err={call.err} retry={() => send()} />}
      {d && (
        <>
          {d.ask.length > 0 && (
            <section className={box}>
              <h3 className={h}>先問客人</h3>
              <ol className="mt-1.5 space-y-2">
                {d.ask.map((a, i) => (
                  <li key={i} className="text-[16px] text-ink">
                    <b>
                      {i + 1}. {a.q}
                    </b>
                    <span className="block text-[15px] text-slate-400">為什麼問：{a.why}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {d.causes.length > 0 && (
            <section className={box}>
              <h3 className={h}>可能的原因</h3>
              <ul className="mt-1.5 space-y-1.5 text-[16px] text-ink">
                {d.causes.map((c, i) => (
                  <li key={i}>・{c.text}</li>
                ))}
              </ul>
              <Pages ids={d.causes.map((c) => c.page)} go={go} />
            </section>
          )}
          {d.sell.length > 0 && (
            <section className={box}>
              <h3 className={h}>可以推的材料</h3>
              <ul className="mt-1.5 space-y-1.5 text-[16px] text-ink">
                {d.sell.map((c, i) => (
                  <li key={i}>・{c.item}</li>
                ))}
              </ul>
              <Pages ids={d.sell.map((c) => c.page)} go={go} />
            </section>
          )}
          {!d.covered && (
            <div className="rounded-xl bg-amber-950 p-3">
              <p className="text-[15px] font-bold text-amber-200">筆記沒有完整寫到，建議問老闆</p>
              <AddBoss q={d.bossQuestion || q} page={currentId} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ───────── ⑤ 接客練習（角色扮演） ───────── */

interface RpSetup {
  opening: string
  hidden: string[]
  mustAsk: string[]
}
interface RpScore {
  score: number
  good: string[]
  missed: { q: string; why: string; page: string }[]
  tip: string
}
type Line = { who: '客人' | '我'; text: string }
const TOPICS = [
  '客人要換壓縮機',
  '客人要買散熱器',
  '客人冰箱不冷來問',
  '客人要配冷氣材料（銅管、保溫管）',
  '客人說要做一間幾坪的冷凍庫',
  '客人一進門就說要兩瓶冷媒',
  '客人新裝的壓縮機壞了，來客訴',
  '客人只說要「兩分」的乾燥過濾器',
  '客人拿大陸型錄來，問能力為什麼不一樣',
  '客人要冷藏「一匹」的壓縮機',
]
const MAX_TURNS = 12

function RoleplayTab({ go }: { go: (id: string) => void }) {
  // 記在 sticky state：換分頁、關掉助教再打開，練到一半的對話還在（10/17 QA）
  const [topic, setTopic] = useStickyState<string | null>('tutor:rp:topic', null)
  const [setup, setSetup] = useStickyState<RpSetup | null>('tutor:rp:setup', null)
  const [lines, setLines] = useStickyState<Line[]>('tutor:rp:lines', [])
  const [say, setSay] = useState('')
  const [done, setDone] = useStickyState('tutor:rp:done', false)
  const [result, setResult] = useStickyState<RpScore | null>('tutor:rp:score', null)
  const start = useCall<RpSetup>()
  const turn = useCall<{ reply: string; done: boolean }>()
  const score = useCall<RpScore>()
  const end = useRef<HTMLDivElement>(null)
  /** 第幾場練習：換情境後，舊的回覆就丟掉 */
  const round = useRef(0)
  // 大括號不能省：新版 Chrome 的 scrollIntoView 會回傳 Promise，被 React 當成清除函式就整頁當掉（10/17 QA）
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' })
  }, [lines, result])
  const ctx = (t: string) => contextFor(t, undefined, [HUB], 3)
  const begin = async (t: string) => {
    setTopic(t)
    setLines([])
    setDone(false)
    setSetup(null)
    setResult(null)
    score.reset()
    const my = ++round.current
    const r = await start.run('rpStart', { input: t, context: ctx(t) })
    // 等的時候按了「換一個情境」：舊的回覆不要套上去
    if (r && my === round.current) {
      setSetup(r.data)
      setLines([{ who: '客人', text: r.data.opening }])
    }
  }
  const myTurns = lines.filter((l) => l.who === '我').length
  const send = async () => {
    const text = say.trim()
    if (!text || !setup || !topic || turn.loading) return
    const my = round.current
    const next: Line[] = [...lines, { who: '我', text }]
    setLines(next)
    setSay('')
    // 扮客人只要設定和對話，不用再送筆記（省錢）
    const r = await turn.run('rpTurn', { input: JSON.stringify({ topic, hidden: setup.hidden, dialog: next }), context: '' })
    if (r && my === round.current) {
      setLines([...next, { who: '客人', text: r.data.reply }])
      if (r.data.done || myTurns + 1 >= MAX_TURNS) setDone(true)
    }
  }
  const finish = async () => {
    if (!setup || !topic || score.loading) return
    setDone(true)
    const r = await score.run('rpScore', { input: JSON.stringify({ topic, hidden: setup.hidden, mustAsk: setup.mustAsk, dialog: lines }), context: ctx(topic) })
    if (r) setResult(r.data)
  }

  if (!topic || (!setup && !start.loading && start.err == null))
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[15px] text-slate-300">助教扮演來店裡的客人，你練習「開單前要問什麼」。問到才會說，結束後幫你打分數、列出漏問的。</p>
        {TOPICS.map((t) => (
          <button key={t} type="button" onClick={() => void begin(t)} className="flex min-h-14 items-center justify-between rounded-[14px] border border-line bg-card px-4 text-left text-[16px] font-bold text-ink hover:border-sky-500/50">
            {t}
            <span className="text-[14px] font-semibold text-sky-300">開始 →</span>
          </button>
        ))}
        <p className="text-[14px] text-slate-500">每回合算一次助教次數；最多 {MAX_TURNS} 回合。</p>
      </div>
    )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[15px] font-bold text-slate-300">情境：{topic}</p>
        <button
          type="button"
          onClick={() => {
            round.current++
            setTopic(null)
          }}
          className="min-h-11 text-[14px] text-slate-400 underline underline-offset-2"
        >
          換一個情境
        </button>
      </div>
      {start.loading && <Loading text="客人正在走進店裡…" />}
      {start.err != null && <ErrorBox err={start.err} retry={() => void begin(topic)} />}
      <ol className="flex flex-col gap-2">
        {lines.map((l, i) => (
          <li key={i} className={cn('max-w-[85%] rounded-2xl px-4 py-2.5 text-[16px] leading-relaxed [overflow-wrap:anywhere]', l.who === '客人' ? 'self-start bg-card text-ink' : 'self-end bg-sky-900 text-white')}>
            <span className="mb-0.5 block text-[13px] font-bold opacity-70">{l.who}</span>
            {l.text}
          </li>
        ))}
      </ol>
      {turn.loading && <Loading text="客人在想…" />}
      {turn.err != null && <ErrorBox err={turn.err} />}
      {setup && !done && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void send()
          }}
          className="flex gap-2"
        >
          <input value={say} onChange={(e) => setSay(e.target.value)} maxLength={300} placeholder="你要問客人什麼？" aria-label="你對客人說" className="h-12 min-w-0 flex-1 rounded-xl border border-line bg-paper px-4 text-[16px] text-ink outline-none placeholder:text-slate-500 focus:border-sky-500" />
          <button type="submit" disabled={!say.trim() || turn.loading} className={btnMain} aria-label="送出">
            <Send className="size-4" aria-hidden />
          </button>
        </form>
      )}
      {setup && myTurns > 0 && !result && !score.loading && (
        <button type="button" onClick={() => void finish()} disabled={turn.loading} className={cn(btnSub, 'self-start')}>
          結束，幫我打分數
        </button>
      )}
      {score.loading && <Loading text="助教在打分數…" />}
      {score.err != null && <ErrorBox err={score.err} retry={() => void finish()} />}
      {result && (
        <section className={cn(box, 'border-violet-400/45')}>
          <p className="text-[28px] font-black text-violet-200">{result.score} 分</p>
          {result.good.length > 0 && (
            <>
              <h3 className={cn(h, 'mt-2')}>做得好</h3>
              <ul className="mt-1 space-y-1 text-[16px] text-emerald-200">
                {result.good.map((g, i) => (
                  <li key={i}>・{g}</li>
                ))}
              </ul>
            </>
          )}
          {result.missed.length > 0 && (
            <>
              <h3 className={cn(h, 'mt-3')}>漏問的</h3>
              <ol className="mt-1 space-y-2">
                {result.missed.map((m, i) => (
                  <li key={i} className="text-[16px] text-ink">
                    <b>{m.q}</b>
                    <span className="block text-[15px] text-slate-400">為什麼問：{m.why}</span>
                  </li>
                ))}
              </ol>
              <Pages ids={result.missed.map((m) => m.page)} go={go} />
            </>
          )}
          <p className="mt-3 rounded-xl bg-white/[0.05] p-3 text-[16px] text-ink">{result.tip}</p>
          <button type="button" onClick={() => void begin(topic)} className={cn(btnMain, 'mt-3')}>
            同一個情境再練一次
          </button>
        </section>
      )}
      <div ref={end} />
    </div>
  )
}

/* ───────── ② 要問老闆 ───────── */

interface BossItem {
  id: string
  at: string
  q: string
  page: string
  answer: string
  archive: boolean
}

const BOSS_EX = [
  '低溫一匹到底用 4,000 還是 4,500 BTU 算？店裡怎麼算？',
  '散熱外移、管子拉很長，冷媒大概要多灌多少？',
  '中溫車拿來打冷藏，什麼時候划算？',
  '店裡常賣的溫控器是哪幾款？差在哪？',
  '散熱器「有外箱」和「無穿衫」差多少？怎麼推？',
  '高壓氣管在現場都怎麼叫？',
]

function BossTab({ currentId, go }: { currentId: string; go: (id: string) => void }) {
  const [items, setItems] = useState<BossItem[] | null>(null)
  const [err, setErr] = useState<unknown>(null)
  const [adding, setAdding] = useState(false)
  const load = async () => {
    setErr(null)
    try {
      const r = await callTutor('bossList')
      setItems(((r.items as BossItem[]) ?? []).filter((x) => !x.archive))
    } catch (e) {
      setErr(e)
    }
  }
  useEffect(() => {
    void load()
  }, [])
  const [added, setAdded] = useState<string[]>([])
  const addEx = async (q: string) => {
    setAdded((a) => [...a, q])
    try {
      await callTutor('bossAdd', { q, page: currentId })
      void load()
    } catch (e) {
      setAdded((a) => a.filter((x) => x !== q))
      setErr(e)
    }
  }
  const open = items?.filter((x) => !x.answer) ?? []
  const done = items?.filter((x) => x.answer) ?? []
  const lineText = '想請教老闆：\n' + open.map((x, i) => `${i + 1}. ${x.q}`).join('\n')
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] text-slate-300">問助教時筆記沒有的、或你想親口問的，都放這裡。老闆回答後打進來，助教之後回答也會參考，筆記整理時也會收進去。</p>
      {adding ? (
        <div className={box}>
          <AddBoss q="" page={currentId} onAdded={() => void load()} />
          <button type="button" onClick={() => setAdding(false)} className={cn(btnSub, 'mt-2')}>
            完成
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className={cn(btnSub, 'self-start')}>
          ＋ 自己加一題
        </button>
      )}
      <section className="flex flex-col gap-1.5">
        <h3 className={h}>筆記還沒講清楚、值得問老闆的（點了加進清單）</h3>
        <div className="flex flex-wrap gap-1.5">
          {BOSS_EX.filter((x) => !items?.some((it) => it.q === x)).map((x) => (
            <button key={x} type="button" disabled={added.includes(x)} onClick={() => void addEx(x)} className="min-h-11 rounded-full border border-amber-500/40 bg-amber-950 px-3.5 py-1.5 text-left text-[15px] font-semibold leading-snug text-amber-100 hover:border-amber-500 disabled:opacity-40">
              ＋ {x}
            </button>
          ))}
        </div>
      </section>
      {err != null && <ErrorBox err={err} retry={() => void load()} />}
      {!items && err == null && <Loading text="讀取清單…" />}
      {items && (
        <>
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className={h}>還沒問（{open.length}）</h3>
              {open.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <CopyButton text={lineText} label="複製全部" />
                  <a href={`https://line.me/R/share?text=${encodeURIComponent(lineText)}`} target="_blank" rel="noreferrer" className={cn(btn, 'bg-[#06C755] text-white hover:brightness-110')}>
                    用 LINE 傳
                  </a>
                </div>
              )}
            </div>
            {open.length === 0 && <p className="mt-2 text-[15px] text-slate-500">目前沒有要問的。</p>}
            <ul className="mt-2 space-y-2">
              {open.map((x) => (
                <BossRow key={x.id} item={x} go={go} onChange={load} />
              ))}
            </ul>
          </section>
          {done.length > 0 && (
            <section>
              <h3 className={h}>老闆回答過（{done.length}）</h3>
              <ul className="mt-2 space-y-2">
                {done.map((x) => (
                  <BossRow key={x.id} item={x} go={go} onChange={load} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function BossRow({ item, go, onChange }: { item: BossItem; go: (id: string) => void; onChange: () => void }) {
  const [edit, setEdit] = useState(false)
  const [ans, setAns] = useState(item.answer)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<unknown>(null)
  const save = async (action: 'bossAnswer' | 'bossArchive') => {
    setBusy(true)
    setErr(null)
    try {
      await callTutor(action, { id: item.id, answer: ans.trim() })
      setEdit(false)
      onChange()
    } catch (e) {
      setErr(e)
    } finally {
      setBusy(false)
    }
  }
  return (
    <li className={box}>
      <p className="text-[16px] font-bold text-ink [overflow-wrap:anywhere]">{item.q}</p>
      {item.page && <Pages ids={[item.page]} go={go} />}
      {item.answer && !edit && <p className="mt-2 whitespace-pre-line rounded-xl bg-emerald-950 p-3 text-[16px] text-emerald-50 [overflow-wrap:anywhere]">老闆：{item.answer}</p>}
      {edit && (
        <textarea value={ans} onChange={(e) => setAns(e.target.value)} rows={3} maxLength={2000} placeholder="老闆怎麼說？" aria-label="老闆的回答" className="mt-2 w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 text-[16px] text-ink outline-none focus:border-sky-500" />
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {edit ? (
          <>
            <button type="button" disabled={busy || !ans.trim()} onClick={() => void save('bossAnswer')} className={btnMain}>
              存起來
            </button>
            <button
              type="button"
              onClick={() => {
                setAns(item.answer)
                setEdit(false)
              }}
              className={btnSub}
            >
              取消
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setEdit(true)} className={btnSub}>
            {item.answer ? '改回答' : '寫老闆的回答'}
          </button>
        )}
        <button type="button" disabled={busy} onClick={() => {
            if (window.confirm('這題收起來，清單上就不顯示了（試算表裡還留著）。確定嗎？')) void save('bossArchive')
          }} className={cn(btn, 'text-slate-400 hover:bg-white/[0.05]')}>
          不用問了（收起來）
        </button>
      </div>
      {err != null && <div className="mt-2"><ErrorBox err={err} /></div>}
    </li>
  )
}

/* ───────── ⑧ 老闆看 ───────── */

interface Weekly {
  total: number
  summary: string
  topics: { topic: string; count: number; examples: string[]; page: string; gap: boolean }[]
}

function WeeklyTab({ go }: { go: (id: string) => void }) {
  const call = useCall<Weekly>()
  const d = call.data
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] text-slate-300">給老闆看：最近 7 天新人最常問的前 5 類問題，知道哪裡沒教清楚、下次上課補什麼。同一天整理過就直接看結果，不重複花錢。</p>
      <button type="button" onClick={() => void call.run('weekly', {})} disabled={call.loading} className={cn(btnMain, 'self-start')}>
        整理最近 7 天
      </button>
      {call.loading && <Loading text="助教在整理…" />}
      {call.err != null && <ErrorBox err={call.err} />}
      {d && (
        <>
          <p className={cn(box, 'text-[16px] leading-relaxed text-ink')}>
            <b className="mr-1 text-violet-200">共 {d.total} 題。</b>
            {d.summary}
          </p>
          <ol className="space-y-2">
            {d.topics.map((t, i) => (
              <li key={i} className={box}>
                <p className="flex flex-wrap items-center gap-2 text-[16px] font-bold text-ink">
                  {i + 1}. {t.topic}
                  <span className="rounded-full bg-white/[0.07] px-2 text-[14px] text-slate-300">{t.count} 次</span>
                  {t.gap && <span className="rounded-full bg-amber-950 px-2 text-[14px] text-amber-200">建議補課</span>}
                </p>
                <ul className="mt-1 text-[15px] text-slate-400">
                  {t.examples.map((x, k) => (
                    <li key={k}>「{x}」</li>
                  ))}
                </ul>
                <Pages ids={[t.page]} go={go} />
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}

/* ───────── ③④⑦ 從別的地方叫來的工作 ───────── */

interface WrongData {
  explain: string
  pages: string[]
  followup: Quiz
}
interface PitchData {
  script: string
  notes: string[]
  pages: string[]
}
interface DigestData {
  points: { text: string; page: string }[]
  quiz: Quiz[]
}

function JobView({ job, go }: { job: TutorJob; go: (id: string) => void }) {
  const call = useCall<WrongData & PitchData & DigestData>()
  const ran = useRef(false)
  const run = () => {
    if (job.kind === 'wrong')
      void call.run('wrong', {
        page: job.slideId,
        input: `題目：${job.q}\n選項：${job.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('／')}\n他選：${job.options[job.picked]}\n正確答案：${job.options[job.answer]}\n原本的解說：${job.why}`,
        context: contextFor(job.q, job.slideId, [], 2),
      })
    else if (job.kind === 'pitch') void call.run('pitch', { page: job.slideId, input: job.text, context: contextFor('幾匹 BTU 散熱器 排氣量', job.slideId, ['comp-rating', 'comp-displacement'], 1) })
    else void call.run('digest', { page: job.slideId, input: job.mode, context: contextFor(pageTitle(job.slideId), job.slideId, [], job.mode === '錄音導讀' ? 2 : 1) })
  }
  useEffect(() => {
    if (ran.current) return
    ran.current = true
    run()
    // 只在打開時做一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const title = job.kind === 'wrong' ? '為什麼錯？' : job.kind === 'pitch' ? '講給客人聽' : job.mode === '錄音導讀' ? '錄音導讀＋考 3 題' : job.mode === '考我' ? '這頁考我 3 題' : '用白話講這頁'
  const d = call.data
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[18px] font-bold text-ink">{title}</h3>
      {job.kind === 'wrong' && <p className="text-[15px] text-slate-400">題目：{job.q}（你選「{job.options[job.picked]}」）</p>}
      {call.loading && <Loading />}
      {call.err != null && <ErrorBox err={call.err} retry={run} />}
      {d && job.kind === 'wrong' && (
        <>
          <p className={cn(box, 'whitespace-pre-line text-[16px] leading-relaxed text-ink')}>{d.explain}</p>
          <Pages ids={d.pages} go={go} />
          <p className={h}>換個情境，馬上再試一次</p>
          <QuizCard quiz={d.followup} />
        </>
      )}
      {d && job.kind === 'pitch' && (
        <>
          <p className={cn(box, 'whitespace-pre-line text-[17px] leading-relaxed text-ink')}>{d.script}</p>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={d.script} label="複製這段話" />
          </div>
          {d.notes.length > 0 && (
            <ul className="space-y-1 text-[15px] text-slate-300">
              {d.notes.map((n, i) => (
                <li key={i}>・{n}</li>
              ))}
            </ul>
          )}
          <Pages ids={d.pages} go={go} />
        </>
      )}
      {d && job.kind === 'digest' && (
        <>
          <ul className={cn(box, 'space-y-2 text-[16px] leading-relaxed text-ink')}>
            {d.points.map((p, i) => (
              <li key={i}>
                {i + 1}. {p.text}
              </li>
            ))}
          </ul>
          <Pages ids={d.points.map((p) => p.page)} go={go} />
          {d.quiz.map((q, i) => (
            <QuizCard key={i} quiz={q} n={i + 1} />
          ))}
        </>
      )}
    </div>
  )
}
