import type { CycleNodeId } from './cycleNotes'

/**
 * 故障模擬：拿掉一個零件（或風扇壞了），3D 系統一步一步演出會發生什麼。
 * 內容依據 cycleNotes（錄音01／02）與各章重點；不寫課堂沒教、手冊沒寫的推論。
 */
export type PipeMode = 'on' | 'off' | 'bubbles' | 'liquid' | 'weak'

/** 每一步 3D 要呈現的狀態（沒寫＝正常運轉） */
export interface FaultFx {
  /** 被拿掉的零件（3D 隱藏，畫一個紅色 ✕） */
  removed?: CycleNodeId
  flow?: Partial<Record<'discharge' | 'liquid' | 'mixture' | 'suction', PipeMode>>
  compOn?: boolean
  condFan?: boolean
  evapFan?: boolean
  hotPuffs?: boolean
  coldPuffs?: boolean
  /** 膨脹閥結冰 */
  ice?: boolean
  /** 冷凍油跟著冷媒跑 */
  oil?: boolean
  /** 0～1：高壓／排氣過熱程度 */
  overheat?: number
  /** 警示標籤 */
  alarm?: { at: CycleNodeId; text: string; tone: 'red' | 'amber' }
  /** 鏡頭偏向哪裡 */
  focus?: CycleNodeId
}

export interface FaultStep {
  title: string
  text: string
  fx: FaultFx
}

export interface Fault {
  id: string
  /** 選單上的字 */
  label: string
  /** 相關零件（說明面板可跳去看它的說明） */
  part: CycleNodeId
  steps: FaultStep[]
  /** 結論：所以要怎樣 */
  lesson: string
}

const allOff = { discharge: 'off', liquid: 'off', mixture: 'off', suction: 'off' } as const

export const FAULTS: Fault[] = [
  {
    id: 'no-dml',
    label: '拿掉乾燥過濾器',
    part: 'dml',
    steps: [
      { title: '系統裡有水', text: '沒有乾燥過濾器，管路裡的水分跟著冷媒一起跑。', fx: { removed: 'dml', focus: 'liquid' } },
      { title: '水在膨脹閥結冰', text: '冷媒過了膨脹閥就在零度以下，水結成冰，堵住膨脹閥的小孔。', fx: { removed: 'dml', ice: true, focus: 'txv' } },
      {
        title: '冷媒流不過去',
        text: '膨脹閥後面沒有冷媒，蒸發器不冷，低壓一直往下掉。',
        fx: { removed: 'dml', ice: true, flow: { mixture: 'off', suction: 'off' }, coldPuffs: false, focus: 'evap' },
      },
      {
        title: '低壓跳脫，庫溫降不下來',
        text: '低壓太低，壓力開關切斷電源；客人會說「庫溫降不下來」。',
        fx: { removed: 'dml', ice: true, flow: allOff, compOn: false, condFan: false, evapFan: false, hotPuffs: false, coldPuffs: false, alarm: { at: 'kp15', text: '低壓跳脫', tone: 'amber' }, focus: 'kp15' },
      },
    ],
    lesson: '系統裡只能有冷媒、不能有水：乾燥過濾器一定要裝，它也是常常更換的東西。',
  },
  {
    id: 'no-evr',
    label: '拿掉電磁閥',
    part: 'evr',
    steps: [
      {
        title: '庫溫到了，壓縮機停',
        text: '溫控器讓壓縮機停機，可是液管沒有電磁閥關住。',
        fx: { removed: 'evr', compOn: false, condFan: false, evapFan: false, hotPuffs: false, coldPuffs: false, flow: allOff, focus: 'tc' },
      },
      {
        title: '冷媒往冷的地方跑',
        text: '停機時，液態冷媒從液管慢慢流進冷的蒸發器，積在吸氣管。',
        fx: { removed: 'evr', compOn: false, condFan: false, evapFan: false, hotPuffs: false, coldPuffs: false, flow: { discharge: 'off', liquid: 'liquid', mixture: 'liquid', suction: 'liquid' }, focus: 'evap' },
      },
      {
        title: '下次啟動先吸到液體',
        text: '壓縮機一啟動，先吸到積在吸氣管的液體，負擔很大，嚴重時打壞閥片。',
        fx: { removed: 'evr', flow: { suction: 'liquid' }, alarm: { at: 'comp', text: '吸到液體！', tone: 'red' }, focus: 'comp' },
      },
    ],
    lesson: '電磁閥常閉、通電才開：停機時把冷媒關在液管。散熱器裝得遠、管路長，一定要裝。',
  },
  {
    id: 'no-receiver',
    label: '拿掉儲液器',
    part: 'receiver',
    steps: [
      { title: '送出去的不一定全是液體', text: '沒有儲液器讓液體沉下來，冷凝器出口的冷媒還夾著氣體。', fx: { removed: 'receiver', flow: { liquid: 'bubbles' }, focus: 'liquid' } },
      { title: '視液鏡一直冒泡', text: '液管裡有氣泡，從視液鏡看得到一直冒泡。', fx: { removed: 'receiver', flow: { liquid: 'bubbles' }, alarm: { at: 'sgi', text: '一直冒泡', tone: 'amber' }, focus: 'sgi' } },
      {
        title: '膨脹閥供液不穩',
        text: '膨脹閥拿不到源源不絕的液體，供液忽多忽少，蒸發器不夠冷。',
        fx: { removed: 'receiver', flow: { liquid: 'bubbles', mixture: 'weak', suction: 'weak' }, coldPuffs: false, focus: 'txv' },
      },
    ],
    lesson: '用膨脹閥的系統一定要裝儲液器，確保膨脹閥一直拿到液體；冰箱這類毛細管系統可以不裝。',
  },
  {
    id: 'no-acc',
    label: '拿掉液氣分離器',
    part: 'acc',
    steps: [
      { title: '冷排沒蒸發完', text: '蒸發器裡的液體來不及蒸發完，跟著吸氣管流出來。', fx: { removed: 'acc', flow: { suction: 'liquid' }, focus: 'evap' } },
      { title: '液體直接回壓縮機', text: '沒有液氣分離器把液體擋在底部，液體一路回到壓縮機。', fx: { removed: 'acc', flow: { suction: 'liquid' }, focus: 'suction' } },
      { title: '液壓縮，壓縮機受損', text: '壓縮機只能壓氣體；液體進去會打壞閥片和連桿。', fx: { removed: 'acc', flow: { suction: 'liquid' }, alarm: { at: 'comp', text: '液壓縮！', tone: 'red' }, focus: 'comp' } },
    ],
    lesson: '管子裡有沒有液體看不到；大一點的系統要裝液氣分離器，只讓氣體回壓縮機。',
  },
  {
    id: 'no-kp15',
    label: '拿掉壓力開關',
    part: 'kp15',
    steps: [
      { title: '散熱變差，高壓升高', text: '冷凝器風扇壞了（或鰭片太髒），熱排不出去，高壓一直升高。', fx: { removed: 'kp15', condFan: false, hotPuffs: false, overheat: 0.45, focus: 'cond' } },
      { title: '沒有東西切斷電源', text: '沒有壓力開關，壓縮機繼續硬撐運轉，排氣管越來越燙。', fx: { removed: 'kp15', condFan: false, hotPuffs: false, overheat: 0.8, focus: 'discharge' } },
      {
        title: '排氣過熱，壓縮機燒毀',
        text: '排氣溫度超過 107°C，冷凍油碳化，最後壓縮機燒毀。',
        fx: { removed: 'kp15', condFan: false, hotPuffs: false, overheat: 1, compOn: false, flow: allOff, coldPuffs: false, evapFan: false, alarm: { at: 'comp', text: '過熱燒毀', tone: 'red' }, focus: 'comp' },
      },
    ],
    lesson: '每套系統都一定要裝壓力開關：壓力太高或太低就停機，保護壓縮機。',
  },
  {
    id: 'fan-fail',
    label: '冷凝器風扇壞了',
    part: 'cond',
    steps: [
      { title: '熱排不出去', text: '冷凝器風扇停了，冷媒液化不完全，高壓升高。', fx: { condFan: false, hotPuffs: false, overheat: 0.45, focus: 'cond' } },
      {
        title: '壓力開關跳脫',
        text: '高壓超過設定值，壓力開關切斷電源，壓縮機停機保護自己。',
        fx: { condFan: false, hotPuffs: false, overheat: 0.2, compOn: false, evapFan: false, coldPuffs: false, flow: allOff, alarm: { at: 'kp15', text: '高壓跳脫', tone: 'amber' }, focus: 'kp15' },
      },
      {
        title: '客人說「機器一直跳」',
        text: '先建議檢查冷凝器風扇、清洗鰭片，再看散熱器是不是太小。',
        fx: { condFan: false, hotPuffs: false, compOn: false, evapFan: false, coldPuffs: false, flow: allOff, alarm: { at: 'cond', text: '先查風扇、洗鰭片', tone: 'amber' }, focus: 'cond' },
      },
    ],
    lesson: '夏天高壓跳機，先建議客人清洗鰭片、檢查風扇；有壓力開關，壓縮機才不會燒。',
  },
  {
    id: 'no-oub',
    label: '拿掉油分離器',
    part: 'oub',
    steps: [
      { title: '冷凍油跟著冷媒跑', text: '壓縮機排氣時，冷凍油跟著冷媒一起被打出去。', fx: { removed: 'oub', oil: true, focus: 'discharge' } },
      { title: '油散在管路裡', text: '沒有油分離器把油送回去，油留在冷凝器、蒸發器和管路裡。', fx: { removed: 'oub', oil: true, focus: 'evap' } },
      { title: '壓縮機缺油', text: '壓縮機裡的油越來越少，潤滑不良、磨損，最後燒毀。', fx: { removed: 'oub', oil: true, alarm: { at: 'comp', text: '缺油', tone: 'red' }, focus: 'comp' } },
    ],
    lesson: '壓縮機像汽車引擎要有機油：油分離器把油分出來送回壓縮機，通常是機組的一部分。',
  },
]
