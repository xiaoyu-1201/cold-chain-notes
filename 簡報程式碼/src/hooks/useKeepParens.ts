import { useLayoutEffect, type RefObject } from 'react'

/**
 * 短的括號不要被拆成兩行（10/13 QA：「（內／膨）」「（例如／-15°C）」）。
 * 做法：括號裡 8 個字以內的（太長黏在一起，窄的格子會被撐出去），字跟字之間塞「不換行連接字元」（U+2060），空白換成不換行空白。
 * 只動畫面上的文字節點（搜尋索引用的是資料，不受影響）；之後 React 換字時 MutationObserver 會再處理一次。
 * 跨元件的括號（「（<Em>內膨</Em>）」）處理不到，只能靠內容自己調。
 */
const WJ = '\u2060'
const RX = /（[^（）\n]{1,8}）|\([^()\n]{1,8}\)/g

const glue = (s: string) =>
  s.replace(RX, (m) => [...m.replace(/\u2060/g, '').replace(/ /g, '\u00a0')].join(WJ))

function fix(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    const v = root.nodeValue ?? ''
    if (/[（(]/.test(v)) {
      const g = glue(v)
      if (g !== v) root.nodeValue = g
    }
    return
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) fix(n)
}

// 複製時把塞進去的字元換回來（貼到 LINE、Excel 才搜得到）
if (typeof document !== 'undefined')
  document.addEventListener('copy', (e) => {
    const sel = document.getSelection()?.toString() ?? ''
    if (!/[\u2060\u00a0]/.test(sel) || !e.clipboardData) return
    e.clipboardData.setData('text/plain', sel.replace(/\u2060/g, '').replace(/\u00a0/g, ' '))
    e.preventDefault()
  })

export function useKeepParens(ref: RefObject<HTMLElement | null>) {
  // 畫面第一次畫出來之前就處理，不會先換行再跳回來
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    fix(el)
    const mo = new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === 'characterData') fix(m.target)
        else m.addedNodes.forEach(fix)
      }
    })
    mo.observe(el, { subtree: true, childList: true, characterData: true })
    return () => mo.disconnect()
  }, [ref])
}
