import type { SlideData } from './types'

/**
 * 每一頁屬於哪個小類別（10/18 使用者：目錄要看得出每一類有哪幾頁）。
 * 目錄、全部頁一覽照這個分組；同一組的頁照頁碼排（可能跳號，例如貨架是 24、25、27、32），翻頁順序不變。
 * 沒寫在這裡的頁（導覽、結語、進階）不分組。新頁記得加進來。
 */
const CATEGORY: Record<string, string> = {
  strokes: '冷凍循環',
  'cycle-lesson': '冷凍循環',

  units: '管徑與量測',
  caliper: '管徑與量測',
  reftools: '冷媒',
  reftable: '冷媒',
  refrigerants: '冷媒',
  'refrigerant-rules': '冷媒',

  industry: '產業與裝置',
  'fridge-types': '產業與裝置',
  'room-types': '產業與裝置',

  products: '總覽',
  handout: '總覽',
  ch2: '壓縮機：認識與保護',
  'comp-protect': '壓縮機：認識與保護',
  'comp-types': '壓縮機：認識與保護',
  'comp-fault': '壓縮機：認識與保護',
  'comp-brands': '壓縮機：貨架與拿貨',
  'comp-power': '壓縮機：貨架與拿貨',
  'comp-temp': '壓縮機：貨架與拿貨',
  'comp-pick': '壓縮機：貨架與拿貨',
  equivalents: '壓縮機：貨架與拿貨',
  'comp-rating': '壓縮機：幾匹與冷媒',
  'comp-displacement': '壓縮機：幾匹與冷媒',
  'hp-calc': '壓縮機：幾匹與冷媒',
  'comp-oil': '壓縮機：幾匹與冷媒',
  ch3: '散熱器（冷凝器）',
  'coil-spec': '散熱器（冷凝器）',
  'cond-practice': '散熱器（冷凝器）',
  'outdoor-units': '散熱器（冷凝器）',
  ch4: '冷排（蒸發器）',
  defrost: '冷排（蒸發器）',
  ch5: '閥件與控制',
  'drier-sizes': '管路配件',
  'flare-fittings': '管路配件',
  'pipe-marks': '管路配件',
  insulation: '管路配件',
  'insulation-sizes': '管路配件',

  estimate: '接單與估價',
  'ask-first': '接單與估價',
  'coil-store': '接單與估價',
  'ac-materials': '接單與估價',
  'store-mindset': '業務心法',
  'newbie-sales': '業務心法',
  ch9: '故障與客訴',
  sop: '故障與客訴',
  warranty: '故障與客訴',
  'delivery-sop': '送貨',

  recordings: '錄音與筆記',
  'session-notes': '錄音與筆記',
  glossary: '名詞與縮寫',
  'abbr-parts': '名詞與縮寫',
  'abbr-specs': '名詞與縮寫',
  'abbr-thermo': '名詞與縮寫',
  quiz: '自我檢測',
}

/** 每篇最後的「記住三件事」「小測驗」 */
const categoryOf = (s: SlideData) => CATEGORY[s.id] ?? (/^(recap|check)-\d/.test(s.id) ? '複習' : '')

/**
 * 一篇裡的頁分成小類別（照第一次出現的順序；「複習」放最後）。
 * 整篇都沒有類別（導覽、結語）就回傳一組、name 空的＝不顯示小標題。
 */
export function byCategory<T extends { slide: SlideData }>(items: T[]): { name: string; items: T[] }[] {
  const out: { name: string; items: T[] }[] = []
  for (const it of items) {
    const name = categoryOf(it.slide)
    const g = out.find((x) => x.name === name)
    if (g) g.items.push(it)
    else out.push({ name, items: [it] })
  }
  return out.sort((a, b) => Number(a.name === '複習') - Number(b.name === '複習'))
}
