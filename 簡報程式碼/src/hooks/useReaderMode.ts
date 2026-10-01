import { useEffect, useState } from 'react'

const KEY = 'cold-chain-deck:reader'

/**
 * 自動判斷要不要用閱讀模式：手機寬度，或簡報畫布縮放後太小（< 0.7：內文 20px 實際不到 14px）
 * 例：1920×1080 桌機約 0.83、1440×900 約 0.74 → 簡報；1366×768 筆電、iPad 橫放 → 閱讀模式
 */
function autoReader() {
  const w = window.innerWidth
  const h = window.innerHeight
  if (w <= 900) return true
  return Math.min((w - 24) / 1920, (h - 96) / 1080) < 0.7
}

function readPref(): boolean | null {
  try {
    const v = window.localStorage.getItem(KEY)
    return v === null ? null : v === '1'
  } catch {
    return null
  }
}

/** 閱讀模式（單欄捲動）或簡報模式；手動切換會記在瀏覽器 */
export function useReaderMode() {
  const [auto, setAuto] = useState(autoReader)
  const [pref, setPref] = useState<boolean | null>(readPref)

  useEffect(() => {
    const onResize = () => setAuto(autoReader())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const set = (value: boolean) => {
    setPref(value)
    try {
      window.localStorage.setItem(KEY, value ? '1' : '0')
    } catch {
      // 無法儲存時只影響這次瀏覽
    }
  }

  return [pref ?? auto, set] as const
}
