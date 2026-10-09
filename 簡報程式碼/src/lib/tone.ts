import type { Tone } from '../data/types'

/**
 * 顏色語言（技術藍圖，10/09）：淡色紙底上用深色字＋淺底。
 * red／amber／ice＝管路三色：紅＝吐出管（高溫高壓氣態）、黃＝液管、藍＝吸氣管（低溫低壓）；
 * 其他 tone 是篇章、分類用的顏色。色票的實際色碼在 index.css。
 */
export interface ToneStyle {
  /** 強調文字（深色，4.5:1 以上） */
  text: string
  /** 更深的強調文字（數值、公式） */
  strong: string
  /** 淺底色 */
  soft: string
  border: string
  /** Badge / Chip */
  chip: string
  /** 圖示外框（只用在分類） */
  icon: string
  dot: string
  /** 管路色線（卡片頂端、時間軸）：實心色 */
  bar: string
}

export const toneStyles: Record<Tone, ToneStyle> = {
  ice: {
    text: 'text-sky-300',
    strong: 'text-sky-100',
    soft: 'bg-sky-950',
    border: 'border-sky-500/45',
    chip: 'border-sky-500/35 bg-sky-950 text-sky-200',
    icon: 'bg-sky-950 text-sky-300 ring-1 ring-inset ring-sky-500/30',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
  },
  teal: {
    text: 'text-teal-300',
    strong: 'text-teal-100',
    soft: 'bg-teal-950',
    border: 'border-teal-500/45',
    chip: 'border-teal-500/35 bg-teal-950 text-teal-200',
    icon: 'bg-teal-950 text-teal-300 ring-1 ring-inset ring-teal-500/30',
    dot: 'bg-teal-500',
    bar: 'bg-teal-500',
  },
  indigo: {
    text: 'text-indigo-300',
    strong: 'text-indigo-100',
    soft: 'bg-indigo-950',
    border: 'border-indigo-500/45',
    chip: 'border-indigo-500/35 bg-indigo-950 text-indigo-200',
    icon: 'bg-indigo-950 text-indigo-300 ring-1 ring-inset ring-indigo-500/30',
    dot: 'bg-indigo-500',
    bar: 'bg-indigo-500',
  },
  violet: {
    text: 'text-violet-300',
    strong: 'text-violet-100',
    soft: 'bg-violet-950',
    border: 'border-violet-500/45',
    chip: 'border-violet-500/35 bg-violet-950 text-violet-200',
    icon: 'bg-violet-950 text-violet-300 ring-1 ring-inset ring-violet-500/30',
    dot: 'bg-violet-500',
    bar: 'bg-violet-500',
  },
  emerald: {
    text: 'text-emerald-300',
    strong: 'text-emerald-100',
    soft: 'bg-emerald-950',
    border: 'border-emerald-500/45',
    chip: 'border-emerald-500/35 bg-emerald-950 text-emerald-200',
    icon: 'bg-emerald-950 text-emerald-300 ring-1 ring-inset ring-emerald-500/30',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
  },
  amber: {
    text: 'text-amber-300',
    strong: 'text-amber-100',
    soft: 'bg-amber-950',
    border: 'border-amber-500/55',
    chip: 'border-amber-500/50 bg-amber-950 text-amber-200',
    icon: 'bg-amber-950 text-amber-300 ring-1 ring-inset ring-amber-500/45',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
  },
  red: {
    text: 'text-red-300',
    strong: 'text-red-100',
    soft: 'bg-red-950',
    border: 'border-red-500/45',
    chip: 'border-red-500/35 bg-red-950 text-red-200',
    icon: 'bg-red-950 text-red-300 ring-1 ring-inset ring-red-500/30',
    dot: 'bg-red-500',
    bar: 'bg-red-500',
  },
  slate: {
    text: 'text-slate-300',
    strong: 'text-slate-100',
    soft: 'bg-white/[0.05]',
    border: 'border-line',
    chip: 'border-line bg-white/[0.04] text-slate-200',
    icon: 'bg-white/[0.05] text-slate-300 ring-1 ring-inset ring-line',
    dot: 'bg-slate-500',
    bar: 'bg-slate-500',
  },
}
