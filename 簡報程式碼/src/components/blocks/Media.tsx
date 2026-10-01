import { ArrowUpRight, AudioLines, Headphones, MousePointerClick, Play } from 'lucide-react'
import { useRef, useState } from 'react'
import { useDeck } from '../../context/deck'
import type { AudioBlock, HotspotGroup, HotspotsBlock } from '../../data/types'
import { cn, pad } from '../../lib/cn'
import { toneStyles } from '../../lib/tone'
import { Badge } from '../ui/Badge'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
const GROUP_ORDER: HotspotGroup[] = ['liquid', 'suction', 'discharge', 'control']

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${pad(m)}:${pad(s)}`
}

function MissingAudio() {
  return (
    <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[15px] leading-snug text-amber-100">
      錄音無法播放：請改用 Chrome 或 Edge 開啟這個簡報檔。
    </p>
  )
}

/** 講義圖片 + 可點擊的零件標記 */
export function HotspotDiagram({ block }: { block: HotspotsBlock }) {
  const { goToId, numberOf } = useDeck()
  const [selectedId, setSelectedId] = useState(block.defaultId)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audio2Ref = useRef<HTMLAudioElement>(null)
  const selected = block.items.find((i) => i.id === selectedId) ?? block.items[0]
  const group = block.groups[selected.group]
  const gt = toneStyles[group.tone]

  const playAt = (sec: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio2Ref.current?.pause()
    audio.currentTime = sec
    audio.play().catch(() => setAudioError(true))
  }

  return (
    <div className="hotspot-wrap flex h-full items-center gap-6">
      <figure
        className="relative w-[960px] shrink-0 overflow-hidden rounded-[20px] border border-white/15 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]"
        style={{ aspectRatio: String(block.ratio) }}
      >
        <img src={block.image} alt={block.alt} draggable={false} className="absolute inset-0 h-full w-full select-none object-cover" />
        {block.items.flatMap((item) =>
          item.points.map((p, i) => {
            const active = item.id === selected.id
            return (
              <button
                key={`${item.id}-${i}`}
                type="button"
                title={`${item.code} · ${item.name}`}
                aria-label={`${item.code} ${item.name}`}
                aria-pressed={active}
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200',
                  focusRing,
                  active
                    ? 'z-10 size-14 border-[3px] border-amber-400 bg-amber-300/20 shadow-[0_0_0_6px_rgba(251,191,36,0.25),0_0_24px_rgba(251,191,36,0.8)]'
                    : 'size-6 border-2 border-white bg-sky-600/85 shadow-[0_0_0_3px_rgba(2,132,199,0.25)] hover:scale-125',
                )}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              />
            )
          }),
        )}
        <figcaption className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-navy-950/80 px-3 py-1.5 text-[15px] font-semibold text-slate-100">
          <MousePointerClick className="size-4 text-sky-300" aria-hidden />
          點圖上的藍點或右側型號查看說明
        </figcaption>
      </figure>

      <section className="flex h-full min-w-0 flex-1 flex-col gap-4">
        <div className={cn('flex flex-col rounded-[20px] border bg-linear-to-br p-5', gt.border, gt.wash)}>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[36px] font-black leading-none text-white">{selected.code}</span>
            <Badge tone={group.tone} size="sm">
              {group.label}
            </Badge>
          </div>
          <h4 className="mt-2 text-[24px] font-bold leading-tight text-slate-50">{selected.name}</h4>
          <p className="mt-0.5 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">{selected.en}</p>
          <p className="mt-3 text-[19px] leading-normal text-slate-200">{selected.func}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {selected.slide && (
              <button
                type="button"
                onClick={() => goToId(selected.slide!)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border border-white/15 bg-navy-900/60 px-3 py-1.5 text-[16px] font-semibold text-slate-100 transition hover:border-sky-400/50',
                  focusRing,
                )}
              >
                {selected.chapter} <span className="font-mono text-[13px] text-slate-400">P.{pad(numberOf(selected.slide))}</span>
                <ArrowUpRight className="size-4" aria-hidden />
              </button>
            )}
            {selected.audioAt !== undefined && block.audioSrc && (
              <button
                type="button"
                onClick={() => playAt(selected.audioAt!)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-[16px] font-semibold text-emerald-100 transition hover:bg-emerald-400/20',
                  focusRing,
                )}
              >
                <Headphones className="size-4" aria-hidden />
                錄音01 <span className="font-mono">{formatTime(selected.audioAt)}</span>
              </button>
            )}
            {selected.audioAt2 !== undefined && block.audioSrc2 && (
              <button
                type="button"
                onClick={() => {
                  audioRef.current?.pause()
                  const audio = audio2Ref.current
                  if (!audio) return
                  audio.currentTime = selected.audioAt2!
                  audio.play().catch(() => setAudioError(true))
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-[16px] font-semibold text-emerald-100 transition hover:bg-emerald-400/20',
                  focusRing,
                )}
              >
                <Headphones className="size-4" aria-hidden />
                錄音02 <span className="font-mono">{formatTime(selected.audioAt2)}</span>
              </button>
            )}
          </div>
          {block.audioSrc2 && <audio ref={audio2Ref} src={block.audioSrc2} preload="none" controls={false} />}
        </div>
        {block.note && <p className="-mt-1 text-[15px] leading-snug text-amber-200/90">{block.note}</p>}

        <div className="flex min-h-0 flex-1 flex-col justify-between gap-2.5">
          {GROUP_ORDER.map((g) => {
            const meta = block.groups[g]
            const t = toneStyles[meta.tone]
            return (
              <div key={g}>
                <p className="mb-1.5 flex items-center gap-2 text-[15px] font-bold text-slate-400">
                  <span aria-hidden className={cn('h-1 w-5 rounded-full', t.dot)} />
                  {meta.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {block.items
                    .filter((i) => i.group === g)
                    .map((item) => {
                      const active = item.id === selected.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          aria-pressed={active}
                          title={item.audioAt !== undefined || item.audioAt2 !== undefined ? '錄音中有講解' : '錄音未講解'}
                          className={cn(
                            'flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[15px] font-semibold transition',
                            focusRing,
                            active ? 'border-amber-400 bg-amber-400/20 text-amber-50' : cn(t.chip, 'hover:brightness-125'),
                          )}
                        >
                          {(item.audioAt !== undefined || item.audioAt2 !== undefined) && <Headphones className="size-3.5 opacity-80" aria-label="錄音中有講解" />}
                          {item.code}
                        </button>
                      )
                    })}
                </div>
              </div>
            )
          })}
        </div>

        {block.audioSrc && (
          <div className="rounded-xl border border-white/10 bg-navy-900/60 px-3 py-2.5">
            <p className="mb-1.5 flex items-center gap-2 text-[14px] font-semibold text-slate-400">
              <AudioLines className="size-4 text-emerald-300" aria-hidden />
              課堂錄音 01
              <span className="ml-auto flex items-center gap-1 font-normal">
                <Headphones className="size-3.5" aria-hidden />= 錄音中有講解
              </span>
            </p>
            {audioError ? (
              <MissingAudio />
            ) : (
              <audio ref={audioRef} controls preload="metadata" src={block.audioSrc} onError={() => setAudioError(true)} className="h-9 w-full" />
            )}
          </div>
        )}
      </section>
    </div>
  )
}

/** 課堂錄音：章節時間軸，點擊即跳到該段播放（支援多段錄音） */
export function AudioChapters({ block }: { block: AudioBlock }) {
  const tracks = block.tracks ?? [{ label: '', src: block.src, duration: block.duration }]
  const audioRef = useRef<HTMLAudioElement>(null)
  const [track, setTrack] = useState(0)
  const [time, setTime] = useState(0)
  const [audioError, setAudioError] = useState(false)
  const current = block.chapters.reduce((acc, c, i) => ((c.track ?? 0) === track && time >= c.at ? i : acc), -1)

  const seek = (sec: number, t: number) => {
    const audio = audioRef.current
    if (!audio) return
    const go = () => {
      audio.currentTime = sec
      audio.play().catch(() => setAudioError(true))
    }
    if (t !== track) {
      audio.src = tracks[t].src
      setTrack(t)
      setTime(sec)
      audio.addEventListener('loadedmetadata', go, { once: true })
      audio.load()
    } else go()
  }

  return (
    <div className="grid h-full grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-6">
      <section className="flex h-full flex-col rounded-[22px] border border-emerald-400/25 bg-linear-to-b from-emerald-500/[0.12] to-white/[0.02] p-6">
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/35">
            <Headphones className="size-8" aria-hidden />
          </span>
          <div>
            <h3 className="text-[28px] font-black leading-tight text-white">{block.title}</h3>
            {block.en && <p className="mt-1 font-mono text-[14px] uppercase tracking-[0.18em] text-emerald-300/80">{block.en}</p>}
          </div>
        </div>
        {block.tracks && (
          <div className="mt-5 flex gap-2">
            {tracks.map((tr, i) => (
              <button
                key={tr.label}
                type="button"
                onClick={() => seek(0, i)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-[16px] font-bold transition',
                  focusRing,
                  i === track ? 'border-emerald-400 bg-emerald-400/20 text-emerald-50' : 'border-white/10 text-slate-300 hover:border-white/25',
                )}
              >
                {tr.label}
                <span className="ml-1.5 font-mono text-[13px] font-normal opacity-70">{tr.duration}</span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-5 flex items-baseline gap-3">
          <span className="font-mono text-[56px] font-extrabold leading-none text-emerald-100">{formatTime(time)}</span>
          <span className="font-mono text-[22px] text-slate-400">/ {tracks[track].duration}</span>
        </div>
        <div className="mt-4">
          {audioError ? (
            <MissingAudio />
          ) : (
            <audio
              ref={audioRef}
              controls
              preload="metadata"
              src={tracks[0].src}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onError={() => setAudioError(true)}
              className="w-full"
            />
          )}
        </div>
        <div className="mt-auto rounded-2xl border border-white/10 bg-navy-900/60 p-4">
          <p className="text-[15px] font-semibold text-slate-400">目前段落</p>
          <p className="mt-1 text-[22px] font-bold leading-snug text-emerald-100">{current >= 0 ? block.chapters[current].title : '—'}</p>
          <p className="mt-2 text-[16px] leading-snug text-slate-400">點右側任一段落，就會從該處開始播放。</p>
        </div>
      </section>

      <ol className="flex h-full min-h-0 flex-col gap-2">
        {block.chapters.map((c, i) => {
          const active = i === current
          const t = c.track ?? 0
          return (
            <li key={`${t}-${c.at}`} className="flex min-h-0 flex-1">
              <button
                type="button"
                onClick={() => seek(c.at, t)}
                className={cn(
                  'group flex w-full items-center gap-4 rounded-xl border px-4 py-2 text-left transition',
                  focusRing,
                  active ? 'border-emerald-400/50 bg-emerald-400/10' : 'border-white/[0.08] bg-navy-900/50 hover:border-white/20',
                )}
              >
                <span
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 font-mono text-[17px] font-bold',
                    block.tracks ? 'w-[120px]' : 'w-[86px]',
                    active ? 'text-emerald-300' : 'text-slate-400 group-hover:text-slate-200',
                  )}
                >
                  <Play className="size-4" aria-hidden />
                  {block.tracks && <span className="text-[14px] opacity-80">{tracks[t].label}</span>}
                  {formatTime(c.at)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-[20px] font-bold leading-snug', active ? 'text-white' : 'text-slate-100')}>{c.title}</span>
                  <span className="block text-[16px] leading-snug text-slate-400">{c.summary}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}