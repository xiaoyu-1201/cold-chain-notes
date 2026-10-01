import { AnimatePresence, MotionConfig, motion, type Variants } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { DeckContext, type DeckApi } from '../context/deck'
import { parts } from '../data/parts'
import { slides } from '../data/slides'
import { useDeckKeyboard } from '../hooks/useDeckKeyboard'
import { useFitScale } from '../hooks/useFitScale'
import { useFullscreen } from '../hooks/useFullscreen'
import { useReaderMode } from '../hooks/useReaderMode'
import { ReaderView } from './ReaderView'
import { ChapterDrawer } from './ChapterDrawer'
import { ProgressBar } from './ProgressBar'
import { SlideCard } from './SlideCard'
import { SlideNav } from './SlideNav'

/** 設計畫布尺寸：所有投影片以 1920×1080 排版後等比例縮放 */
const STAGE_W = 1920
const STAGE_H = 1080
const TOTAL = slides.length

const clamp = (n: number) => Math.min(Math.max(n, 0), TOTAL - 1)

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
  /** 從頁內連結跳轉前所在的頁，用來顯示「返回」按鈕 */
  const [returnTo, setReturnTo] = useState<number | null>(null)
  const indexRef = useRef(page.index)
  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const stageRef = useRef<HTMLDivElement>(null)
  const scale = useFitScale(stageRef, STAGE_W, STAGE_H)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

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

  const showBack = returnTo !== null && returnTo !== page.index
  const goBack = useCallback(() => {
    if (returnTo === null) return
    goTo(returnTo)
    setReturnTo(null)
  }, [returnTo, goTo])

  useDeckKeyboard({ next, prev, first, last, toggleFullscreen, toggleDrawer, closeDrawer, back: goBack })

  // 頁碼同步到網址（#/5），重新整理後停留在同一頁
  useEffect(() => {
    indexRef.current = page.index
    const hash = `#/${page.index + 1}`
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash)
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

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1)
  }

  const slide = slides[page.index]
  const part = parts[slide.part]

  if (reader) return <ReaderView onExit={() => setReader(false)} />

  return (
    <MotionConfig reducedMotion="user">
      <DeckContext.Provider value={api}>
        <div className="flex h-dvh w-full flex-col bg-navy-950 text-slate-100">
          <ProgressBar index={page.index} total={TOTAL} />

          <main className="relative min-h-0 flex-1" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div ref={stageRef} className="absolute inset-2 sm:inset-3" />
            <div
              className="absolute left-1/2 top-1/2 overflow-hidden rounded-[14px] border border-white/[0.06] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)]"
              style={{ width: STAGE_W * scale, height: STAGE_H * scale, transform: 'translate(-50%, -50%)' }}
            >
              <div
                className="blueprint-grid relative origin-top-left bg-navy-900"
                style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_-10%,rgba(56,189,248,0.16),transparent_55%),radial-gradient(ellipse_at_-5%_110%,rgba(99,102,241,0.12),transparent_50%)]"
                />
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
            onToggleFullscreen={toggleFullscreen}
            back={showBack && returnTo !== null ? { number: returnTo + 1, title: slides[returnTo].title } : null}
            onBack={goBack}
            onReader={() => setReader(true)}
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
        </div>
      </DeckContext.Provider>
    </MotionConfig>
  )
}
