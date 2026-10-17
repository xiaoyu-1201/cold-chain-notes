import { Cog, Droplets, Fan, Filter, Layers, SlidersHorizontal, Snowflake, Stethoscope, Wind, type LucideIcon } from 'lucide-react'

/**
 * 開單前問客人總表（10/17 使用者：「把那些怎麼問客人的引導問題再重新瀏覽過一次，看有沒有要優化成更有含金量的」）。
 * 每一題都從原本那頁搬來（slide＝出處頁），補上「為什麼問」「回答後怎麼做」；新加的寫 added。
 * 只寫老闆上課講過的、講義和筆記頁上有的，不自己編。
 */
export interface AskItem {
  q: string
  why: string
  then: string
  slide: string
  added?: string
}
export interface AskGroup {
  id: string
  label: string
  icon: LucideIcon
  /** 這一組最重要的一句 */
  tip?: string
  items: AskItem[]
}

export const ASK_FIRST: AskGroup[] = [
  {
    id: 'comp',
    label: '壓縮機',
    icon: Cog,
    tip: '最準的是請客人拍機器上的型號牌',
    items: [
      { q: '灌什麼冷媒？', why: '壓縮機不挑冷媒，油才挑：礦物油（MO）只能灌 R22、R438A、R408A；合成油（POE）都可以；R134a 的只能灌 R134a。', then: '照油挑型號；舊的鐵甲 5 開頭是 R22，換合成油的改 9 或 4 開頭。', slide: 'comp-oil' },
      { q: '冰什麼？高溫、中溫還是低溫？', why: '同一顆壓縮機，溫度越低能力越小：高溫 12,000、中溫 8,000、低溫 4,000 BTU 算一匹。', then: '用幾匹換算器算；鐵甲看型號第一個數字。', slide: 'hp-calc' },
      { q: '要足的，還是小一點的？', why: '同樣叫「一匹」可以差一級，低溫的一匹就分小型、中型。', then: '以排氣量為主、BTU 為輔來挑；跟客人講「一匹足」或「小型一匹」。', slide: 'comp-displacement' },
      { q: '電源是單相還是三相？110 還是 220？', why: '客人要 220、你拿 110，通電就燒掉；焊過就不能退。', then: '看型號牌的 PH：PH 1＝單相、PH 3＝三相；110 只有一馬以下的小顆才有。', slide: 'comp-power' },
      { q: '為什麼壞？熱排、冷排多大？', why: '很多壓縮機燒掉，是原本就配錯、散熱不良；不找出原因，換新的一樣會壞。', then: '散熱器先抓壓縮機 ×2；燒掉的要先清管路，一起換乾燥過濾器。', slide: 'comp-fault' },
    ],
  },
  {
    id: 'cond',
    label: '散熱器',
    icon: Fan,
    items: [
      { q: '有沒有外移？放在哪裡？', why: '沒有外移、在廚房或通風差，散熱器要加大（最多到 2.5 倍）。', then: '跟客人講「○匹以上」，再推濾網。', slide: 'cond-practice' },
      { q: '幾排、幾支、多長？', why: '只說「四排十四支」不夠，還要長度。', then: '請客人拍穿管面數排×支、量實內。', slide: 'coil-store' },
      { q: '「底板」是要放壓縮機的嗎？', why: '客人說的底板，可能是放壓縮機的基板，也可能是把底封住的封底板。', then: '先問用途，再拿貨。', slide: 'coil-store' },
      { q: '是冰箱用的嗎？放在冰箱頂上？', why: '散熱器放冰箱頂上的（機上型）只能用 11 支。', then: '機上型拿 11 支的。', slide: 'fridge-types' },
    ],
  },
  {
    id: 'room',
    label: '冷凍庫、冷排',
    icon: Snowflake,
    tip: '客人說幾坪，只是參考坪數',
    items: [
      { q: '冰什麼？軟的還是硬的？', why: '東西熱量越高，機組、冷排要越大；冰什麼決定溫度，溫度決定壓縮機多大。', then: '先定溫度，再配壓縮機、冷排。', slide: 'room-types' },
      { q: '儲存庫、常溫庫還是急速冷凍？', why: '儲存庫只要保溫；常溫庫、急速冷凍庫的機組要大很多。', then: '照用途選機組，不要只看坪數。', slide: 'room-types' },
      { q: '冷排結冰很厚？除霜有沒有動？', why: '常見是除霜電熱管燒斷或感測器壞，不一定要換整台蒸發器。', then: '先推除霜電熱管、感測器。', slide: 'ch4' },
    ],
  },
  {
    id: 'txv',
    label: '膨脹閥',
    icon: SlidersHorizontal,
    items: [
      { q: '冷媒、蒸發溫度、冷凍能力？', why: '膨脹閥照這三個選；閥芯選太大會忽開忽關，太小供液不夠、庫溫降不下來。', then: '三個都問到再挑閥芯。', slide: 'ch5' },
      { q: '閥前後的壓差多少？', why: '選閥用的壓差，要扣掉管路的壓損。', then: '照扣掉壓損後的壓差挑。', slide: 'ch5' },
    ],
  },
  {
    id: 'drier',
    label: '乾燥過濾器',
    icon: Filter,
    items: [
      { q: '兩分是 032 還是 052？焊接還是牙？', why: '光兩分就有 4 種。', then: '兩個都問到再拿，拿錯要退換。', slide: 'drier-sizes' },
      { q: '是不是壓縮機燒掉要換？', why: '壓縮機燒毀的案子，乾燥過濾器要一起換。', then: '換壓縮機的單，一起開乾燥過濾器。', slide: 'comp-fault' },
    ],
  },
  {
    id: 'insul',
    label: '保溫管',
    icon: Layers,
    items: [
      { q: '包什麼？銅管還是水管？', why: '灰色照銅管尺寸、黑色照水管尺寸；抽出來就塞不回去。', then: '先問再拿。', slide: 'insulation-sizes' },
      { q: '幾分？多厚？', why: '4 分水管＝7 分銅管；六分回管用最多。', then: '照管徑和厚度拿。', slide: 'insulation-sizes' },
      { q: '包水管：水多冷？', why: '冷氣排水用最薄的就好；冰水管 7°C 要包厚。', then: '照溫度挑厚度；聽得懂就知道你內行。', slide: 'insulation-sizes' },
      { q: '說「三分」：鐵管還是銅管？', why: '鐵管是標稱尺寸，鐵管 4 分＝銅管 7 分。', then: '先問管子材質，再對尺寸。', slide: 'pipe-marks' },
    ],
  },
  {
    id: 'ac',
    label: '冷氣材料',
    icon: Wind,
    items: [{ q: '銅管配幾分？機器的牙是幾分？', why: '牙跟銅管對不上要轉接頭；冷氣機的接頭是外牙，接上去的一定要內牙。', then: '兩個尺寸都問到，再拿轉接頭。', slide: 'ac-materials' }],
  },
  {
    id: 'gas',
    label: '補冷媒',
    icon: Droplets,
    items: [
      { q: '漏在哪？補過幾次？', why: '反覆補冷媒，代表有漏點。', then: '推檢漏、修漏（檢漏劑、銀焊條、乾燥過濾器）。', slide: 'ch9' },
      { q: '拿錶來問：灌什麼冷媒？', why: '冷媒種類加上錶壓，才查得出管內溫度。', then: '用冷媒滑尺查給他看。', slide: 'reftools' },
    ],
  },
  {
    id: 'fault',
    label: '故障、客訴',
    icon: Stethoscope,
    items: [
      { q: '越來越不冷：除霜有沒有動？風扇轉不轉？門有沒有關緊？', why: '多半不是缺冷媒。', then: '推除霜電熱管、感測器、風扇馬達、門封條。', slide: 'sop' },
      { q: '才裝沒多久就壞：散熱器多大？有沒有清管？冷媒灌多少？', why: '壓縮機壞掉多半是冷媒太多（液壓縮）、散熱不良（過熱）、系統不乾淨。', then: '對照故障判斷表找原因；材料不保固要講清楚為什麼。', slide: 'warranty' },
    ],
  },
]
