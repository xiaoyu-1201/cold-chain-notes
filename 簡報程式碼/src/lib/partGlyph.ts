import type { ReactNode } from 'react'
import type { PartGlyphId } from '../components/ui/PartGlyph'

/**
 * 卡片標題講的是哪個零件 → 用哪張零件線稿（不用改資料：看標題的字就知道）。
 * 順序有關係：比較長、比較特定的詞放前面（「含壓縮機的室外機」是室外機，不是壓縮機）。
 */
const RULES: [RegExp, PartGlyphId][] = [
  [/液氣分離/, 'accumulator'],
  [/乾燥過濾|乾燥器/, 'drier'],
  [/視液鏡/, 'sightglass'],
  [/電磁閥/, 'solenoid'],
  [/膨脹閥|閥芯|節流膨脹/, 'txv'],
  [/儲液/, 'receiver'],
  [/高低壓開關|壓力開關|高壓開關|低壓開關/, 'switch'],
  [/球閥|手閥/, 'ballvalve'],
  [/保溫/, 'insulation'],
  [/喇叭/, 'flare'],
  [/卡尺/, 'caliper'],
  [/室外機|散熱器|冷凝|熱排/, 'condenser'],
  [/蒸發|冷風機|冷排/, 'evaporator'],
  [/壓縮/, 'compressor'],
]

export function glyphFor(text: ReactNode): PartGlyphId | null {
  if (typeof text !== 'string') return null
  for (const [re, id] of RULES) if (re.test(text)) return id
  return null
}
