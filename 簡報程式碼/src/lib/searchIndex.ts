import { isValidElement } from 'react'
import { slideById, slides } from '../data/slides'
import { recordingOf } from '../data/recordings'
import { PRACTICE } from '../data/practice'
import type { Block, RecordingsIndexBlock, SlideData } from '../data/types'

/**
 * 關鍵字搜尋的索引：開頁時從投影片資料把「看得到的字」全部抓出來（標題、內文、小結論、門市實戰、
 * 名詞翻卡、縮寫、錄音段落），一頁一筆、一個區塊一段，搜尋結果才能顯示是哪一段對到。
 */
export interface SearchChunk {
  /** 這段在哪裡（區塊標題、「小結論」、「錄音13 · 段落名」） */
  label: string
  text: string
}

export interface SearchEntry {
  index: number
  slide: SlideData
  /** 標題＋章節＋英文 */
  head: string
  chunks: SearchChunk[]
  /** 全部文字（小寫），用來快速判斷有沒有對到 */
  all: string
}

export interface SearchHit {
  entry: SearchEntry
  score: number
  /** 對到的段落（最多 3 段） */
  chunks: SearchChunk[]
}

/** 不是「字」的欄位：樣式、圖示、座標、連結目標 */
const SKIP = new Set([
  'type', 'className', 'tone', 'icon', 'image', 'src', 'ratio', 'points', 'x', 'y', 'id', 'slide', 'part', 'group',
  'cols', 'direction', 'compact', 'bare', 'size', 'added', 'tier', 'layout', 'fit', 'position', 'at', 'track', 'from', 'to',
  'rec', 'answer', 'baseCol', 'col', 'highlight', 'defaultId', 'audioSrc', 'audioSrc2', 'audioAt', 'audioAt2', 'alt',
  'duration', 'key', 'ref', 'tracks', 'style', 'href', 'target', 'rel',
])

/** 把任何資料（字串、陣列、物件、React 元素）裡看得到的字串接起來 */
export function textOf(v: unknown, depth = 0): string {
  if (v == null || typeof v === 'boolean' || typeof v === 'function' || depth > 14) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  if (Array.isArray(v)) return v.map((x) => textOf(x, depth + 1)).filter(Boolean).join(' ')
  if (isValidElement(v)) return textOf((v as { props: unknown }).props, depth + 1)
  if (typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>)
      .filter(([k]) => !SKIP.has(k))
      .map(([, x]) => textOf(x, depth + 1))
      .filter(Boolean)
      .join(' ')
  }
  return ''
}

const clean = (s: string) => s.replace(/\s+/g, ' ').trim()

/** 整個區塊都是互動元件、資料裡沒有字的頁：補上畫面上看得到的關鍵字（10/09 QA：搜「4分」找不到管徑頁） */
const FEN_SIZES = [2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 17]
const COMPONENT_TEXT: Partial<Record<Block['type'], string>> = {
  fen: `幾分 換算 銅管 管徑 外徑 英吋 mm ${FEN_SIZES.map((n) => `${n}分 ${n} 分 ${(n * 3.175).toFixed(2)} mm`).join(' ')}`,
  caliper: '游標卡尺 卡尺 量外徑 主尺 游尺 讀數 mm',
  coilreader: '散熱器規格 排 支 鏡面 實內 平的彎頭',
}
/** 這幾頁就是那個詞的「主頁」：當成標題的一部分計分，搜尋時排前面（不會顯示在畫面上） */
const HEAD_ALIAS: Record<string, string> = {
  units: FEN_SIZES.map((n) => `${n}分 ${n} 分`).join(' '),
  caliper: '卡尺 游標卡尺',
}

/** 一個區塊變成一段（有子區塊的往下拆） */
function chunksOf(block: Block, prefix: string, out: SearchChunk[]) {
  const title = 'title' in block && block.title ? clean(textOf(block.title)) : ''
  const label = title || prefix
  if (block.type === 'grid') {
    block.children.forEach((c) => chunksOf(c, prefix, out))
    return
  }
  if (block.type === 'section' || (block.type === 'insight' && block.children)) {
    const own = { ...block, children: undefined }
    const t = clean(textOf(own))
    if (t) out.push({ label, text: t })
    block.children?.forEach((c) => chunksOf(c, label, out))
    return
  }
  if (block.type === 'recordingsIndex') {
    recordingChunks(block, out)
    return
  }
  const t = clean(textOf(block))
  if (t) out.push({ label, text: t })
}

/** 互動元件補的關鍵字：只拿來比對，不顯示在搜尋結果的摘要裡（10/10 code review：會出現「3分 3 分 9.53 mm」這種機器字） */
function componentText(blocks: Block[]): string {
  return blocks
    .map((b) => (b.type === 'grid' ? componentText(b.children) : (COMPONENT_TEXT[b.type] ?? '')))
    .filter(Boolean)
    .join(' ')
}

/** 錄音索引頁：每段錄音的每個段落各一段（搜「散熱器」會對到老闆講到的那一段） */
function recordingChunks(block: RecordingsIndexBlock, out: SearchChunk[]) {
  for (const item of block.items) {
    const rec = recordingOf(item.slide)
    const s = slideById(item.slide)
    if (!rec || !s) continue
    out.push({ label: `${item.code}`, text: clean(`${s.title} ${textOf(item.related)}`) })
    for (const ch of rec.audio.chapters) {
      out.push({ label: `${item.code} · ${ch.title}`, text: clean(`${ch.title} ${textOf(ch.summary)}`) })
    }
  }
}

function build(): SearchEntry[] {
  return slides.map((slide, index) => {
    const chunks: SearchChunk[] = []
    if (slide.cover) chunks.push({ label: '封面', text: clean(textOf(slide.cover)) })
    if (slide.store) chunks.push({ label: '門市實戰', text: clean(textOf(slide.store)) })
    slide.blocks.forEach((b) => chunksOf(b, slide.chapter ?? '', chunks))
    chunks.push({ label: slide.conclusion.label ?? '本章小結論', text: clean(textOf(slide.conclusion.text)) })
    // 只放題目，不放答案和解說：搜尋結果不能先把答案告訴你（10/09 QA）
    const pq = PRACTICE[slide.id]
    if (pq) chunks.push({ label: '學完馬上練', text: clean(pq.q) })
    const head = clean([slide.title, slide.chapter, slide.en, HEAD_ALIAS[slide.id]].filter(Boolean).join(' '))
    const all = (head + ' ' + chunks.map((c) => c.label + ' ' + c.text).join(' ') + ' ' + componentText(slide.blocks)).toLowerCase()
    return { index, slide, head, chunks, all }
  })
}

let cache: SearchEntry[] | null = null
export const searchEntries = () => (cache ??= build())

/**
 * 同一個東西的不同叫法：搜其中一個，其他叫法也算對到（10/09 QA：搜「熱排」找不到冷凝器主頁）。
 * 只放老闆、客人真的會講的說法和英文名。
 */
const SYNONYMS: string[][] = [
  ['冷凝器', '熱排', '散熱器', 'condenser'],
  ['蒸發器', '冷排', 'evaporator'],
  ['乾燥過濾器', '乾燥器', 'drier'],
  ['視液鏡', '視窗', 'sight glass'],
  ['膨脹閥', 'txv', 'expansion valve'],
  // 「龍頭」不放：會對到「水龍頭」（10/10 code review）
  ['壓縮機', 'compressor'],
  ['電磁閥', 'solenoid'],
  ['液氣分離器', 'accumulator'],
  ['儲液器', 'receiver'],
  ['吐出管', '高壓氣管', 'discharge'],
  ['回氣管', '回管', '吸氣管', 'suction'],
  ['喇叭口', '喇叭頭', 'flare'],
]
const CN_DIGIT: Record<string, string> = { 一: '1', 二: '2', 兩: '2', 三: '3', 四: '4', 五: '5', 六: '6', 七: '7', 八: '8' }

/** 一個關鍵字 → 它的所有寫法（小寫）：同義詞、「四分／4分／4 分」 */
function variantsOf(term: string): string[] {
  const out = new Set([term])
  const fen = term.match(/^([1-8一二兩三四五六七八])分$/)
  if (fen) {
    const d = CN_DIGIT[fen[1]] ?? fen[1]
    const cn = '一二三四五六七八'[Number(d) - 1]
    out.add(`${d}分`).add(`${d} 分`).add(`${cn}分`)
    if (d === '2') out.add('兩分')
  }
  for (const g of SYNONYMS) if (g.includes(term)) g.forEach((w) => out.add(w))
  return [...out]
}

/** 把關鍵字切開：空白、逗號隔開的都要對到；「4 分」中間的空白不算分隔 */
function rawTerms(q: string) {
  return q
    .toLowerCase()
    .replace(/(\d)\s+分/g, '$1分')
    .split(/[\s,，、]+/)
    .filter(Boolean)
}

/** 每個關鍵字一組（組內任一個寫法對到就算） */
function queryGroups(q: string) {
  return rawTerms(q).map(variantsOf)
}

/** 畫面上標黃色、找摘要用：所有寫法攤平，長的放前面（「保溫管」先於「保溫」） */
export function parseQuery(q: string) {
  return [...new Set(queryGroups(q).flat())].sort((a, b) => b.length - a.length)
}

const count = (hay: string, needle: string) => {
  let n = 0
  for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + needle.length)) n++
  return n
}
const countAny = (hay: string, alts: string[]) => alts.reduce((a, t) => a + count(hay, t), 0)

export function search(q: string, limit = 40): SearchHit[] {
  const groups = queryGroups(q)
  if (!groups.length) return []
  const hits: SearchHit[] = []
  for (const entry of searchEntries()) {
    if (!groups.every((alts) => alts.some((t) => entry.all.includes(t)))) continue
    const head = entry.head.toLowerCase()
    // 錄音索引頁什麼都對得到（15 段錄音的段落都在），權重減半，內容頁才會排前面
    const weight = entry.slide.blocks.some((b) => b.type === 'recordingsIndex') ? 0.5 : 1
    let score = 0
    for (const alts of groups) {
      if (alts.some((t) => head.includes(t))) score += 20
      score += Math.min(countAny(entry.all, alts), 8) * weight
    }
    const matched = entry.chunks
      .map((c) => {
        const low = (c.label + ' ' + c.text).toLowerCase()
        const n = groups.reduce((a, alts) => a + countAny(low, alts), 0)
        return { c, n }
      })
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, 3)
      .map((x) => x.c)
    hits.push({ entry, score, chunks: matched })
  }
  return hits.sort((a, b) => b.score - a.score || a.entry.index - b.entry.index).slice(0, limit)
}

/** 取關鍵字前後一小段當摘要（第一個對到的字附近） */
export function snippet(text: string, terms: string[], radius = 28) {
  const low = text.toLowerCase()
  let at = -1
  for (const t of terms) {
    const i = low.indexOf(t)
    if (i >= 0 && (at < 0 || i < at)) at = i
  }
  if (at < 0) return text.slice(0, radius * 2)
  const start = Math.max(0, at - radius)
  const end = Math.min(text.length, at + radius * 2)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}
