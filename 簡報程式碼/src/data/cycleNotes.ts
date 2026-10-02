import type { Tone } from './types'

export type CycleNodeId =
  | 'comp' | 'cond' | 'txv' | 'evap'
  | 'discharge' | 'liquid' | 'mixture' | 'suction'
  | 'oub' | 'kp15' | 'receiver' | 'gbc' | 'dml' | 'sgi' | 'evr' | 'tc' | 'acc'

/**
 * 寫作標準：沒上過課也要看得懂——每句有主詞與動詞、一句一件事、先講結論；
 * 錄音原話只在單獨看也懂時才放，否則改寫成重點；錄音沒講的以權威資料補充。
 */
export interface CycleNote {
  id: CycleNodeId
  kind: 'part' | 'pipe' | 'small'
  title: string
  alias: string
  tone: Tone
  /** 冷媒狀態變化（依課堂用語：不寫過冷、過熱） */
  state: string
  /** 錄音原話：單獨看也懂才放 */
  quote?: string
  analogy?: string
  point: string
  /** 錄音時間（秒）：錄音01 / 錄音02 */
  audioAt?: number
  audio2At?: number
  slide?: string
  chapter?: string
  /** 小視窗錨點（佔圖片寬高的百分比）與開啟方向 */
  anchor: { x: number; y: number; place: 'left' | 'right' | 'above' | 'below' }
}

export const cycleNotes: Record<CycleNodeId, CycleNote> = {
  comp: {
    id: 'comp',
    kind: 'part',
    title: '① 壓縮機',
    alias: '四大金剛之首',
    tone: 'red',
    state: '低溫低壓氣態 → 高溫高壓氣態',
    quote: '「四大金剛就是壓縮機、熱排、冷排、膨脹閥」「壓縮機不能壓縮液態」',
    analogy: '壓縮機像汽車引擎，要用冷凍油潤滑。',
    point: '壓縮機的大小口語用「馬」表示（1 馬、2 馬）；冷凝器、膨脹閥、冷排的大小都要依壓縮機來配。',
    audioAt: 11 * 60 + 57,
    audio2At: 4 * 60 + 46,
    slide: 'ch2',
    chapter: '第 2 章',
    anchor: { x: 75, y: 50, place: 'left' },
  },
  cond: {
    id: 'cond',
    kind: 'part',
    title: '② 冷凝器',
    alias: '散熱器・熱排（台語）',
    tone: 'amber',
    state: '高溫高壓氣態 → 中溫中壓液態（放熱到室外）',
    analogy: '下雨前特別悶熱，是因為水氣凝結成水時會放熱；冷媒在冷凝器裡也是凝結放熱。',
    point: '冷凝器把冷媒的熱排到室外，風扇吹出的風有四、五十度。一般 1 馬壓縮機配 2 馬散熱器。裸露型（台語「無穿衫」）便宜，但別放鐵皮屋頂：夏天會到 50°C、散熱變差。散熱器太小或太髒，冷媒就液化不完全。',
    audioAt: 0,
    audio2At: 11 * 60 + 41,
    slide: 'ch3',
    chapter: '第 3 章',
    anchor: { x: 50, y: 25, place: 'below' },
  },
  txv: {
    id: 'txv',
    kind: 'part',
    title: '③ 膨脹閥',
    alias: '降壓節流',
    tone: 'teal',
    state: '中溫中壓液態 → 液氣混合',
    quote: '「膨脹閥就是降壓節流」',
    analogy: '像洗車時用手壓住水管口：水被擠成細小水滴、噴得又快又遠。冷媒變成細小的液氣混合，就很容易蒸發。',
    point: '膨脹閥的閥芯有大小，要依壓縮機大小選配。冰箱這類小系統用毛細管代替膨脹閥：便宜，但流量不能調。',
    audioAt: 5 * 60 + 47,
    audio2At: 10 * 60 + 52,
    slide: 'ch5',
    chapter: '第 5 章',
    anchor: { x: 21, y: 50, place: 'right' },
  },
  evap: {
    id: 'evap',
    kind: 'part',
    title: '④ 蒸發器',
    alias: '冷排（台語）',
    tone: 'ice',
    state: '液氣混合 → 低溫低壓氣態（從庫內吸熱）',
    analogy: '冰塊放在面前會覺得涼，是因為身上的熱被冰吸走了；水燒開變成水蒸氣，也要吸熱。',
    point: '冷媒在蒸發器裡從液體變成氣體，同時吸走庫內的熱——這就是「冷」的來源。一定要有液變氣的過程才吸得到熱；庫房要密閉、庫板要保溫，冷才不會跑掉。',
    audioAt: 6 * 60 + 27,
    audio2At: 14 * 60 + 15,
    slide: 'ch4',
    chapter: '第 4 章',
    anchor: { x: 50, y: 76, place: 'above' },
  },
  discharge: {
    id: 'discharge',
    kind: 'pipe',
    title: '高壓氣管',
    alias: '講義上的紅色線',
    tone: 'red',
    state: '高溫高壓氣態',
    point: '高壓氣管從壓縮機接到冷凝器，是整個系統最燙的一段，摸到會燙傷。油分離器裝在這段，把跟著冷媒跑出來的冷凍油送回壓縮機。',
    audioAt: 1 * 60 + 57,
    audio2At: 3 * 60 + 6,
    anchor: { x: 80, y: 28, place: 'left' },
  },
  liquid: {
    id: 'liquid',
    kind: 'pipe',
    title: '液管',
    alias: '講義上的黃色線',
    tone: 'amber',
    state: '中溫中壓液態（純液態）',
    point: '液管從冷凝器接到膨脹閥，是零件最多的一段：儲液器 → 手閥 → 乾燥過濾器 → 視液鏡 → 電磁閥。冷媒送到膨脹閥前一定要是純液態，膨脹閥才能正常降壓。',
    audioAt: 2 * 60 + 24,
    audio2At: 3 * 60 + 8,
    slide: 'handout',
    chapter: '講義零件圖',
    anchor: { x: 20, y: 25, place: 'right' },
  },
  mixture: {
    id: 'mixture',
    kind: 'pipe',
    title: '液氣混合段',
    alias: '膨脹閥出口',
    tone: 'teal',
    state: '液氣混合（還不算真正低壓）',
    point: '膨脹閥出來的冷媒是半液半氣，還不算真正的低壓；要進到蒸發器、完全蒸發成氣體之後，才是低溫低壓。',
    audioAt: 10 * 60 + 22,
    audio2At: 40,
    anchor: { x: 20, y: 72, place: 'right' },
  },
  suction: {
    id: 'suction',
    kind: 'pipe',
    title: '吸氣管',
    alias: '講義上的藍色線',
    tone: 'ice',
    state: '低溫低壓氣態（已完全蒸發）',
    quote: '「經過蒸發器出來才是低溫低壓」',
    point: '吸氣管從蒸發器接回壓縮機，裡面應該全是氣體。大一點的系統在這段裝液氣分離器：沒蒸發完的液體沉在底部，只讓氣體回壓縮機，避免壓縮機被液體打壞。',
    audioAt: 12 * 60 + 16,
    audio2At: 76,
    anchor: { x: 80, y: 72, place: 'left' },
  },
  oub: {
    id: 'oub',
    kind: 'small',
    title: '油分離器',
    alias: '講義型號 OUB',
    tone: 'red',
    state: '把冷凍油分出來，送回壓縮機',
    analogy: '壓縮機像汽車引擎，要有機油（冷凍油）潤滑。',
    point: '壓縮機裡的冷凍油會跟著冷媒一起被排出去。油分離器裝在排氣管上，把油分出來送回壓縮機，避免壓縮機缺油；通常是機組的一部分。',
    audioAt: 3 * 60 + 49,
    audio2At: 9 * 60 + 35,
    anchor: { x: 83, y: 33, place: 'left' },
  },
  kp15: {
    id: 'kp15',
    kind: 'small',
    title: '壓力開關',
    alias: '講義型號 KP 15・一定要裝',
    tone: 'violet',
    state: '壓力異常就跳脫停機',
    point: '壓力開關監測系統的高壓和低壓：壓力太高或太低時切斷電源、讓壓縮機停機，保護壓縮機。每套系統都一定要裝。',
    audio2At: 18 * 60 + 36,
    anchor: { x: 92, y: 50, place: 'left' },
  },
  receiver: {
    id: 'receiver',
    kind: 'small',
    title: '儲液器',
    alias: '高壓・講義右下小圓',
    tone: 'amber',
    state: '確保送出去的是液態',
    analogy: '像水塔：水沉在底下，水龍頭一開就源源不絕地來。',
    point: '儲液器是裝在冷凝器後面的筒子：液態冷媒比較重、沉在底部，從底部取液送往膨脹閥，確保膨脹閥一直拿到液態。用膨脹閥的系統一定要裝；冰箱這類用毛細管的小系統可以不裝。',
    audio2At: 10 * 60 + 17,
    anchor: { x: 27, y: 16, place: 'right' },
  },
  gbc: {
    id: 'gbc',
    kind: 'small',
    title: '手閥（球閥）',
    alias: '講義型號 GBC',
    tone: 'amber',
    state: '手動開關冷媒',
    quote: '「閥就是一個水龍頭的意思」',
    point: '大一點的系統在乾燥過濾器前後各裝一顆手閥：換乾燥過濾器時把兩顆關起來，就不用放掉整個系統的冷媒。',
    audioAt: 18 * 60 + 44,
    anchor: { x: 21, y: 16, place: 'right' },
  },
  dml: {
    id: 'dml',
    kind: 'small',
    title: '乾燥過濾器',
    alias: '講義型號 DML・一定要裝',
    tone: 'amber',
    state: '吸水分、濾雜質',
    quote: '「這個系統裡面只能有冷媒，不能有水」',
    analogy: '乾燥過濾器像家裡的濾水器。',
    point: '冷媒溫度多在零度以下，系統裡的水會結冰、堵住管路。乾燥過濾器裡的分子篩會吸水、也濾掉雜質；冷媒含水量不一定，所以一定要裝，系統打開維修過就要換新。',
    audioAt: 2 * 60 + 34,
    audio2At: 19 * 60 + 5,
    anchor: { x: 17, y: 22, place: 'right' },
  },
  sgi: {
    id: 'sgi',
    kind: 'small',
    title: '視液鏡（視窗）',
    alias: '講義型號 SGI',
    tone: 'amber',
    state: '看冷媒夠不夠、系統有沒有含水',
    point: '視液鏡中間的含水指示環會變色：綠色＝乾燥正常；綠色變淡＝水分快超標；黃色＝含水過多，乾燥過濾器吸飽了，要盡快更換。冷媒夠時，冷媒看起來像透明的水；一直冒氣泡，可能是冷媒不足或乾燥過濾器堵塞，要先找原因，不要一看到氣泡就補冷媒。',
    audioAt: 5 * 60 + 27,
    audio2At: 19 * 60 + 5,
    anchor: { x: 17, y: 29, place: 'right' },
  },
  evr: {
    id: 'evr',
    kind: 'small',
    title: '電磁閥',
    alias: '講義型號 EVR・常閉',
    tone: 'amber',
    state: '通電才開；停機時關住液管',
    quote: '「冷媒的特性就是它往冷的地方跑」',
    point: '電磁閥平常是關的（常閉），通電才打開。庫溫到了，電磁閥跟壓縮機一起斷電關閉，把冷媒關在液管、不讓它流進冷的蒸發器；否則下次啟動時壓縮機負擔很大。散熱器裝得遠、管路很長時一定要裝。',
    audioAt: 17 * 60 + 17,
    audio2At: 19 * 60 + 5,
    anchor: { x: 17, y: 36, place: 'right' },
  },
  tc: {
    id: 'tc',
    kind: 'small',
    title: '溫控器＋感溫棒',
    alias: '講義型號 EKC・溫差抓 4°C',
    tone: 'violet',
    state: '到溫停機，回溫再啟動',
    analogy: '像家裡冷氣設定溫度：到溫就停，變熱再開。',
    point: '溫控器用感溫棒量庫內溫度，到了設定溫度就讓壓縮機停。停機和再啟動的溫差一般設 4°C，例如 -20°C 停、回升到 -16°C 再啟動；溫差太小，壓縮機開開關關、縮短壽命。冷凍庫的溫控還要管除霜，冷藏庫不用。',
    audioAt: 16 * 60 + 15,
    anchor: { x: 9, y: 38, place: 'right' },
  },
  acc: {
    id: 'acc',
    kind: 'small',
    title: '液氣分離器',
    alias: '低壓儲液器',
    tone: 'ice',
    state: '確保回壓縮機的是氣態',
    quote: '「壓縮機想要壓縮到液態，它會死掉」',
    point: '液氣分離器裝在蒸發器和壓縮機之間：沒蒸發完的液體沉在底部，只從上面取氣體回壓縮機。管子裡有沒有液體看不到，所以大一點的系統要裝來保險。',
    audio2At: 15 * 60 + 53,
    anchor: { x: 83, y: 75, place: 'left' },
  },
}

export const SMALL_PARTS: CycleNodeId[] = ['oub', 'kp15', 'receiver', 'gbc', 'dml', 'sgi', 'evr', 'tc', 'acc']

export const CYCLE_ORDER: CycleNodeId[] = ['comp', 'discharge', 'cond', 'liquid', 'txv', 'mixture', 'evap', 'suction', ...SMALL_PARTS]
