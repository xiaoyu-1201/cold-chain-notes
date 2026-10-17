/** 幾匹換算的算法（HpCalc 用；照老闆錄音18、20） */
export type Temp = 'high' | 'mid' | 'low'
export const DIV: Record<Temp, number> = { high: 12000, mid: 8000, low: 4000 }
export const TEMP_NAME: Record<Temp, string> = { high: '高溫（冷藏）', mid: '中溫', low: '低溫（冷凍）' }

/** 跟客人講的大小（老闆：客人聽得懂的分數；壓縮機、散熱器常用） */
const SIZES: { v: number; say: string }[] = [
  { v: 1 / 6, say: '六分之一' },
  { v: 1 / 5, say: '五分之一' },
  { v: 1 / 4, say: '四分之一' },
  { v: 1 / 3, say: '三分之一' },
  { v: 1 / 2, say: '半匹' },
  { v: 3 / 4, say: '四分之三' },
  { v: 7 / 8, say: '八分之七' },
  { v: 1, say: '一匹' },
  { v: 1.25, say: '一又四分之一' },
  { v: 1.5, say: '一匹半' },
  { v: 2, say: '兩匹' },
  { v: 2.5, say: '兩匹半' },
  { v: 3, say: '三匹' },
  { v: 4, say: '四匹' },
  { v: 5, say: '五匹' },
  { v: 6, say: '六匹' },
]
/** 散熱器的尺寸：1¾ 沒有，直接跳 2 匹；2.5 再上去是 3 匹〔錄音18 18:57、70:32〕 */
const COND = [0.25, 1 / 3, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
export const condName = (v: number) => SIZES.find((s) => Math.abs(s.v - v) < 0.01)?.say ?? `${v} 匹`

/** 鐵甲型號：4 碼，第 1 碼 2／4／5／7／9、第 2 碼 4 或 5（位數） */
export function readModel(s: string): { temp: Temp; btu: number; how: string } | null {
  const m = s.replace(/\s/g, '').match(/^([24579])([45])(\d{2})$/)
  // 後兩碼 00（例 4500、5400）是 BTU 不是型號：鐵甲型號沒有 00 結尾的
  if (!m || m[3] === '00') return null
  const temp: Temp = m[1] === '7' ? 'mid' : m[1] === '2' ? 'low' : 'high'
  const digits = Number(m[2])
  const btu = Number(m[3]) * 10 ** (digits - 2)
  return { temp, btu, how: `第 1 碼 ${m[1]}＝${TEMP_NAME[temp]}；第 2 碼 ${m[2]}＝${digits} 位數；${m[3]} 補 0 → ${btu.toLocaleString()} BTU` }
}

/** 跟客人講：最接近的大小；多 3% 以上講「足」，少 3% 以上講「不到」 */
export function sayHp(hp: number) {
  const near = SIZES.reduce((a, b) => (Math.abs(b.v - hp) < Math.abs(a.v - hp) ? b : a))
  if (hp > near.v * 1.03) return `${near.say}足`
  if (hp < near.v * 0.97) return `不到${near.say}`
  return near.say
}
/** 散熱器：壓縮機 ×2，挑一樣大或大一點的尺寸；只差 7% 以內就用小的那個（老闆：1.33 匹 ×2＝2.67 也配 2.5 匹，差一點點不用計較） */
export function condFor(hp: number) {
  const need = hp * 2
  return COND.find((c) => c >= need * 0.93) ?? COND[COND.length - 1]
}

