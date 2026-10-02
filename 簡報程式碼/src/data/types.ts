import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type Tone = 'ice' | 'teal' | 'indigo' | 'violet' | 'emerald' | 'amber' | 'red' | 'slate'

export type PartId = 'intro' | 'basics' | 'units' | 'industry' | 'components' | 'practice' | 'review' | 'summary' | 'advanced'

export interface Part {
  id: PartId
  ordinal: string
  title: string
  label: string
  short: string
  tone: Tone
  /** 學習路徑第幾步（1–5）；導覽、複習、附錄沒有 */
  step?: number
  /** 這一篇學完要會的事（學習目標） */
  goal?: string
}

/** 帶標題的卡片共用欄位 */
interface Heading {
  icon: LucideIcon
  title: ReactNode
  en?: string
  tone: Tone
}

export interface FormulaSpec {
  lhs: ReactNode
  rhs: ReactNode
}

/* ---------- 版面區塊 ---------- */

export interface GridBlock {
  type: 'grid'
  /** Tailwind grid 樣板，例如 'grid-cols-2 grid-rows-2' */
  className: string
  children: Block[]
}

export interface SectionBlock extends Heading {
  type: 'section'
  className: string
  children: Block[]
}

/* ---------- 內容區塊 ---------- */

export interface ConceptBlock extends Heading {
  type: 'concept'
  badge?: { label: string; tone: Tone }
  formula?: FormulaSpec
  body?: ReactNode
  points?: ReactNode[]
  pairs?: { label: string; en: string; desc: ReactNode; tone: Tone }[]
  chain?: ReactNode[]
  guard?: string
}

export interface FlowStep {
  title: ReactNode
  en?: string
  desc?: ReactNode
  icon?: LucideIcon
  tone?: Tone
  tag?: string
}

export interface FlowBlock {
  type: 'flow'
  direction: 'row' | 'col'
  tone: Tone
  steps: FlowStep[]
  icon?: LucideIcon
  title?: ReactNode
  en?: string
  /** 精簡版：row 為單列標籤流程，col 為小型編號清單 */
  compact?: boolean
  /** 不包外框卡片 */
  bare?: boolean
  result?: { label: string; text: ReactNode }
}

export interface AlertBlock {
  type: 'alert'
  title: string
  en?: string
  items: { icon: LucideIcon; title: string; value?: string; desc: ReactNode }[]
}

export interface TrapBlock {
  type: 'trap'
  icon: LucideIcon
  title: string
  en?: string
  chain: ReactNode[]
  fixes: string[]
}

export interface EquationTerm {
  symbol: ReactNode
  label: string
  tone: Tone
}

export interface EquationBlock {
  type: 'equation'
  result: EquationTerm
  terms: EquationTerm[]
  icon?: LucideIcon
  title?: ReactNode
  en?: string
  tone?: Tone
  note?: ReactNode
  highlight?: string
  /** 精簡版（無外框，結果放在等號右側） */
  compact?: boolean
}

export interface MetricItem {
  label: ReactNode
  value: string
  unit?: string
  note?: ReactNode
  tone: Tone
  tag?: string
}

export interface MetricsBlock extends Heading {
  type: 'metrics'
  cols: 1 | 2 | 3
  items: MetricItem[]
  formula?: FormulaSpec
  footnote?: ReactNode
  size?: 'md' | 'lg'
}

export interface CompareSide {
  badge: string
  value: string
  tone: Tone
  rows: { k: string; v: ReactNode }[]
  use: ReactNode
}

export interface CompareBlock extends Heading {
  type: 'compare'
  axis: string[]
  left: CompareSide
  right: CompareSide
}

export interface TimelineBlock extends Heading {
  type: 'timeline'
  items: { gen: string; example: string; note: string; tone: Tone }[]
}

export interface InfoBlock {
  type: 'info'
  icon: LucideIcon
  title: ReactNode
  en?: string
  tone: Tone
  tag?: string
  body: ReactNode
  warn?: ReactNode
  meta?: string
}

export interface StatBlock extends Heading {
  type: 'stat'
  from: { value: string; label: string }
  to: { value: string; label: string }
  desc: ReactNode
}

export interface ListBlock extends Heading {
  type: 'list'
  items: { icon: LucideIcon; title: string; desc: ReactNode; badge?: { label: string; tone: Tone } }[]
}

export type MatrixGroup = 'physical' | 'thermal'

export interface MatrixBlock {
  type: 'matrix'
  groups: Record<MatrixGroup, { label: string; hint: string }>
  categories: { id: string; label: string; group: MatrixGroup }[]
  columns: {
    title: string
    en: string
    icon: LucideIcon
    tone: Tone
    flag?: string
    /** 現場第一步檢查 */
    firstCheck?: string
    causes: { text: ReactNode; cat: string; top?: boolean }[]
  }[]
}

export interface ChecklistBlock {
  type: 'checklist'
  /** 用於瀏覽器暫存勾選狀態 */
  id: string
  title: string
  en?: string
  items: ReactNode[]
}

export interface PartsBlock {
  type: 'parts'
  items: {
    part: PartId
    no: string
    range: string
    icon: LucideIcon
    summary: string
    chapters: { code: string; title: string; slide: string }[]
  }[]
  finale: { label: string; links: { title: string; slide: string }[]; note?: ReactNode }
}

export interface QuoteBlock {
  type: 'quote'
  text: ReactNode
  author: string
}

export interface TilesBlock extends Heading {
  type: 'tiles'
  cols: 2 | 3
  items: { icon: LucideIcon; title: string; desc: ReactNode }[]
}

export interface ProductsBlock {
  type: 'products'
  items: {
    icon: LucideIcon
    tone: Tone
    title: string
    en: string
    items: string
    side: string
    chapter: string
    slide: string
  }[]
}

export type HotspotGroup = 'liquid' | 'suction' | 'discharge' | 'control'

export interface HotspotItem {
  id: string
  /** 圖上的型號或短名 */
  code: string
  name: string
  en: string
  group: HotspotGroup
  func: ReactNode
  /** 在圖片上的位置（百分比），同一零件可有多個 */
  points: { x: number; y: number }[]
  slide?: string
  chapter?: string
  /** 錄音中講解此零件的時間（秒）：Part 1 / Part 2 */
  audioAt?: number
  audioAt2?: number
}

export interface HotspotsBlock {
  type: 'hotspots'
  image: string
  alt: string
  /** 圖片寬 / 高 */
  ratio: number
  groups: Record<HotspotGroup, { label: string; tone: Tone }>
  items: HotspotItem[]
  defaultId: string
  audioSrc?: string
  audioSrc2?: string
  note?: ReactNode
}

export interface AudioChapter {
  at: number
  /** 多段錄音時屬於第幾段（tracks 的索引） */
  track?: number
  title: string
  summary: ReactNode
}

export interface AudioBlock {
  type: 'audio'
  src: string
  title: string
  en?: string
  duration: string
  /** 多段錄音（有的話以此為準） */
  tracks?: { label: string; src: string; duration: string }[]
  chapters: AudioChapter[]
}

export interface ScenarioBlock {
  type: 'scenario'
  label: string
  tone: Tone
  customer: string
  ask: ReactNode
  recommend: string[]
  slide?: string
  chapter?: string
}

export interface InsightBlock {
  type: 'insight'
  no: string
  icon: LucideIcon
  tone: Tone
  title: string
  subtitle?: string
  en: string
  body?: ReactNode
  children?: Block[]
}

export interface BoundariesBlock {
  type: 'boundaries'
  items: { label: string; value: string; note: string; tone: Tone }[]
}

export interface QABlock extends Heading {
  type: 'qa'
  prompts: string[]
  links: { label: string; slide: string }[]
}

export interface SizingBlock {
  type: 'sizing'
  icon: LucideIcon
  title: string
  en?: string
  badge?: string
  points: ReactNode[]
  formula: ReactNode
  example?: { caption: ReactNode; rows: { label: string; value: string; note: string; tone: Tone }[] }
}

export interface TxvBlock extends Heading {
  type: 'txv'
  rules: { icon: LucideIcon; tone: Tone; title: ReactNode; desc: ReactNode }[]
}

export interface CycleBlock extends Heading {
  type: 'cycle'
}

/** 自我檢測：先自己回想，再點開看答案（提取練習） */
export interface QuizBlock {
  type: 'quiz'
  items: { q: ReactNode; a: ReactNode; slide?: string }[]
}

/** 估價練習：情境題，一題一題配出整套 */
export interface EstimateBlock {
  type: 'estimate'
  scenarios: {
    title: string
    story: ReactNode
    questions: { q: string; options: string[]; answer: number; why: ReactNode; slide?: string }[]
  }[]
}

/** 名詞翻卡：國語／台語／英文／型號 */
export interface FlashcardsBlock {
  type: 'flashcards'
  /** group：全選單的分組（同組的卡片要排在一起） */
  cards: FlashCard[]
}

export interface FlashCard {
  term: string
  alias: string
  en: string
  tip: string
  group: string
  /** 上課錄音裡講台語的片段（錄音編號、起訖秒數；已用逐字對時確認） */
  tw?: { rec: 1 | 2; from: number; to: number; say: string }
  /** 有 3D 模型／照片的零件 id（three/ids 的 part3DFor） */
  part?: string
}

/** 資料表（電腦版表格、手機版每欄一張卡片） */
export interface TableBlock {
  type: 'table'
  tone: Tone
  head: string[]
  /** 全部欄位共用的比較條件：合併成一格強調（例如「冷凝溫度都是 40.42°C」） */
  standard?: { label: string; value: string; note: ReactNode }
  /** 用長條圖比較的數值列；虛線＝基準欄的值 */
  bars?: { label: string; unit: string; values: number[]; baseCol: number }
  rows: { label: string; cells: ReactNode[] }[]
  /** 要特別標示的欄（例如基準） */
  highlight?: { col: number; label: string }[]
  notes?: ReactNode[]
  /** 原稿照片 */
  image?: { src: string; label: string }
}

/** 網頁版 Ref Tools 冷媒滑尺：溫度 ↔ 壓力 */
export interface RefSliderBlock {
  type: 'refslider'
}

/** 互動換算器：管徑「分」↔ mm（含考考我練習） */
export interface FenBlock {
  type: 'fen'
}

/** 核心圖解：大張可點選循環圖 + 項目清單 */
export interface CycleLessonBlock {
  type: 'cycleLesson'
}

export type Block =
  | GridBlock
  | SectionBlock
  | ConceptBlock
  | FlowBlock
  | AlertBlock
  | TrapBlock
  | EquationBlock
  | MetricsBlock
  | CompareBlock
  | TimelineBlock
  | InfoBlock
  | StatBlock
  | ListBlock
  | MatrixBlock
  | ChecklistBlock
  | PartsBlock
  | InsightBlock
  | BoundariesBlock
  | QABlock
  | SizingBlock
  | TxvBlock
  | CycleBlock
  | QuoteBlock
  | TilesBlock
  | ProductsBlock
  | ScenarioBlock
  | HotspotsBlock
  | AudioBlock
  | CycleLessonBlock
  | QuizBlock
  | FenBlock
  | EstimateBlock
  | FlashcardsBlock
  | RefSliderBlock
  | TableBlock

export interface CoverData {
  kicker: string
  titleLead: string
  titleAccent: string
  subtitle: string
  audience: string
  source: string
  tags: { label: string; icon: LucideIcon }[]
}

/** 材料行門市視角：相關品項 + 老闆叮嚀 */
export interface StoreTip {
  products: string[]
  tip: ReactNode
}

export interface SlideData {
  id: string
  part: PartId
  layout?: 'cover' | 'standard'
  chapter?: string
  /** 背景大字浮水印 */
  mark?: string
  title: string
  en?: string
  cover?: CoverData
  store?: StoreTip
  blocks: Block[]
  /** 第二階段（進階）內容 */
  advanced?: boolean
  /** 內容來源：沒標＝課堂錄音／講義；handbook＝一丞手冊延伸；extra＝業界常識補充 */
  source?: 'handbook' | 'extra'
  /** 每頁底部「📌 本章小結論」 */
  conclusion: { label?: string; text: ReactNode }
}
