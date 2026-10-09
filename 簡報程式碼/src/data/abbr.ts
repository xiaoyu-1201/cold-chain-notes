import type { AbbrBlock } from './types'

/**
 * 英文縮寫全稱（使用者 10/08：「英文縮寫我也想知道全稱，用英文去記也可以輔助」）。
 * 真的縮寫寫全稱；牌子的系列代號（CR／CS、ZS、TE、EVR…）不是縮寫，就寫「○○系列」，
 * 「記法」只是幫助記憶，不是正式定義。
 */
export const ABBR_PARTS: AbbrBlock['groups'] = [
  {
    label: '膨脹閥、電磁閥、過濾器（講義上的 Danfoss 型號）',
    tone: 'teal',
    items: [
      { abbr: 'TXV / TEV', en: 'Thermostatic Expansion Valve', zh: '感溫式膨脹閥', tip: '靠感溫包控制開度；Danfoss 的型號叫 TE', slide: 'handout' },
      { abbr: 'TE', en: 'Danfoss 感溫膨脹閥系列（記法：T＝Thermostatic、E＝Expansion）', zh: '膨脹閥', tip: '客人報「TE 2」就是膨脹閥', slide: 'handout' },
      { abbr: 'EVR', en: 'Danfoss 電磁閥系列（記法：E＝Electric、V＝Valve）', zh: '電磁閥', tip: '常閉，通電才開', slide: 'handout' },
      { abbr: 'SGI / SGN', en: 'Sight Glass with Indicator / No indicator', zh: '視液鏡（視窗）', tip: 'I＝有指示環會變色（含水變黃）；N＝沒有指示環', slide: 'handout' },
      { abbr: 'DML', en: 'Drier · Molecular sieve · Liquid line', zh: '乾燥過濾器（液管用）', tip: 'Emerson 叫 ADK、三花叫 FD；尾巴 S＝焊接口', slide: 'drier-sizes' },
      { abbr: 'OUB', en: 'Danfoss 油分離器系列', zh: '油分離器', tip: '把跑出去的冷凍油送回壓縮機', slide: 'handout' },
      { abbr: 'GBC', en: 'Danfoss 球閥系列（記法：B＝Ball）', zh: '球閥（手閥）', tip: '換零件前後關起來', slide: 'handout' },
      { abbr: 'NRV', en: 'Non-Return Valve', zh: '逆止閥', tip: '只准一個方向流', slide: 'handout' },
    ],
  },
  {
    label: '壓力調節閥、開關、控制器',
    tone: 'indigo',
    items: [
      { abbr: 'KVP', en: 'Evaporator Pressure Regulator（Danfoss KV 系列）', zh: '蒸發壓力調節閥', tip: '裝在蒸發器出口，撐住蒸發壓力；一對二才用', slide: 'handout' },
      { abbr: 'KVR', en: 'Condensing Pressure Regulator', zh: '冷凝壓力調整閥', tip: '冬天高壓太低時用；跟 NRD 一組', slide: 'handout' },
      { abbr: 'KVL', en: 'Crankcase Pressure Regulator', zh: '曲軸箱壓力調整閥', tip: '限制吸氣壓力，保護壓縮機馬達；通用叫法是 CPR', slide: 'handout' },
      { abbr: 'CPR', en: 'Crankcase Pressure Regulator', zh: '曲軸箱壓力調節閥', tip: '剛開機或除霜完吸氣壓力偏高時擋一下', slide: 'ch5' },
      { abbr: 'NRD', en: 'Differential Pressure Valve（Danfoss NRD）', zh: '差壓閥', tip: '跟 KVR 搭配，把排氣補進儲液器', slide: 'handout' },
      { abbr: 'KP', en: 'Danfoss 壓力開關系列', zh: '壓力開關（高低壓開關）', tip: 'KP 15＝高壓、低壓合在一顆；一定要裝', slide: 'handout' },
      { abbr: 'EKC', en: 'Danfoss 電子控制器系列（記法：E＝Electronic、C＝Controller）', zh: '溫度控制器', tip: 'EKC 101 控溫；201 還管除霜', slide: 'ch4' },
      { abbr: 'EKS / AKS', en: 'Danfoss 感測器系列（記法：S＝Sensor）', zh: '溫度感測器／壓力傳送器', tip: 'EKS、AKS 12 是感溫棒；AKS 3000 量壓力', slide: 'handout' },
    ],
  },
]

export const ABBR_SPECS: AbbrBlock['groups'] = [
  {
    label: '接頭與型號牌上的字',
    tone: 'amber',
    items: [
      { abbr: 'ODF', en: 'Outside Diameter Female', zh: '焊接口（母口，銅管插進去）', tip: '型號尾巴有 S＝焊接', slide: 'pipe-marks' },
      { abbr: 'SAE', en: 'Society of Automotive Engineers', zh: '喇叭口（45° 牙）的規格', tip: '美國汽車工程師學會訂的；SAE＝FLARE＝牙', slide: 'pipe-marks' },
      { abbr: 'FLARE', en: 'Flare（喇叭狀）', zh: '喇叭口', tip: '銅管口打開成喇叭狀用牙鎖；拆得下來、不用動火', slide: 'flare-fittings' },
      { abbr: 'MPT / PT', en: 'Male Pipe Thread / Pipe Thread', zh: '鐵管外牙／管牙', tip: '鐵管是平牙直接鎖；4分鐵管＝7分銅管', slide: 'pipe-marks' },
      { abbr: 'IPS', en: 'Iron Pipe Size', zh: '水管尺寸', tip: '黑色保溫管照水管尺寸標：4分水管＝7分銅管', slide: 'insulation-sizes' },
      { abbr: 'PH', en: 'Phase', zh: '相位', tip: '型號牌 PH 1＝單相、PH 3＝三相', slide: 'comp-power' },
      { abbr: 'PFV / TF5', en: 'Copeland 電源代號（P＝單相 Phase 1、T＝三相 Three）', zh: '單相／三相', tip: '尾碼是電壓代號；拿錯一個字就燒掉', slide: 'comp-brands' },
      { abbr: 'CR / CS / CF', en: 'Copeland 往復式系列（記法：R＝Refrigerator 冷藏、F＝Freezer 冷凍）', zh: '高溫／中溫／低溫', tip: '不是縮寫，是系列代號；中溫兩邊都能打，低溫缺貨可以拿大一點的中溫代替', slide: 'comp-temp' },
      { abbr: 'ZS / ZB / ZF', en: 'Copeland 渦捲式系列（Z＝Scroll）', zh: '渦捲壓縮機', tip: 'Z 開頭都是渦捲：ZS／ZB 中溫、ZF 低溫', slide: 'comp-brands' },
      { abbr: 'LBP / MBP / HBP', en: 'Low / Medium / High Back Pressure', zh: '低溫機／中溫機／高溫機', tip: '「背壓」＝吸氣壓力：冷凍庫吸氣壓力低，所以低溫機叫 LBP', slide: 'comp-temp' },
    ],
  },
  {
    label: '能力與尺寸的單位',
    tone: 'ice',
    items: [
      { abbr: 'HP', en: 'Horsepower', zh: '馬力（客人說「幾馬」）', tip: '真正要對的是 BTU 和排氣量', slide: 'comp-power' },
      { abbr: 'BTU', en: 'British Thermal Unit', zh: '英熱單位（冷凍能力）', tip: '型號對的是 BTU/h；1 kW ≈ 3,412 BTU/h', slide: 'comp-power' },
      { abbr: 'kW / kcal/h', en: 'Kilowatt / Kilocalorie per hour', zh: '千瓦／每小時千卡', tip: '也是冷凍能力：1 kW ≈ 860 kcal/h' },
      { abbr: 'psi / psig', en: 'Pounds per Square Inch (gauge)', zh: '磅／平方英吋（錶壓）', tip: '壓力錶的刻度；1 kg/cm² ≈ 14.2 psi', slide: 'reftools' },
      { abbr: 'P-T', en: 'Pressure–Temperature', zh: '壓力－溫度對照', tip: '同一種冷媒，壓力和溫度綁在一起；Ref Tools 就是查這個', slide: 'reftools' },
      { abbr: 'OD / ID', en: 'Outside / Inside Diameter', zh: '外徑／內徑', tip: '銅管量外徑；接頭、彎頭量內徑', slide: 'caliper' },
      { abbr: 'A/C', en: 'Air Conditioning', zh: '冷氣', tip: '冷氣材料：被覆銅管、管槽、轉接頭', slide: 'ac-materials' },
      { abbr: 'SOP', en: 'Standard Operating Procedure', zh: '標準作業流程', tip: '接單問診 SOP、送貨對貨 SOP', slide: 'sop' },
    ],
  },
]

export const ABBR_THERMO: AbbrBlock['groups'] = [
  {
    label: '溫度、壓力的量測',
    tone: 'violet',
    items: [
      { abbr: 'TD', en: 'Temperature Difference', zh: '溫差（設計溫差）', tip: '冷凝溫度 − 外氣溫度；TD 大 → 除濕多、庫內濕度低' },
      { abbr: 'THR', en: 'Total Heat of Rejection', zh: '總排熱量', tip: '冷凝器要排掉的熱＝冷凍能力＋壓縮機輸入' },
      { abbr: 'SH', en: 'Superheat', zh: '過熱度', tip: '蒸發器出口 5～7°C；壓縮機吸氣口 10～15°C', slide: 'ch6' },
      { abbr: 'SC', en: 'Subcooling', zh: '過冷度', tip: '液管約 5°C，確保進膨脹閥的是液態', slide: 'ch6' },
      { abbr: 'RH', en: 'Relative Humidity', zh: '相對濕度', tip: '庫內濕度，跟 TD 連動' },
      { abbr: 'PU', en: 'Polyurethane', zh: 'PU 發泡（庫板保溫層）', tip: '玻璃門保溫比 PU 差，壓縮機要加大', slide: 'fridge-types' },
    ],
  },
  {
    label: '冷媒與冷凍油',
    tone: 'emerald',
    items: [
      { abbr: 'R-404A、R-22…', en: 'R ＝ Refrigerant', zh: '冷媒編號', tip: '400 開頭＝非共沸混合（R404A、R448A）；500 開頭＝共沸混合（R507）；R22、R134a 是單一冷媒', slide: 'refrigerants' },
      { abbr: 'HFC / HCFC', en: 'Hydrofluorocarbon / Hydrochlorofluorocarbon', zh: '氫氟碳化物／氫氯氟碳化物', tip: 'R404A、R134a 是 HFC；R22 是 HCFC（有氯，會破壞臭氧層）', slide: 'refrigerants' },
      { abbr: 'GWP', en: 'Global Warming Potential', zh: '全球暖化潛勢', tip: '數字越大越暖化；R404A 很高', slide: 'refrigerants' },
      { abbr: 'ODP', en: 'Ozone Depletion Potential', zh: '臭氧破壞潛勢', tip: 'HFC 冷媒 ODP＝0', slide: 'refrigerants' },
      { abbr: 'POE', en: 'Polyol Ester', zh: '多元醇酯（合成冷凍油）', tip: 'HFC 冷媒配 POE 油；R22 舊機配礦物油；不能混', slide: 'refrigerants' },
    ],
  },
]
