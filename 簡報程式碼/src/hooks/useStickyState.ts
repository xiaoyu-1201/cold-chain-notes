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

/** 跳到別頁之前先設好那一頁的狀態（例：首頁「看 3D 版」→ 核心圖解直接打開 3D） */
export function presetSticky<T>(key: string, value: T) {
  memory.set(key, value)
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // 存不進去就只留在記憶體
  }
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
