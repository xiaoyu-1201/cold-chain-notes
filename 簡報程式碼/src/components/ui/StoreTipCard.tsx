import { ArrowUpRight, Store } from 'lucide-react'
import { useDeck } from '../../context/deck'
import type { StoreTip } from '../../data/types'
import { pad } from '../../lib/cn'

/** 標題右側的「門市實戰」卡：相關品項＋老闆叮嚀；藍色連結可跳到店內產品地圖 */
export function StoreTipCard({ store }: { store: StoreTip }) {
  const { goToId, numberOf } = useDeck()
  return (
    <aside className="relative w-[740px] shrink-0 rounded-[14px] border border-emerald-500/35 bg-emerald-950/70 px-6 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => goToId('products')}
          title="跳到店內產品地圖"
          className="mr-1 flex items-center gap-1.5 rounded-full text-[18px] font-semibold text-sky-300 transition hover:text-sky-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        >
          <Store className="size-5 text-emerald-300" aria-hidden />
          <span className="text-emerald-200">門市實戰</span>
          <span className="font-mono text-[16px]">P.{pad(numberOf('products'))}</span>
          <ArrowUpRight className="size-4" aria-hidden />
        </button>
        {store.products.map((p) => (
          <span key={p} className="rounded-full border border-line bg-card px-3 py-0.5 text-[17px] font-semibold text-slate-100">
            {p}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[18px] leading-normal text-slate-200">{store.tip}</p>
    </aside>
  )
}
