import { ArrowUpRight, Box, ChevronLeft, ChevronRight, Layers, TriangleAlert } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { FAULTS, type Fault } from '../../data/faults'
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
import { Deferred } from '../ui/Deferred'
import { Segmented } from '../ui/Segmented'

const CycleSystem3D = lazy(() => import('../three/CycleSystem3D'))
const loading3D = <p className="absolute inset-0 flex items-center justify-center text-[20px] text-slate-400">3D 載入中…</p>

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


interface FaultControl {
  fault: Fault | null
  step: number
  auto: boolean
  start: (id: string) => void
  setStep: (s: number) => void
  setAuto: (a: boolean) => void
  exit: () => void
}

/** 故障模擬的說明：一步一步走，最後給結論 */
function FaultPanel({ f, onSelect }: { f: FaultControl; onSelect: (id: CycleNodeId | null) => void }) {
  const fault = f.fault!
  const last = fault.steps.length - 1
  const navBtn = cn('flex items-center gap-1 rounded-full bg-white/[0.08] px-4 py-2 text-[18px] font-semibold text-slate-100 transition hover:bg-white/[0.14] disabled:opacity-30', focusRing)
  return (
    <div className="flex h-full flex-col rounded-[28px] bg-white/[0.04] px-8 py-7">
      <button type="button" onClick={f.exit} className={cn('flex items-center gap-1 self-start text-[18px] font-semibold text-sky-300 hover:text-sky-200', focusRing)}>
        <ChevronLeft className="size-5" aria-hidden />
        結束模擬
      </button>
      <p className="mt-3 flex items-center gap-2 text-[18px] font-semibold text-red-300">
        <TriangleAlert className="size-5" aria-hidden />
        故障模擬
      </p>
      <p className="text-[34px] font-bold leading-tight text-white">{fault.label}，會怎樣？</p>
      <ol className="mt-4 min-h-0 flex-1 space-y-2.5">
        {fault.steps.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => f.setStep(i)}
              className={cn('flex w-full gap-3 rounded-2xl px-4 py-2.5 text-left transition', i === f.step ? 'bg-red-400/[0.12]' : 'hover:bg-white/[0.05]', i > f.step && 'opacity-45', focusRing)}
            >
              <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-[17px] font-bold', i === f.step ? 'bg-red-400 text-navy-950' : 'bg-white/[0.1] text-slate-200')}>{i + 1}</span>
              <span className="min-w-0">
                <span className="block text-[21px] font-bold text-white">{s.title}</span>
                <span className="block text-[18px] leading-snug text-slate-300">{s.text}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      {f.step === last && (
        <div className="mt-3 rounded-2xl bg-emerald-400/[0.1] px-5 py-3">
          <p className="text-[19px] leading-snug text-emerald-50">
            <b className="mr-2 text-emerald-300">所以</b>
            {fault.lesson}
          </p>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <button type="button" onClick={() => f.setStep(f.step - 1)} disabled={f.step === 0} className={navBtn}>
          <ChevronLeft className="size-5" aria-hidden />
          上一步
        </button>
        <button type="button" onClick={() => f.setStep(f.step + 1)} disabled={f.step === last} className={navBtn}>
          下一步
          <ChevronRight className="size-5" aria-hidden />
        </button>
        <label className="ml-1 flex cursor-pointer items-center gap-2 text-[17px] text-slate-300">
          <input type="checkbox" checked={f.auto} onChange={(e) => f.setAuto(e.target.checked)} className="size-4 accent-sky-400" />
          自動播放
        </label>
        <button
          type="button"
          onClick={() => {
            f.exit()
            onSelect(fault.part)
          }}
          className={cn('ml-auto flex items-center gap-1 rounded-full bg-white/[0.07] px-4 py-2 text-[17px] font-semibold text-sky-300 hover:bg-white/[0.12]', focusRing)}
        >
          看{cycleNotes[fault.part].title.replace(/^[①-④]\s*/, '')}說明
          <ArrowUpRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

/** 右側檢視面板：沒選→分組清單；選了→說明（取代蓋在圖上的小視窗）；故障模擬→一步一步的說明 */
function Inspector({ selected, onSelect, faults }: { selected: CycleNodeId | null; onSelect: (id: CycleNodeId | null) => void; faults: FaultControl }) {
  const { goToId, numberOf } = useDeck()
  const [viewer, setViewer] = useState(false)

  if (faults.fault) return <FaultPanel f={faults} onSelect={onSelect} />

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
        <div>
          <p className="mb-2.5 flex items-center gap-1.5 text-[17px] font-semibold text-red-300">
            <TriangleAlert className="size-4" aria-hidden />
            故障模擬：拿掉一個會怎樣？（3D 演給你看）
          </p>
          <div className="flex flex-wrap gap-2">
            {FAULTS.map((fa) => (
              <button
                key={fa.id}
                type="button"
                onClick={() => faults.start(fa.id)}
                className={cn('rounded-full bg-red-400/[0.12] px-4 py-2 text-[18px] font-semibold text-red-200 transition hover:bg-red-400/20', focusRing)}
              >
                {fa.label}
              </button>
            ))}
          </div>
        </div>
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
      <div className="mt-5 min-h-0 flex-1 space-y-4 overflow-y-auto text-[21px] leading-relaxed text-slate-200">
        {note.quote && <p className="text-slate-100">{note.quote}</p>}
        <p>{note.point}</p>
        {note.field && (
          <p className="text-slate-200">
            <span className="mr-2 font-semibold text-emerald-300">現場</span>
            {note.field}
          </p>
        )}
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
  const [faultId, setFaultId] = useState<string | null>(null)
  const [faultStep, setFaultStep] = useState(0)
  const [auto, setAuto] = useState(true)
  const fault = FAULTS.find((x) => x.id === faultId) ?? null
  const faults: FaultControl = {
    fault,
    step: faultStep,
    auto,
    start: (id) => {
      setFaultId(id)
      setFaultStep(0)
      setSelected(null)
      setView('3d')
    },
    setStep: (s) => {
      setAuto(false)
      setFaultStep(Math.min(Math.max(s, 0), (fault?.steps.length ?? 1) - 1))
    },
    setAuto,
    exit: () => setFaultId(null),
  }
  // 自動播放：每一步停 4.5 秒，播到最後一步停下
  useEffect(() => {
    if (!fault || !auto || faultStep >= fault.steps.length - 1) return
    const id = setTimeout(() => setFaultStep((s) => s + 1), 4500)
    return () => clearTimeout(id)
  }, [fault, auto, faultStep])

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-center gap-5">
        <Segmented
          value={view}
          onChange={(v) => {
            setView(v)
            if (v === '2d') setFaultId(null)
          }}
          options={[
            { value: '2d', label: '2D 圖解' },
            { value: '3d', label: '3D 立體' },
          ]}
        />
        <p className="text-[19px] text-slate-400">{view === '2d' ? '點圖上的零件或管路，右邊就會出現說明' : '按下方「啟動冷凍系統」看冷媒跑一圈；點零件看說明，雙擊零件放大'}</p>
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
            <Deferred fallback={loading3D}>
              <Suspense fallback={loading3D}>
                <CycleSystem3D selected={selected} onSelect={setSelected} cut={cut} fault={fault?.steps[faultStep].fx ?? null} faultLabel={fault?.label} onExitFault={() => setFaultId(null)} />
              </Suspense>
            </Deferred>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Inspector selected={selected} onSelect={setSelected} faults={faults} />
        </div>
      </div>
    </div>
  )
}
