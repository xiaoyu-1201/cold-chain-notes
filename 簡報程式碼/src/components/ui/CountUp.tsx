import { useLayoutEffect, useRef } from 'react'
import { countTo, parseNum } from '../../lib/anim'

/**
 * 大數字：出現時從 0 跑到結果；數字改了就從上一個值跑到新的值（幾匹換算器）。不是數字就照原樣顯示。
 * - 看不見的那層先用最後的字撐好寬度：跑動時旁邊的單位、箭頭不會左右晃。
 * - 跑動的那層不給報讀軟體，報讀只念最後的值（sr-only）。
 * - 字由這裡直接寫進 span（不交給 React 管），不然 React 和動畫會搶同一個文字節點。
 * run＝false：小數字分類（「4 分」「2 條線」）不跑，跑了意思會怪。
 */
export function CountUp({ text, className, run = true }: { text: string; className?: string; run?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  // 記上一次的「字」：StrictMode 第二次跑時字一樣，就照樣從 0 跑（記數字的話第二次會從結果跑到結果，看起來沒動）
  const prev = useRef<string | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (!run) {
      el.textContent = text
      return
    }
    const from = prev.current && prev.current !== text ? (parseNum(prev.current)?.n ?? 0) : 0
    prev.current = text
    return countTo(el, text, from)
  }, [text, run])
  return (
    <span className={`inline-grid ${className ?? ''}`}>
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {text}
      </span>
      <span ref={ref} aria-hidden className="col-start-1 row-start-1" />
      <span className="sr-only">{text}</span>
    </span>
  )
}
