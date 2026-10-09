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
    const pq = PRACTICE[slide.id]
    if (pq) chunks.push({ label: '學完馬上練', text: clean(`${pq.q} ${pq.options[pq.answer]} ${pq.why}`) })
    const head = clean([slide.title, slide.chapter, slide.en].filter(Boolean).join(' '))
    const all = (head + ' ' + chunks.map((c) => c.label + ' ' + c.text).join(' ')).toLowerCase()
    return { index, slide, head, chunks, all }
  })
}

let cache: SearchEntry[] | null = null
export const searchEntries = () => (cache ??= build())

/** 關鍵字可以用空白隔開（都要對到）；英文不分大小寫 */
export function parseQuery(q: string) {
  return q.toLowerCase().split(/[\s,，、]+/).filter(Boolean)
}

const count = (hay: string, needle: string) => {
  let n = 0
  for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + needle.length)) n++
  return n
}

export function search(q: string, limit = 40): SearchHit[] {
  const terms = parseQuery(q)
  if (!terms.length) return []
  const hits: SearchHit[] = []
  for (const entry of searchEntries()) {
    if (!terms.every((t) => entry.all.includes(t))) continue
    const head = entry.head.toLowerCase()
    // 錄音索引頁什麼都對得到（15 段錄音的段落都在），權重減半，內容頁才會排前面
    const weight = entry.slide.blocks.some((b) => b.type === 'recordingsIndex') ? 0.5 : 1
    let score = 0
    for (const t of terms) {
      if (head.includes(t)) score += 20
      score += Math.min(count(entry.all, t), 8) * weight
    }
    const matched = entry.chunks
      .map((c) => {
        const low = (c.label + ' ' + c.text).toLowerCase()
        const n = terms.reduce((a, t) => a + count(low, t), 0)
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
