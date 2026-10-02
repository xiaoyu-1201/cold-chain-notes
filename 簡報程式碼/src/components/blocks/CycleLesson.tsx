import { ArrowUpRight, Box, ChevronLeft, Layers } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import { useStickyState } from '../../hooks/useStickyState'
import { useDeck } from '../../context/deck'
import { cycleNotes, type CycleNodeId } from '../../data/cycleNotes'
import { CLASS_AUDIO, CLASS_AUDIO_2 } from '../../data/media'
import { cn, pad } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'
import { CycleDiagram } from '../diagrams/CycleDiagram'
import { ClipButton } from '../diagrams/CycleExplorer'
import { part3DFor } from '../three/ids'
import { PartViewer } from '../three/PartViewer'

const CycleSystem3D = lazy(() => import('../three/CycleSystem3D'))

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

const GROUPS: { label: string; ids: CycleNodeId[] }[] = [
  { label: '四大金剛', ids: ['comp', 'cond', 'txv', 'evap'] },
  { label: '管路上的小零件', ids: ['oub', 'kp15', 'receiver', 'gbc', 'dml', 'sgi', 'evr', 'tc', 'acc'] },
]

/** 冷媒一圈的四個狀態（顏色跟圖上的管路一樣） */
const STATES: { id: CycleNodeId; color: string; state: string; where: string }[] = [
  { id: 'discharge', color: '#f87171', state: '高溫高壓氣態', where: '高壓氣管：壓縮機 → 冷凝器' },
  { id: 'liquid', color: '#fbbf24', state: '中溫中壓液態', where: '液管：冷凝器 → 膨脹閥' },
  { id: 'mixture', color: '#5eead4', state: '液氣混合', where: '液氣混合段：膨脹閥 → 蒸發器' },
  { id: 'suction', color: '#38bdf8', state: '低溫低壓氣態', where: '吸氣管：蒸發器 → 壓縮機' },
]

/** Apple 風格分段切換 */
export function Segmented<T extends string>({ value, options, onChange, size = 'lg' }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; size?: 'lg' | 'sm' }) {
  return (
    <div role="tablist" className="inline-flex rounded-full bg-white/[0.08] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-full font-semibold transition',
            size === 'lg' ? 'px-6 py-2 text-[20px]' : 'px-4 py-1.5 text-[15px]',
            value === o.value ? 'bg-slate-100 text-navy-950 shadow' : 'text-slate-300 hover:text-white',
            focusRing,
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** 右側檢視面板：沒選→分組清單；選了→說明（取代蓋在圖上的小視窗） */
function Inspector({ selected, onSelect }: { selected: CycleNodeId | null; onSelect: (id: CycleNodeId | null) => void }) {
  const { goToId, numberOf } = useDeck()
  const [viewer, setViewer] = useState(false)

  if (!selected) {
    return (
      <div className="flex h-full flex-col gap-6 rounded-[28px] bg-white/[0.04] px-8 py-7">
        <div>
          <p className="text-[28px] font-bold text-white">冷媒一圈的四個狀態</p>
          <p className="mt-1 text-[19px] text-slate-400">顏色跟圖上的管路一樣；點一下看說明、聽錄音。</p>
          <ol className="mt-4 grid grid-cols-2 gap-3">
            {STATES.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onSelect(s.id)}
                  className={cn('flex h-full w-full items-start gap-3 rounded-2xl bg-white/[0.05] px-4 py-3 text-left transition hover:bg-white/[0.09]', focusRing)}
                >
                  <span className="mt-1.5 h-9 w-2 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-[21px] font-bold" style={{ color: s.color }}>
                      {i + 1}. {s.state}
                    </span>
                    <span className="block text-[17px] text-slate-300">{s.where}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        {GROUPS.map((g) => (
          <div key={g.label}>
            <p className="mb-2.5 text-[17px] font-semibold text-slate-500">{g.label}</p>
            <div className="flex flex-wrap gap-2">
              {g.ids.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelect(id)}
                  className={cn('rounded-full bg-white/[0.07] px-4 py-2 text-[19px] font-semibold text-sky-300 transition hover:bg-sky-400/15', focusRing)}
                >
                  {cycleNotes[id].title}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const note = cycleNotes[selected]
  const model = part3DFor(selected)
  return (
    <div className="flex h-full flex-col rounded-[28px] bg-white/[0.04] px-8 py-7">
      <button type="button" onClick={() => onSelect(null)} className={cn('flex items-center gap-1 self-start text-[18px] font-semibold text-sky-300 hover:text-sky-200', focusRing)}>
        <ChevronLeft className="size-5" aria-hidden />
        全部零件
      </button>
      <p className="mt-4 text-[38px] font-bold leading-tight text-white">{note.title}</p>
      <p className={cn('mt-1 text-[20px] font-semibold', toneStyles[note.tone].text)}>{note.alias}</p>
      <p className="mt-4 self-start rounded-full bg-white/[0.07] px-4 py-1.5 text-[18px] font-semibold text-slate-100">{note.state}</p>
      <div className="mt-5 min-h-0 flex-1 space-y-4 text-[21px] leading-relaxed text-slate-200">
        {note.quote && <p className="text-slate-100">{note.quote}</p>}
        <p>{note.point}</p>
        {note.analogy && (
          <p className="text-slate-300">
            <span className="mr-2 font-semibold text-amber-300">比喻</span>
            {note.analogy}
          </p>
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {model && (
          <button
            type="button"
            onClick={() => setViewer(true)}
            className={cn('flex items-center gap-1.5 rounded-full bg-sky-400 px-5 py-2 text-[18px] font-semibold text-navy-950 transition hover:bg-sky-300', focusRing)}
          >
            <Box className="size-5" aria-hidden />
            3D 看構造
          </button>
        )}
        {note.audioAt !== undefined && <ClipButton src={CLASS_AUDIO} at={note.audioAt} label="錄音01" large />}
        {note.audio2At !== undefined && <ClipButton src={CLASS_AUDIO_2} at={note.audio2At} label="錄音02" large />}
        {note.slide && (
          <button
            type="button"
            onClick={() => goToId(note.slide!)}
            className={cn('flex items-center gap-1 rounded-full bg-white/[0.07] px-4 py-2 text-[17px] font-semibold text-sky-300 hover:bg-white/[0.12]', focusRing)}
          >
            {note.chapter} <span className="font-mono text-slate-400">P.{pad(numberOf(note.slide))}</span>
            <ArrowUpRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
      {viewer && model && <PartViewer id={model} title={note.title.replace(/^[①-④]\s*/, '')} alias={note.alias} onClose={() => setViewer(false)} />}
    </div>
  )
}

/** 核心圖解：左邊 2D／3D 循環圖，右邊檢視面板 */
export function CycleLesson() {
  const [selected, setSelected] = useStickyState<CycleNodeId | null>('cycle:selected', null)
  const [view, setView] = useStickyState<'2d' | '3d'>('cycle:view', '2d')
  const [cut, setCut] = useState(false)

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-center gap-5">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: '2d', label: '2D 圖解' },
            { value: '3d', label: '3D 立體' },
          ]}
        />
        <p className="text-[19px] text-slate-400">{view === '2d' ? '點圖上的零件或管路，右邊就會出現說明' : '按下方「啟動冷凍系統」看冷媒跑一圈；拖曳旋轉、滾輪縮放，點零件看說明'}</p>
        {view === '3d' && (
          <button
            type="button"
            aria-pressed={cut}
            onClick={() => setCut((c) => !c)}
            className={cn(
              'ml-auto flex items-center gap-2 rounded-full px-5 py-2 text-[18px] font-semibold transition',
              cut ? 'bg-sky-400 text-navy-950' : 'bg-white/[0.08] text-sky-300 hover:bg-white/[0.12]',
              focusRing,
            )}
          >
            <Layers className="size-5" aria-hidden />
            {cut ? '合起來' : '剖開看內部'}
          </button>
        )}
      </div>
      <div className="cq-box flex min-h-0 flex-1 gap-6" style={{ containerType: 'size' }}>
        <div className="relative h-full shrink-0 overflow-hidden rounded-[28px] bg-white/[0.03]" style={{ width: view === '2d' ? 'min(calc(100cqh * 820 / 560), 62cqw)' : '58cqw' }}>
          {view === '2d' ? (
            <div className="absolute inset-4">
              <CycleDiagram className="h-full w-full" interactive selected={selected} onSelect={(id) => setSelected(selected === id ? null : id)} />
            </div>
          ) : (
            <Suspense fallback={<p className="absolute inset-0 flex items-center justify-center text-[20px] text-slate-400">3D 載入中…</p>}>
              <CycleSystem3D selected={selected} onSelect={setSelected} cut={cut} />
            </Suspense>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Inspector selected={selected} onSelect={setSelected} />
        </div>
      </div>
    </div>
  )
}
