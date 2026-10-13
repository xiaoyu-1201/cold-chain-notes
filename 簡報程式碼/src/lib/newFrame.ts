import { isNew } from '../data/whatsNew'

/**
 * 改過的那一點：外面加紅框＋淡紅底（10/13 使用者：「直接用明顯的框標示」）。
 * 跟 NewChip 一起用：框讓人一眼看到在哪，「新」字讓人知道為什麼框起來。
 */
export const newFrame = (added?: string) => (isNew(added) ? 'rounded-xl ring-2 ring-inset ring-red-400 bg-red-950' : '')
