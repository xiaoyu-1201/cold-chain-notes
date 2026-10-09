import { createContext, useContext } from 'react'

export interface DeckApi {
  /** 依投影片 id 跳頁 */
  goToId: (id: string) => void
  /** 取得投影片頁碼（1 起算），找不到回傳 0 */
  numberOf: (id: string) => number
  /** 下一頁（一般翻頁，不會出現「返回」）；「學完馬上練」答對後用 */
  next: () => void
}

export const DeckContext = createContext<DeckApi | null>(null)

export function useDeck() {
  const ctx = useContext(DeckContext)
  if (!ctx) throw new Error('useDeck must be used inside <DeckContext.Provider>')
  return ctx
}
