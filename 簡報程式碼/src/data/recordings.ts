import { slideById } from './slides'
import type { AudioBlock } from './types'

/** 錄音索引的項目 → 那一段錄音頁的標題、長度、播放器資料（錄音頁定義在 slideList，不在 ORDER 裡） */
export function recordingOf(slideId: string) {
  const s = slideById(slideId)
  const audio = s?.blocks.find((b): b is AudioBlock => b.type === 'audio')
  if (!s || !audio) return null
  const title = s.title.includes('｜') ? s.title.split('｜')[1] : s.title
  const duration = audio.tracks ? audio.tracks.map((t) => t.duration).join('＋') : audio.duration
  return { title, duration, audio, chapters: audio.chapters.length }
}
