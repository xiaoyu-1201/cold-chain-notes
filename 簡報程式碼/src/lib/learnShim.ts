/**
 * 暫時的轉接檔（redesign-blueprint 分支）：主分支的 lib/learn.ts 會新增 resumeId()、todayPages(…, exclude)。
 * 這個分支不能動 learn.ts，所以先在這裡用同樣的名字、同樣的參數做一份；
 * 合併時：把 ProgressPanel 的 `from '../lib/learnShim'` 改成 `from '../lib/learn'`，再刪掉這個檔。
 */
import { slides } from '../data/slides'
import { PRACTICE_IDS, type LearnState } from './learn'

const SESSION_START = Date.now()

const read = (): Partial<LearnState> => {
  try {
    const raw = localStorage.getItem('cold-chain-deck:learn')
    return raw ? (JSON.parse(raw) as Partial<LearnState>) : {}
  } catch {
    return {}
  }
}
/** 開網頁當下記著的「上次讀到哪」 */
const initialLast: string | null = read().last ?? null

/** 「繼續上次」要顯示的頁：開網頁當下的上次頁；這次已經看過、是封面或就是目前這頁，就不顯示 */
export function resumeId(currentId: string): string | null {
  if (!initialLast || initialLast === currentId || initialLast === slides[0]?.id) return null
  if (!slides.some((s) => s.id === initialLast)) return null
  // learn.ts 每次換頁都會寫回瀏覽器：這次打開以後看過那頁，就不用再提醒
  if ((read().seen?.[initialLast] ?? 0) >= SESSION_START) return null
  return initialLast
}

/** 今天讀這幾頁：還沒答對的必讀頁，照順序取前 n 頁；exclude（目前頁、繼續上次那頁）不重複列 */
export function todayPages(s: LearnState, n = 3, exclude: (string | null | undefined)[] = []) {
  return PRACTICE_IDS.filter((id) => !s.done[id] && !exclude.includes(id)).slice(0, n)
}
