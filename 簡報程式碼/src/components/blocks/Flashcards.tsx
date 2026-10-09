import { Box, Check, ChevronLeft, ChevronRight, Repeat, RotateCcw, Shuffle, Volume2 } from 'lucide-react'
import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { CARD_AUDIO } from '../../data/cardAudio'
import { CLASS_AUDIO, loadPlayable, RECORDINGS } from '../../data/media'
import type { FlashCard, FlashcardsBlock } from '../../data/types'
import { isNew } from '../../data/whatsNew'
import { useStickyState } from '../../hooks/useStickyState'
import { cn } from '../../lib/cn'
import { part3DFor } from '../three/ids'
import { PartViewer } from '../three/PartViewer'
import { Segmented } from '../ui/Segmented'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
type Status = 'known' | 'learning'

const shuffled = (n: number) => {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 翻卡的聲音都是幾秒的小檔（data/cardAudio.ts，工具/make_card_audio.py 產生）：
 * 英文用 Windows 英文語音先錄好；老闆說的片段從上課錄音剪出來。
 * 按下去「同一個點擊裡」直接播小檔：手機、平板不會卡，iPhone 靜音模式也聽得到
 * （瀏覽器內建語音在 iPhone 靜音時會沒聲音，只當沒有小檔時的備用）。
 */
let cardAudio: HTMLAudioElement | null = null
function playSmall(url: string) {
  if (!cardAudio) cardAudio = new Audio()
  cardAudio.pause()
  cardAudio.src = url
  cardAudio.currentTime = 0
  void cardAudio.play().catch(() => {})
}
const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window
function speakEnglish(card: FlashCard) {
  const file = CARD_AUDIO[card.term]?.en
  if (file) return playSmall(file)
  if (!canSpeak) return
  const u = new SpeechSynthesisUtterance(card.en.replace(/（.*?）|\(.*?\)/g, '').trim())
  u.lang = 'en-US'
  u.rate = 0.85
  // iPhone：先 cancel 再馬上 speak，有時新的那句也會被取消 → 只在正在唸時才 cancel
  if (speechSynthesis.speaking) speechSynthesis.cancel()
  speechSynthesis.speak(u)
}

/** 老闆說：播剪好的小檔；沒有小檔（新加的卡還沒產生）才從整段錄音跳過去播 */
let clipStop: (() => void) | null = null
function playClip(card: FlashCard) {
  const tw = card.tw!
  const file = CARD_AUDIO[card.term]?.tw
  if (file) return playSmall(file)
  if (!cardAudio) cardAudio = new Audio()
  const audio = cardAudio
  const src = RECORDINGS[tw.rec - 1] ?? CLASS_AUDIO
  if (clipStop) audio.removeEventListener('timeupdate', clipStop)
  clipStop = () => {
    if (audio.currentTime >= tw.to) audio.pause()
  }
  audio.addEventListener('timeupdate', clipStop)
  void loadPlayable(src).then((url) => {
    audio.src = url
    audio.addEventListener(
      'loadedmetadata',
      () => {
        audio.currentTime = tw.from
        void audio.play().catch(() => {})
      },
      { once: true },
    )
    audio.load()
  })
}
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/**
 * 名詞翻卡（參考 Anki／Quizlet）：上一張／下一張、全部名詞選單快速跳、正反向練習、
 * 英文發音＋台語上課原音、零件可看 3D；「會了／還不熟」記在這台電腦，跳頁回來不會重置。
 */
export function Flashcards({ block, mobile = false }: { block: FlashcardsBlock; mobile?: boolean }) {
  const cards = block.cards
  const total = cards.length
  const [order, setOrder] = useStickyState<number[]>('cards:order', () => cards.map((_, i) => i))
  const [cur, setCur] = useStickyState('cards:cur', 0)
  const [status, setStatus] = useStickyState<Record<string, Status>>('cards:status', {})
  const [hideKnown, setHideKnown] = useStickyState('cards:hideKnown', true)
  const [mode, setMode] = useStickyState<'term' | 'en'>('cards:mode', 'term')
  const [flipped, setFlipped] = useState(false)
  const [viewer, setViewer] = useState(false)

  // 卡片數量變了（新增名詞）就重新排
  const safeOrder = order.length === total ? order : cards.map((_, i) => i)
  const visible = useMemo(() => safeOrder.filter((i) => !hideKnown || status[cards[i].term] !== 'known'), [safeOrder, hideKnown, status, cards])
  const current = visible.includes(cur) ? cur : visible[0]
  const card = current !== undefined ? cards[current] : null
  const known = cards.filter((c) => status[c.term] === 'known').length
  const model = card?.part ? part3DFor(card.part) : null

  const show = (i: number) => {
    setCur(i)
    setFlipped(false)
  }
  const go = (delta: number) => {
    if (!visible.length || current === undefined) return
    const p = visible.indexOf(current)
    show(visible[(p + delta + visible.length) % visible.length])
  }
  const mark = (s: Status) => {
    if (!card || current === undefined) return
    const nextStatus = { ...status, [card.term]: s }
    setStatus(nextStatus)
    // 照目前順序找下一張還要練的
    const idx = safeOrder.indexOf(current)
    for (let k = 1; k <= total; k++) {
      const c = safeOrder[(idx + k) % total]
      if (!hideKnown || nextStatus[cards[c].term] !== 'known') {
        show(c)
        return
      }
    }
    setFlipped(false)
  }
  const reshuffle = () => {
    const o = shuffled(total)
    setOrder(o)
    show(o.find((i) => !hideKnown || status[cards[i].term] !== 'known') ?? o[0])
  }
  const resetAll = () => {
    setStatus({})
    show(safeOrder[0])
  }
  const jump = (i: number) => {
    if (hideKnown && status[cards[i].term] === 'known') setHideKnown(false)
    show(i)
  }
  const stop = (e: MouseEvent) => e.stopPropagation()
  const onCardKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setFlipped((f) => !f)
    }
  }

  const size = mobile
    ? { term: 'text-[34px]', en: 'text-[24px]', body: 'text-[16px]', small: 'text-[14px]', btn: 'px-3 py-2 text-[15px]', chip: 'px-2.5 py-1 text-[14px]' }
    : { term: 'text-[68px]', en: 'text-[48px]', body: 'text-[26px]', small: 'text-[18px]', btn: 'px-5 py-2.5 text-[20px]', chip: 'px-3 py-1.5 text-[17px]' }
  const pill = cn('inline-flex items-center gap-1.5 rounded-full font-semibold transition', size.chip, focusRing)

  const englishButton = (c: FlashCard) =>
    (canSpeak || CARD_AUDIO[c.term]?.en) && (
      <button type="button" onClick={(e) => {
        stop(e)
        speakEnglish(c)
      }} className={cn(pill, 'bg-sky-400/15 text-sky-200 hover:bg-sky-400/25')} aria-label={`播放英文發音：${c.en}`}>
        <Volume2 className="size-4" aria-hidden />
        英文
      </button>
    )
  const taiwaneseButton = (c: FlashCard) =>
    c.tw && (
      <button type="button" onClick={(e) => {
        stop(e)
        playClip(c)
      }} className={cn(pill, 'bg-amber-400/15 text-amber-200 hover:bg-amber-400/25')} title={`錄音${String(c.tw.rec).padStart(2, '0')} ${mmss(c.tw.from)}：「${c.tw.say}」`}>
        <Volume2 className="size-4" aria-hidden />
        老闆說（錄音{String(c.tw.rec).padStart(2, '0')} {mmss(c.tw.from)}）
      </button>
    )

  const cardView = card ? (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={onCardKey}
      aria-label={flipped ? '翻回正面' : '翻面看答案'}
      className={cn(
        'flex w-full cursor-pointer flex-col items-center justify-center rounded-[28px] text-center transition-colors',
        mobile ? 'min-h-[260px] p-5' : 'min-h-0 flex-1 px-12 py-8',
        flipped ? 'bg-emerald-400/[0.08]' : 'bg-sky-400/[0.07] hover:bg-sky-400/[0.11]',
        focusRing,
      )}
    >
      <p className={cn('mb-3 flex items-center gap-2 font-semibold text-slate-500', size.small)}>
        {card.group}
        {isNew(card.added) && <span className="rounded bg-emerald-400 px-1.5 text-[13px] font-black leading-5 text-navy-950">新</span>}
      </p>
      {mode === 'term' || flipped ? (
        <span className={cn('font-black text-white', flipped ? (mobile ? 'text-[28px]' : 'text-[52px]') : size.term)}>{card.term}</span>
      ) : (
        <span className="flex flex-col items-center gap-3">
          <span className={cn('font-black text-sky-100', size.en)}>{card.en}</span>
          {englishButton(card)}
        </span>
      )}
      {flipped ? (
        <div className={cn('mt-4 flex flex-col items-center gap-2.5', size.body)}>
          <p className="text-amber-200">也叫：{card.alias}</p>
          {taiwaneseButton(card)}
          <p className="flex flex-wrap items-center justify-center gap-3 text-sky-200">
            <span className="font-semibold">{card.en}</span>
            {englishButton(card)}
          </p>
          <p className="max-w-[880px] text-emerald-50">{card.tip}</p>
          {model && (
            <button type="button" onClick={(e) => {
                stop(e)
                setViewer(true)
              }} className={cn(pill, 'mt-1 bg-sky-400 text-navy-950 hover:bg-sky-300')}>
              <Box className="size-4" aria-hidden />
              3D／照片看構造
            </button>
          )}
        </div>
      ) : (
        <p className={cn('mt-5 text-slate-500', size.small)}>{mode === 'term' ? '先說出台語、英文和用途，再點一下翻面' : '先說出國語名稱，再點一下翻面'}</p>
      )}
    </div>
  ) : (
    <div className={cn('flex w-full flex-col items-center justify-center rounded-[28px] bg-emerald-400/[0.08] text-center', mobile ? 'min-h-[260px] p-5' : 'min-h-0 flex-1')}>
      <span className={cn('font-black text-emerald-200', mobile ? 'text-[26px]' : 'text-[52px]')}>全部會了！</span>
      <span className={cn('mt-2 text-slate-300', size.small)}>隔幾天再來一次，記得更牢</span>
    </div>
  )

  const navButton = (dir: -1 | 1) => (
    <button
      type="button"
      onClick={() => go(dir)}
      disabled={visible.length < 2}
      aria-label={dir < 0 ? '上一張' : '下一張'}
      className={cn('flex shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-slate-100 transition hover:bg-white/[0.14] disabled:opacity-30', mobile ? 'size-10' : 'size-14', focusRing)}
    >
      {dir < 0 ? <ChevronLeft className={mobile ? 'size-5' : 'size-7'} aria-hidden /> : <ChevronRight className={mobile ? 'size-5' : 'size-7'} aria-hidden />}
    </button>
  )

  const groups = [...new Set(cards.map((c) => c.group))]
  const menu = (
    <div className={cn('flex flex-col', mobile ? 'gap-3' : 'min-h-full gap-4')}>
      {groups.map((g) => (
        <div key={g}>
          <p className={cn('mb-1.5 font-semibold text-slate-500', size.small)}>
            {g}
            <span className="ml-2 text-slate-600">
              {cards.filter((c) => c.group === g && status[c.term] === 'known').length}/{cards.filter((c) => c.group === g).length}
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {cards.map((c, i) =>
              c.group !== g ? null : (
                <button
                  key={c.term}
                  type="button"
                  onClick={() => jump(i)}
                  aria-current={i === current}
                  className={cn(
                    'rounded-full font-semibold transition',
                    size.chip,
                    i === current ? 'bg-slate-100 text-navy-950' : status[c.term] === 'known' ? 'bg-emerald-400/15 text-emerald-200' : status[c.term] === 'learning' ? 'bg-amber-400/15 text-amber-200' : 'bg-white/[0.07] text-slate-200 hover:bg-white/[0.12]',
                    focusRing,
                  )}
                >
                  {status[c.term] === 'known' && i !== current && <Check className="-mt-0.5 mr-0.5 inline size-3.5" aria-hidden />}
                  {c.term}
                </button>
              ),
            )}
          </div>
        </div>
      ))}
      <p className={cn('text-slate-500', size.small, !mobile && 'mt-auto')}>綠色＝會了・橘色＝還不熟；記在這台電腦，下次打開還在。</p>
    </div>
  )

  const actionBtn = cn('flex items-center gap-1.5 rounded-full font-bold transition', size.btn, focusRing)
  const main = (
    <div className={cn('flex min-w-0 flex-col', mobile ? 'gap-3' : 'h-full gap-4')}>
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          size={mobile ? 'sm' : 'lg'}
          value={mode}
          onChange={(m) => {
            setMode(m)
            setFlipped(false)
          }}
          options={[
            { value: 'term', label: '看國語' },
            { value: 'en', label: '看英文' },
          ]}
        />
        <label className={cn('flex cursor-pointer items-center gap-2 text-slate-300', size.small)}>
          <input type="checkbox" checked={hideKnown} onChange={(e) => setHideKnown(e.target.checked)} className="size-4 accent-sky-400" />
          只練還不熟的
        </label>
        <span className={cn('ml-auto font-semibold text-slate-400', size.small)}>
          會了 <b className="text-emerald-300">{known}</b> / {total}
          {card && visible.length > 0 && <span className="ml-3 text-slate-500">第 {visible.indexOf(current!) + 1} / {visible.length} 張</span>}
        </span>
      </div>
      <div className={cn('flex min-h-0 items-center', mobile ? 'gap-2' : 'flex-1 gap-4')}>
        {navButton(-1)}
        {cardView}
        {navButton(1)}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {card ? (
          <>
            <button type="button" onClick={() => mark('learning')} className={cn(actionBtn, 'bg-amber-400/15 text-amber-100 hover:bg-amber-400/25')}>
              <Repeat className="size-5" aria-hidden />
              還不熟
            </button>
            <button type="button" onClick={() => mark('known')} className={cn(actionBtn, 'bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/25')}>
              <Check className="size-5" aria-hidden />
              會了
            </button>
          </>
        ) : (
          <button type="button" onClick={resetAll} className={cn(actionBtn, 'bg-white/[0.08] text-slate-100 hover:bg-white/[0.14]')}>
            <RotateCcw className="size-5" aria-hidden />
            全部重來
          </button>
        )}
        <button type="button" onClick={reshuffle} className={cn(actionBtn, 'bg-white/[0.08] text-slate-200 hover:bg-white/[0.14]')}>
          <Shuffle className="size-5" aria-hidden />
          洗牌
        </button>
      </div>
      {viewer && model && card && <PartViewer id={model} title={card.term} alias={card.alias} onClose={() => setViewer(false)} />}
    </div>
  )

  if (mobile)
    return (
      <div className="flex flex-col gap-4">
        {main}
        <details className="rounded-2xl bg-white/[0.04] p-3">
          <summary className="cursor-pointer text-[16px] font-bold text-white">全部名詞（{total}）・點一個直接跳過去</summary>
          <div className="mt-3">{menu}</div>
        </details>
      </div>
    )

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_480px] gap-6">
      {main}
      <section className="flex min-h-0 flex-col rounded-[28px] bg-white/[0.045] p-6">
        <p className="mb-3 text-[24px] font-semibold text-white">全部名詞・點一個直接跳過去</p>
        {/* 名詞越來越多：清單可以捲（之前最下面「管路」那組會被切掉看不到） */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2" data-no-swipe>
          {menu}
        </div>
      </section>
    </div>
  )
}
