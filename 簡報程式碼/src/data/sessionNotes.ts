/**
 * 每次上課的單獨筆記（10/17 使用者：「也出現在網站，就是快速讓我看」）。
 * 直接讀 上課資料/單次筆記/*.md：之後新的單次筆記存進那個資料夾，下次建置就自動出現，不用另外整理。
 * 內容跟逐字稿一樣不放人名、價格、品牌評價（寫筆記時就處理好）。
 */
const files = import.meta.glob('../../../上課資料/單次筆記/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

export interface SessionNote {
  /** 檔名（不含 .md），例：10-16～10-17 上課筆記 */
  id: string
  md: string
}

/** 新的在前面（檔名是日期開頭；月份不補 0，要照數字排）。shortcut: 沒有年份，跨年（1 月 vs 12 月）會排錯，到時檔名加年份 */
const key = (id: string) => {
  const m = id.match(/^(\d+)-(\d+)/)
  return m ? Number(m[1]) * 100 + Number(m[2]) : 0
}

export const SESSION_NOTES: SessionNote[] = Object.entries(files)
  .map(([path, md]) => {
    // glob 的路徑本來就是原字，不用 decode（檔名有 % 會整站打不開）
    return { id: path.split('/').pop()!.replace(/\.md$/, ''), md }
  })
  .sort((a, b) => key(b.id) - key(a.id))
