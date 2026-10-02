import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

/** 冰藍重點 */
export function Hl({ children }: Props) {
  return <strong className="font-bold text-sky-200">{children}</strong>
}

/** 琥珀警示 */
export function Warn({ children }: Props) {
  return <strong className="font-bold text-amber-300">{children}</strong>
}

/** 紅色禁止 */
export function Danger({ children }: Props) {
  return <strong className="font-bold text-red-300">{children}</strong>
}

/** 白色加粗（用於紅/琥珀底色區塊內） */
export function Em({ children }: Props) {
  return <strong className="font-bold text-white">{children}</strong>
}

/** 標示「一丞手冊未列、屬業界經驗值」的數字 */
export function Exp() {
  return (
    <span
      title="一丞手冊未列，屬業界常用參考值"
      className="ml-1.5 inline-flex items-center whitespace-nowrap rounded-md bg-slate-400/15 px-1.5 py-px align-middle text-[max(0.62em,16px)] font-semibold leading-normal text-slate-300"
    >
      業界經驗
    </span>
  )
}

/** 下標，例如 Q<sub>o</sub> */
export function Sub({ children }: Props) {
  return <sub className="relative top-[0.28em] ml-px align-baseline text-[max(0.62em,16px)] leading-none">{children}</sub>
}

/** 分數式 */
export function Frac({ num, den }: { num: ReactNode; den: ReactNode }) {
  return (
    <span className="mx-1 inline-flex flex-col items-center align-middle leading-tight">
      <span className="px-2 pb-1.5">{num}</span>
      <span className="h-0.5 w-full rounded bg-current opacity-70" />
      <span className="px-2 pt-1.5">{den}</span>
    </span>
  )
}
