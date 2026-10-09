import { ArrowUpRight, AudioLines, Box, Headphones, MousePointerClick, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDeck } from '../../context/deck'
import { loadPlayable, usePlayable } from '../../data/media'
import type { AudioBlock, HotspotGroup, HotspotsBlock } from '../../data/types'
import { cn, pad } from '../../lib/cn'
import { useScrollFade } from '../../hooks/useScrollFade'
import { toneStyles } from '../../lib/tone'
import { part3DFor } from '../three/ids'
import { PartViewer } from '../three/PartViewer'
import { Badge } from '../ui/Badge'
import { PartGlyph } from '../ui/PartGlyph'
import { glyphFor } from '../../lib/partGlyph'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500'
const GROUP_ORDER: HotspotGroup[] = ['liquid', 'suction', 'discharge', 'control']

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${pad(m)}:${pad(s)}`
}

function MissingAudio() {
  return (
    <p className="rounded-lg border border-amber-500/50 bg-amber-950 px-3 py-2 text-[17px] leading-snug text-amber-100">
      錄音無法播放：請改用 Chrome 或 Edge 開啟這個簡報檔。
    </p>
  )
}

/** 公開網站沒有完整上課錄音（裡面有客人名字、價格）：告訴他去哪裡聽 */
export function OfflineOnlyAudio({ small }: { small?: boolean }) {
  return (
    <p className={cn('rounded-xl border border-sky-500/40 bg-sky-950 leading-snug text-sky-100', small ? 'px-3 py-2 text-[14px]' : 'px-4 py-3 text-[18px]')}>
      完整錄音只放在公司版（離線檔「冷凍材料行培訓筆記.html」），公開網站不放；這裡可以先看每一段在講什麼。
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
  const audioUrl = usePlayable(block.audioSrc)
  const audio2Url = usePlayable(block.audioSrc2)
  const selected = block.items.find((i) => i.id === selectedId) ?? block.items[0]
  const group = block.groups[selected.group]
  const gt = toneStyles[group.tone]
  const model = part3DFor(selected.id)
  const [view, setView] = useState(false)

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
        className="relative w-[960px] shrink-0 overflow-hidden rounded-[14px] border border-line bg-card"
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
                    ? 'z-10 size-14 border-[3px] border-pipe-red bg-red-500/15 ring-4 ring-red-500/25'
                    : 'size-6 border-2 border-card bg-sky-500 ring-2 ring-sky-500/30 hover:scale-125',
                )}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              />
            )
          }),
        )}
        <figcaption className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-line bg-card/95 px-3 py-1.5 text-[17px] font-semibold text-slate-100">
          <MousePointerClick className="size-4 text-sky-400" aria-hidden />
          點圖上的藍點或右側型號查看說明
        </figcaption>
      </figure>

      <section className="flex h-full min-w-0 flex-1 flex-col gap-4">
        <div className={cn('flex flex-col rounded-[18px] border bg-card p-5', gt.border)}>
          <div className="flex items-center gap-3">
            {glyphFor(selected.name) && <PartGlyph id={glyphFor(selected.name)!} size={48} className="-my-1 shrink-0 text-ink-2" />}
            <span className="font-mono text-[36px] font-black leading-none text-ink">{selected.code}</span>
            <Badge tone={group.tone} size="sm">
              {group.label}
            </Badge>
          </div>
          <h4 className="mt-2 text-[24px] font-bold leading-tight text-slate-50">{selected.name}</h4>
          <p className="mt-0.5 font-mono text-[16px] uppercase tracking-[0.14em] text-slate-400">{selected.en}</p>
          <p className="mt-3 text-[19px] leading-normal text-slate-200">{selected.func}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {model && (
              <button
                type="button"
                onClick={() => setView(true)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border border-sky-500/50 bg-sky-950 px-3 py-1.5 text-[16px] font-semibold text-sky-100 transition hover:border-sky-500',
                  focusRing,
                )}
              >
                <Box className="size-4" aria-hidden />
                3D 看構造
              </button>
            )}
            {selected.slide && (
              <button
                type="button"
                onClick={() => goToId(selected.slide!)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-[16px] font-semibold text-slate-100 transition hover:border-sky-500/50',
                  focusRing,
                )}
              >
                {selected.chapter} <span className="font-mono text-[16px] text-slate-400">P.{pad(numberOf(selected.slide))}</span>
                <ArrowUpRight className="size-4" aria-hidden />
              </button>
            )}
            {selected.audioAt !== undefined && block.audioSrc && (
              <button
                type="button"
                onClick={() => playAt(selected.audioAt!)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[16px] font-semibold text-emerald-100 transition hover:bg-emerald-500/20',
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
                  'flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[16px] font-semibold text-emerald-100 transition hover:bg-emerald-500/20',
                  focusRing,
                )}
              >
                <Headphones className="size-4" aria-hidden />
                錄音02 <span className="font-mono">{formatTime(selected.audioAt2)}</span>
              </button>
            )}
          </div>
          {block.audioSrc2 && <audio ref={audio2Ref} src={audio2Url} preload="none" controls={false} />}
          {view && model && <PartViewer id={model} title={selected.name} alias={`講義型號 ${selected.code}`} onClose={() => setView(false)} />}
        </div>
        {block.note && <p className="-mt-1 text-[17px] leading-snug text-amber-200">{block.note}</p>}

        <div className="flex min-h-0 flex-1 flex-col justify-between gap-2.5">
          {GROUP_ORDER.map((g) => {
            const meta = block.groups[g]
            const t = toneStyles[meta.tone]
            return (
              <div key={g}>
                <p className="mb-1.5 flex items-center gap-2 text-[17px] font-bold text-slate-400">
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
                            'flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[17px] font-semibold transition',
                            focusRing,
                            active ? 'border-pipe-red bg-red-950 text-red-100 ring-1 ring-pipe-red' : cn(t.chip, 'hover:brightness-95'),
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
          <div className="rounded-xl border border-line bg-card px-3 py-2.5">
            <p className="mb-1.5 flex items-center gap-2 text-[16px] font-semibold text-slate-400">
              <AudioLines className="size-4 text-emerald-300" aria-hidden />
              課堂錄音 01
              <span className="ml-auto flex items-center gap-1 font-normal">
                <Headphones className="size-3.5" aria-hidden />= 錄音中有講解
              </span>
            </p>
            {audioError ? (
              <MissingAudio />
            ) : (
              <audio ref={audioRef} controls preload="metadata" src={audioUrl} onError={() => setAudioError(true)} className="h-9 w-full" />
            )}
          </div>
        )}
      </section>
    </div>
  )
}

/**
 * 課堂錄音：上面一條播放列，下面兩欄段落（點一段就從那裡播；支援多段錄音）。
 * 公開網站沒有完整錄音：不顯示時間和播放器，段落清單當成「每段在講什麼」閱讀；點段落會提示完整錄音在公司版。
 */
export function AudioChapters({ block }: { block: AudioBlock }) {
  const tracks = block.tracks ?? [{ label: '', src: block.src, duration: block.duration }]
  const noAudio = !tracks.some((tr) => tr.src)
  const audioRef = useRef<HTMLAudioElement>(null)
  const firstUrl = usePlayable(tracks[0].src)
  const [track, setTrack] = useState(0)
  const [time, setTime] = useState(0)
  const [audioError, setAudioError] = useState(false)
  const [asked, setAsked] = useState<number | null>(null)
  const current = noAudio ? -1 : block.chapters.reduce((acc, c, i) => ((c.track ?? 0) === track && time >= c.at ? i : acc), -1)
  const list = useScrollFade<HTMLOListElement>()
  const activeRef = useRef<HTMLLIElement>(null)
  useEffect(() => {
    if (current >= 0) activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [current])

  const seek = (sec: number, t: number) => {
    const audio = audioRef.current
    if (!audio) return
    const go = () => {
      audio.currentTime = sec
      audio.play().catch(() => setAudioError(true))
    }
    if (t !== track) {
      setTrack(t)
      setTime(sec)
      loadPlayable(tracks[t].src).then((url) => {
        audio.src = url
        audio.addEventListener('loadedmetadata', go, { once: true })
        audio.load()
      })
    } else go()
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <section className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[18px] border border-line bg-card px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Headphones className="size-7 shrink-0 text-emerald-300" aria-hidden />
          <h3 className="text-[24px] font-black leading-tight text-ink">{block.title}</h3>
          <span className="shrink-0 font-mono text-[18px] text-slate-400">
            {block.chapters.length} 段・{tracks.map((tr) => tr.duration).join('＋')}
          </span>
        </div>
        {noAudio ? (
          <div className="min-w-0 flex-1 basis-[420px]">
            <OfflineOnlyAudio small />
          </div>
        ) : (
          <>
            {block.tracks && (
              <div className="flex gap-2">
                {tracks.map((tr, i) => (
                  <button
                    key={tr.label}
                    type="button"
                    onClick={() => seek(0, i)}
                    className={cn(
                      'min-h-11 rounded-lg border px-3 py-1.5 text-[16px] font-bold transition',
                      focusRing,
                      i === track ? 'border-emerald-400 bg-emerald-950 text-emerald-100' : 'border-line bg-card text-slate-300 hover:border-white/25',
                    )}
                  >
                    {tr.label}
                    <span className="ml-1.5 font-mono text-[16px] font-normal text-slate-400">{tr.duration}</span>
                  </button>
                ))}
              </div>
            )}
            <span className="font-mono text-[30px] font-extrabold leading-none text-emerald-300">
              {formatTime(time)}
              <span className="ml-2 text-[18px] font-semibold text-slate-400">/ {tracks[track].duration}</span>
            </span>
            <div className="min-w-[320px] flex-1">
              {audioError ? (
                <MissingAudio />
              ) : (
                <audio
                  ref={audioRef}
                  controls
                  preload="metadata"
                  src={firstUrl}
                  onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                  onError={() => setAudioError(true)}
                  className="w-full"
                />
              )}
            </div>
          </>
        )}
      </section>

      {/* 段落多（錄音13 有 17 段）：兩欄排，放不下才捲；底部淡出表示下面還有；正在播的那段自動捲到看得到 */}
      <ol
        ref={list.ref}
        onScroll={list.measure}
        style={list.style}
        className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 content-start gap-2 overflow-y-auto pr-1 [scrollbar-width:thin]"
        aria-label={noAudio ? '每一段在講什麼' : '段落（點一下從那裡播）'}
      >
        {block.chapters.map((c, i) => {
          const active = i === current
          const t = c.track ?? 0
          return (
            <li key={`${t}-${c.at}`} ref={active ? activeRef : undefined} className="flex">
              <button
                type="button"
                onClick={() => (noAudio ? setAsked(i) : seek(c.at, t))}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition',
                  focusRing,
                  active ? 'border-emerald-500/60 bg-emerald-950' : 'border-line bg-card hover:border-white/20',
                )}
              >
                <span className={cn('flex shrink-0 items-center gap-1.5 pt-0.5 font-mono text-[17px] font-bold', active ? 'text-emerald-300' : 'text-slate-400 group-hover:text-slate-200')}>
                  {!noAudio && <Play className="size-4" aria-hidden />}
                  {block.tracks && <span className="text-[16px]">{tracks[t].label}</span>}
                  {formatTime(c.at)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-[20px] font-bold leading-snug', active ? 'text-ink' : 'text-slate-100')}>{c.title}</span>
                  <span className="block text-[17px] leading-snug text-slate-300">{c.summary}</span>
                  {noAudio && asked === i && (
                    <span role="status" className="mt-1.5 block text-[16px] font-semibold text-sky-300">
                      完整錄音只放在公司版（離線檔），公開網站不能播。
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
