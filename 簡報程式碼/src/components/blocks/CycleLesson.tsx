import { ArrowUpRight, Box, ChevronLeft, Layers } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
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
  { label: '四段管路', ids: ['discharge', 'liquid', 'mixture', 'suction'] },
  { label: '管路上的小零件', ids: ['oub', 'kp15', 'receiver', 'gbc', 'dml', 'sgi', 'evr', 'tc', 'acc'] },
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
      <div className="flex h-full flex-col justify-center gap-7 rounded-[28px] bg-white/[0.04] px-8 py-7">
        <div>
          <p className="text-[30px] font-bold text-white">點圖上的零件</p>
          <p className="mt-1 text-[20px] text-slate-400">或從下面選一個：看說明、聽錄音、看 3D 構造。</p>
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
  const [selected, setSelected] = useState<CycleNodeId | null>(null)
  const [view, setView] = useState<'2d' | '3d'>('2d')
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
        <p className="text-[19px] text-slate-400">{view === '2d' ? '點圖上的零件或管路，右邊就會出現說明' : '拖曳旋轉、滾輪縮放；點零件或名稱看說明，管內光點是冷媒流向'}</p>
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
        <div className="relative h-full shrink-0 overflow-hidden rounded-[28px] bg-white/[0.03]" style={{ width: 'min(calc(100cqh * 820 / 560), 62cqw)' }}>
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
