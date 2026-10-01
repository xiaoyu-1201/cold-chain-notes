/**
 * 零件照片（自由授權圖庫，依授權標示作者與出處；已縮圖）
 * file：src/assets/parts/<file>.jpg；同一張照片可對應多個零件，各自有說明
 * 店裡實拍的照片也可以放進同一個資料夾，再在這裡加一筆
 */
export interface PhotoCredit {
  file: string
  /** 這張照片裡要看哪裡 */
  note: string
  title: string
  author: string
  license: string
  licenseUrl: string
  source: string
}

const unit = {
  file: 'condensing-unit',
  title: 'Condensing Unit',
  author: 'AnyNameWillExpire',
  license: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  source: 'https://commons.wikimedia.org/wiki/File:Condensing_Unit.jpg',
}

export const photoCredits: Record<string, PhotoCredit> = {
  comp: { ...unit, note: '小型機組：中間黑色圓頂的就是全密閉壓縮機（店裡賣的多是這種）。' },
  cond: { ...unit, note: '機組後方黑色風扇罩裡面就是冷凝器（散熱器），風扇把熱吹出去。' },
  dml: { ...unit, note: '右邊灰色罐子（Honeywell）就是乾燥過濾器，上面的箭頭是冷媒流向。' },
  sgi: { ...unit, note: '右下角黃銅、有圓形玻璃窗的就是視液鏡，接在乾燥過濾器後面。' },
  txv: {
    file: 'txv-section',
    note: '膨脹閥剖面圖：左邊感溫包 → 毛細管 → 上方膜片與彈簧 → 下方閥針控制冷媒流量（箭頭是流向）。',
    title: 'Thermostatic Expansion Valve PHT',
    author: 'Neurotronix',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Thermostatic_Expansion_Valve_PHT.jpg',
  },
  gbc: {
    file: 'ball-valve',
    note: '這是一般水電用的球閥，原理相同：把手轉 90° 開關。冷凍用的 GBC 是焊接接頭、上面有蓋帽。',
    title: 'Brass Ball Valve With Handle',
    author: 'Public Domain Photos（Flickr）',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    source: 'https://www.flickr.com/photos/28958738@N06/6837287018',
  },
}
