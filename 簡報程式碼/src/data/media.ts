/**
 * 課堂錄音來源（已轉成單聲道 AAC 以縮小檔案；10/2 下午起用 32 kbps，講話一樣清楚）。
 * 開發 / 一般建置：匯入後是一般檔案網址；離線單檔版（vite-plugin-singlefile）：會內嵌成 base64 data: 網址。
 * data: 網址要轉成 blob 網址再交給播放器（避免超長 data: 網址）。
 * 以前是一打開簡報就全部轉換（錄音越多、開越久）；現在改成「要播的時候才轉」＋「閒下來時在背景先轉好」。
 */
import { useEffect, useState } from 'react'
// 公開網站版會被 vite.config 換成 classAudio.public.ts（沒有錄音）
import { CLASS_AUDIO_URLS } from './classAudio'

const [part1Url, part2Url, part3Url, part4Url, part5Url, part6Url, part7Url, part8Url, part9Url, part10Url, part11Url, part12Url, part13Url, part14Url, part15Url] = CLASS_AUDIO_URLS

/** 這個版本有沒有完整上課錄音（公開網站沒有，離線檔有） */
export const HAS_CLASS_AUDIO = CLASS_AUDIO_URLS.some(Boolean)

export const CLASS_AUDIO = part1Url
export const CLASS_AUDIO_2 = part2Url
export const CLASS_AUDIO_3 = part3Url
export const CLASS_AUDIO_4 = part4Url
export const CLASS_AUDIO_5 = part5Url
/** 錄音06（10-2 上課-part1） */
export const CLASS_AUDIO_6 = part6Url
/** 錄音07～11（10-2 下午：part2、part3-1～3-4） */
export const CLASS_AUDIO_7 = part7Url
export const CLASS_AUDIO_8 = part8Url
export const CLASS_AUDIO_9 = part9Url
export const CLASS_AUDIO_10 = part10Url
export const CLASS_AUDIO_11 = part11Url
export const CLASS_AUDIO_12 = part12Url
/** 錄音13、14（10-6：壓縮機貨架、接頭與保溫管） */
export const CLASS_AUDIO_13 = part13Url
export const CLASS_AUDIO_14 = part14Url
/** 錄音15（10-7：送貨對貨 SOP、老闆看簡報補充壓縮機牌子） */
export const CLASS_AUDIO_15 = part15Url

/** 依錄音編號排好（RECORDINGS[0]＝錄音01）；名詞翻卡的台語片段用 */
export const RECORDINGS = [part1Url, part2Url, part3Url, part4Url, part5Url, part6Url, part7Url, part8Url, part9Url, part10Url, part11Url, part12Url, part13Url, part14Url, part15Url]

const ready = new Map<string, string>()
const pending = new Map<string, Promise<string>>()

/** 拿到可以播放的網址（data: → blob；同一段只轉一次） */
export function loadPlayable(url: string): Promise<string> {
  if (!url.startsWith('data:')) return Promise.resolve(url)
  const done = ready.get(url)
  if (done) return Promise.resolve(done)
  let p = pending.get(url)
  if (!p) {
    // fetch 一個 data: 網址＝讓瀏覽器自己解 base64（比在 JS 裡一個字一個字轉快很多，也不會卡畫面）
    p = fetch(url)
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob)
        ready.set(url, blobUrl)
        return blobUrl
      })
    pending.set(url, p)
  }
  return p
}

/** React 用：轉好之前回傳 undefined（播放器先空著，轉好就自動換上） */
export function usePlayable(url: string | undefined) {
  const [, force] = useState(0)
  const now = url === undefined ? undefined : url.startsWith('data:') ? ready.get(url) : url
  useEffect(() => {
    if (!url || now) return
    let alive = true
    loadPlayable(url).then(() => alive && force((n) => n + 1))
    return () => {
      alive = false
    }
  }, [url, now])
  return now
}

// 打開簡報後閒下來，就在背景把錄音一段一段先轉好（點下去馬上能播）
const ALL = RECORDINGS
if (typeof window !== 'undefined' && ALL.some((u) => u.startsWith('data:'))) {
  const idle = (fn: () => void) => (typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 1500))
  const warm = (i: number) => {
    if (i >= ALL.length) return
    idle(() => {
      loadPlayable(ALL[i]).finally(() => warm(i + 1))
    })
  }
  window.setTimeout(() => warm(0), 3000)
}
