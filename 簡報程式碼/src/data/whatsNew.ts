/**
 * 「新」標記：每次新增或大改的頁面、翻卡，資料上寫 added（YYYY-MM-DD）；
 * 日期 ≥ NEW_SINCE 的會在標題、學習地圖、目錄、翻卡上顯示「新」。
 * 下一批上線時把 NEW_SINCE 改成那一批的日期，舊的標記就自動退掉（added 留著當紀錄）。
 */
// 10/12 使用者：要標得很明顯（紅色）；10/13 使用者：紅點太多 → 只留最新一批（10/12），頁面上再講哪裡是新的（SlideData.changes＋各卡片的 added）
// 10/18 使用者：10/16、10/17 的都要標「新」（錄音17 是 10/16 上的課）
export const NEW_SINCE = '2026-10-16'

export const isNew = (added?: string) => !!added && added >= NEW_SINCE
/** 日期縮寫：2026-10-12 → 「10/12」 */
export const shortDate = (added: string) => `${Number(added.slice(5, 7))}/${Number(added.slice(8, 10))}`
/** 標籤上的字：「新・10/12」 */
export const newTag = (added?: string) => (added ? `新・${shortDate(added)}` : '新')
/** 說明文字跟著 NEW_SINCE 走（下一批只要改 NEW_SINCE） */
export const NEW_LABEL = `${shortDate(NEW_SINCE)} 以後新增、修正`
