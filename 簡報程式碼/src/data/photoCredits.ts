/**
 * 零件照片（自由授權圖庫，依授權標示作者與出處；已縮圖）
 * file：src/assets/parts/<file>.jpg；同一張照片可對應多個零件，各自有說明
 * 店裡實拍的照片也可以放進同一個資料夾，再在這裡加一筆
 */
export interface PhotoCredit {
  file: string
  /** 這張照片裡要看哪裡 */
  note: string
  /** 一個零件有好幾張時，切換按鈕上的字 */
  label?: string
  title: string
  author: string
  /** 自己上課拍的照片不用寫授權 */
  license?: string
  licenseUrl?: string
  source?: string
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

/** 上課拍的（名片、人名已模糊；原始照片不上傳） */
const classPhoto = { title: '10/5 上課拍攝', author: '10/5 上課拍攝' }

/** 產品展示的照片組（key＝showcase 的零件 id；沒有就用上面 photoCredits 的一張） */
export const photoSets: Record<string, PhotoCredit[]> = {
  drier: [
    { ...classPhoto, file: '1005-driers-flare', label: '牙（沒 S）', note: '店裡的乾燥過濾器：型號沒有 S、盒子寫 SAE＝牙（喇叭口）。053＝3分、052＝2分。' },
    { ...classPhoto, file: '1005-driers-solder', label: '焊接（有 S）', note: '型號尾巴有 S、盒子寫 ODF＝焊接。052 S＝2分（胖）、032 S＝2分（小支）。' },
    { ...unit, label: '裝在機組上', note: photoCredits.dml.note },
  ],
  flare: [{ ...classPhoto, file: '1005-capillary', note: '上面：銅管口打成喇叭嘴（張開的斜面），後面套著喇叭螺帽；下面：螺帽裡面的內牙。' }],
  fittings: [
    {
      file: 'copper-fittings',
      note: '銅的焊接接頭：上排 45° 彎頭、T 型三通、直接頭；下排管帽、90° 彎頭、大小頭、45° 彎頭。口都是套筒，銅管插在裡面，所以量內徑。',
      title: 'Kupferfittings 4062',
      author: 'Torsten Bätge',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      source: 'https://commons.wikimedia.org/wiki/File:Kupferfittings_4062.jpg',
    },
  ],
  insul: [
    {
      file: 'ac-insulation',
      note: '冷氣室外機：右下角黑色的就是保溫管（發泡橡膠），包在冷媒管外面。',
      title: 'Air conditioner armaflex insulation',
      author: 'Achim Hering',
      license: 'CC BY 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
      source: 'https://commons.wikimedia.org/wiki/File:Air_conditioner_armaflex_insulation.jpg',
    },
  ],
}