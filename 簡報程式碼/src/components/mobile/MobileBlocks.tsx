import { ArrowRight, ArrowUpRight, Box, Check, CheckCircle2, ExternalLink, Headphones, Pause, Quote, TriangleAlert } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { useDeck } from '../../context/deck'
import { cycleNotes, CYCLE_ORDER, type CycleNodeId } from '../../data/cycleNotes'
import { CLASS_AUDIO, CLASS_AUDIO_2, usePlayable } from '../../data/media'
import type { AudioBlock, Block, HotspotsBlock, MatrixBlock, RecordingsIndexBlock, Tone } from '../../data/types'
import { slides } from '../../data/slides'
import { isNew } from '../../data/whatsNew'
import { recordingOf } from '../../data/recordings'

/** 這一批新增的頁：學習地圖的連結後面加綠色「新」；查閱頁加（查閱） */
const newIds = new Set(slides.filter((s) => isNew(s.added)).map((s) => s.id))
const refIds = new Set(slides.filter((s) => s.tier === 'ref').map((s) => s.id))
import { cn, pad } from '../../lib/cn'
import { glyphFor } from '../../lib/partGlyph'
import { PartGlyph } from '../ui/PartGlyph'
import { toneStyles } from '../../lib/tone'
import { Segmented } from '../ui/Segmented'
import { DataTable } from '../blocks/DataTable'
import { OfflineOnlyAudio } from '../blocks/Media'
import { PhotoCard } from '../blocks/PhotoCard'
import { EstimatePractice } from '../blocks/Estimate'
import { CoilReader } from '../blocks/CoilReader'
import { InView } from '../ui/InView'
import { FenConverter } from '../blocks/FenConverter'
import { VernierCaliper } from '../blocks/VernierCaliper'
import { ProductShowcase } from '../three/ProductShowcase'
import { Abbr } from '../blocks/Abbr'
import { Flashcards } from '../blocks/Flashcards'
import { RefSlider } from '../blocks/RefSlider'
import { BulbClock } from '../diagrams/BulbClock'
import { CycleDiagram } from '../diagrams/CycleDiagram'
import { part3DFor } from '../three/ids'
import { PartViewer } from '../three/PartViewer'

/* 手機閱讀版：不縮放、實際字級（內文 17px），單欄、最多一層卡片 */

const CycleSystem3D = lazy(() => import('../three/CycleSystem3D'))

const formatTime = (sec: number) => `${pad(Math.floor(sec / 60))}:${pad(Math.floor(sec % 60))}`

function Card({ nested, tone, className, children }: { nested?: boolean; tone?: Tone; className?: string; children: ReactNode }) {
  if (nested) return <div className={cn('py-1', className)}>{children}</div>
  return (
    <div className={cn('rounded-2xl border bg-card p-4', tone ? toneStyles[tone].border : 'border-line', className)}>{children}</div>
  )
}

function Title({ icon: Icon, tone = 'ice', children, small }: { icon?: React.ElementType; tone?: Tone; children: ReactNode; small?: boolean }) {
  // 標題講的是零件 → 零件線稿（跟電腦版同一套）
  const glyph = glyphFor(children)
  return (
    <h3 className={cn('flex items-center gap-2 font-bold leading-snug text-white', small ? 'text-[17px]' : 'text-[19px]')}>
      {glyph ? <PartGlyph id={glyph} size={28} className="-my-1 shrink-0 text-ink-2" /> : Icon && <Icon className={cn('size-5 shrink-0', toneStyles[tone].text)} aria-hidden />}
      <span>{children}</span>
    </h3>
  )
}

function Bullets({ items, tone = 'ice' }: { items: ReactNode[]; tone?: Tone }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className={cn('mt-[11px] size-1.5 shrink-0 rounded-full', toneStyles[tone].dot)} aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Chip({ tone = 'slate', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-[14px] font-semibold', toneStyles[tone].chip)}>{children}</span>
}

/** 跳到其他頁的連結 */
export function PageLink({ slide, children }: { slide: string; children: ReactNode }) {
  const { goToId, numberOf } = useDeck()
  return (
    <button
      type="button"
      onClick={() => goToId(slide)}
      className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-left text-[15px] font-semibold text-slate-100 active:bg-sky-950"
    >
      {children}
      <span className="font-mono text-[13px] text-slate-400">P.{pad(numberOf(slide))}</span>
      <ArrowUpRight className="size-3.5" aria-hidden />
    </button>
  )
}

/** 播放錄音片段 */
function Clip({ src, at, label }: { src: string; at: number; label: string }) {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const url = usePlayable(src)
  useEffect(() => {
    const audio = ref.current
    return () => audio?.pause()
  }, [])
  const toggle = () => {
    const audio = ref.current
    if (!audio) return
    if (playing) return audio.pause()
    audio.currentTime = at
    audio.play().catch(() => {})
  }
  return (
    <>
      <audio ref={ref} src={url} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <button
        type="button"
        onClick={toggle}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-emerald-500/45 bg-emerald-950 px-3 py-1.5 text-[15px] font-semibold text-emerald-100 active:border-emerald-500"
      >
        {playing ? <Pause className="size-4" aria-hidden /> : <Headphones className="size-4" aria-hidden />}
        {playing ? '暫停' : label} <span className="font-mono">{formatTime(at)}</span>
      </button>
    </>
  )
}

export function MobileBlock({ block, nested }: { block: Block; nested?: boolean }) {
  switch (block.type) {
    case 'grid':
      return (
        <div className={cn('space-y-4', nested && 'space-y-3')}>
          {block.children.map((child, i) => (
            <MobileBlock key={i} block={child} nested={nested} />
          ))}
        </div>
      )

    case 'section':
      return (
        <Card nested={nested} tone={block.tone}>
          <Title icon={block.icon} tone={block.tone}>
            {block.title}
          </Title>
          <div className="mt-3 space-y-4 divide-y divide-line [&>*:not(:first-child)]:pt-4">
            {block.children.map((child, i) => (
              <MobileBlock key={i} block={child} nested />
            ))}
          </div>
        </Card>
      )

    case 'concept':
      return (
        <Card nested={nested} tone={block.tone}>
          <div className="flex flex-wrap items-center gap-2">
            <Title icon={block.icon} tone={block.tone} small={nested}>
              {block.title}
            </Title>
            {block.badge && <Chip tone={block.badge.tone}>{block.badge.label}</Chip>}
          </div>
          {block.formula && (
            <p className={cn('mt-2 rounded-lg bg-white/[0.05] px-3 py-2 font-bold', toneStyles[block.tone].strong)}>
              {block.formula.lhs} ＝ {block.formula.rhs}
            </p>
          )}
          {block.body && <p className="mt-2">{block.body}</p>}
          {block.points && <Bullets items={block.points} tone={block.tone} />}
          {block.pairs && (
            <dl className="mt-2 space-y-2">
              {block.pairs.map((p) => (
                <div key={p.label}>
                  <dt className={cn('font-bold', toneStyles[p.tone].text)}>{p.label}</dt>
                  <dd className="text-slate-300">{p.desc}</dd>
                </div>
              ))}
            </dl>
          )}
          {block.chain && <Chain items={block.chain} />}
          {block.guard && (
            <p className="mt-2 flex gap-2 text-[15px] text-amber-200">
              <TriangleAlert className="mt-1 size-4 shrink-0" aria-hidden />
              {block.guard}
            </p>
          )}
        </Card>
      )

    case 'flow':
      return (
        <Card nested={nested || block.bare} tone={block.tone}>
          {block.title && (
            <div className="mb-2">
              <Title icon={block.icon} tone={block.tone} small={nested}>
                {block.title}
              </Title>
            </div>
          )}
          <ol className="space-y-2.5">
            {block.steps.map((step, i) => {
              const t = toneStyles[step.tone ?? block.tone]
              return (
                <li key={i} className="flex gap-3">
                  <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-[14px] font-bold', t.chip)}>
                    {i + 1}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="font-bold text-white">
                      {step.title}
                      {step.tag && <span className="ml-2 align-middle"><Chip tone={step.tone ?? block.tone}>{step.tag}</Chip></span>}
                    </p>
                    {step.desc && <p className="text-[15px] text-slate-300">{step.desc}</p>}
                  </div>
                </li>
              )
            })}
          </ol>
          {block.result && (
            <p className="mt-3 rounded-lg bg-white/[0.05] px-3 py-2">
              <span className="mr-2 font-bold text-emerald-300">{block.result.label}</span>
              {block.result.text}
            </p>
          )}
        </Card>
      )

    case 'alert':
      return (
        <Card nested={nested} tone="red" className={nested ? undefined : 'bg-red-500/[0.06]'}>
          <Title icon={TriangleAlert} tone="red" small={nested}>
            {block.title}
          </Title>
          <ul className="mt-2 space-y-2.5">
            {block.items.map((item) => (
              <li key={item.title}>
                <p className="font-bold text-red-200">
                  {item.title}
                  {item.value && <span className="ml-2 font-mono text-red-300">{item.value}</span>}
                </p>
                <p className="text-[15px] text-slate-300">{item.desc}</p>
              </li>
            ))}
          </ul>
        </Card>
      )

    case 'trap':
      return (
        <Card nested={nested} tone="amber" className={nested ? undefined : 'bg-amber-500/[0.06]'}>
          <Title icon={block.icon} tone="amber" small={nested}>
            {block.title}
          </Title>
          <p className="mt-2 text-[15px] font-bold text-amber-300">成因</p>
          <Chain items={block.chain} />
          <p className="mt-3 text-[15px] font-bold text-emerald-300">對策</p>
          <ul className="mt-1 space-y-1">
            {block.fixes.map((fix) => (
              <li key={fix} className="flex gap-2">
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-300" aria-hidden />
                {fix}
              </li>
            ))}
          </ul>
        </Card>
      )

    case 'equation':
      return (
        <Card nested={nested} tone={block.tone}>
          {block.title && (
            <Title icon={block.icon} tone={block.tone} small={nested}>
              {block.title}
            </Title>
          )}
          <p className="mt-2 rounded-lg bg-white/[0.05] px-3 py-2 font-bold text-white">
            {block.result.label} ＝ {block.terms.map((t) => t.label).join(' ＋ ')}
          </p>
          {block.note && <p className="mt-2 text-[15px] text-slate-300">{block.note}</p>}
        </Card>
      )

    case 'metrics':
      return (
        <Card nested={nested} tone={block.tone}>
          <Title icon={block.icon} tone={block.tone} small={nested}>
            {block.title}
          </Title>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {block.items.map((m, i) => (
              <div key={i} className="rounded-xl bg-white/[0.04] px-3 py-2.5">
                <p className="text-[14px] text-slate-400">{m.label}</p>
                <p className={cn('text-[22px] font-black leading-tight', toneStyles[m.tone].strong)}>
                  {m.value}
                  {m.unit && <span className="ml-1 text-[14px] font-semibold text-slate-400">{m.unit}</span>}
                </p>
                {m.note && <p className="text-[13px] text-slate-400">{m.note}</p>}
              </div>
            ))}
          </div>
          {block.formula && (
            <p className="mt-2 text-[15px] text-slate-300">
              {block.formula.lhs} ＝ {block.formula.rhs}
            </p>
          )}
          {block.footnote && <p className="mt-2 text-[14px] text-slate-400">{block.footnote}</p>}
        </Card>
      )

    case 'compare':
      return (
        <Card nested={nested} tone={block.tone}>
          <Title icon={block.icon} tone={block.tone} small={nested}>
            {block.title}
          </Title>
          <div className="mt-3 space-y-3">
            {[block.left, block.right].map((side) => (
              <div key={side.badge} className={cn('rounded-xl border p-3', toneStyles[side.tone].border)}>
                <p className="flex items-baseline gap-2">
                  <Chip tone={side.tone}>{side.badge}</Chip>
                  <span className={cn('font-bold', toneStyles[side.tone].strong)}>{side.value}</span>
                </p>
                <dl className="mt-2 space-y-1 text-[15px]">
                  {side.rows.map((r) => (
                    <div key={r.k} className="flex gap-2">
                      <dt className="w-[5.5em] shrink-0 text-slate-400">{r.k}</dt>
                      <dd>{r.v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-[15px] text-slate-300">{side.use}</p>
              </div>
            ))}
          </div>
        </Card>
      )

    case 'timeline':
      return (
        <Card nested={nested} tone={block.tone}>
          <Title icon={block.icon} tone={block.tone} small={nested}>
            {block.title}
          </Title>
          <ol className="mt-2 space-y-2 border-l border-line pl-4">
            {block.items.map((item) => (
              <li key={item.gen}>
                <p className={cn('font-bold', toneStyles[item.tone].text)}>
                  {item.gen} <span className="ml-1 text-white">{item.example}</span>
                </p>
                <p className="text-[15px] text-slate-300">{item.note}</p>
              </li>
            ))}
          </ol>
        </Card>
      )

    case 'info':
      return (
        <Card nested={nested} tone={block.tone}>
          <div className="flex flex-wrap items-center gap-2">
            <Title icon={block.icon} tone={block.tone} small={nested}>
              {block.title}
            </Title>
            {block.tag && <Chip tone={block.tone}>{block.tag}</Chip>}
          </div>
          <div className="mt-1.5">{block.body}</div>
          {block.warn && (
            <p className="mt-2 flex gap-2 text-[15px] text-amber-200">
              <TriangleAlert className="mt-1 size-4 shrink-0" aria-hidden />
              <span>{block.warn}</span>
            </p>
          )}
          {block.meta && <p className="mt-1.5 text-[14px] text-slate-400">{block.meta}</p>}
        </Card>
      )

    case 'stat':
      return (
        <Card nested={nested} tone={block.tone}>
          <Title icon={block.icon} tone={block.tone} small={nested}>
            {block.title}
          </Title>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[15px]">
            <span className="text-slate-400">{block.from.label}</span>
            <b className="text-[20px] text-slate-200">{block.from.value}</b>
            <ArrowRight className="size-4 text-slate-500" aria-hidden />
            <span className="text-slate-400">{block.to.label}</span>
            <b className={cn('text-[20px]', toneStyles[block.tone].strong)}>{block.to.value}</b>
          </p>
          <p className="mt-1.5 text-slate-300">{block.desc}</p>
        </Card>
      )

    case 'list':
      return (
        <Card nested={nested} tone={block.tone}>
          <Title icon={block.icon} tone={block.tone} small={nested}>
            {block.title}
          </Title>
          <ul className="mt-2 space-y-2.5">
            {block.items.map((item) => (
              <li key={item.title}>
                <p className="flex flex-wrap items-center gap-2 font-bold text-white">
                  <item.icon className={cn('size-4', toneStyles[block.tone].text)} aria-hidden />
                  {item.title}
                  {item.badge && <Chip tone={item.badge.tone}>{item.badge.label}</Chip>}
                </p>
                <p className="text-[15px] text-slate-300">{item.desc}</p>
              </li>
            ))}
          </ul>
        </Card>
      )

    case 'tiles':
      return (
        <Card nested={nested} tone={block.tone}>
          <Title icon={block.icon} tone={block.tone} small={nested}>
            {block.title}
          </Title>
          <ul className="mt-2 space-y-2.5">
            {block.items.map((item) => (
              <li key={item.title}>
                <p className="flex items-center gap-2 font-bold text-white">
                  <item.icon className={cn('size-4', toneStyles[block.tone].text)} aria-hidden />
                  {item.title}
                </p>
                <p className="text-[15px] text-slate-300">{item.desc}</p>
              </li>
            ))}
          </ul>
        </Card>
      )

    case 'matrix':
      return <MatrixList block={block} />

    case 'checklist':
      return <Checklist id={block.id} title={block.title} items={block.items} nested={nested} />

    case 'parts':
      return (
        <div className="space-y-3">
          {block.items.map((item) => (
            <Card key={item.no} nested={nested}>
              <Title icon={item.icon}>
                {item.no} {item.summary}
              </Title>
              <p className="text-[14px] text-slate-400">{item.range}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.chapters.map((c) => (
                  <PageLink key={c.slide + c.code} slide={c.slide}>
                    {c.code} {c.title}
                    {refIds.has(c.slide) ? '（查閱）' : ''}
                    {newIds.has(c.slide) && <span className="ml-1 rounded bg-emerald-400 px-1.5 text-[13px] font-black leading-5 text-paper">新</span>}
                  </PageLink>
                ))}
              </div>
            </Card>
          ))}
          <Card nested={nested} tone="emerald">
            <p className="font-bold text-emerald-200">{block.finale.label}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {block.finale.links.map((l) => (
                <PageLink key={l.slide} slide={l.slide}>
                  {l.title}
                </PageLink>
              ))}
            </div>
            {block.finale.note && <p className="mt-2 text-[15px] text-slate-300">{block.finale.note}</p>}
          </Card>
        </div>
      )

    case 'insight':
      return (
        <Card nested={nested} tone={block.tone}>
          <p className={cn('font-mono text-[14px] font-bold', toneStyles[block.tone].text)}>{block.no}</p>
          <Title icon={block.icon} tone={block.tone}>
            {block.title}
          </Title>
          {block.subtitle && <p className="text-[15px] text-slate-400">{block.subtitle}</p>}
          {block.body && <div className="mt-2">{block.body}</div>}
          {block.children && (
            <div className="mt-3 space-y-3">
              {block.children.map((child, i) => (
                <MobileBlock key={i} block={child} nested />
              ))}
            </div>
          )}
        </Card>
      )

    case 'boundaries':
      return (
        <div className="grid grid-cols-2 gap-2.5">
          {block.items.map((item) => (
            <div key={item.label} className={cn('rounded-xl border px-3 py-2.5', toneStyles[item.tone].border)}>
              <p className="text-[14px] text-slate-400">{item.label}</p>
              <p className={cn('text-[20px] font-black', toneStyles[item.tone].strong)}>{item.value}</p>
              <p className="text-[13px] text-slate-400">{item.note}</p>
            </div>
          ))}
        </div>
      )

    case 'qa':
      return (
        <Card nested={nested} tone={block.tone}>
          <Title icon={block.icon} tone={block.tone} small={nested}>
            {block.title}
          </Title>
          <Bullets items={block.prompts} tone={block.tone} />
          <div className="mt-3 flex flex-wrap gap-2">
            {block.links.map((l) => (
              <PageLink key={l.slide} slide={l.slide}>
                {l.label}
              </PageLink>
            ))}
          </div>
        </Card>
      )

    case 'sizing':
      return (
        <Card nested={nested}>
          <div className="flex flex-wrap items-center gap-2">
            <Title icon={block.icon} small={nested}>
              {block.title}
            </Title>
            {block.badge && <Chip tone="ice">{block.badge}</Chip>}
          </div>
          <Bullets items={block.points} />
          <p className="mt-2 rounded-lg bg-white/[0.05] px-3 py-2 font-bold text-sky-100">{block.formula}</p>
          {block.example && (
            <div className="mt-2">
              <p className="text-[15px] text-slate-300">{block.example.caption}</p>
              <ul className="mt-1 space-y-1 text-[15px]">
                {block.example.rows.map((r) => (
                  <li key={r.label}>
                    <span className="text-slate-400">{r.label}</span>{' '}
                    <b className={toneStyles[r.tone].strong}>{r.value}</b> <span className="text-slate-400">{r.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )

    case 'txv':
      return (
        <Card nested={nested} tone={block.tone}>
          <Title icon={block.icon} tone={block.tone} small={nested}>
            {block.title}
          </Title>
          <figure className="mx-auto mt-2 w-[200px]">
            <BulbClock className="w-full" />
            <figcaption className="text-center text-[13px] text-slate-400">吸氣管截面・感溫包方位</figcaption>
          </figure>
          <ul className="mt-2 space-y-2.5">
            {block.rules.map((r, i) => (
              <li key={i}>
                <p className={cn('flex items-center gap-2 font-bold', toneStyles[r.tone].text)}>
                  <r.icon className="size-4" aria-hidden />
                  {r.title}
                </p>
                <p className="text-[15px] text-slate-300">{r.desc}</p>
              </li>
            ))}
          </ul>
        </Card>
      )

    case 'cycle':
      return (
        <Card nested={nested} tone={block.tone}>
          <Title icon={block.icon} tone={block.tone} small={nested}>
            {block.title}
          </Title>
          <div className="relative mt-2" style={{ aspectRatio: '820 / 560' }}>
            <CycleDiagram className="absolute inset-0 h-full w-full" />
          </div>
          <div className="mt-2">
            <PageLink slide="cycle-lesson">可點零件的互動版</PageLink>
          </div>
        </Card>
      )

    case 'cycleLesson':
      return <CycleLessonMobile />

    case 'quote':
      return (
        <blockquote className="flex gap-2.5 rounded-2xl bg-white/[0.04] p-4">
          <Quote className="mt-1 size-5 shrink-0 text-emerald-300" aria-hidden />
          <div>
            <p className="font-semibold text-white">{block.text}</p>
            <p className="mt-1 text-[14px] text-slate-400">— {block.author}</p>
          </div>
        </blockquote>
      )

    case 'products':
      return (
        <div className="space-y-3">
          {block.items.map((item) => (
            <Card key={item.title} nested={nested} tone={item.tone}>
              <Title icon={item.icon} tone={item.tone}>
                {item.title}
              </Title>
              <p className="mt-1">{item.items}</p>
              <p className="mt-1 text-[15px] text-slate-400">{item.side}</p>
              <div className="mt-2">
                <PageLink slide={item.slide}>{item.chapter}</PageLink>
              </div>
            </Card>
          ))}
        </div>
      )

    case 'scenario':
      return (
        <Card nested={nested} tone={block.tone}>
          <Chip tone={block.tone}>{block.label}</Chip>
          <p className="mt-2 font-bold text-white">{block.customer}</p>
          <p className="mt-1 text-slate-300">{block.ask}</p>
          <p className="mt-2 text-[15px] font-bold text-emerald-300">建議品項</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {block.recommend.map((r) => (
              <Chip key={r}>{r}</Chip>
            ))}
          </div>
          {block.slide && (
            <div className="mt-2">
              <PageLink slide={block.slide}>{block.chapter ?? '相關章節'}</PageLink>
            </div>
          )}
        </Card>
      )

    case 'hotspots':
      return <HotspotsMobile block={block} />

    case 'audio':
      return <AudioMobile block={block} />

    case 'recap':
      return (
        <div className="space-y-3">
          <ol className="space-y-2">
            {block.items.map((item, i) => (
              <li key={item.title}>
                <Card tone={block.tone}>
                  <div className="flex gap-3">
                    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl text-[20px] font-black', toneStyles[block.tone].soft, toneStyles[block.tone].text)}>{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-[19px] font-bold leading-snug text-white">{item.title}</p>
                      <p className="mt-1 text-[15px] text-slate-300">{item.desc}</p>
                      {item.slide && (
                        <div className="mt-2">
                          <PageLink slide={item.slide}>回去看</PageLink>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
          {block.refs.length > 0 && (
            <Card>
              <Title small>查閱頁：需要時再翻</Title>
              <div className="mt-2 flex flex-wrap gap-2">
                {block.refs.map((r) => (
                  <PageLink key={r.slide} slide={r.slide}>
                    {r.label}
                  </PageLink>
                ))}
              </div>
            </Card>
          )}
        </div>
      )

    case 'recordingsIndex':
      return <RecordingsMobile block={block} />
    case 'abbr':
      return <Abbr block={block} mobile />

    case 'fen':
      return <FenConverter mobile />
    case 'caliper':
      return <VernierCaliper mobile />
    case 'coilreader':
      return <CoilReader mobile />
    case 'showcase':
      return <ProductShowcase parts={block.parts} mobile />

    case 'estimate':
      return <EstimatePractice block={block} mobile />

    case 'flashcards':
      return <Flashcards block={block} mobile />

    case 'refslider':
      return <RefSlider mobile />

    case 'table':
      return <DataTable block={block} mobile />
    case 'photo':
      return <PhotoCard block={block} mobile />

    case 'quiz':
      return <QuizMobile items={block.items} />
  }
}

function QuizMobile({ items }: { items: { q: ReactNode; a: ReactNode; slide?: string }[] }) {
  const [open, setOpen] = useState<number[]>([])
  return (
    <ol className="space-y-2.5">
      {items.map((item, i) => {
        const shown = open.includes(i)
        return (
          <li key={i}>
            <button
              type="button"
              aria-expanded={shown}
              onClick={() => setOpen((o) => (shown ? o.filter((x) => x !== i) : [...o, i]))}
              className={cn(
                'w-full rounded-2xl border p-4 text-left',
                shown ? 'border-emerald-500/40 bg-emerald-500/[0.07]' : 'border-dashed border-white/20 bg-white/[0.03]',
              )}
            >
              <span className="flex gap-2.5">
                <span className="font-mono font-black text-sky-300">{pad(i + 1)}</span>
                <span className="font-bold text-white">{item.q}</span>
              </span>
              <span className={cn('mt-1.5 block pl-8', shown ? 'text-emerald-100' : 'text-[15px] text-slate-500')}>
                {shown ? item.a : '先想一想，點一下看答案'}
              </span>
            </button>
            {shown && item.slide && (
              <div className="mt-1.5 pl-8">
                <PageLink slide={item.slide}>回去複習</PageLink>
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function Chain({ items }: { items: ReactNode[] }) {
  return (
    <ol className="mt-1 space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="w-5 shrink-0 text-center text-slate-500">{i === 0 ? '•' : '↓'}</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  )
}

function MatrixList({ block }: { block: MatrixBlock }) {
  const catLabel = Object.fromEntries(block.categories.map((c) => [c.id, c.label]))
  return (
    <div className="space-y-3">
      {block.columns.map((col) => (
        <Card key={col.title} tone={col.tone}>
          <div className="flex flex-wrap items-center gap-2">
            <Title icon={col.icon} tone={col.tone}>
              {col.title}
            </Title>
            {col.flag && <Chip tone={col.tone}>{col.flag}</Chip>}
          </div>
          {col.firstCheck && (
            <p className="mt-2 rounded-lg bg-white/[0.05] px-3 py-2 text-[15px]">
              <b className="mr-1.5 text-emerald-300">先檢查</b>
              {col.firstCheck}
            </p>
          )}
          <ul className="mt-2 space-y-1.5">
            {col.causes.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5 shrink-0 rounded bg-white/[0.06] px-1.5 text-[13px] leading-6 text-slate-400">{catLabel[c.cat]}</span>
                <span className={cn(c.top && 'font-bold text-white')}>
                  {c.text}
                  {c.top && <span className="ml-1 text-amber-300">★常見</span>}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  )
}

function Checklist({ id, title, items, nested }: { id: string; title: string; items: ReactNode[]; nested?: boolean }) {
  const key = `cold-chain-deck:check:${id}`
  const [done, setDone] = useState<number[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem(key) ?? '[]') as number[]
    } catch {
      return []
    }
  })
  const toggle = (i: number) => {
    const next = done.includes(i) ? done.filter((d) => d !== i) : [...done, i]
    setDone(next)
    try {
      window.localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // 無法儲存時只影響這次瀏覽
    }
  }
  return (
    <Card nested={nested} tone="emerald">
      <Title icon={CheckCircle2} tone="emerald" small={nested}>
        {title}
      </Title>
      <ul className="mt-2 space-y-1">
        {items.map((item, i) => {
          const on = done.includes(i)
          return (
            <li key={i}>
              <button type="button" onClick={() => toggle(i)} className="flex w-full gap-3 rounded-lg py-1.5 text-left active:bg-white/5">
                <span
                  className={cn(
                    'mt-1 flex size-5 shrink-0 items-center justify-center rounded border',
                    on ? 'border-emerald-400 bg-emerald-400 text-paper' : 'border-slate-500 bg-card',
                  )}
                >
                  {on && <Check className="size-4" aria-hidden />}
                </span>
                <span className={cn(on && 'text-slate-500 line-through')}>{item}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

const KIND_LABEL = { part: '四大金剛', pipe: '四段管路', small: '管路上的小零件' } as const

function CycleLessonMobile() {
  const [selected, setSelected] = useState<CycleNodeId | null>(null)
  const noteRef = useRef<HTMLDivElement>(null)
  const pick = (id: CycleNodeId, scroll: boolean) => {
    setSelected(selected === id ? null : id)
    if (scroll) requestAnimationFrame(() => noteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }
  const note = selected ? cycleNotes[selected] : null
  const [viewId, setViewId] = useState<string | null>(null)
  const viewModel = viewId ? part3DFor(viewId) : null
  const [view, setView] = useState<'2d' | '3d'>('2d')
  const [cut, setCut] = useState(false)
  return (
    <div className="space-y-3">
      {viewModel && note && <PartViewer id={viewModel} title={note.title.replace(/^[①-④]\s*/, '')} alias={note.alias} onClose={() => setViewId(null)} />}
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { value: '2d', label: '2D 圖解' },
            { value: '3d', label: '3D 立體' },
          ]}
        />
        {view === '3d' && (
          <button
            type="button"
            aria-pressed={cut}
            onClick={() => setCut((c) => !c)}
            className={cn('rounded-full px-3 py-1.5 text-[14px] font-semibold', cut ? 'bg-sky-400 text-paper' : 'border border-line bg-card text-sky-300')}
          >
            {cut ? '合起來' : '剖開看內部'}
          </button>
        )}
      </div>
      <p className="text-[15px] text-slate-300">{view === '2d' ? '點圖上的虛線框或下面的按鈕，看說明、聽錄音。' : '按「啟動冷凍系統」看冷媒跑一圈；手指拖曳旋轉、兩指縮放，點零件名稱看說明。'}</p>
      {view === '2d' ? (
        <div className="relative rounded-2xl border border-line bg-card" style={{ aspectRatio: '820 / 560' }}>
          <CycleDiagram className="absolute inset-0 h-full w-full" interactive selected={selected} onSelect={(id) => pick(id, false)} />
        </div>
      ) : (
        <div className="relative h-[420px] overflow-hidden rounded-2xl bg-white/[0.04]">
          <InView fallback={<p className="absolute inset-0 flex items-center justify-center text-[15px] text-slate-400">3D 載入中…</p>}>
            <Suspense fallback={<p className="absolute inset-0 flex items-center justify-center text-[15px] text-slate-400">3D 載入中…</p>}>
              <CycleSystem3D selected={selected} onSelect={(id) => id && pick(id, true)} cut={cut} compact />
            </Suspense>
          </InView>
        </div>
      )}
      <div ref={noteRef} style={{ scrollMarginTop: 64 }}>
        {note && (
          <div className={cn('rounded-2xl border bg-card p-4', toneStyles[note.tone].border)}>
            <p className="text-[21px] font-black text-white">{note.title}</p>
            <p className={cn('text-[15px] font-semibold', toneStyles[note.tone].text)}>{note.alias}</p>
            <p className={cn('mt-2 inline-flex rounded-lg border px-2.5 py-0.5 text-[15px] font-bold', toneStyles[note.tone].chip)}>{note.state}</p>
            {note.quote && (
              <blockquote className="mt-2 flex gap-2 rounded-xl bg-white/[0.04] px-3 py-2.5">
                <Quote className="mt-1 size-4 shrink-0 text-emerald-300" aria-hidden />
                <span>{note.quote}</span>
              </blockquote>
            )}
            {note.analogy && (
              <p className="mt-2">
                <b className="mr-2 text-amber-300">比喻</b>
                {note.analogy}
              </p>
            )}
            <p className="mt-1.5">
              <b className="mr-2 text-sky-300">重點</b>
              {note.point}
            </p>
            {note.field && (
              <p className="mt-1.5">
                <b className="mr-2 text-emerald-300">現場</b>
                {note.field}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {part3DFor(note.id) && (
                <button
                  type="button"
                  onClick={() => setViewId(note.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/50 bg-sky-500/15 px-3 py-1.5 text-[15px] font-semibold text-sky-100 active:bg-sky-500/25"
                >
                  <Box className="size-4" aria-hidden />
                  3D 看構造
                </button>
              )}
              {note.audioAt !== undefined && CLASS_AUDIO && <Clip key={`${note.id}-1`} src={CLASS_AUDIO} at={note.audioAt} label="錄音01" />}
              {note.audio2At !== undefined && CLASS_AUDIO_2 && <Clip key={`${note.id}-2`} src={CLASS_AUDIO_2} at={note.audio2At} label="錄音02" />}
              {note.slide && <PageLink slide={note.slide}>{note.chapter}</PageLink>}
            </div>
          </div>
        )}
      </div>
      {(['part', 'pipe', 'small'] as const).map((kind) => (
        <div key={kind}>
          <p className="mb-1.5 text-[14px] font-bold text-slate-400">{KIND_LABEL[kind]}</p>
          <div className="flex flex-wrap gap-2">
            {CYCLE_ORDER.filter((id) => cycleNotes[id].kind === kind).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => pick(id, true)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-[15px] font-semibold',
                  selected === id ? toneStyles[cycleNotes[id].tone].chip : 'border-line text-slate-200',
                )}
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

function HotspotsMobile({ block }: { block: HotspotsBlock }) {
  const groups = Object.entries(block.groups) as [keyof HotspotsBlock['groups'], { label: string; tone: Tone }][]
  const [view, setView] = useState<{ id: string; title: string; code: string } | null>(null)
  const viewModel = view ? part3DFor(view.id) : null
  return (
    <div className="space-y-4">
      {view && viewModel && <PartViewer id={viewModel} title={view.title} alias={`講義型號 ${view.code}`} onClose={() => setView(null)} />}
      <a href={block.image} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl border border-line bg-card">
        <img src={block.image} alt={block.alt} className="w-full" />
      </a>
      <p className="flex items-center gap-1.5 text-[14px] text-slate-400">
        <ExternalLink className="size-4" aria-hidden />
        點圖片可開新分頁放大
      </p>
      {block.note && <p className="text-[15px] text-slate-300">{block.note}</p>}
      {groups.map(([group, g]) => {
        const items = block.items.filter((item) => item.group === group)
        if (items.length === 0) return null
        return (
          <Card key={group} tone={g.tone}>
            <p className={cn('font-bold', toneStyles[g.tone].text)}>{g.label}</p>
            <ul className="mt-2 divide-y divide-line">
              {items.map((item) => (
                <li key={item.id} className="py-2.5">
                  <p className="flex flex-wrap items-center gap-2">
                    <Chip tone={g.tone}>{item.code}</Chip>
                    <b className="text-white">{item.name}</b>
                  </p>
                  <p className="mt-1 text-[15px] text-slate-300">{item.func}</p>
                  {(item.audioAt !== undefined || item.audioAt2 !== undefined || item.slide || part3DFor(item.id)) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {part3DFor(item.id) && (
                        <button
                          type="button"
                          onClick={() => setView({ id: item.id, title: item.name, code: item.code })}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/50 bg-sky-500/15 px-3 py-1.5 text-[15px] font-semibold text-sky-100 active:bg-sky-500/25"
                        >
                          <Box className="size-4" aria-hidden />
                          3D 看構造
                        </button>
                      )}
                      {item.audioAt !== undefined && block.audioSrc && <Clip src={block.audioSrc} at={item.audioAt} label="錄音01" />}
                      {item.audioAt2 !== undefined && block.audioSrc2 && <Clip src={block.audioSrc2} at={item.audioAt2} label="錄音02" />}
                      {item.slide && <PageLink slide={item.slide}>{item.chapter ?? '相關章節'}</PageLink>}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )
      })}
    </div>
  )
}

/** 錄音索引（手機）：一段一列，點開才出現章節和播放器 */
function RecordingsMobile({ block }: { block: RecordingsIndexBlock }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="space-y-2">
      {block.items.map((item) => {
        const rec = recordingOf(item.slide)
        const on = open === item.slide
        return (
          <Card key={item.slide} tone={on ? 'emerald' : undefined}>
            <button type="button" onClick={() => setOpen(on ? null : item.slide)} aria-expanded={on} className="flex min-h-11 w-full items-center gap-3 text-left">
              <span className={cn('w-[80px] shrink-0 font-mono text-[14px] font-bold', on ? 'text-emerald-300' : 'text-slate-400')}>{item.code}</span>
              <span className="min-w-0 flex-1 text-[16px] font-semibold text-white">{rec?.title ?? item.slide}</span>
              <span className="shrink-0 font-mono text-[13px] text-slate-500">{rec?.duration}</span>
            </button>
            {on && rec && (
              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {item.related.map((l) => (
                    <PageLink key={l.slide} slide={l.slide}>
                      {l.label}
                    </PageLink>
                  ))}
                </div>
                <AudioMobile block={rec.audio} />
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function AudioMobile({ block }: { block: AudioBlock }) {
  const ref = useRef<HTMLAudioElement>(null)
  const tracks = block.tracks ?? [{ label: '', src: block.src, duration: block.duration }]
  const [track, setTrack] = useState(0)
  const [active, setActive] = useState<number | null>(null)
  const trackUrl = usePlayable(tracks[track].src)
  // 換段：等新的錄音讀到長度，再跳到那一段
  const pendingSeek = useRef<number | null>(null)

  const play = (i: number) => {
    const audio = ref.current
    if (!audio) return
    const chapter = block.chapters[i]
    const t = chapter.track ?? 0
    setActive(i)
    if (t !== track) {
      pendingSeek.current = chapter.at
      setTrack(t)
    } else {
      audio.currentTime = chapter.at
      audio.play().catch(() => {})
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
        <Title icon={Headphones} tone="emerald">
          {block.title}
          {tracks.length > 1 && <span className="ml-2 text-[15px] font-semibold text-slate-400">第 {tracks[track].label} 段</span>}
        </Title>
        {!tracks[track].src ? (
          <div className="mt-3">
            <OfflineOnlyAudio small />
          </div>
        ) : (
          <>
            <audio
              ref={ref}
              src={trackUrl}
              controls
              preload="metadata"
              onLoadedMetadata={(e) => {
                if (pendingSeek.current === null) return
                e.currentTarget.currentTime = pendingSeek.current
                pendingSeek.current = null
                e.currentTarget.play().catch(() => {})
              }}
              className="mt-3 w-full"
            />
            <p className="mt-2 text-[14px] text-slate-400">點下面的段落，直接從那裡開始播。</p>
          </>
        )}
      </div>
      <ol className="divide-y divide-line rounded-2xl border border-line">
        {block.chapters.map((c, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => play(i)}
              className={cn('flex w-full gap-3 px-4 py-3 text-left active:bg-white/5', active === i && 'bg-emerald-500/10')}
            >
              <span className="w-[4.2em] shrink-0 pt-0.5 font-mono text-[14px] font-bold text-emerald-300">
                {tracks.length > 1 && `${tracks[c.track ?? 0].label}·`}
                {formatTime(c.at)}
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-white">{c.title}</span>
                <span className="block text-[15px] text-slate-300">{c.summary}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
