import { useSyncExternalStore } from 'react'
import { PRACTICE } from '../data/practice'
import { slides } from '../data/slides'

/**
 * 學習進度（只存在這台裝置的瀏覽器）：看過哪幾頁、上次讀到哪、哪幾題答對、哪幾題答錯要複習。
 * 讀寫都包 try/catch：無痕模式、清掉網站資料時存不進去也照樣能用（只是不會記住）。
 */
export interface LearnState {
  /** 看過的頁（id → 時間） */
  seen: Record<string, number>
  /** 「學完馬上練」答對過的頁 */
  done: Record<string, number>
  /** 答錯、還沒在複習裡答對的題（n＝答錯幾次） */
  wrong: Record<string, { at: number; n: number }>
  /** 上次停在哪一頁 */
  last?: string
}

const KEY = 'cold-chain-deck:learn'
const empty = (): LearnState => ({ seen: {}, done: {}, wrong: {} })

function load(): LearnState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const v = JSON.parse(raw) as Partial<LearnState>
    return { seen: v.seen ?? {}, done: v.done ?? {}, wrong: v.wrong ?? {}, last: v.last }
  } catch {
    return empty()
  }
}

let state: LearnState = load()
const listeners = new Set<() => void>()

/**
 * 「繼續上次」：開網頁當下記著的上次頁（10/09 QA：一開頁就被封面／目前頁蓋掉，永遠顯示目前這頁）。
 * 這次打開之後已經看過那頁，就不用再提醒。
 */
let resumeAtLoad = state.last
const seenThisVisit = new Set<string>()
const coverId = () => slides[0]?.id

// 同時開兩個分頁：另一個分頁存了進度，這邊跟著更新，才不會用記憶體裡的舊資料蓋回去（10/10 code review）
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY && e.key !== null) return
    state = load()
    listeners.forEach((l) => l())
  })
}

function commit(next: LearnState) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* 存不進去就算了：這次開著的期間照樣有效 */
  }
  listeners.forEach((l) => l())
}

export function useLearn() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state,
  )
}

/** 換頁時記：看過這頁、目前停在這頁（封面不算「上次讀到哪」：從捷徑打開都會先到封面） */
export function markSeen(id: string) {
  seenThisVisit.add(id)
  const isCover = id === coverId()
  if (state.seen[id] && (isCover || state.last === id)) return
  commit({ ...state, last: isCover ? state.last : id, seen: { ...state.seen, [id]: Date.now() } })
}

/** 「繼續上次」要顯示的頁：開網頁時的上次頁；已不存在、是封面、是目前這頁、這次已經看過 → null */
export function resumeId(currentId?: string): string | null {
  const id = resumeAtLoad
  if (!id || id === coverId() || id === currentId || seenThisVisit.has(id)) return null
  return slides.some((s) => s.id === id) ? id : null
}

/**
 * 回答「學完馬上練」：答對記 done、從錯題拿掉；答錯放進錯題，也取消「已練過」
 * （10/09 QA：練過的題再答錯，會同時算學會又出現在錯題裡）。
 */
export type AnswerResult = 'learned' | 'wrong' | 'tomorrow'

const sameDay = (a: number, b: number) => new Date(a).toDateString() === new Date(b).toDateString()

/**
 * 回答之後的結果：learned＝算學會；wrong＝放進錯題；
 * tomorrow＝答對了，但今天才答錯、看過答案 → 先留在錯題，明天再答對才算學會
 * （10/10 QA：答錯後關掉再打開，照剛看到的答案按就算學會）。
 */
export function answer(id: string, correct: boolean): AnswerResult {
  const now = Date.now()
  if (correct) {
    const w = state.wrong[id]
    if (w && sameDay(w.at, now)) return 'tomorrow'
    const wrong = { ...state.wrong }
    delete wrong[id]
    commit({ ...state, done: { ...state.done, [id]: state.done[id] ?? now }, wrong })
    return 'learned'
  }
  const prev = state.wrong[id]
  const done = { ...state.done }
  delete done[id]
  commit({ ...state, done, wrong: { ...state.wrong, [id]: { at: now, n: (prev?.n ?? 0) + 1 } } })
  return 'wrong'
}

/** 重新開始：「繼續上次」也一起清掉 */
export function resetLearn() {
  resumeAtLoad = undefined
  commit(empty())
}

/** 有出題的必讀頁（照投影片順序） */
export const PRACTICE_IDS = slides.filter((s) => PRACTICE[s.id]).map((s) => s.id)

/** 今天讀這幾頁：還沒答對的必讀頁，照順序取前 n 頁；exclude 放目前頁、「繼續上次」那頁，避免重複 */
export function todayPages(s: LearnState, n = 3, exclude: (string | null | undefined)[] = []) {
  return PRACTICE_IDS.filter((id) => !s.done[id] && !exclude.includes(id)).slice(0, n)
}
