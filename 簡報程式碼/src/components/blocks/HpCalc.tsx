import { Calculator, Fan, MessagesSquare, Sparkles } from 'lucide-react'
import { openTutor } from '../../lib/tutor'
import { CountUp } from '../ui/CountUp'
import { useMemo } from 'react'
import { useStickyState } from '../../hooks/useStickyState'
import { cn } from '../../lib/cn'
import { Panel } from '../ui/Panel'
import { Segmented } from '../ui/Segmented'
import { condFor, condName, DIV, readModel, sayHp, TEMP_NAME, type Temp } from '../../lib/hp'

/**
 * 幾匹換算器（10/17 使用者：業務、經營者角度的小工具）。算法全部照老闆錄音：
 * 高溫 12,000、中溫 8,000、低溫 4,000 BTU＝1 匹〔錄音18 06:55〕；鐵甲型號第 1 碼＝溫度、第 2 碼＝位數〔錄音18 09:27〕；
 * 50 Hz 型錄乘 1.2〔錄音20 19:49〕；散熱器＝壓縮機 ×2，挑最接近的尺寸〔錄音18 70:32〕。
 */
const EXAMPLES = [
  { label: '鐵甲 5520', value: '5520' },
  { label: '鐵甲 2446', value: '2446' },
  { label: '型錄 13,000 BTU', value: '13000' },
]

export function HpCalc({ mobile = false }: { mobile?: boolean }) {
  const [input, setInput] = useStickyState('hp:input', '5520')
  const [temp, setTemp] = useStickyState<Temp>('hp:temp', 'high')
  const [hz50, setHz50] = useStickyState('hp:hz50', false)

  const r = useMemo(() => {
    const model = readModel(input)
    const n = Number(input.replace(/[,，\s]|btu/gi, ''))
    const base = model ? model.btu : Number.isFinite(n) && n > 0 ? n : null
    // 不合理的數字（打錯、少打一個 0）不要硬算出「8333 匹」（10/17 QA）
    if (base === null || base < 1000 || base > 500000) return null
    const t = model ? model.temp : temp
    // 型號算出來的已經是 60 Hz；只有型錄上的 BTU 才可能是 50 Hz
    const btu = hz50 && !model ? Math.round(base * 1.2) : base
    const hp = btu / DIV[t]
    return { model, t, base, btu, hp, say: sayHp(hp), cond: condFor(hp) }
  }, [input, temp, hz50])

  const s = mobile
    ? { input: 'text-[22px]', body: 'text-[15px]', small: 'text-[13px]', big: 'text-[26px]', chip: 'min-h-11 px-3 py-1 text-[14px]' }
    : { input: 'text-[32px]', body: 'text-[20px]', small: 'text-[20px]', big: 'text-[44px]', chip: 'px-4 py-1.5 text-[20px]' }
  const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

  const form = (
    <div className={cn('flex flex-col', mobile ? 'gap-3' : 'gap-3')}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        inputMode="numeric"
        placeholder="鐵甲型號（例 5520）或 BTU（例 13000）"
        aria-label="輸入鐵甲型號或 BTU"
        className={cn('w-full rounded-2xl bg-card px-5 py-2 font-black text-ink outline-none ring-2 ring-sky-500/45 placeholder:font-semibold placeholder:text-slate-500 focus:ring-sky-500', s.input)}
      />
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button key={ex.value} type="button" onClick={() => setInput(ex.value)} className={cn('rounded-full border border-sky-500/40 bg-sky-950 font-semibold text-sky-200 transition hover:border-sky-500', s.chip, ring)}>
            {ex.label}
          </button>
        ))}
      </div>
      {!r?.model && (
        <div className="flex flex-wrap items-center gap-3">
          <span className={cn('font-semibold text-slate-300', s.body)}>這顆是</span>
          <Segmented
            size={mobile ? 'sm' : 'md'}
            value={temp}
            onChange={setTemp}
            options={[
              { value: 'high', label: '高溫' },
              { value: 'mid', label: '中溫' },
              { value: 'low', label: '低溫' },
            ]}
          />
        </div>
      )}
      {!r?.model && (
        <label className={cn('flex cursor-pointer items-center gap-2 text-slate-200', s.body)}>
          <input type="checkbox" checked={hz50} onChange={(e) => setHz50(e.target.checked)} className="size-5 accent-sky-500" />
          型錄寫的是 50 Hz（大陸、歐洲型錄）→ 乘 1.2
        </label>
      )}
    </div>
  )

  const result = r ? (
    <div className={cn('flex flex-col', mobile ? 'gap-2.5' : 'gap-3')}>
      {r.model && <p className={cn('rounded-xl bg-white/[0.06] px-3 py-2 text-slate-200', s.body)}>{r.model.how}</p>}
      <dl className={cn('grid gap-3', mobile ? 'grid-cols-2' : 'grid-cols-3')}>
        <div>
          <dt className={cn('font-semibold text-slate-400', s.small)}>能力（60 Hz）</dt>
          <dd className={cn('font-black tabular-nums text-white', s.big)}>
            <CountUp text={r.btu.toLocaleString('en-US')} />
            <span className={cn('ml-1 font-bold text-slate-400', s.small)}>BTU</span>
          </dd>
        </div>
        <div>
          <dt className={cn('font-semibold text-slate-400', s.small)}>
            ÷ {DIV[r.t].toLocaleString()}（{TEMP_NAME[r.t]}）
          </dt>
          <dd className={cn('font-black tabular-nums text-sky-300', s.big)}>
            <CountUp text={r.hp.toFixed(2)} />
            <span className={cn('ml-1 font-bold text-slate-400', s.small)}>匹</span>
          </dd>
        </div>
        <div className={mobile ? 'col-span-2' : ''}>
          <dt className={cn('flex items-center gap-1.5 font-semibold text-slate-400', s.small)}>
            <MessagesSquare className="size-4" aria-hidden />
            跟客人講
          </dt>
          <dd className={cn('font-black text-amber-300', s.big)}>{r.say}</dd>
        </div>
      </dl>
      <div className={cn('rounded-2xl border border-emerald-500/35 bg-emerald-950/60', mobile ? 'p-3' : 'px-5 py-3')}>
        <p className={cn('flex items-center gap-2 font-bold text-emerald-200', s.body)}>
          <Fan className="size-5" aria-hidden />
          散熱器：{r.hp.toFixed(2)} × 2 → 配<span className="text-white">{condName(r.cond)}</span>
        </p>
        <p className={cn('mt-1 text-slate-200', s.small)}>沒有外移、在廚房或通風差：再加大（最多到 2.5 倍）；跟客人講「{condName(r.cond)}以上」。</p>
      </div>
      {r.t === 'low' && <p className={cn('text-slate-300', s.small)}>低溫車有人用 4,500 BTU 當一匹；同樣叫「一匹」也分小型、中型，要問客人要足的還是小一點的。</p>}
      <button
        type="button"
        onClick={() =>
          openTutor('ask', {
            kind: 'pitch',
            slideId: 'hp-calc',
            text: `${r.model ? `鐵甲 ${input}（${r.model.how}）` : `型錄 ${r.base.toLocaleString()} BTU`}${hz50 && !r.model ? '，型錄是 50 Hz、已乘 1.2' : ''}；${TEMP_NAME[r.t]}，${r.btu.toLocaleString()} BTU ÷ ${DIV[r.t].toLocaleString()} = ${r.hp.toFixed(2)} 匹 → 跟客人講「${r.say}」；散熱器 ×2 → ${condName(r.cond)}`,
          })
        }
        className={cn('inline-flex items-center gap-2 self-start rounded-full border border-violet-400/50 bg-violet-950 font-bold text-violet-100 hover:border-violet-400', mobile ? 'min-h-11 px-4 text-[15px]' : 'min-h-[52px] px-5 text-[20px]', ring)}
      >
        <Sparkles className={mobile ? 'size-4' : 'size-5'} aria-hidden />
        幫我講給客人聽（助教）
      </button>
    </div>
  ) : (
    <p className={cn('rounded-2xl border border-amber-500/50 bg-amber-950 p-4 text-amber-200', s.body)}>{input.trim() ? '看不懂或數字不太對：輸入鐵甲型號（4 碼，例 5520、7512、2446），或 BTU（通常在 1,000～500,000 之間）。' : '輸入鐵甲型號或型錄上的 BTU。'}</p>
  )

  if (mobile)
    return (
      <div className="flex flex-col gap-4">
        {form}
        {result}
      </div>
    )
  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-6">
      <Panel icon={Calculator} tone="ice" title="輸入型號或 BTU">
        {form}
      </Panel>
      <Panel icon={Calculator} tone="amber" title="幾匹、怎麼講、散熱器配多大">
        {result}
      </Panel>
    </div>
  )
}
