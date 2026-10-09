import type { ReactNode } from 'react'

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-6 items-center justify-center rounded-md border border-line bg-card px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-200 shadow-[inset_0_-1px_0_rgba(15,36,64,0.12)]">
      {children}
    </kbd>
  )
}
