/** 零件照片出處（自由授權圖庫）；檔案放在 src/assets/parts/<id>.jpg */
export interface PhotoCredit {
  title: string
  author: string
  license: string
  source: string
}

export const photoCredits: Record<string, PhotoCredit> = {}
