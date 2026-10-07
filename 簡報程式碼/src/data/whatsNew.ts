/**
 * 「新」標記：每次新增或大改的頁面、翻卡，資料上寫 added（YYYY-MM-DD）；
 * 日期 ≥ NEW_SINCE 的會在標題、學習地圖、目錄、翻卡上顯示「新」。
 * 下一批上線時把 NEW_SINCE 改成那一批的日期，舊的標記就自動退掉（added 留著當紀錄）。
 */
export const NEW_SINCE = '2026-10-07'
export const NEW_LABEL = '10/7 新增'

export const isNew = (added?: string) => !!added && added >= NEW_SINCE
