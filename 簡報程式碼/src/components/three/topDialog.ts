/** 這個全螢幕視窗是不是最上面那一個（視窗疊視窗時，鍵盤只給最上面的；按一次 Esc 只關一層） */
export function isTopDialog(el: HTMLElement | null): boolean {
  if (!el) return false
  const open = document.querySelectorAll('[role="dialog"][aria-modal="true"]')
  return open[open.length - 1] === el
}
