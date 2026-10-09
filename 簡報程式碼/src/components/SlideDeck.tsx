import { AnimatePresence, MotionConfig, MotionGlobalConfig, motion, type Variants } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { DeckContext, type DeckApi } from '../context/deck'
import { parts } from '../data/parts'
import { slides } from '../data/slides'
import { useDeckKeyboard } from '../hooks/useDeckKeyboard'
import { useFitStage } from '../hooks/useFitScale'
import { useFullscreen } from '../hooks/useFullscreen'
import { useReaderMode } from '../hooks/useReaderMode'
import { interactionHints } from '../lib/interactions'
import { MobileDeck } from './MobileDeck'
import { ChapterDrawer } from './ChapterDrawer'
import { ProgressBar } from './ProgressBar'
import { SearchPanel } from './SearchPanel'
import { ProgressPanel } from './ProgressPanel'
import { markSeen } from '../lib/learn'
import { SlideCard } from './SlideCard'
import { SlideNav } from './SlideNav'
import { FrostBackground } from './ui/FrostBackground'

/** 排版檢查模式（網址加 ?audit）：不播換頁動畫，視窗在背景時量測也準 */
const AUDIT = typeof location !== 'undefined' && new URLSearchParams(location.search).has('audit')
if (AUDIT) MotionGlobalConfig.skipAnimations = true

/** 設計畫布：高度固定 1080，寬度依螢幕比例在 1920～2240 之間調整後等比例縮放 */
const STAGE_H = 1080
const STAGE_MIN_W = 1920
const STAGE_MAX_W = 2240
const TOTAL = slides.length

const clamp = (n: number) => Math.min(Math.max(n, 0), TOTAL - 1)

/** 手指下面（或上層）有可以左右捲動的東西（表格、橫向清單）：在那裡滑是要捲動，不是換頁 */
function hasHorizontalScroll(el: HTMLElement | null) {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    const ox = getComputedStyle(n).overflowX
    if ((ox === 'auto' || ox === 'scroll') && n.scrollWidth > n.clientWidth + 2) return true
  }
  return false
}

function indexFromHash() {
  const match = /^#\/(\d+)$/.exec(window.location.hash)
  return match ? clamp(Number(match[1]) - 1) : 0
}

const slideVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 90 : -90 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -90 : 90, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }),
}

export function SlideDeck() {
  const [reader, setReader] = useReaderMode()
  const [page, setPage] = useState(() => ({ index: indexFromHash(), dir: 0 }))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [progressOpen, setProgressOpen] = useState(false)
  /** 從頁內連結跳轉前所在的頁，用來顯示「返回」按鈕 */
  const [returnTo, setReturnTo] = useState<number | null>(null)
  const indexRef = useRef(page.index)
  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const stageRef = useRef<HTMLDivElement>(null)
  const { width: STAGE_W, scale } = useFitStage(stageRef, STAGE_H, STAGE_MIN_W, STAGE_MAX_W)
  const touchStart = useRef<{ x: number; y: number; t: number; multi: boolean } | null>(null)

  const goTo = useCallback((target: number) => {
    setPage((prev) => {
      const index = clamp(target)
      return index === prev.index ? prev : { index, dir: index > prev.index ? 1 : -1 }
    })
  }, [])

  const step = useCallback((delta: number) => {
    setPage((prev) => {
      const index = clamp(prev.index + delta)
      return index === prev.index ? prev : { index, dir: delta }
    })
  }, [])

  const next = useCallback(() => step(1), [step])
  const prev = useCallback(() => step(-1), [step])
  const first = useCallback(() => goTo(0), [goTo])
  const last = useCallback(() => goTo(TOTAL - 1), [goTo])
  const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const toggleSearch = useCallback(() => setSearchOpen((o) => !o), [])
  /** 搜尋結果跳頁：記住原本在哪一頁，可以「返回」 */
  const jumpTo = useCallback(
    (i: number) => {
      if (i === indexRef.current) return
      setReturnTo(indexRef.current)
      goTo(i)
    },
    [goTo],
  )

  const showBack = returnTo !== null && returnTo !== page.index
  const goBack = useCallback(() => {
    if (returnTo === null) return
    goTo(returnTo)
    setReturnTo(null)
  }, [returnTo, goTo])

  useDeckKeyboard({ next, prev, first, last, toggleFullscreen, toggleDrawer, closeDrawer, back: goBack, toggleSearch })

  // 頁碼同步到網址（#/5），重新整理後停留在同一頁
  useEffect(() => {
    indexRef.current = page.index
    const hash = `#/${page.index + 1}`
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash)
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
    }),
    [goTo],
  )

  /**
   * 手機、平板左右滑換頁：只有「明確、夠長、快速的單指橫向滑動」才算。
   * 不算：兩指縮放、畫面放大中、在 3D／滑桿／輸入框／可橫向捲動的地方滑、滑得太短、斜著滑、慢慢拖。
   */
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
    if (!start || start.multi || (window.visualViewport?.scale ?? 1) > 1.05) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    const far = Math.abs(dx) > Math.max(110, window.innerWidth * 0.22)
    const straight = Math.abs(dx) > Math.abs(dy) * 2.5
    const quick = Date.now() - start.t < 650
    if (far && straight && quick) step(dx < 0 ? 1 : -1)
  }

  const slide = slides[page.index]
  const part = parts[slide.part]

  if (reader) return <MobileDeck onExit={() => setReader(false)} />

  return (
    <MotionConfig reducedMotion={AUDIT ? 'always' : 'user'}>
      <DeckContext.Provider value={api}>
        <div className="flex h-dvh w-full flex-col bg-navy-950 text-slate-100">
          <ProgressBar index={page.index} total={TOTAL} />

          <main className="relative min-h-0 flex-1" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <div ref={stageRef} className="absolute inset-2 sm:inset-3" />
            <div
              className="absolute left-1/2 top-1/2 overflow-clip rounded-[14px] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)]"
              style={{ width: STAGE_W * scale, height: STAGE_H * scale, transform: 'translate(-50%, -50%)' }}
              // 畫布是縮放過的，瀏覽器會誤以為下方按鈕在可視範圍外而捲動；overflow-clip 不能捲，這裡再保險歸零
              onScroll={(e) => {
                e.currentTarget.scrollTop = 0
                e.currentTarget.scrollLeft = 0
              }}
            >
              <div
                className="deck-hover relative origin-top-left bg-[#081526]"
                style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
              >
                <FrostBackground />
                {AUDIT ? (
                  <div className="absolute inset-0">
                    <SlideCard key={slide.id} slide={slide} />
                  </div>
                ) : (
                  <AnimatePresence initial={false} custom={page.dir}>
                    <motion.div
                      key={slide.id}
                      custom={page.dir}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute inset-0"
                      aria-roledescription="slide"
                      aria-label={`第 ${page.index + 1} 頁，共 ${TOTAL} 頁：${slide.title}`}
                    >
                      <SlideCard slide={slide} />
                    </motion.div>
                  </AnimatePresence>
                )}
                {/* 投影片內的放大檢視等覆蓋層（跟著畫布等比例縮放） */}
                <div id="canvas-overlay" className="pointer-events-none absolute inset-0 z-40" />
              </div>
            </div>
          </main>

          <SlideNav
            index={page.index}
            total={TOTAL}
            partLabel={part.label}
            title={slide.title}
            isFullscreen={isFullscreen}
            onPrev={prev}
            onNext={next}
            onGoTo={goTo}
            onOpenMenu={() => setDrawerOpen(true)}
            onSearch={() => setSearchOpen(true)}
            onProgress={() => setProgressOpen(true)}
            onToggleFullscreen={toggleFullscreen}
            back={showBack && returnTo !== null ? { number: returnTo + 1, title: slides[returnTo].title } : null}
            onBack={goBack}
            onReader={() => setReader(true)}
            hints={interactionHints(slide)}
          />

          <ChapterDrawer
            open={drawerOpen}
            index={page.index}
            onClose={closeDrawer}
            onSelect={(i) => {
              goTo(i)
              setDrawerOpen(false)
            }}
          />
          <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} onSelect={jumpTo} />
          <ProgressPanel open={progressOpen} onClose={() => setProgressOpen(false)} onSelect={goTo} />
        </div>
      </DeckContext.Provider>
    </MotionConfig>
  )
}
