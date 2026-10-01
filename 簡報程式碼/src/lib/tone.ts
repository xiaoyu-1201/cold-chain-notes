import type { Tone } from '../data/types'

export interface ToneStyle {
  /** 強調文字 */
  text: string
  /** 高亮文字（數值、公式） */
  strong: string
  /** 柔和底色 */
  soft: string
  border: string
  /** Badge / Chip */
  chip: string
  /** 圖示外框 */
  icon: string
  dot: string
  /** 漸層色（搭配 bg-linear-to-*） */
  gradient: string
  /** 卡片標頭漸層底色 */
  wash: string
}

export const toneStyles: Record<Tone, ToneStyle> = {
  ice: {
    text: 'text-sky-300',
    strong: 'text-sky-100',
    soft: 'bg-sky-400/10',
    border: 'border-sky-400/30',
    chip: 'border-sky-400/35 bg-sky-400/10 text-sky-200',
    icon: 'bg-sky-400/15 text-sky-300 ring-1 ring-inset ring-sky-400/30',
    dot: 'bg-sky-400',
    gradient: 'from-sky-400 to-cyan-300',
    wash: 'from-sky-500/25 to-sky-500/[0.03]',
  },
  teal: {
    text: 'text-teal-300',
    strong: 'text-teal-100',
    soft: 'bg-teal-400/10',
    border: 'border-teal-400/30',
    chip: 'border-teal-400/35 bg-teal-400/10 text-teal-200',
    icon: 'bg-teal-400/15 text-teal-300 ring-1 ring-inset ring-teal-400/30',
    dot: 'bg-teal-400',
    gradient: 'from-teal-400 to-emerald-300',
    wash: 'from-teal-500/25 to-teal-500/[0.03]',
  },
  indigo: {
    text: 'text-indigo-300',
    strong: 'text-indigo-100',
    soft: 'bg-indigo-400/10',
    border: 'border-indigo-400/30',
    chip: 'border-indigo-400/35 bg-indigo-400/10 text-indigo-200',
    icon: 'bg-indigo-400/15 text-indigo-300 ring-1 ring-inset ring-indigo-400/30',
    dot: 'bg-indigo-400',
    gradient: 'from-indigo-400 to-sky-300',
    wash: 'from-indigo-500/25 to-indigo-500/[0.03]',
  },
  violet: {
    text: 'text-violet-300',
    strong: 'text-violet-100',
    soft: 'bg-violet-400/10',
    border: 'border-violet-400/30',
    chip: 'border-violet-400/35 bg-violet-400/10 text-violet-200',
    icon: 'bg-violet-400/15 text-violet-300 ring-1 ring-inset ring-violet-400/30',
    dot: 'bg-violet-400',
    gradient: 'from-violet-400 to-fuchsia-300',
    wash: 'from-violet-500/25 to-violet-500/[0.03]',
  },
  emerald: {
    text: 'text-emerald-300',
    strong: 'text-emerald-100',
    soft: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    chip: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
    icon: 'bg-emerald-400/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/30',
    dot: 'bg-emerald-400',
    gradient: 'from-emerald-400 to-teal-300',
    wash: 'from-emerald-500/25 to-emerald-500/[0.03]',
  },
  amber: {
    text: 'text-amber-300',
    strong: 'text-amber-100',
    soft: 'bg-amber-400/10',
    border: 'border-amber-400/35',
    chip: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
    icon: 'bg-amber-400/15 text-amber-300 ring-1 ring-inset ring-amber-400/35',
    dot: 'bg-amber-400',
    gradient: 'from-amber-300 to-orange-400',
    wash: 'from-amber-500/25 to-amber-500/[0.03]',
  },
  red: {
    text: 'text-red-300',
    strong: 'text-red-100',
    soft: 'bg-red-500/10',
    border: 'border-red-400/40',
    chip: 'border-red-400/45 bg-red-500/15 text-red-200',
    icon: 'bg-red-500/15 text-red-300 ring-1 ring-inset ring-red-400/40',
    dot: 'bg-red-400',
    gradient: 'from-red-400 to-orange-400',
    wash: 'from-red-500/30 to-red-500/[0.03]',
  },
  slate: {
    text: 'text-slate-300',
    strong: 'text-slate-100',
    soft: 'bg-slate-400/10',
    border: 'border-slate-400/25',
    chip: 'border-slate-400/30 bg-slate-400/10 text-slate-200',
    icon: 'bg-slate-400/15 text-slate-300 ring-1 ring-inset ring-slate-400/25',
    dot: 'bg-slate-400',
    gradient: 'from-slate-400 to-slate-300',
    wash: 'from-slate-500/25 to-slate-500/[0.03]',
  },
}
