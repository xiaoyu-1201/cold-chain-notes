import { useSyncExternalStore } from 'react'
import { slideById, slides } from '../data/slides'
import { searchEntries, textOf, type SearchEntry } from './searchIndex'

/**
 * AI 助教（10/17 使用者：「全部都做吧」）。網頁只送「筆記內容＋問題」到使用者自己的 Apps Script（apps-script/tutor.gs），
 * 金鑰、通行碼檢查、每天次數上限都在那邊；這裡只記通行碼（這台裝置）。
 */
/** Apps Script 網頁應用程式網址：使用者部署後填（不是祕密，保護靠通行碼） */
const DEPLOYED_URL = ''
/** 開發時（npm run dev）可以接假的後端測排版：localStorage「tutor-dev-url」；上線的網站不會讀 */
const devUrl = () => {
  try {
    return import.meta.env.DEV ? (localStorage.getItem('tutor-dev-url') ?? '') : ''
  } catch {
    return ''
  }
}
export const TUTOR_URL = devUrl() || DEPLOYED_URL

const PASS_KEY = 'cold-chain-deck:tutor-pass'
export function getPass() {
  try {
    return localStorage.getItem(PASS_KEY) ?? ''
  } catch {
    return ''
  }
}
export function setPass(v: string) {
  try {
    if (v) localStorage.setItem(PASS_KEY, v)
    else localStorage.removeItem(PASS_KEY)
  } catch {
    /* 存不進去：這次開著有效就好 */
  }
  passMemo = v
  emit()
}
let passMemo = getPass()

/* ───── 開面板：任何地方都可以叫助教（答錯題、幾匹換算器、頁面） ───── */

export type TutorTab = 'ask' | 'triage' | 'roleplay' | 'boss' | 'weekly'
export type TutorJob =
  | { kind: 'wrong'; slideId: string; q: string; options: string[]; picked: number; answer: number; why: string }
  | { kind: 'pitch'; slideId: string; text: string }
  | { kind: 'digest'; slideId: string; mode: '錄音導讀' | '白話講這頁' | '考我' }

interface TutorState {
  open: boolean
  tab: TutorTab
  job: TutorJob | null
  /** 每次叫一次都不一樣：同一個工作再按一次也會重做 */
  seq: number
  pass: string
  /** 今天還能問幾次（問過一次才知道） */
  left: number | null
}
let state: TutorState = { open: false, tab: 'ask', job: null, seq: 0, pass: passMemo, left: null }
const listeners = new Set<() => void>()
function emit() {
  state = { ...state, pass: passMemo }
  listeners.forEach((l) => l())
}
export function useTutor() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state,
  )
}
export function openTutor(tab: TutorTab = 'ask', job: TutorJob | null = null) {
  state = { ...state, open: true, tab, job, seq: state.seq + 1 }
  emit()
}
export function closeTutor() {
  state = { ...state, open: false, job: null }
  emit()
}
export function setTutorTab(tab: TutorTab) {
  state = { ...state, tab, job: null }
  emit()
}
/** 助教按「去看 P.xx」跳頁：練習視窗、今天讀什麼也要一起關，不然蓋在新頁上（10/17 QA） */
export const TUTOR_JUMP = 'tutor-jump'
/** 練習視窗、今天讀什麼的 Esc：助教開著就讓助教先關 */
export const tutorIsOpen = () => state.open

/* ───── 打 Apps Script ───── */

export class TutorError extends Error {
  kind: 'setup' | 'pass' | 'quota' | 'net' | 'other'
  constructor(message: string, kind: TutorError['kind']) {
    super(message)
    this.kind = kind
  }
}

/** passTry：輸入通行碼時先用它試，對了才存（錯了不會把畫面換掉） */
export async function callTutor<T = unknown>(action: string, body: Record<string, unknown> = {}, passTry?: string): Promise<{ data: T; left?: number; items?: unknown }> {
  if (!TUTOR_URL) throw new TutorError('助教還沒開通：要先照「部署說明」把後端架好。', 'setup')
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), 75000)
  let res: Response
  try {
    // text/plain：Apps Script 不支援 CORS 預檢，用簡單請求
    res = await fetch(TUTOR_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ ...body, action, pass: passTry ?? passMemo }), signal: ctrl.signal })
  } catch {
    throw new TutorError(ctrl.signal.aborted ? '助教想太久了（超過 75 秒），再試一次。' : '連不到助教：看看網路有沒有通。', 'net')
  } finally {
    window.clearTimeout(timer)
  }
  let out: { ok?: boolean; error?: string; pass?: boolean; setup?: boolean; quota?: boolean; data?: T; left?: number; items?: unknown }
  try {
    out = await res.json()
  } catch {
    throw new TutorError(`助教回覆看不懂（${res.status}）。`, 'other')
  }
  if (!out.ok) {
    if (out.pass && passTry === undefined) setPass('')
    throw new TutorError(out.error || '助教出錯了。', out.pass ? 'pass' : out.setup ? 'setup' : out.quota ? 'quota' : 'other')
  }
  if (typeof out.left === 'number') {
    state = { ...state, left: Math.max(0, out.left) }
    emit()
  }
  return { data: out.data as T, left: out.left, items: out.items }
}

/* ───── 找相關的筆記頁（送給助教當資料） ───── */

const byId = new Map(slides.map((s, i) => [s.id, i]))
export const pageNo = (id: string) => (byId.get(id) ?? -1) + 1
export const pageTitle = (id: string) => slides[byId.get(id) ?? -1]?.title ?? slideById(id)?.title ?? ''
export const isPage = (id: string) => byId.has(id)

/** 一頁變成給助教讀的文字：[頁 id｜P.12 標題] ＋ 每一段「段名：內容」 */
export function pageText(e: SearchEntry, max = 3500) {
  const body = e.chunks.map((c) => (c.label ? `${c.label}：${c.text}` : c.text)).join('\n')
  return `[頁 ${e.slide.id}｜P.${e.index + 1} ${e.slide.title}]\n${body}`.slice(0, max)
}

/** 問題切成小片：中文兩兩一組、英文數字整個字 */
export function grams(q: string) {
  const low = q.toLowerCase()
  const out = new Set<string>()
  for (const m of low.matchAll(/[a-z0-9.]{2,}/g)) out.add(m[0])
  const cjk = low.replace(/[^一-鿿]+/g, ' ').split(' ').filter(Boolean)
  for (const w of cjk) for (let i = 0; i + 1 < w.length; i++) out.add(w.slice(i, i + 2))
  return [...out]
}

/** 不送給助教的頁：封面、錄音索引（太大）、公司版專用頁（公司資料不送到外面） */
const skipEntry = (e: SearchEntry) => e.slide.layout === 'cover' || !!e.slide.companyOnly || e.slide.blocks.some((b) => b.type === 'recordingsIndex')

/** 跟問題最像的幾頁（少見的字分數高） */
export function relatedPages(q: string, n = 4, exclude: string[] = []) {
  const all = searchEntries().filter((e) => !skipEntry(e) && !exclude.includes(e.slide.id))
  // 最多 80 組：問題再長也不會卡（每組只掃一次全部頁）
  const gs = grams(q).slice(0, 80)
  if (!gs.length) return []
  const N = all.length
  const score = new Map<SearchEntry, number>()
  for (const g of gs) {
    const hit = all.filter((e) => e.all.includes(g))
    const idf = Math.log((N + 1) / (hit.length + 1))
    for (const e of hit) score.set(e, (score.get(e) ?? 0) + idf * (e.head.toLowerCase().includes(g) ? 3 : 1))
  }
  return all
    .map((e) => ({ e, score: score.get(e) ?? 0 }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.e)
}

/** 送給助教的筆記：目前這頁＋（指定的頁）＋跟問題最像的幾頁，總長有上限 */
export function contextFor(q: string, currentId?: string, extra: string[] = [], n = 4, max = 10000) {
  const entries = searchEntries()
  const first = [currentId, ...extra]
    .filter((id): id is string => !!id && byId.has(id))
    .map((id) => entries[byId.get(id)!])
    // 公司版專用頁就算是目前這頁也不送（公司資料不送到外面）
    .filter((e) => !e.slide.companyOnly)
  const rest = relatedPages(q, n, first.map((e) => e.slide.id))
  // 不在頁序裡的頁（錄音頁 recording-xx，從錄音索引叫來的）：直接拿那頁的字
  const loose = [currentId, ...extra].filter((id): id is string => !!id && !byId.has(id)).map((id) => slideById(id)).filter((s) => !!s && !s.companyOnly)
  let out = loose.map((s) => `[頁 ${s!.id}｜${s!.title}]\n${textOf(s!.blocks)}`.slice(0, 6000) + '\n\n').join('')
  for (const e of [...first, ...rest]) {
    const t = pageText(e)
    if (out.length + t.length > max) break
    out += t + '\n\n'
  }
  return out
}
