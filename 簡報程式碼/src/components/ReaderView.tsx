import { MotionConfig } from 'framer-motion'
import { Menu, Presentation } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DeckContext, type DeckApi } from '../context/deck'
import { slides } from '../data/slides'
import { pad } from '../lib/cn'
import { ChapterDrawer } from './ChapterDrawer'
import { SlideCard } from './SlideCard'

const scrollToId = (id: string) => document.getElementById(`reader-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

/** 手機閱讀模式：所有頁面單欄排列、上下捲動 */
export function ReaderView({ onExit }: { onExit: () => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(() => window.innerWidth)

  // 以捲動區實際寬度（扣掉捲軸）計算，避免出現左右捲動
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 排版寬度：手機直向 640、橫向 / 平板 1000，再等比例縮放到螢幕寬
  const design = width < 700 ? 640 : 1000
  const zoom = width / design

  const api = useMemo<DeckApi>(
    () => ({ goToId: scrollToId, numberOf: (id) => slides.findIndex((s) => s.id === id) + 1 }),
    [],
  )

  return (
    <MotionConfig reducedMotion="user">
      <DeckContext.Provider value={api}>
        <div ref={scrollerRef} className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-navy-950 text-slate-100">
          <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-white/10 bg-navy-900/95 px-3 backdrop-blur">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-sm font-bold text-slate-100"
            >
              <Menu className="size-4" aria-hidden />
              目錄
            </button>
            <p className="min-w-0 flex-1 truncate text-sm font-bold">冷凍材料行培訓筆記</p>
            <button
              type="button"
              onClick={onExit}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-sky-400/40 bg-sky-400/10 px-2.5 text-sm font-bold text-sky-100"
            >
              <Presentation className="size-4" aria-hidden />
              簡報模式
            </button>
          </header>
          <div className="reader mx-auto pb-10" style={{ width: design, zoom }}>
            {slides.map((slide, i) => (
              <section
                key={slide.id}
                id={`reader-${slide.id}`}
                className="blueprint-grid relative mx-3 my-4 overflow-hidden rounded-[22px] border border-white/10 bg-navy-900"
                style={{ scrollMarginTop: 56 / zoom }}
              >
                <span className="absolute right-4 top-3 z-10 font-mono text-[14px] text-slate-500">
                  {pad(i + 1)} / {pad(slides.length)}
                </span>
                <SlideCard slide={slide} />
              </section>
            ))}
          </div>
        </div>
        <ChapterDrawer
          open={drawerOpen}
          index={-1}
          onClose={() => setDrawerOpen(false)}
          onSelect={(i) => {
            setDrawerOpen(false)
            scrollToId(slides[i].id)
          }}
        />
      </DeckContext.Provider>
    </MotionConfig>
  )
}
