import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { BookOpenCheck, ChevronLeft, ChevronRight, CornerUpLeft, List, PencilLine, Pin, Pointer, Presentation, Search, Store } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { DeckContext, type DeckApi } from '../context/deck'
import { PART_NO, parts } from '../data/parts'
import { slides } from '../data/slides'
import type { SlideData } from '../data/types'
import { isNew } from '../data/whatsNew'
import { cn, pad } from '../lib/cn'
import { interactionHints } from '../lib/interactions'
import { toneStyles } from '../lib/tone'
import { ChapterDrawer } from './ChapterDrawer'
import { MobileBlock } from './mobile/MobileBlocks'
import { SearchPanel } from './SearchPanel'
import { ProgressPanel } from './ProgressPanel'
import { PracticeQuestion } from './Practice'
import { PRACTICE } from '../data/practice'
import { markSeen, useLearn } from '../lib/learn'
import { SOURCE_LABEL } from './SlideCard'
import { BlueprintBackground } from './ui/BlueprintBackground'
import { LensMagnify, LensView } from './ui/LiquidLens'
import { lensBindings, lensDragBusy, useLensTrack, useLiquidLens } from '../hooks/useLiquidLens'

/**
 * 手機版簡報：一頁一張卡（跟電腦版同一份內容，直式單欄排法）。
 * 左右滑換頁；上面是目錄、頁碼、切回電腦版；下面是上一頁／下一頁。
 * 使用者主要是「找某一頁來查」，所以目錄打開會停在目前這一頁，頁內連結跳走後有「返回」。
 */
const TOTAL = slides.length
/** 標題列的圖示鈕：沒有外框，按下時後面出現淡灰色小膠囊（44px） */
const barIcon =
  'flex size-11 shrink-0 items-center justify-center rounded-full text-ink active:bg-[rgba(15,36,64,0.1)] motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500'
/** 懸浮膠囊的三顆（按下的回饋交給液態玻璃鏡片） */
const capBtn =
  'relative flex h-11 items-center rounded-full text-[15px] font-bold disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500'
const clamp = (n: number) => Math.min(Math.max(n, 0), TOTAL - 1)
const indexFromHash = () => {
  const m = /^#\/(\d+)$/.exec(window.location.hash)
  return m ? clamp(Number(m[1]) - 1) : 0
}
/** 手指下面有可以左右捲的東西（表格、橫向清單）：在那裡滑是要捲動，不是換頁 */
function hasHorizontalScroll(el: HTMLElement | null) {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    const ox = getComputedStyle(n).overflowX
    if ((ox === 'auto' || ox === 'scroll') && n.scrollWidth > n.clientWidth + 2) return true
  }
  return false
}

export function MobileDeck({ onExit }: { onExit: () => void }) {
  const [page, setPage] = useState(() => ({ index: indexFromHash(), dir: 0 }))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [progressOpen, setProgressOpen] = useState(false)
  const [returnTo, setReturnTo] = useState<number | null>(null)
  const indexRef = useRef(page.index)
  const scroller = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number; t: number; multi: boolean } | null>(null)

  const goTo = useCallback((target: number) => {
    setPage((prev) => {
      const index = clamp(target)
      return index === prev.index ? prev : { index, dir: index > prev.index ? 1 : -1 }
    })
  }, [])
  const step = useCallback((delta: number) => goTo(indexRef.current + delta), [goTo])

  // 頁碼同步到網址（#/5）：重新整理、分享連結都停在同一頁；換頁回到卡片最上面
  useEffect(() => {
    indexRef.current = page.index
    const hash = `#/${page.index + 1}`
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash)
    scroller.current?.scrollTo({ top: 0 })
    markSeen(slides[page.index].id)
  }, [page.index])
  useEffect(() => {
    const onHashChange = () => goTo(indexFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [goTo])

  const api = useMemo<DeckApi>(
    () => ({
      goToId: (id) => {
        const i = slides.findIndex((s) => s.id === id)
        if (i < 0 || i === indexRef.current) return
        setReturnTo(indexRef.current)
        goTo(i)
      },
      numberOf: (id) => slides.findIndex((s) => s.id === id) + 1,
      next: () => step(1),
    }),
    [goTo, step],
  )

  // 左右滑換頁：只有明確、夠長、快速的單指橫滑才算（跟電腦版同一套條件）
  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]
    const target = e.target as HTMLElement
    const blocked =
      e.touches.length > 1 ||
      (window.visualViewport?.scale ?? 1) > 1.05 ||
      !!target.closest('input, textarea, select, canvas, [role="slider"], .touch-none, [data-no-swipe]') ||
      hasHorizontalScroll(target)
    touchStart.current = blocked ? null : { x: t.clientX, y: t.clientY, t: Date.now(), multi: false }
  }
  const onTouchMove = (e: TouchEvent) => {
    if (touchStart.current && e.touches.length > 1) touchStart.current.multi = true
  }
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    // 剛剛在拖液態玻璃鏡片（一排按鈕）：不是要換頁
    if (lensDragBusy()) return
    if (!start || start.multi || (window.visualViewport?.scale ?? 1) > 1.05) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    const far = Math.abs(dx) > Math.max(90, window.innerWidth * 0.22)
    const straight = Math.abs(dx) > Math.abs(dy) * 2.5
    const quick = Date.now() - start.t < 650
    if (far && straight && quick) step(dx < 0 ? 1 : -1)
  }

  const slide = slides[page.index]
  const part = parts[slide.part]
  const prevSlide = slides[page.index - 1]
  const nextSlide = slides[page.index + 1]
  const showBack = returnTo !== null && returnTo !== page.index

  return (
    <MotionConfig reducedMotion="user">
      <DeckContext.Provider value={api}>
        <div className="reader-mode fixed inset-0 bg-paper text-[17px] leading-[1.7] text-slate-200">
          <BlueprintBackground fixed className="-z-10" />

          {/* 中：這一頁（整個畫面都能捲，內容會從上下的玻璃列後面透出來；左右滑換頁） */}
          <main className="absolute inset-0 overflow-hidden" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            {/* 只有進場動畫、沒有退場：舊的那頁馬上拿掉（退場動畫在背景分頁會跑不完，頁會疊在一起） */}
            <AnimatePresence initial={false} custom={page.dir}>
              <motion.div
                key={slide.id}
                ref={scroller}
                custom={page.dir}
                initial={{ opacity: 0, x: page.dir >= 0 ? 60 : -60 }}
                animate={{ opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
                className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain [scroll-padding-bottom:calc(env(safe-area-inset-bottom)+96px)] [scroll-padding-top:calc(env(safe-area-inset-top)+64px)]"
              >
                {/* 上留標題列＋安全區、下留懸浮列＋安全區＋一點呼吸空間：最後一段（學完馬上練）不會被蓋住 */}
                <article className="mx-auto max-w-[720px] px-4 pb-[calc(env(safe-area-inset-bottom)+112px)] pt-[calc(env(safe-area-inset-top)+76px)] lg:max-w-[960px]">
                  <MobileSlide slide={slide} index={page.index} />
                </article>
              </motion.div>
            </AnimatePresence>
          </main>

          {/* 上：篇名、搜尋、今天、切回電腦版（目錄和頁碼在下面的懸浮列） */}
          <header className="glass glass-bar absolute inset-x-0 top-0 z-30 border-b border-line pt-[env(safe-area-inset-top)]">
            <div className="flex h-14 items-center gap-1.5 pl-[max(16px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))]">
              <p className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className={cn('max-w-full truncate text-[15px] font-bold', toneStyles[part.tone].text)}>{part.label}</span>
                <span className="max-w-full truncate text-[13px] font-semibold text-ink-2">{slide.chapter ?? '冷凍材料行培訓筆記'}</span>
              </p>
              <button type="button" onClick={() => setSearchOpen(true)} aria-label="搜尋關鍵字" className={cn(barIcon, 'relative')}>
                <Search className="size-[22px]" aria-hidden />
                {isNew('2026-10-08') && <span aria-hidden className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-emerald-400" />}
              </button>
              <button
                type="button"
                onClick={() => setProgressOpen(true)}
                aria-label="今天讀什麼"
                className="relative flex h-11 shrink-0 items-center justify-center gap-1 rounded-full bg-[rgba(15,36,64,0.07)] px-3.5 text-[15px] font-bold text-ink active:bg-[rgba(15,36,64,0.14)] motion-safe:transition-colors"
              >
                <BookOpenCheck className="size-5" aria-hidden />
                今天
                {isNew('2026-10-09') && <span aria-hidden className="absolute right-0.5 top-0.5 size-2.5 rounded-full bg-emerald-400" />}
              </button>
              {showBack ? (
                <button
                  type="button"
                  onClick={() => {
                    if (returnTo !== null) goTo(returnTo)
                    setReturnTo(null)
                  }}
                  className="flex h-11 shrink-0 items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-950 px-3 text-[15px] font-bold text-emerald-100"
                >
                  <CornerUpLeft className="size-5" aria-hidden />
                  返回 P.{pad(returnTo! + 1)}
                </button>
              ) : (
                <button type="button" onClick={onExit} aria-label="切換到電腦版（投影片）" title="電腦版（投影片）" className={barIcon}>
                  <Presentation className="size-[22px]" aria-hidden />
                </button>
              )}
            </div>
          </header>

          {/* 下：懸浮膠囊（像 Instagram 底部列）——上一頁・目錄＋頁碼・下一頁 */}
          <nav aria-label="翻頁" className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
            <MobileDock index={page.index} prev={prevSlide} next={nextSlide} onPrev={() => step(-1)} onNext={() => step(1)} onMenu={() => setDrawerOpen(true)} />
          </nav>
        </div>
        <ChapterDrawer
          mobile
          open={drawerOpen}
          index={page.index}
          onClose={() => setDrawerOpen(false)}
          onSelect={(i) => {
            setDrawerOpen(false)
            goTo(i)
          }}
        />
        <ProgressPanel open={progressOpen} mobile currentId={slide.id} onClose={() => setProgressOpen(false)} onSelect={(i) => goTo(i)} />
        <SearchPanel
          open={searchOpen}
          mobile
          onClose={() => setSearchOpen(false)}
          onSelect={(i) => {
            if (i === indexRef.current) return
            setReturnTo(indexRef.current)
            goTo(i)
          }}
        />
      </DeckContext.Provider>
    </MotionConfig>
  )
}

/** 一頁的內容：眉標、標題、門市實戰、各區塊（手機排法）、小結論 */
function MobileSlide({ slide, index }: { slide: SlideData; index: number }) {
  const part = parts[slide.part]
  const cover = slide.layout === 'cover' ? slide.cover : undefined
  const hints = interactionHints(slide, true)
  const siblings = slides.filter((s) => s.part === slide.part)

  return (
    <section>
      {cover ? (
        <header>
          <h1 className="text-[34px] font-black leading-[1.2] text-white">
            {cover.titleLead}
            <br />
            <span className="text-sky-300">{cover.titleAccent}</span>
          </h1>
          <p className="mt-3 text-[19px] font-bold text-slate-100">{cover.subtitle}</p>
          <p className="mt-2 text-emerald-300">{cover.audience}</p>
          <p className="mt-1 text-[14px] text-slate-400">{cover.source}</p>
          <p className="mt-4 rounded-xl border border-line bg-card px-4 py-3 text-[15px] text-slate-300">
            左右滑換頁，點下方中間的頁碼可以打開目錄、直接跳到想看的那一頁。看到
            <span className="mx-1 inline-flex items-center gap-1 rounded-md border border-dashed border-sky-500/60 bg-sky-950 px-1.5 text-sky-200">
              <Pointer className="size-3.5" aria-hidden />
              可以點
            </span>
            的地方都能互動。
          </p>
        </header>
      ) : (
        <header>
          <div className="flex flex-wrap items-center gap-2 text-[14px]">
            <span className="drawing-no inline-flex items-stretch overflow-hidden rounded-[4px] border border-ink/45 text-[13px] leading-none" title={`第 ${index + 1} 頁`}>
              <span className="px-1.5 py-1 font-bold text-ink">
                圖 {PART_NO[slide.part]}-{siblings.indexOf(slide) + 1}
              </span>
              <span className="border-l border-ink/30 px-1.5 py-1 text-ink-3">共 {siblings.length}</span>
            </span>
            <span className={cn('rounded-md border px-2 py-0.5 font-semibold', toneStyles[part.tone].chip)}>{part.short}</span>
            {slide.chapter && <span className="rounded-md border border-line px-2 py-0.5 font-semibold text-slate-300">{slide.chapter}</span>}
            {slide.source && <span className="rounded-md border border-line px-2 py-0.5 font-semibold text-slate-400">{SOURCE_LABEL[slide.source]}</span>}
            {slide.advanced && slide.part !== 'advanced' && <span className="rounded-md border border-amber-500/50 bg-amber-950 px-2 py-0.5 font-semibold text-amber-200">進階</span>}
            {slide.tier === 'ref' && <span className="rounded-md border border-line px-2 py-0.5 font-semibold text-slate-400">查閱</span>}
            {isNew(slide.added) && <span className="rounded-md bg-emerald-400 px-2 py-0.5 font-black text-paper">新</span>}
          </div>
          <h2 className="mt-2 text-[26px] font-black leading-[1.3] text-white">{slide.title}</h2>
          {hints.length > 0 && (
            <p className="mt-2 flex gap-1.5 rounded-lg border border-dashed border-sky-500/60 bg-sky-950 px-3 py-1.5 text-[15px] text-sky-200">
              <Pointer className="mt-1 size-4 shrink-0 text-sky-400" aria-hidden />
              <span>
                <b className="mr-1 text-sky-400">可以點</b>
                {hints.join('；')}
              </span>
            </p>
          )}
        </header>
      )}

      {slide.store && (
        <aside className="mt-4 rounded-[14px] border border-emerald-500/35 bg-emerald-950/70 p-4">
          <p className="flex items-center gap-2 font-bold text-emerald-200">
            <Store className="size-5" aria-hidden />
            門市實戰
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {slide.store.products.map((p) => (
              <span key={p} className="rounded-md border border-line bg-card px-2 py-0.5 text-[14px] text-slate-200">
                {p}
              </span>
            ))}
          </div>
          <p className="mt-2">{slide.store.tip}</p>
        </aside>
      )}

      <div className="mt-5 space-y-4">
        {slide.blocks.map((block, i) => (
          <MobileBlock key={i} block={block} />
        ))}
      </div>

      <aside className="mt-5 rounded-[14px] border border-line border-l-4 border-l-pipe-blue bg-card px-4 py-3">
        <p className="flex items-center gap-1.5 text-[15px] font-bold text-sky-300">
          <Pin className="size-4" aria-hidden />
          {slide.conclusion.label ?? '本章小結論'}
        </p>
        <p className="mt-1 font-semibold text-white">{slide.conclusion.text}</p>
      </aside>

      {PRACTICE[slide.id] && <MobilePractice id={slide.id} />}
    </section>
  )
}

/**
 * 手機版下方的懸浮膠囊（像 Instagram／iOS 26 分頁列）：上一頁・目錄＋頁碼・下一頁。
 * 鏡片平常停在中間（目前頁碼）；按下哪顆就滑過去，按住左右拖鏡片跟著手指、放開在哪顆就按哪顆。
 */
function MobileDock({ index, prev, next, onPrev, onNext, onMenu }: { index: number; prev?: SlideData; next?: SlideData; onPrev: () => void; onNext: () => void; onMenu: () => void }) {
  const lens = useLiquidLens({ liftScale: 1.1 })
  const bar = useRef<HTMLDivElement>(null)
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const actions = [onPrev, onMenu, onNext]
  const track = useLensTrack({ lens, container: bar, items, rest: 1, pressMoves: true, onCommit: (i) => actions[i]() })
  const setItem = (i: number) => (el: HTMLButtonElement | null) => {
    items.current[i] = el
  }
  return (
    <div
      ref={bar}
      data-no-swipe
      data-lens-group
      {...lensBindings(track)}
      className="glass pointer-events-auto relative grid h-[60px] w-full max-w-[440px] touch-none select-none grid-cols-[1fr_auto_1fr] items-center rounded-full px-2 [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
    >
      <LensView lens={lens} className="top-[7px] h-11" restClassName="bg-[rgba(15,36,64,0.07)]" />
      <button
        ref={setItem(0)}
        type="button"
        disabled={!prev}
        onClick={onPrev}
        aria-label={prev ? `上一頁：${prev.title}` : '上一頁（已經是第一頁）'}
        className={cn(capBtn, 'justify-self-start pl-2 pr-3 text-slate-200')}
      >
        <LensMagnify lens={lens} geom={track.geom} index={0} className="gap-0.5">
          <ChevronLeft className="size-6 shrink-0" aria-hidden />
          <span className="hidden min-[360px]:inline">上一頁</span>
        </LensMagnify>
      </button>
      <button ref={setItem(1)} type="button" onClick={onMenu} aria-label={`目錄：目前第 ${index + 1} 頁，共 ${TOTAL} 頁`} className={cn(capBtn, 'px-4 text-ink')}>
        <LensMagnify lens={lens} geom={track.geom} index={1} className="gap-2">
          <List className="size-5 shrink-0" aria-hidden />
          <span className="font-mono text-[16px] font-bold tabular-nums">
            <span className="text-sky-100">{pad(index + 1)}</span>
            <span className="text-slate-200"> / {pad(TOTAL)}</span>
          </span>
        </LensMagnify>
      </button>
      <button
        ref={setItem(2)}
        type="button"
        disabled={!next}
        onClick={onNext}
        aria-label={next ? `下一頁：${next.title}` : '下一頁（已經是最後一頁）'}
        className={cn(capBtn, 'justify-self-end pl-3 pr-2 text-sky-100')}
      >
        <LensMagnify lens={lens} geom={track.geom} index={2} className="gap-0.5">
          <span className="hidden min-[360px]:inline">下一頁</span>
          <ChevronRight className="size-6 shrink-0" aria-hidden />
        </LensMagnify>
      </button>
    </div>
  )
}

/** 手機版：每頁最下面的「學完馬上練」 */
function MobilePractice({ id }: { id: string }) {
  const learn = useLearn()
  return (
    <section className="mt-5 rounded-[14px] border border-sky-500/40 bg-sky-950/60 p-4" data-no-swipe>
      <p className="mb-3 flex items-center gap-2 text-[15px] font-bold text-sky-400">
        <PencilLine className="size-5" aria-hidden />
        學完馬上練
        {learn.done[id] && <span className="ml-auto rounded-md bg-emerald-950 px-2 py-0.5 text-[13px] text-emerald-200">已練過</span>}
      </p>
      <PracticeQuestion key={id} id={id} />
    </section>
  )
}
