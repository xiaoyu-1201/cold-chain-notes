import type { Block, SlideData } from '../data/types'

/** 各互動區塊的操作提示：[電腦, 手機] */
const HINTS: Partial<Record<Block['type'], [string, string]>> = {
  cycleLesson: ['點循環圖上的虛線框，看說明、聽錄音', '點循環圖或下方按鈕，看說明、聽錄音'],
  cycle: ['點循環圖上的零件，看說明', '點「互動版」按鈕，到可點的循環圖'],
  hotspots: ['點講義上的零件，看用途、聽錄音', '點錄音按鈕聽講解，點圖片可放大'],
  audio: ['點段落，從那裡開始播放', '點段落，從那裡開始播放'],
  quiz: ['先想答案，再點卡片翻開', '先想答案，再點卡片翻開'],
  fen: ['點「幾分」看換算，按「考考我」練習', '點「幾分」看換算，按「考考我」練習'],
  checklist: ['點項目打勾，會自動記住', '點項目打勾，會自動記住'],
  estimate: ['選情境，一題一題幫客人配出整套', '選情境，一題一題幫客人配出整套'],
  flashcards: ['點卡片翻面，按「會了／還不熟」', '點卡片翻面，按「會了／還不熟」'],
  products: ['點品項，跳到對應章節', '點章節按鈕，跳到對應章節'],
  parts: ['點章節，直接跳過去', '點章節按鈕，直接跳過去'],
}

function collect(blocks: Block[], out: Set<Block['type']>) {
  for (const block of blocks) {
    out.add(block.type)
    if (block.type === 'grid' || block.type === 'section') collect(block.children, out)
    else if (block.type === 'insight' && block.children) collect(block.children, out)
  }
}

/** 這一頁有哪些東西可以點（讓新人知道哪裡能互動） */
export function interactionHints(slide: SlideData, mobile = false): string[] {
  const types = new Set<Block['type']>()
  collect(slide.blocks, types)
  const hints = [...types].flatMap((t) => {
    const hint = HINTS[t]
    return hint ? [hint[mobile ? 1 : 0]] : []
  })
  const hasPageLink = slide.store || types.has('qa') || types.has('scenario')
  if (hasPageLink && !types.has('parts') && !types.has('products')) hints.push('點「P.xx」跳到相關頁')
  return hints
}
