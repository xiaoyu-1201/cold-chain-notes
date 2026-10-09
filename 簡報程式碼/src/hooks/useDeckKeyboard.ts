import { useEffect } from 'react'

interface DeckKeyHandlers {
  next: () => void
  prev: () => void
  first: () => void
  last: () => void
  toggleFullscreen: () => void
  toggleDrawer: () => void
  closeDrawer: () => void
  /** 返回頁內連結跳轉前的頁 */
  back: () => void
  /** 開關關鍵字搜尋（/ 或 Ctrl+K） */
  toggleSearch?: () => void
}

/**
 * 簡報鍵盤控制
 * → / Space / PageDown：下一頁；← / PageUp：上一頁；Home / End：首頁 / 末頁
 * F：全螢幕；M：目錄；/ 或 Ctrl+K：搜尋；Esc：關閉目錄；Backspace：返回跳轉前的頁
 */
export function useDeckKeyboard({
  next,
  prev,
  first,
  last,
  toggleFullscreen,
  toggleDrawer,
  closeDrawer,
  back,
  toggleSearch,
}: DeckKeyHandlers) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return
      // Ctrl+K／Cmd+K：搜尋（在輸入框裡也可以按）
      if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'k' || e.key === 'K') && toggleSearch) {
        e.preventDefault()
        toggleSearch()
        return
      }
      if (e.altKey || e.ctrlKey || e.metaKey) return
      // 有小視窗開著（學完馬上練、今天、搜尋、放大圖）：翻頁鍵都不處理，免得背後偷偷換頁（10/09 QA）
      // 目錄抽屜例外：它本來就靠 M／Esc 開關
      if (document.querySelector('[aria-modal="true"]:not([data-deck-drawer]):not([aria-label="章節導覽"])')) return

      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return
      if (e.key === '/' && toggleSearch) {
        e.preventDefault()
        toggleSearch()
        return
      }
      // 焦點在播放器上時，方向鍵 / Space 交給播放器（快轉、暫停）
      if (target?.closest('audio, video') && (e.key.startsWith('Arrow') || e.key === ' ')) return
      // 焦點在按鈕 / 勾選框上時，Space 交給元素本身處理
      const onControl = Boolean(target?.closest('button, a, [role="checkbox"], [role="button"]'))

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault()
          next()
          break
        case ' ':
          if (onControl) return
          e.preventDefault()
          if (e.shiftKey) prev()
          else next()
          break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          prev()
          break
        case 'Home':
          e.preventDefault()
          first()
          break
        case 'End':
          e.preventDefault()
          last()
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'm':
        case 'M':
          e.preventDefault()
          toggleDrawer()
          break
        case 'Escape':
          closeDrawer()
          break
        case 'Backspace':
          e.preventDefault()
          back()
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [next, prev, first, last, toggleFullscreen, toggleDrawer, closeDrawer, back, toggleSearch])
}
