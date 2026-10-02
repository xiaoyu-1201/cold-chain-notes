import { Check, ClipboardCheck, Ruler, Shuffle, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useStickyState } from '../../hooks/useStickyState'
import { cn } from '../../lib/cn'
import { Panel } from '../ui/Panel'

/**
 * 管徑「分」：1 吋＝8 分＝25.4 mm，1 分＝3.175 mm；冷媒銅管以外徑標示〔錄音05 02:28〕。
 * 1 吋以上叫「1 吋＋幾分」：1-1/8″＝1吋1分＝28.58 mm。
 */
const MM: Record<number, number> = { 1: 3.18, 2: 6.35, 3: 9.52, 4: 12.7, 5: 15.88, 6: 19.05, 7: 22.22, 8: 25.4, 9: 28.58, 10: 31.75, 11: 34.92, 12: 38.1, 13: 41.28, 14: 44.45, 15: 47.62, 16: 50.8, 17: 53.98 }
/** 店裡常見的冷媒銅管（ACR）尺寸 */
const ACR = [2, 3, 4, 5, 6, 7, 9, 11, 13, 17]
const MM_PER_FEN = 3.175

const fenName = (f: number) => (f < 8 ? `${f}分` : f % 8 === 0 ? `${f / 8}吋` : `${Math.floor(f / 8)}吋${f % 8}分`)
const FRAC: Record<number, string> = { 1: '1/8', 2: '1/4', 3: '3/8', 4: '1/2', 5: '5/8', 6: '3/4', 7: '7/8' }
const fenInch = (f: number) => {
  const whole = Math.floor(f / 8)
  const rem = f % 8
  if (!whole) return FRAC[rem]
  return rem ? `${whole}-${FRAC[rem]}` : `${whole}`
}
const fenMm = (f: number) => MM[f] ?? Math.round(f * MM_PER_FEN * 100) / 100
const cm = (mm: number) => (mm / 10).toFixed(2)

interface Reading {
  /** 我把輸入讀成什麼 */
  as: string
  mm: number
  /** 輸入本身就是精確的幾分（不是量出來的） */
  exact?: number
  /** 算法說明 */
  how: string
}

/** 把客人說的、單子寫的、卡尺量的各種寫法，換成外徑 mm */
function parse(raw: string): Reading | null {
  // ″ 經 NFKC 會變成兩個 ′，所以先換掉英吋符號再正規化
  let s = raw.replace(/["″”〃]|′′/g, '吋').normalize('NFKC').toLowerCase().trim()
  s = s.replace(/[φø⌀Φ]/g, '').replace(/英吋|inch|in\b/g, '吋').replace(/′+/g, '吋').replace(/公分/g, 'cm').replace(/公釐|毫米|m\/m/g, 'mm')
  s = s.replace(/\s+/g, ' ').trim()
  let m: RegExpMatchArray | null
  if ((m = s.match(/^(\d+)\s*吋\s*(?:(\d+)\s*分|(半))?$/))) {
    const f = Number(m[1]) * 8 + (m[2] ? Number(m[2]) : m[3] ? 4 : 0)
    return { as: fenName(f), mm: fenMm(f), exact: f, how: `${m[1]} 吋＝${Number(m[1]) * 8} 分${f % 8 ? `，再加 ${f % 8} 分＝${f} 分` : ''}；${f} × 3.175 ≈ ${fenMm(f)} mm` }
  }
  if ((m = s.match(/^(\d+)\s*分$/))) {
    const f = Number(m[1])
    if (f < 1 || f > 24) return null
    return { as: `${f} 分`, mm: fenMm(f), exact: f, how: `${f} × 3.175 ≈ ${fenMm(f)} mm${f >= 8 ? `（${f} 分＝${fenName(f)}）` : ''}` }
  }
  if ((m = s.match(/^(\d+)\s*分之\s*(\d+)\s*吋?$/))) s = `${m[2]}/${m[1]}`
  if ((m = s.match(/^(?:(\d+)[-\s])?(\d+)\/(\d+)\s*吋?$/))) {
    const whole = m[1] ? Number(m[1]) : 0
    const n = Number(m[2])
    const d = Number(m[3])
    if (!d || ![2, 4, 8, 16].includes(d)) return null
    const eighths = whole * 8 + (n * 8) / d
    const label = `${whole ? `${whole}-` : ''}${n}/${d}″`
    if (Number.isInteger(eighths)) {
      const step = d === 8 ? `分母是 8，分子 ${n} 就是 ${n} 分` : `${n}/${d}＝${(n * 8) / d}/8，就是 ${(n * 8) / d} 分`
      const part = (n * 8) / d
      const how = whole ? `${whole} 吋＝${whole * 8} 分，${n}/${d}＝${part} 分，加起來 ${eighths} 分` : step
      return { as: `英吋 ${label}`, mm: fenMm(eighths), exact: eighths, how }
    }
    const mm = (whole + n / d) * 25.4
    return { as: `英吋 ${label}`, mm, how: `${whole + n / d} × 25.4 ≈ ${mm.toFixed(2)} mm` }
  }
  if ((m = s.match(/^(\d+(?:\.\d+)?)\s*(mm|cm|吋)?$/))) {
    const v = Number(m[1])
    const unit = m[2] ?? (Number.isInteger(v) && v >= 1 && v <= 17 ? 'fen' : v < 6 ? 'cm' : 'mm')
    if (unit === 'fen') return { as: `${v} 分（只寫數字，當成幾分）`, mm: fenMm(v), exact: v, how: `${v} × 3.175 ≈ ${fenMm(v)} mm` }
    if (unit === '吋') {
      const eighths = v * 8
      if (Number.isInteger(eighths)) return { as: `${v} 吋`, mm: fenMm(eighths), exact: eighths, how: `${v} 吋 × 8＝${eighths} 分` }
      return { as: `${v} 吋`, mm: v * 25.4, how: `${v} × 25.4 ≈ ${(v * 25.4).toFixed(2)} mm` }
    }
    const mm = unit === 'cm' ? v * 10 : v
    return { as: unit === 'cm' ? `${v} 公分（${mm.toFixed(1)} mm）` : `${v} mm`, mm, how: `${mm.toFixed(2)} ÷ 3.175 ≈ ${(mm / MM_PER_FEN).toFixed(1)} 分` }
  }
  return null
}

/** 量出來的外徑 → 最接近的幾分 */
function nearest(mm: number) {
  const f = Math.max(1, Math.round(mm / MM_PER_FEN))
  return { fen: f, diff: Math.abs(mm - fenMm(f)) }
}

/** 單子上同一個尺寸常見的寫法 */
const variants = (f: number) => {
  const mm = fenMm(f)
  const list = [fenName(f), `${fenInch(f)}″`, fenInch(f), `Φ${mm}`, `${mm} mm`, `${cm(mm)} cm`]
  if (f >= 9) list.splice(1, 0, `${f}分`)
  return [...new Set(list)]
}

type Quiz = { q: string; options: string[]; answer: string; explain: string }
function makeQuiz(prev?: string): Quiz {
  let quiz: Quiz
  do {
    const i = Math.floor(Math.random() * ACR.length)
    const f = ACR[i]
    const near = [ACR[i - 1], ACR[i + 1], ACR[i + 2], ACR[i - 2]].filter((x): x is number => x !== undefined).slice(0, 2)
    const pool = [f, ...near].sort((a, b) => a - b)
    const kind = Math.floor(Math.random() * 3)
    if (kind === 0) quiz = { q: `單子寫 ${fenInch(f)}″，是幾分？`, options: pool.map(fenName), answer: fenName(f), explain: `${fenInch(f)}″＝${fenName(f)}` }
    else if (kind === 1) {
      const measured = (fenMm(f) + (Math.random() < 0.5 ? -0.04 : 0.03)).toFixed(2)
      quiz = { q: `卡尺量到 ${measured} mm，是幾分？`, options: pool.map(fenName), answer: fenName(f), explain: `${measured} ÷ 3.175 ≈ ${f}，就是${fenName(f)}（${fenMm(f)} mm）` }
    } else quiz = { q: `客人要${fenName(f)}的管，外徑幾 mm？`, options: pool.map((x) => `${fenMm(x)}`), answer: `${fenMm(f)}`, explain: `${f} × 3.175 ≈ ${fenMm(f)} mm` }
  } while (quiz.q === prev)
  return quiz
}

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
const EXAMPLES = [
  { label: '客人說「3 分」', value: '3分' },
  { label: '單子寫 1-1/8″', value: '1-1/8″' },
  { label: '卡尺量到 15.9 mm', value: '15.9mm' },
  { label: '標籤寫 2.22 cm', value: '2.22cm' },
]

/** 對單小幫手：聽客人講幾分、出貨進貨看單對貨；輸入任何寫法 → 分／英吋／mm／公分，右邊是完整對照表 */
export function FenConverter({ mobile = false }: { mobile?: boolean }) {
  const [input, setInput] = useStickyState('fen:input', '3分')
  const [quiz, setQuiz] = useState(() => makeQuiz())
  const [picked, setPicked] = useState<string | null>(null)
  const reading = useMemo(() => parse(input), [input])
  const near = reading ? nearest(reading.mm) : null
  const fen = reading?.exact ?? near?.fen ?? null
  const isExact = reading?.exact !== undefined
  const close = !isExact && near ? near.diff <= Math.max(0.35, reading!.mm * 0.02) : true

  const t = mobile
    ? { label: 'text-[13px]', body: 'text-[15px]', value: 'text-[22px]', input: 'text-[22px]', small: 'text-[13px]', chip: 'px-3 py-1 text-[14px]' }
    : { label: 'text-[17px]', body: 'text-[20px]', value: 'text-[38px]', input: 'text-[34px]', small: 'text-[17px]', chip: 'px-4 py-1.5 text-[18px]' }

  const nextQuiz = () => {
    setQuiz(makeQuiz(quiz.q))
    setPicked(null)
  }

  const helper = (
    <div className={cn('flex h-full flex-col', mobile ? 'gap-3' : 'gap-4')}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        placeholder="例：3分、3/8″、1-1/8、15.9mm、2.2公分"
        aria-label="輸入尺寸（幾分、英吋、mm 或公分都可以）"
        className={cn('w-full rounded-2xl bg-black/30 px-5 font-black text-white outline-none ring-2 ring-sky-400/40 placeholder:font-semibold placeholder:text-slate-500 focus:ring-sky-300', t.input, mobile ? 'py-2' : 'py-3')}
      />
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button key={ex.value} type="button" onClick={() => setInput(ex.value)} className={cn('rounded-full bg-sky-400/15 font-semibold text-sky-200 transition hover:bg-sky-400/25', t.chip, focusRing)}>
            {ex.label}
          </button>
        ))}
      </div>

      {reading && fen !== null ? (
        <div className={cn('rounded-[22px] bg-white/[0.05]', mobile ? 'p-3' : 'p-5')}>
          <p className={cn('text-slate-400', t.small)}>我讀成：{reading.as}</p>
          <dl className={cn('mt-2 grid grid-cols-4', mobile ? 'gap-2' : 'gap-4')}>
            {[
              ['叫法', fenName(fen)],
              ['英吋', `${fenInch(fen)}″`],
              ['外徑', `${fenMm(fen)}`, 'mm'],
              ['公分', cm(fenMm(fen)), 'cm'],
            ].map(([label, value, unit]) => (
              <div key={label} className="min-w-0">
                <dt className={cn('font-semibold text-slate-400', t.label)}>{label}</dt>
                <dd className={cn('truncate font-black tabular-nums text-white', t.value)}>
                  {value}
                  {unit && <span className={cn('ml-1 font-bold text-slate-400', t.label)}>{unit}</span>}
                </dd>
              </div>
            ))}
          </dl>
          <p className={cn('mt-2 text-slate-200', t.body)}>算法：{reading.how}</p>
          {!isExact && near && (
            <p className={cn('mt-1 font-semibold', t.body, close ? 'text-emerald-300' : 'text-amber-300')}>
              {close
                ? `跟${fenName(near.fen)}（${fenMm(near.fen)} mm）差 ${near.diff.toFixed(2)} mm → 就是${fenName(near.fen)}`
                : `跟最接近的${fenName(near.fen)}差 ${near.diff.toFixed(2)} mm，請再量一次，或確認是不是公制管`}
            </p>
          )}
          {!ACR.includes(fen) && <p className={cn('mt-1 text-amber-200', t.small)}>冷媒銅管很少用這個尺寸，跟客人再確認一次。</p>}
          <div className={cn('mt-3 flex flex-wrap items-center gap-1.5', t.small)}>
            <span className="text-slate-400">單子上也可能寫成</span>
            {variants(fen).map((v) => (
              <span key={v} className="rounded-md bg-white/[0.07] px-2 py-0.5 font-semibold text-slate-100">
                {v}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className={cn('rounded-[22px] bg-white/[0.05] text-amber-200', t.body, mobile ? 'p-3' : 'p-5')}>
          {input.trim() ? '看不懂這個寫法；試試「3分」「3/8″」「1吋1分」「15.9mm」「2.2公分」。' : '輸入客人說的、單子寫的或卡尺量的尺寸。'}
        </p>
      )}

      <div className={cn('rounded-[22px] bg-emerald-400/[0.07]', mobile ? 'p-3' : 'mt-auto p-5')}>
        <div className="flex items-center justify-between gap-2">
          <p className={cn('font-bold text-emerald-200', t.body)}>考考我：{quiz.q}</p>
          <button type="button" onClick={nextQuiz} className={cn('flex shrink-0 items-center gap-1 rounded-full bg-white/[0.08] font-semibold text-sky-300 hover:bg-white/[0.12]', t.chip, focusRing)}>
            <Shuffle className="size-4" aria-hidden />
            換一題
          </button>
        </div>
        <div className={cn('mt-2.5 flex flex-wrap items-center', mobile ? 'gap-2' : 'gap-3')}>
          {quiz.options.map((o) => {
            const show = picked !== null
            const isAnswer = o === quiz.answer
            return (
              <button
                key={o}
                type="button"
                disabled={show}
                onClick={() => setPicked(o)}
                className={cn(
                  'rounded-full font-black transition',
                  mobile ? 'px-4 py-1.5 text-[16px]' : 'px-6 py-2 text-[21px]',
                  !show && 'bg-white/[0.08] text-slate-100 hover:bg-white/[0.14]',
                  show && isAnswer && 'bg-emerald-400/25 text-emerald-100',
                  show && !isAnswer && picked === o && 'bg-red-500/20 text-red-200',
                  show && !isAnswer && picked !== o && 'bg-white/[0.03] text-slate-500',
                  focusRing,
                )}
              >
                {o}
              </button>
            )
          })}
          {picked !== null && (
            <p className={cn('flex items-center gap-1.5 font-semibold', t.body, picked === quiz.answer ? 'text-emerald-300' : 'text-red-300')}>
              {picked === quiz.answer ? <Check className="size-5" aria-hidden /> : <X className="size-5" aria-hidden />}
              {picked === quiz.answer ? '答對了！' : quiz.explain}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  const maxMm = fenMm(17)
  const table = (
    <div className={cn('flex h-full flex-col', mobile ? 'gap-2' : 'gap-3')}>
      <p className={cn('text-slate-300', t.body)}>
        <b className="text-white">1 分＝3.175 mm</b>；英吋分母換成 8，分子就是幾分（3/4＝6/8＝6 分）
      </p>
      <table className="w-full table-fixed border-collapse text-center">
        <thead>
          <tr className={cn('text-slate-400', t.label)}>
            {!mobile && <th className="w-[64px] py-1 font-semibold">大小</th>}
            <th className="py-1 text-left font-semibold">叫法</th>
            <th className="py-1 font-semibold">英吋</th>
            <th className="py-1 font-semibold">外徑 mm</th>
            <th className="py-1 font-semibold">公分</th>
          </tr>
        </thead>
        <tbody>
          {ACR.map((f) => {
            const on = f === fen
            return (
              <tr
                key={f}
                onClick={() => setInput(fenName(f))}
                className={cn('cursor-pointer border-t border-white/[0.06] transition-colors', on ? 'bg-sky-400/15' : 'hover:bg-white/[0.05]')}
              >
                {!mobile && (
                  <td className="py-0.5">
                    <span
                      className={cn('mx-auto block rounded-full border-2', on ? 'border-sky-300 bg-sky-400/20' : 'border-amber-300/70 bg-amber-400/10')}
                      style={{ width: Math.max(6, (fenMm(f) / maxMm) * 32), height: Math.max(6, (fenMm(f) / maxMm) * 32) }}
                      aria-hidden
                    />
                  </td>
                )}
                <td className={cn('py-1 text-left font-black', mobile ? 'text-[16px]' : 'text-[22px]', on ? 'text-sky-200' : 'text-white')}>
                  <button type="button" onClick={() => setInput(fenName(f))} className={cn('rounded', focusRing)}>
                    {fenName(f)}
                  </button>
                </td>
                <td className={cn('py-1 font-semibold tabular-nums text-slate-100', mobile ? 'text-[15px]' : 'text-[21px]')}>{fenInch(f)}″</td>
                <td className={cn('py-1 font-semibold tabular-nums text-slate-100', mobile ? 'text-[15px]' : 'text-[21px]')}>{fenMm(f)}</td>
                <td className={cn('py-1 tabular-nums text-slate-300', mobile ? 'text-[15px]' : 'text-[21px]')}>{cm(fenMm(f))}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className={cn('rounded-2xl bg-white/[0.04] text-slate-300', t.small, mobile ? 'p-2.5' : 'mt-auto px-4 py-3')}>
        <b className="text-white">看型號也知道幾分：</b>Danfoss 乾燥過濾器 DML 08<b className="text-sky-200">3</b> 的最後一碼 3＝3 分（3/8″）；尾巴 S＝焊接，沒有＝喇叭口
      </p>
    </div>
  )

  if (mobile)
    return (
      <div className="flex flex-col gap-4">
        {helper}
        <div className="rounded-2xl bg-white/[0.04] p-3">
          <p className="mb-2 text-[16px] font-bold text-white">冷媒銅管尺寸對照（外徑）</p>
          {table}
        </div>
      </div>
    )

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] gap-6">
      <Panel icon={ClipboardCheck} tone="ice" title="對單小幫手：客人說的、單子寫的、卡尺量的，都輸入這裡">
        {helper}
      </Panel>
      <Panel icon={Ruler} tone="amber" title="冷媒銅管尺寸對照（外徑）">
        {table}
      </Panel>
    </div>
  )
}
