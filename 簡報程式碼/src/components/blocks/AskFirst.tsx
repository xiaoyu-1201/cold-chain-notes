import { ArrowRight, CornerDownRight, MessagesSquare, Sparkles, Users } from 'lucide-react'
import { useDeck } from '../../context/deck'
import { ASK_FIRST } from '../../data/askFirst'
import { useStickyState } from '../../hooks/useStickyState'
import { cn, pad } from '../../lib/cn'
import { openTutor } from '../../lib/tutor'
import { NewChip } from '../ui/NewChip'
import { Panel } from '../ui/Panel'

/**
 * 開單前問客人總表（10/17）：左邊選商品，右邊是要問的話、為什麼問、回答後怎麼做，點頁碼回原本那頁。
 * 下面兩顆直接叫 AI 助教練：客人說一句話 → 要問什麼；接客角色扮演。
 */
export function AskFirst({ mobile = false }: { mobile?: boolean }) {
  const [id, setId] = useStickyState('askfirst:group', ASK_FIRST[0].id)
  const deck = useDeck()
  const g = ASK_FIRST.find((x) => x.id === id) ?? ASK_FIRST[0]
  const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500'

  const picker = (
    <div role="tablist" aria-label="選商品" className={cn('grid', mobile ? 'grid-cols-3 gap-1.5' : 'grid-cols-2 gap-2.5')}>
      {ASK_FIRST.map((x) => {
        const on = x.id === g.id
        const Icon = x.icon
        return (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => setId(x.id)}
            className={cn(
              'flex items-center gap-2 rounded-xl border text-left font-bold transition',
              mobile ? 'min-h-11 justify-center px-1.5 text-[14px]' : 'min-h-[60px] px-4 text-[21px]',
              on ? 'border-sky-500 bg-sky-950 text-sky-100' : 'border-line bg-card text-slate-200 hover:border-sky-500/50',
              ring,
            )}
          >
            {!mobile && <Icon className="size-6 shrink-0 text-sky-300" aria-hidden />}
            <span className="min-w-0">{x.label}</span>
          </button>
        )
      })}
    </div>
  )

  const tutorBtns = (
    <div className={cn('flex', mobile ? 'flex-col gap-2' : 'flex-col gap-2.5')}>
      <button type="button" onClick={() => openTutor('triage')} className={cn('flex items-center gap-2 rounded-xl border border-violet-400/50 bg-violet-950 font-bold text-violet-100 hover:border-violet-400', mobile ? 'min-h-12 px-4 text-[15px]' : 'min-h-[60px] px-5 text-[21px]', ring)}>
        <MessagesSquare className={mobile ? 'size-5' : 'size-6'} aria-hidden />
        客人說一句話，問助教要問什麼
      </button>
      <button type="button" onClick={() => openTutor('roleplay')} className={cn('flex items-center gap-2 rounded-xl border border-violet-400/50 bg-violet-950 font-bold text-violet-100 hover:border-violet-400', mobile ? 'min-h-12 px-4 text-[15px]' : 'min-h-[60px] px-5 text-[21px]', ring)}>
        <Users className={mobile ? 'size-5' : 'size-6'} aria-hidden />
        跟助教扮演的客人練習
        <Sparkles className={cn('ml-auto', mobile ? 'size-4' : 'size-5')} aria-hidden />
      </button>
    </div>
  )

  const cards = (
    // 5 題排 3 欄（2 欄會多出半張、被切到）；只有 1 題就撐滿（10/17 QA）
    <ol className={cn('grid', mobile ? 'grid-cols-1 gap-2.5' : cn('gap-3', g.items.length > 4 ? 'grid-cols-3' : g.items.length === 1 ? 'grid-cols-1' : 'grid-cols-2'))}>
      {g.items.map((it, i) => (
        <li key={it.q} className={cn('flex flex-col rounded-2xl border border-line bg-paper', mobile ? 'p-3.5' : 'px-5 py-3')}>
          <p className={cn('flex items-start gap-2 font-black text-ink', mobile ? 'text-[16px]' : 'text-[23px] leading-snug')}>
            <span className="shrink-0 text-sky-300">{i + 1}.</span>
            <span className="min-w-0 flex-1">{it.q}</span>
            <NewChip added={it.added} mobile={mobile} className="mt-0.5" />
          </p>
          <p className={cn('mt-1 text-slate-300', mobile ? 'text-[15px]' : 'text-[20px] leading-snug')}>
            <b className="text-slate-400">為什麼問：</b>
            {it.why}
          </p>
          <p className={cn('mt-1 flex items-start gap-1.5 text-emerald-200', mobile ? 'text-[15px]' : 'text-[20px] leading-snug')}>
            <CornerDownRight className={cn('mt-1 shrink-0', mobile ? 'size-4' : 'size-5')} aria-hidden />
            <span>{it.then}</span>
          </p>
          {deck.numberOf(it.slide) > 0 && (
            <button type="button" onClick={() => deck.goToId(it.slide)} className={cn('mt-auto inline-flex items-center gap-1 self-start pt-1.5 font-semibold text-sky-300 hover:text-sky-200', mobile ? 'min-h-11 text-[15px]' : 'text-[20px]', ring)}>
              看 P.{pad(deck.numberOf(it.slide))}
              <ArrowRight className={mobile ? 'size-4' : 'size-5'} aria-hidden />
            </button>
          )}
        </li>
      ))}
    </ol>
  )

  if (mobile)
    return (
      <div className="flex flex-col gap-3">
        {picker}
        {g.tip && <p className="rounded-xl bg-amber-950 px-3 py-2 text-[15px] font-semibold text-amber-200">{g.tip}</p>}
        <div role="tabpanel" aria-label={g.label}>
          {cards}
        </div>
        {tutorBtns}
      </div>
    )
  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,0.62fr)_minmax(0,1.6fr)] gap-6">
      <div className="flex min-h-0 flex-col gap-5">
        {picker}
        {tutorBtns}
      </div>
      <Panel title={`${g.label}：開單前先問`} right={g.tip ? <span className="rounded-full bg-amber-950 px-4 py-1 text-[20px] font-semibold text-amber-200">{g.tip}</span> : undefined}>
        <div role="tabpanel" aria-label={g.label} className="h-full overflow-y-auto">
          {cards}
        </div>
      </Panel>
    </div>
  )
}
