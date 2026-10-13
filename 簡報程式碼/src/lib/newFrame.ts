import { isNew } from '../data/whatsNew'

/**
 * 改過的那一點加 class「new-frame」：「圈出新的」開著時（<html class="show-new">）index.css 畫紅框（10/13 使用者：按一下就圈出來）。
 * 跟 NewChip 一起用：框讓人一眼看到在哪，「新」字讓人知道為什麼框起來。
 */
export const newFrame = (added?: string) => (isNew(added) ? 'new-frame' : '')
