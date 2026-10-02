/**
 * 課堂錄音來源（Part 1 / Part 2，已轉成 64 kbps 單聲道以縮小檔案）。
 * 開發 / 一般建置：匯入後是一般檔案網址；離線單檔版（vite-plugin-singlefile）：會內嵌成 base64，
 * 這裡再轉成 blob 網址交給播放器（避免超長 data: 網址）。
 */
import part1Url from '../assets/class-0101-part1.m4a'
import part2Url from '../assets/class-0101-part2.m4a'
import part3Url from '../assets/class-0101-part3.m4a'
import part4Url from '../assets/class-0101-part4.m4a'
import part5Url from '../assets/class-0101-part5.m4a'
import part6Url from '../assets/class-1002-part1.m4a'

function toPlayable(url: string) {
  if (!url.startsWith('data:')) return url
  const [meta, b64] = url.split(',')
  const mime = /data:(.*?);base64/.exec(meta)?.[1] ?? 'audio/mp4'
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return URL.createObjectURL(new Blob([bytes], { type: mime }))
}

export const CLASS_AUDIO = toPlayable(part1Url)
export const CLASS_AUDIO_2 = toPlayable(part2Url)
export const CLASS_AUDIO_3 = toPlayable(part3Url)
export const CLASS_AUDIO_4 = toPlayable(part4Url)
export const CLASS_AUDIO_5 = toPlayable(part5Url)
/** 錄音06（10-2 上課-part1） */
export const CLASS_AUDIO_6 = toPlayable(part6Url)
