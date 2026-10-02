import { MotionConfig } from 'framer-motion'
import { Menu, Pin, Pointer, Presentation, Store } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { DeckContext, type DeckApi } from '../context/deck'
import { parts } from '../data/parts'
import { slides } from '../data/slides'
import type { SlideData } from '../data/types'
import { cn, pad } from '../lib/cn'
import { interactionHints } from '../lib/interactions'
import { toneStyles } from '../lib/tone'
import { ChapterDrawer } from './ChapterDrawer'
import { MobileBlock } from './mobile/MobileBlocks'
import { SOURCE_LABEL } from './SlideCard'
import { FrostBackground } from './ui/FrostBackground'

const scrollToId = (id: string) => document.getElementById(`reader-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

/** 手機閱讀模式：實際字級的單欄文章排版，上下捲動 */
export function ReaderView({ onExit }: { onExit: () => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const api = useMemo<DeckApi>(
    () => ({ goToId: scrollToId, numberOf: (id) => slides.findIndex((s) => s.id === id) + 1 }),
    [],
  )

  return (
    <MotionConfig reducedMotion="user">
      <DeckContext.Provider value={api}>
        <div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#081526] text-[17px] leading-[1.7] text-slate-200">
          <FrostBackground fixed className="-z-10" />
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-white/10 bg-[#0b1d33]/90 px-3 backdrop-blur">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[16px] font-bold text-slate-100"
            >
              <Menu className="size-5" aria-hidden />
              目錄
            </button>
            <p className="min-w-0 flex-1 truncate text-center text-[16px] font-bold text-white">冷凍材料行培訓筆記</p>
            <button
              type="button"
              onClick={onExit}
              aria-label="切換到簡報模式"
              className="flex h-10 items-center gap-1.5 rounded-lg border border-sky-400/40 bg-sky-400/10 px-3 text-[15px] font-bold text-sky-100"
            >
              <Presentation className="size-5" aria-hidden />
              簡報
            </button>
          </header>
          <main className="deck-hover mx-auto max-w-[720px] pb-16">
            {slides.map((slide, i) => {
              const part = parts[slide.part]
              const firstOfPart = i > 0 && slides[i - 1].part !== slide.part
              return (
                <Fragment key={slide.id}>
                  {/* 篇章分段：先說這一篇學完要會什麼 */}
                  {firstOfPart && (
                    <div className={cn('mx-4 mt-8 rounded-2xl border-l-4 px-4 py-3', toneStyles[part.tone].soft, toneStyles[part.tone].border)}>
                      <p className={cn('text-[14px] font-bold', toneStyles[part.tone].text)}>{part.ordinal}</p>
                      <p className="text-[22px] font-black text-white">{part.title}</p>
                      {part.goal && (
                        <p className="mt-1 text-[15px] text-slate-300">
                          <b className={cn('mr-2', toneStyles[part.tone].text)}>學完你會</b>
                          {part.goal}
                        </p>
                      )}
                    </div>
                  )}
                  <MobileSlide slide={slide} index={i} />
                </Fragment>
              )
            })}
          </main>
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

function MobileSlide({ slide, index }: { slide: SlideData; index: number }) {
  const part = parts[slide.part]
  const cover = slide.layout === 'cover' ? slide.cover : undefined
  const hints = interactionHints(slide, true)

  return (
    <section id={`reader-${slide.id}`} className="border-b border-white/10 px-4 py-8" style={{ scrollMarginTop: 56 }}>
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
          <p className="mt-4 rounded-xl bg-white/[0.05] px-4 py-3 text-[15px] text-slate-300">
            往下滑閱讀；左上角「目錄」可以直接跳到想看的章節。看到
            <span className="mx-1 inline-flex items-center gap-1 rounded-md border border-dashed border-sky-400/50 bg-sky-400/10 px-1.5 text-sky-100">
              <Pointer className="size-3.5" aria-hidden />
              可以點
            </span>
            的地方都能互動。
          </p>
        </header>
      ) : (
        <header>
          <div className="flex flex-wrap items-center gap-2 text-[14px]">
            <span className="font-mono text-slate-500">{pad(index + 1)}</span>
            <span className={cn('rounded-md border px-2 py-0.5 font-semibold', toneStyles[part.tone].chip)}>{part.short}</span>
            {slide.chapter && <span className="rounded-md border border-white/15 px-2 py-0.5 font-semibold text-slate-300">{slide.chapter}</span>}
            {slide.source && <span className="rounded-md border border-white/15 px-2 py-0.5 font-semibold text-slate-400">{SOURCE_LABEL[slide.source]}</span>}
            {slide.advanced && <span className="rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 font-semibold text-amber-200">進階</span>}
          </div>
          <h2 className="mt-2 text-[26px] font-black leading-[1.3] text-white">{slide.title}</h2>
          {hints.length > 0 && (
            <p className="mt-2 flex gap-1.5 rounded-lg border border-dashed border-sky-400/50 bg-sky-400/10 px-3 py-1.5 text-[15px] text-sky-100">
              <Pointer className="mt-1 size-4 shrink-0 text-sky-300" aria-hidden />
              <span>
                <b className="mr-1 text-sky-300">可以點</b>
                {hints.join('；')}
              </span>
            </p>
          )}
        </header>
      )}

      {slide.store && (
        <aside className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/[0.07] p-4">
          <p className="flex items-center gap-2 font-bold text-emerald-200">
            <Store className="size-5" aria-hidden />
            門市實戰
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {slide.store.products.map((p) => (
              <span key={p} className="rounded-md bg-white/[0.07] px-2 py-0.5 text-[14px] text-slate-200">
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

      <aside className="mt-5 rounded-2xl border-l-4 border-sky-300 bg-sky-500/[0.1] px-4 py-3">
        <p className="flex items-center gap-1.5 text-[15px] font-bold text-sky-200">
          <Pin className="size-4" aria-hidden />
          {slide.conclusion.label ?? '本章小結論'}
        </p>
        <p className="mt-1 font-semibold text-white">{slide.conclusion.text}</p>
      </aside>
    </section>
  )
}
