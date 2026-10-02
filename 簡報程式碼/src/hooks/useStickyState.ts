import { useEffect, useState } from 'react'

const PREFIX = 'cold-chain-deck:state:'
/** 換頁時元件會卸載；先記在記憶體，再存 localStorage（重新整理也還在） */
const memory = new Map<string, unknown>()

function load<T>(key: string, initial: T | (() => T)): T {
  if (memory.has(key)) return memory.get(key) as T
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw != null) return JSON.parse(raw) as T
  } catch {
    // 無痕模式或封鎖儲存空間：用預設值
  }
  return typeof initial === 'function' ? (initial as () => T)() : initial
}

/** 跟 useState 一樣，但跳到別頁再回來，輸入的值不會被重置 */
export function useStickyState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => load(key, initial))
  useEffect(() => {
    memory.set(key, value)
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // 存不進去就只留在記憶體
    }
  }, [key, value])
  return [value, setValue] as const
}
