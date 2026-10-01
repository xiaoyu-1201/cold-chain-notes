import { useEffect, useState } from 'react'

/** 手機、窄螢幕或橫向矮螢幕：自動用閱讀模式 */
const QUERY = '(max-width: 900px), (max-height: 560px)'
const KEY = 'cold-chain-deck:reader'

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
  const [auto, setAuto] = useState(() => window.matchMedia(QUERY).matches)
  const [pref, setPref] = useState<boolean | null>(readPref)

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = () => setAuto(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
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
