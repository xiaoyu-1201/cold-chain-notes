/**
 * 冷媒飽和壓力（絕對壓力 bar），-40～60°C 每 5°C 一筆。
 * 來源：NIST Chemistry WebBook, SRD 69（Thermophysical Properties of Fluid Systems），2026-10-01 取得後內插。
 * 混合冷媒（R404A、R410A 等）有露點／泡點之分，需另依廠商 PT 表補上。
 */
export const PT_TEMPS = Array.from({ length: 21 }, (_, i) => -40 + i * 5)

export const REFRIGERANTS = {
  R134a: { use: '冷藏、汽車冷氣、冰箱', abs: [0.513, 0.662, 0.844, 1.064, 1.328, 1.64, 2.006, 2.433, 2.928, 3.497, 4.146, 4.884, 5.717, 6.654, 7.702, 8.87, 10.166, 11.599, 13.179, 14.915, 16.818] },
  R22: { use: '舊型冷凍、冷氣（逐步淘汰）', abs: [1.053, 1.32, 1.639, 2.015, 2.453, 2.962, 3.548, 4.218, 4.98, 5.841, 6.809, 7.893, 9.1, 10.439, 11.919, 13.548, 15.336, 17.292, 19.427, 21.751, 24.275] },
  R32: { use: '新型冷氣', abs: [1.775, 2.214, 2.735, 3.346, 4.058, 4.881, 5.826, 6.906, 8.131, 9.515, 11.069, 12.808, 14.745, 16.897, 19.275, 21.898, 24.783, 27.948, 31.412, 35.198, 39.333] },
} as const

export type RefrigerantId = keyof typeof REFRIGERANTS

/** 一大氣壓（bar） */
export const ATM = 1.01325

/** 溫度 → 絕對壓力（線性內插） */
export function pressureAt(id: RefrigerantId, t: number) {
  const abs = REFRIGERANTS[id].abs
  const x = Math.min(Math.max((t - PT_TEMPS[0]) / 5, 0), abs.length - 1)
  const i = Math.min(Math.floor(x), abs.length - 2)
  return abs[i] + (abs[i + 1] - abs[i]) * (x - i)
}

/** 絕對壓力 → 飽和溫度（線性內插） */
export function temperatureAt(id: RefrigerantId, pAbs: number) {
  const abs = REFRIGERANTS[id].abs
  if (pAbs <= abs[0]) return PT_TEMPS[0]
  for (let i = 0; i < abs.length - 1; i++) {
    if (pAbs <= abs[i + 1]) return PT_TEMPS[i] + (5 * (pAbs - abs[i])) / (abs[i + 1] - abs[i])
  }
  return PT_TEMPS[PT_TEMPS.length - 1]
}
