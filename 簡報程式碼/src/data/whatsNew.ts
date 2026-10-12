/**
 * 「新」標記：每次新增或大改的頁面、翻卡，資料上寫 added（YYYY-MM-DD）；
 * 日期 ≥ NEW_SINCE 的會在標題、學習地圖、目錄、翻卡上顯示「新」。
 * 下一批上線時把 NEW_SINCE 改成那一批的日期，舊的標記就自動退掉（added 留著當紀錄）。
 */
// 10/12 使用者：要拿去跟老闆對「有沒有做好」→ 從 10/9 全面對照錄音之後改過的都標（跟 Word 檔一致），而且要標得很明顯（紅色）
export const NEW_SINCE = '2026-10-09'
export const NEW_LABEL = '10/9 之後新增、修正'

export const isNew = (added?: string) => !!added && added >= NEW_SINCE
/** 標籤上的字：「新・10/12」 */
export const newTag = (added?: string) => (added ? `新・${Number(added.slice(5, 7))}/${Number(added.slice(8, 10))}` : '新')
