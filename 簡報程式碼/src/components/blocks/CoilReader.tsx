import { useMemo } from 'react'
import { useStickyState } from '../../hooks/useStickyState'
import { cn } from '../../lib/cn'
import { Segmented } from '../ui/Segmented'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

type Mode = 'rows' | 'tubes' | 'flat'
const MODES: { value: Mode; label: string }[] = [
  { value: 'rows', label: '數排' },
  { value: 'tubes', label: '數支' },
  { value: 'flat', label: '找平的彎頭' },
]

/**
 * 支數 → 外觀高度與風車大小（錄音10：11 支＝10 吋風車、高約 29 公分；14 支＝12 吋、36.5 公分；
 * 10 支、16 支取自型錄外觀尺寸）。其他支數用每支約 2.6 公分估算。
 */
const HEIGHT: Record<number, { cm: string; fan: string }> = {
  10: { cm: '27', fan: '9 吋' },
  11: { cm: '29', fan: '10 吋' },
  14: { cm: '36.5', fan: '12 吋' },
  16: { cm: '42', fan: '12 吋' },
}

const EXAMPLES = ['4×11×330', '5×11×660', '4×14×780', '5×16×1090']

/** 讀「排×支×鏡面」：4×11×330、4x11x33（公分）、4*11 都可以 */
function parse(text: string) {
  const m = text.replace(/\s+/g, '').match(/^(\d+)[x×X*乘](\d+)(?:[x×X*乘](\d+(?:\.\d+)?))?/)
  if (!m) return null
  const rows = Number(m[1])
  const tubes = Number(m[2])
  if (rows < 1 || rows > 8 || tubes < 4 || tubes > 30) return null
  let len = m[3] ? Number(m[3]) : null
  let asCm = false
  if (len !== null && len < 100) {
    len = Math.round(len * 10)
    asCm = true
  }
  return { rows, tubes, len, asCm }
}

/**
 * 穿管面（全部都是彎頭的那一面）示意圖：
 * 每一排是一直行（排與排錯開半格）；同一排裡的彎頭是直的（平的），跨到下一排的彎頭是斜的。
 */
function TubeSheet({ rows, tubes, mode, mobile }: { rows: number; tubes: number; mode: Mode; mobile: boolean }) {
  const P = 30 // 孔距（上下）
  const RX = P * 2 // 排距（左右放寬一點，圖比較好看懂）
  const padX = 60
  const padTop = 54
  const W = padX * 2 + (rows - 1) * RX
  const H = padTop + (tubes - 1) * P + P / 2 + 30
  const pos = (r: number, t: number) => ({ x: padX + r * RX, y: padTop + t * P + (r % 2 ? P / 2 : 0) })

  // 跨排的彎頭（斜的）：輪流接在最下面、最上面；其餘的孔在同一排裡兩兩相接（平的）
  const bends: { a: { x: number; y: number }; b: { x: number; y: number }; flat: boolean }[] = []
  const used = Array.from({ length: rows }, () => new Set<number>())
  for (let r = 0; r + 1 < rows; r++) {
    const idx = r % 2 === 0 ? tubes - 1 : 0
    bends.push({ a: pos(r, idx), b: pos(r + 1, idx), flat: false })
    used[r].add(idx)
    used[r + 1].add(idx)
  }
  for (let r = 0; r < rows; r++) {
    const free = Array.from({ length: tubes }, (_, i) => i).filter((i) => !used[r].has(i))
    for (let k = 0; k + 1 < free.length; k += 2) if (free[k + 1] - free[k] === 1) bends.push({ a: pos(r, free[k]), b: pos(r, free[k + 1]), flat: true })
  }
  const rowTone = ['#2e7bc8', '#6a3fbf', '#15a06e', '#e0a01b', '#c2417a', '#1f64a8', '#d23f2e', '#1a9c8e']
  const tubeCol = 0

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('h-full w-full', mobile ? 'max-h-[380px]' : '')} role="img" aria-label={`散熱器穿管面示意：${rows} 排 × ${tubes} 支`}>
      {/* 風的方向：一排一排穿過去 */}
      {/* 箭頭可以變淡，字不行：淡色底上 45% 透明的字對比只有 2.3:1（10/10 QA） */}
      <line x1={padX - 30} x2={W - padX + 30} y1={22} y2={22} stroke="#2e7bc8" strokeWidth={2} markerEnd="url(#coil-arrow)" opacity={mode === 'rows' ? 1 : 0.45} />
      <text x={W / 2} y={14} textAnchor="middle" fill="#164d84" fontSize={13} fontWeight={600}>
        風吹過去的方向
      </text>
      <defs>
        <marker id="coil-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 10 5 0 10z" fill="#2e7bc8" />
        </marker>
      </defs>
      {/* 數排：每一排一個色帶＋編號 */}
      {mode === 'rows' &&
        Array.from({ length: rows }, (_, r) => {
          const top = pos(r, 0)
          const bot = pos(r, tubes - 1)
          return (
            <g key={r}>
              <rect x={top.x - 13} y={top.y - 15} width={26} height={bot.y - top.y + 30} rx={13} fill={rowTone[r % rowTone.length]} opacity={0.16} />
              <text x={top.x} y={H - 8} textAnchor="middle" fill="#3e5677" fontSize={16} fontWeight={800}>
                {r + 1}
              </text>
            </g>
          )
        })}
      {/* 數支：沿著第 1 排的直線數洞 */}
      {mode === 'tubes' && (
        <rect x={pos(tubeCol, 0).x - 14} y={pos(tubeCol, 0).y - 15} width={28} height={(tubes - 1) * P + 30} rx={14} fill="#2e7bc8" opacity={0.16} />
      )}
      {/* 彎頭 */}
      {bends.map((b, i) => {
        const hi = mode === 'flat' ? (b.flat ? '#15a06e' : '#e0a01b') : mode === 'rows' && !b.flat ? '#e0a01b' : '#c2733d'
        return <line key={i} x1={b.a.x} y1={b.a.y} x2={b.b.x} y2={b.b.y} stroke={hi} strokeWidth={9} strokeLinecap="round" opacity={mode === 'tubes' ? 0.55 : 0.95} />
      })}
      {/* 孔（銅管口） */}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: tubes }, (_, t) => {
          const p = pos(r, t)
          const on = mode === 'tubes' && r === tubeCol
          return (
            <g key={`${r}-${t}`}>
              <circle cx={p.x} cy={p.y} r={7.5} fill="#ffffff" stroke={on ? '#2e7bc8' : '#b8642a'} strokeWidth={on ? 3 : 2} />
              {on && (
                <text x={p.x - 16} y={p.y} textAnchor="end" dominantBaseline="middle" fill="#164d84" fontSize={13} fontWeight={700}>
                  {t + 1}
                </text>
              )}
            </g>
          )
        }),
      )}
    </svg>
  )
}

/** 看懂散熱器／冷排規格「排×支×鏡面」：左邊穿管面示意（數排、數支、找平的彎頭），右邊輸入規格直接解讀 */
export function CoilReader({ mobile = false }: { mobile?: boolean }) {
  const [mode, setMode] = useStickyState<Mode>('coil:mode', 'flat')
  const [input, setInput] = useStickyState('coil:input', '4×11×330')
  const spec = useMemo(() => parse(input), [input])
  const rows = spec ? Math.min(spec.rows, 6) : 4
  const tubes = spec ? Math.min(spec.tubes, 16) : 11
  const h = spec ? HEIGHT[spec.tubes] : undefined

  const t = mobile
    ? { body: 'text-[15px]', small: 'text-[13px]', value: 'text-[26px]', input: 'text-[22px]', chip: 'px-3 py-1 text-[14px]', card: 'p-3' }
    : { body: 'text-[20px]', small: 'text-[17px]', value: 'text-[40px]', input: 'text-[34px]', chip: 'px-4 py-1.5 text-[18px]', card: 'px-5 py-4' }

  const caption: Record<Mode, string> = {
    rows: `排＝一層一層，順著風吹的方向數：${rows} 排。跨到下一排的彎頭是斜的（排與排錯開半格）。`,
    tubes: `支＝沿著同一排（一條直線）數有幾個洞：${tubes} 支。`,
    flat: '平的（直的）彎頭一定在同一排裡：順著平的方向數就是「支」；斜的彎頭是跨到下一排。只要找到一個平的彎頭就分得出來。',
  }

  const diagram = (
    <div className={cn('flex min-h-0 flex-col rounded-[18px] border border-line bg-card', mobile ? 'gap-2 p-3' : 'h-full gap-3 p-5')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={cn('font-bold text-white', t.body)}>穿管面（全部都是彎頭的那一面）</p>
        <Segmented size={mobile ? 'sm' : 'md'} value={mode} onChange={setMode} options={MODES} />
      </div>
      <div className={cn('relative min-h-0', mobile ? 'h-[380px]' : 'flex-1')}>
        <TubeSheet rows={rows} tubes={tubes} mode={mode} mobile={mobile} />
      </div>
      <p className={cn('text-slate-200', t.small)} aria-live="polite">
        {caption[mode]}
      </p>
    </div>
  )

  const reader = (
    <div className={cn('flex min-h-0 flex-col', mobile ? 'gap-2.5' : 'h-full gap-3')}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        placeholder="輸入規格，例：4×11×330"
        aria-label="輸入散熱器規格：排×支×鏡面"
        className={cn('w-full rounded-2xl bg-card px-5 font-mono font-black text-ink outline-none ring-2 ring-sky-500/45 placeholder:font-sans placeholder:font-semibold placeholder:text-slate-500 focus:ring-sky-500', t.input, mobile ? 'py-2' : 'py-3')}
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('font-semibold text-slate-400', t.small)}>試試</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setInput(ex)}
            aria-pressed={input === ex}
            className={cn('rounded-full font-semibold tabular-nums transition', t.chip, input === ex ? 'border border-sky-500 bg-sky-950 text-sky-200' : 'border border-line bg-card text-slate-200 hover:border-sky-500/50', focusRing)}
          >
            {ex}
          </button>
        ))}
      </div>
      {spec ? (
        <dl className={cn('grid', mobile ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-3')}>
          <div className={cn('rounded-2xl bg-violet-500/[0.1]', t.card)}>
            <dt className={cn('font-semibold text-violet-200', t.small)}>排（深度）</dt>
            <dd className={cn('font-black tabular-nums text-white', t.value)}>{spec.rows} 排</dd>
            <p className={cn('text-slate-300', t.small)}>風要穿過 {spec.rows} 層銅管；排越多越厚</p>
          </div>
          <div className={cn('rounded-2xl bg-sky-500/[0.1]', t.card)}>
            <dt className={cn('font-semibold text-sky-200', t.small)}>支（高度）</dt>
            <dd className={cn('font-black tabular-nums text-white', t.value)}>{spec.tubes} 支</dd>
            <p className={cn('text-slate-300', t.small)}>
              {h ? `高約 ${h.cm} 公分、配 ${h.fan}風車` : `高約 ${Math.round(spec.tubes * 2.6)} 公分（估算，以型錄為準）`}
            </p>
          </div>
          <div className={cn('rounded-2xl bg-emerald-500/[0.1]', t.card)}>
            <dt className={cn('font-semibold text-emerald-200', t.small)}>鏡面＝實內（長度）</dt>
            <dd className={cn('font-black tabular-nums text-white', t.value)}>{spec.len !== null ? `${spec.len} mm` : '—'}</dd>
            <p className={cn('text-slate-300', t.small)}>
              {spec.len !== null ? `有鰭片的長度${spec.asCm ? '（當成公分換算）' : ''}；連兩側彎頭量約 ${Math.round(spec.len / 10 + 6)} 公分` : '第三個數字是有鰭片的長度（mm）'}
            </p>
          </div>
        </dl>
      ) : (
        <p className={cn('rounded-2xl border border-amber-500/50 bg-amber-950 text-amber-200', t.body, t.card)}>看不懂這個寫法；規格是「排×支×鏡面」，例如 4×11×330。</p>
      )}
      <div className={cn('rounded-[18px] border border-line bg-card', mobile ? 'p-3' : 'px-5 py-4')}>
        <p className={cn('font-bold text-white', t.body)}>支數 → 高度、風車（看高度就知道幾支）</p>
        <div className={cn('mt-2 grid grid-cols-4', mobile ? 'gap-1.5' : 'gap-3')}>
          {Object.entries(HEIGHT).map(([n, v]) => {
            const on = spec?.tubes === Number(n)
            return (
              <button
                key={n}
                type="button"
                onClick={() => setInput(`${spec?.rows ?? 4}×${n}${spec?.len ? `×${spec.len}` : ''}`)}
                aria-pressed={on}
                className={cn('rounded-2xl text-left transition', mobile ? 'p-2' : 'px-4 py-3', on ? 'bg-sky-950 ring-2 ring-sky-500/70' : 'border border-line bg-paper hover:border-sky-500/50', focusRing)}
              >
                <span className={cn('block font-black tabular-nums text-white', mobile ? 'text-[18px]' : 'text-[26px]')}>{n} 支</span>
                <span className={cn('block text-slate-300', t.small)}>
                  高約 {v.cm} 公分
                  <br />
                  {v.fan}風車
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <div className={cn('rounded-[18px] border border-line bg-card text-slate-200', t.body, mobile ? 'p-3' : 'mt-auto px-5 py-4')}>
        <p className="font-bold text-white">老闆的看法</p>
        <ul className={cn('mt-1.5 list-disc space-y-1 pl-6', t.small)}>
          <li>「鏡面」很多人聽不懂；老闆叫「實內」＝有鰭片、風吹得到的有效長度。只有銅管、沒有鰭片的地方幫助很小。</li>
          <li>同樣 4 排 11 支，長度不同、馬力就不同（例如 1 馬是 4×11×330）。</li>
          <li>支數決定高度：11 支約 29 公分，14 支約 36.5 公分。放冰箱頂上（機上型）一定用 11 支。</li>
        </ul>
      </div>
    </div>
  )

  if (mobile)
    return (
      <div className="space-y-3">
        {diagram}
        {reader}
      </div>
    )
  return <div className="grid h-full min-h-0 grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-6">{diagram}{reader}</div>
}
