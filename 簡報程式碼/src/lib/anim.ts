import { gsap } from 'gsap'

/**
 * GSAP 動畫（10/18 使用者：「gsap-skills 也要」）。只做幫助理解的：數字跑到結果、新的地方閃一下、手機往下滑卡片浮上來。
 * 規則：只動 transform／opacity（outline-offset 例外，是紅框本身）、0.2～0.6 秒；「減少動態效果」或排版檢查（?audit）就不動。
 */
const audit = typeof location !== 'undefined' && new URLSearchParams(location.search).has('audit')
export const still = () => audit || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)

/** 「12,000」「> 4」「0.5」：拆成前綴、數字、後綴；不是數字就回 null */
export function parseNum(text: string) {
  // 型號（R404A）、日期（2026/1/1）不算：前面不能有英文字母，後面不能再有數字
  const m = text.match(/^([^\dA-Za-z-]*)(-?[\d,]*\.?\d+)([^\d]*)$/)
  if (!m) return null
  const n = Number(m[2].replace(/,/g, ''))
  if (!Number.isFinite(n)) return null
  const decimals = m[2].includes('.') ? m[2].split('.')[1].length : 0
  return { pre: m[1], n, post: m[3], decimals, comma: m[2].includes(',') }
}

const fmt = (v: number, p: NonNullable<ReturnType<typeof parseNum>>) =>
  p.pre + (p.comma ? v.toLocaleString('en-US', { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals }) : v.toFixed(p.decimals)) + p.post

/** 數字從 from 跑到 text；回傳清除函式 */
export function countTo(el: HTMLElement, text: string, from = 0) {
  const p = parseNum(text)
  if (!p || still()) {
    el.textContent = text
    return () => {}
  }
  const obj = { v: from }
  // 先寫起始值：分頁在背景時畫面不更新（requestAnimationFrame 暫停），不能讓數字空白
  el.textContent = fmt(from, p)
  const tween = gsap.to(obj, {
    v: p.n,
    duration: Math.min(0.9, 0.35 + Math.log10(Math.abs(p.n) + 1) * 0.12),
    ease: 'power2.out',
    onUpdate: () => {
      el.textContent = fmt(obj.v, p)
    },
    onComplete: () => {
      el.textContent = text
    },
  })
  return () => {
    tween.kill()
    el.textContent = text
  }
}

/** 頁面裡改過的地方（.new-frame）：紅框從外面收進來、依序閃一下（「圈出新的」開著才會看到框）；結束回到 CSS 的位置 */
export function flashNew(root: Element | null) {
  if (!root || still() || !document.documentElement.classList.contains('show-new')) return () => {}
  const els = root.querySelectorAll<HTMLElement>('.new-frame')
  if (!els.length) return () => {}
  const tween = gsap.from(els, { outlineOffset: 10, duration: 0.5, ease: 'power2.out', stagger: 0.08, delay: 0.35, overwrite: 'auto', clearProps: 'outlineOffset' })
  return () => {
    tween.kill()
    gsap.set(els, { clearProps: 'outlineOffset' })
  }
}

/**
 * 手機版：往下滑時，內容一塊一塊浮上來（第一個畫面已經看到的不動）。
 * 用 IntersectionObserver：看的是「現在」的位置，上面的內容收合、變短也不會有區塊一直藏著（10/18 code review）。
 * 浮上來之後把 transform／opacity 清掉，不留 stacking context（浮層才不會被下一塊蓋住）。
 */
export function revealOnScroll(scroller: HTMLElement | null, items: HTMLElement[]) {
  if (!scroller || still() || !items.length || typeof IntersectionObserver === 'undefined') return () => {}
  const bottom = scroller.getBoundingClientRect().bottom
  const below = items.filter((el) => el.getBoundingClientRect().top > bottom)
  if (!below.length) return () => {}
  gsap.set(below, { opacity: 0, y: 24 })
  const io = new IntersectionObserver(
    (entries) => {
      const shown = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement)
      if (!shown.length) return
      shown.forEach((el) => io.unobserve(el))
      gsap.to(shown, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.07, overwrite: 'auto', clearProps: 'transform,opacity' })
    },
    { root: scroller, rootMargin: '0px 0px -8% 0px' },
  )
  below.forEach((el) => io.observe(el))
  return () => {
    io.disconnect()
    gsap.killTweensOf(below)
    gsap.set(below, { clearProps: 'transform,opacity' })
  }
}
