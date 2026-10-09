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

/** 換頁時記：看過這頁、目前停在這頁 */
export function markSeen(id: string) {
  if (state.last === id && state.seen[id]) return
  commit({ ...state, last: id, seen: { ...state.seen, [id]: Date.now() } })
}

/** 回答「學完馬上練」：答對記 done、從錯題拿掉；答錯放進錯題 */
export function answer(id: string, correct: boolean) {
  const now = Date.now()
  if (correct) {
    const wrong = { ...state.wrong }
    delete wrong[id]
    commit({ ...state, done: { ...state.done, [id]: state.done[id] ?? now }, wrong })
  } else {
    const prev = state.wrong[id]
    commit({ ...state, wrong: { ...state.wrong, [id]: { at: now, n: (prev?.n ?? 0) + 1 } } })
  }
}

export function resetLearn() {
  commit(empty())
}

/** 有出題的必讀頁（照投影片順序） */
export const PRACTICE_IDS = slides.filter((s) => PRACTICE[s.id]).map((s) => s.id)

/** 今天讀這幾頁：還沒答對的必讀頁，照順序取前 n 頁 */
export function todayPages(s: LearnState, n = 3) {
  return PRACTICE_IDS.filter((id) => !s.done[id]).slice(0, n)
}
