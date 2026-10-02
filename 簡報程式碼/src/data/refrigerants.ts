/**
 * 冷媒飽和壓力（絕對壓力 bar），-40～60°C 每 5°C 一筆。
 * 來源：R134a、R22、R32 為 NIST Chemistry WebBook（SRD 69）；R404A、R410A、R507A 為 CoolProp 8.0 計算
 *（以 R134a 交叉比對 NIST，誤差 < 0.001 bar）。2026-10-01 取得。
 * 混合冷媒有露點（dew，氣體開始凝結／完全蒸發）與泡點（bubble）之分：主數值用露點（看低壓），另附泡點（看高壓）。
 */
export const PT_TEMPS = Array.from({ length: 21 }, (_, i) => -40 + i * 5)

interface Refrigerant {
  use: string
  /** 飽和壓力（混合冷媒為露點） */
  abs: readonly number[]
  /** 混合冷媒的泡點壓力 */
  bubble?: readonly number[]
}

export const REFRIGERANTS = {
  R22: { use: '舊機冷凍、冷藏、空調；資深師傅的比較基準', abs: [1.053, 1.32, 1.639, 2.015, 2.453, 2.962, 3.548, 4.218, 4.98, 5.841, 6.809, 7.893, 9.1, 10.439, 11.919, 13.548, 15.336, 17.292, 19.427, 21.751, 24.275] },
  R404A: {
    use: '冷凍庫、低溫冷藏（混合冷媒）',
    abs: [1.31, 1.636, 2.022, 2.475, 3.002, 3.61, 4.307, 5.102, 6.003, 7.018, 8.157, 9.429, 10.844, 12.412, 14.145, 16.053, 18.149, 20.447, 22.961, 25.709, 28.712],
    bubble: [1.353, 1.685, 2.078, 2.537, 3.071, 3.686, 4.391, 5.194, 6.102, 7.125, 8.271, 9.55, 10.971, 12.546, 14.284, 16.196, 18.295, 20.595, 23.109, 25.854, 28.85],
  },
  R507A: { use: '冷凍、冷藏（共沸冷媒，高壓最高）', abs: [1.387, 1.727, 2.128, 2.598, 3.144, 3.773, 4.493, 5.312, 6.24, 7.284, 8.454, 9.759, 11.209, 12.815, 14.587, 16.537, 18.679, 21.025, 23.592, 26.399, 29.469] },
  R134a: { use: '冷藏、汽車冷氣、冰箱', abs: [0.513, 0.662, 0.844, 1.064, 1.328, 1.64, 2.006, 2.433, 2.928, 3.497, 4.146, 4.884, 5.717, 6.654, 7.702, 8.87, 10.166, 11.599, 13.179, 14.915, 16.818] },
  R32: { use: '新型冷氣', abs: [1.775, 2.214, 2.735, 3.346, 4.058, 4.881, 5.826, 6.906, 8.131, 9.515, 11.069, 12.808, 14.745, 16.897, 19.275, 21.898, 24.783, 27.948, 31.412, 35.198, 39.333] },
  R410A: {
    use: '冷氣（混合冷媒，壓力高）',
    abs: [1.748, 2.181, 2.693, 3.294, 3.993, 4.8, 5.727, 6.783, 7.981, 9.332, 10.848, 12.543, 14.429, 16.521, 18.834, 21.383, 24.186, 27.261, 30.63, 34.316, 38.348],
    bubble: [1.755, 2.189, 2.703, 3.306, 4.007, 4.817, 5.746, 6.806, 8.007, 9.362, 10.883, 12.583, 14.475, 16.572, 18.891, 21.447, 24.256, 27.338, 30.711, 34.398, 38.426],
  },
} satisfies Record<string, Refrigerant>

export type RefrigerantId = keyof typeof REFRIGERANTS

/** 一大氣壓（bar） */
export const ATM = 1.01325
/** 1 bar ＝ 14.5038 psi ＝ 1.01972 kg/cm² */
export const PSI_PER_BAR = 14.5038
export const KG_PER_BAR = 1.01972

const curveOf = (id: RefrigerantId, curve: 'dew' | 'bubble'): readonly number[] => {
  const r: Refrigerant = REFRIGERANTS[id]
  return curve === 'bubble' && r.bubble ? r.bubble : r.abs
}

/** 溫度 → 絕對壓力（線性內插；混合冷媒預設露點） */
export function pressureAt(id: RefrigerantId, t: number, curve: 'dew' | 'bubble' = 'dew') {
  const abs = curveOf(id, curve)
  const x = Math.min(Math.max((t - PT_TEMPS[0]) / 5, 0), abs.length - 1)
  const i = Math.min(Math.floor(x), abs.length - 2)
  return abs[i] + (abs[i + 1] - abs[i]) * (x - i)
}

/** 絕對壓力 → 飽和溫度（線性內插；混合冷媒預設露點） */
export function temperatureAt(id: RefrigerantId, pAbs: number, curve: 'dew' | 'bubble' = 'dew') {
  const abs = curveOf(id, curve)
  if (pAbs <= abs[0]) return PT_TEMPS[0]
  for (let i = 0; i < abs.length - 1; i++) {
    if (pAbs <= abs[i + 1]) return PT_TEMPS[i] + (5 * (pAbs - abs[i])) / (abs[i + 1] - abs[i])
  }
  return PT_TEMPS[PT_TEMPS.length - 1]
}

/** 是否為混合冷媒（有泡點資料） */
export const isBlend = (id: RefrigerantId) => 'bubble' in REFRIGERANTS[id]
