import { ArrowUpRight, MessageCircle, Store } from 'lucide-react'
import { useDeck } from '../../context/deck'
import type { StoreTip } from '../../data/types'
import { pad } from '../../lib/cn'

/** 標題右側的「🏪 門市實戰」卡：相關品項 + 老闆叮嚀；點標籤可跳到店內產品地圖 */
export function StoreTipCard({ store }: { store: StoreTip }) {
  const { goToId, numberOf } = useDeck()
  return (
    <aside className="relative w-[740px] shrink-0 overflow-hidden rounded-[18px] border border-emerald-400/30 bg-linear-to-br from-emerald-500/[0.14] to-emerald-500/[0.03] px-5 py-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => goToId('products')}
          title="跳到店內產品地圖"
          className="mr-1 flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[18px] font-bold text-emerald-200 transition hover:bg-emerald-400/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        >
          <Store className="size-5" aria-hidden />
          門市實戰
          <span className="font-mono text-[13px] font-semibold text-emerald-300/80">P.{pad(numberOf('products'))}</span>
          <ArrowUpRight className="size-4" aria-hidden />
        </button>
        {store.products.map((p) => (
          <span
            key={p}
            className="rounded-md border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-0.5 text-[15px] font-semibold text-emerald-100"
          >
            {p}
          </span>
        ))}
      </div>
      <p className="mt-2 flex gap-2 text-[18px] leading-normal text-emerald-50/90">
        <MessageCircle className="mt-1 size-[18px] shrink-0 text-emerald-300" aria-hidden />
        <span>{store.tip}</span>
      </p>
    </aside>
  )
}
