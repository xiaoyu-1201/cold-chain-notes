import type { Block, SlideData } from '../data/types'

/** 各互動區塊的操作提示：[電腦, 手機] */
const HINTS: Partial<Record<Block['type'], [string, string]>> = {
  cycleLesson: ['點零件看說明；切到「3D 立體」按「啟動冷凍系統」看冷媒跑一圈', '點零件看說明；切到 3D 按「啟動冷凍系統」看冷媒跑一圈'],
  cycle: ['點循環圖上的零件，看說明', '點「互動版」按鈕，到可點的循環圖'],
  hotspots: ['點講義上的零件，看用途、聽錄音、看 3D 構造', '點「3D 看構造」或錄音按鈕；點圖片可放大'],
  audio: ['點段落，從那裡開始播放', '點段落，從那裡開始播放'],
  quiz: ['先想答案，再點卡片翻開', '先想答案，再點卡片翻開'],
  fen: ['輸入客人說的、單子寫的或卡尺量的尺寸；點右邊表格也可以', '輸入任何寫法的尺寸，或點下面表格'],
  caliper: ['拖游尺或按微調鍵；點分數會自動夾上去；「考考我」練習讀數', '拖游尺或按微調鍵；點分數自動夾上；考考我練習'],
  coilreader: ['切換「數排／數支／找平的彎頭」看圖；右邊輸入規格（例 4×11×330）直接解讀', '切換數排／數支看圖；輸入規格直接解讀'],
  checklist: ['點項目打勾，會自動記住', '點項目打勾，會自動記住'],
  refslider: ['選冷媒，拖滑桿或直接輸入 psig／公斤／溫度', '選冷媒，拖滑桿或直接輸入 psig／公斤／溫度'],
  table: ['點表格下面的照片按鈕，放大原始照片', '點表格下面的照片按鈕，放大原始照片'],
  photo: ['點照片可以放大', '點照片可以放大'],
  estimate: ['選情境，一題一題幫客人配出整套', '選情境，一題一題幫客人配出整套'],
  flashcards: ['點卡片翻面、聽英文和台語；‹ › 換卡，右邊點名詞直接跳', '點卡片翻面、聽發音；‹ › 換卡，下面「全部名詞」直接跳'],
  products: ['點品項，跳到對應章節', '點章節按鈕，跳到對應章節'],
  parts: ['點章節，直接跳過去', '點章節按鈕，直接跳過去'],
  abbr: ['點有「P.xx」的縮寫，跳到講它的那一頁', '點有「P.xx」的縮寫，跳到那一頁'],
  showcase: ['左邊 3D 可以轉、剖開，還能「動手試試」；也能切到實物照片', '3D 可以轉、剖開、動手試試；也能切到實物照片'],
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
