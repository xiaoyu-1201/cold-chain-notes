import { useEffect } from 'react'

/**
 * 單顆玻璃按鈕的「果凍拖動」（10/10，iOS 26）：按住往旁邊拖，按鈕往拖的方向變形——位移最多 6px、拉長最多 1.08、
 * 上下稍微壓扁；放開用 CSS 彈簧曲線回彈。拖出按鈕範圍再放開＝取消（擋掉那一下 click）。
 *   - 整個網頁只有一組 document 事件（委派），不讓 React 重新 render；只改 transform，閒置時 rAF 停。
 *   - 上下滑先動＝在捲頁面，不接手；只有水平拖才變形（手機左右滑換頁照常：換頁用的是 touch 事件）。
 *   - 一排按鈕（[data-lens-group]）交給液態玻璃鏡片，不在這裡處理。
 *   - 電腦版縮放畫布：位移換算成按鈕自己的座標（除以縮放比例）。
 *   - 減少動態效果時不做。
 */
const EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

type State = { el: HTMLElement; id: number; x0: number; y0: number; k: number; mode: 'wait' | 'drag'; dx: number; raf: number }

export function useGlassJelly() {
  useEffect(() => {
    let s: State | null = null
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const paint = () => {
      if (!s) return
      s.raf = 0
      const n = Math.tanh(s.dx / 48)
      const m = Math.abs(n)
      s.el.style.transform = `translateX(${(6 * n).toFixed(2)}px) scale(${(1 + 0.08 * m).toFixed(3)}, ${(1 - 0.04 * m).toFixed(3)})`
    }

    const blockClick = (el: HTMLElement) => {
      const block = (ev: Event) => {
        // 鍵盤產生的 click 不擋
        if ((ev as MouseEvent).detail === 0) return
        ev.stopImmediatePropagation()
        ev.preventDefault()
      }
      const remove = () => {
        el.removeEventListener('click', block, true)
        document.removeEventListener('pointerdown', remove, true)
      }
      el.addEventListener('click', block, { capture: true, once: true })
      document.addEventListener('pointerdown', remove, { capture: true, once: true })
      window.setTimeout(remove, 400)
    }

    const release = (cancelClick: boolean) => {
      const cur = s
      if (!cur) return
      s = null
      if (cur.raf) cancelAnimationFrame(cur.raf)
      if (cur.mode === 'drag') {
        const el = cur.el
        // transform（果凍）和 scale（按下放大 1.035）都用彈簧曲線回彈，不要直接跳回
        el.style.transition = `transform 0.5s ${EASE}, scale 0.42s ${EASE}`
        el.style.transform = ''
        const done = (ev?: TransitionEvent) => {
          if (ev && (ev.target !== el || ev.propertyName !== 'transform')) return
          el.style.transition = ''
          el.removeEventListener('transitionend', done)
        }
        el.addEventListener('transitionend', done)
        // 背景分頁 transition 不會跑完：時間到一定清掉
        window.setTimeout(() => done(), 650)
      }
      if (cancelClick) blockClick(cur.el)
    }

    const down = (e: PointerEvent) => {
      if (s || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0) || reduced.matches) return
      const el = (e.target as Element | null)?.closest?.('button') as HTMLButtonElement | null
      if (!el || el.disabled || el.closest('[data-lens-group], [data-no-jelly]')) return
      // 卡片型的大按鈕（整列、翻卡、「學完馬上練」方塊）不做
      if (el.classList.contains('w-full') || el.offsetWidth > 420 || el.offsetHeight > 100) return
      const r = el.getBoundingClientRect()
      s = { el, id: e.pointerId, x0: e.clientX, y0: e.clientY, k: r.width ? el.offsetWidth / r.width : 1, mode: 'wait', dx: 0, raf: 0 }
    }

    const move = (e: PointerEvent) => {
      if (!s || e.pointerId !== s.id) return
      if (e.pointerType === 'mouse' && e.buttons === 0) return release(false)
      const dx = e.clientX - s.x0
      const dy = e.clientY - s.y0
      if (s.mode === 'wait') {
        const slop = e.pointerType === 'mouse' ? 4 : 10
        if (Math.abs(dy) > slop && Math.abs(dy) >= Math.abs(dx)) {
          s = null // 在捲頁面
          return
        }
        if (Math.abs(dx) <= slop) return
        s.mode = 'drag'
        s.el.style.transition = 'none'
      }
      s.dx = dx * s.k
      if (!s.raf) s.raf = requestAnimationFrame(paint)
    }

    const up = (e: PointerEvent) => {
      if (!s || e.pointerId !== s.id) return
      const r = s.el.getBoundingClientRect()
      const pad = 8
      const outside = e.clientX < r.left - pad || e.clientX > r.right + pad || e.clientY < r.top - pad || e.clientY > r.bottom + pad
      release(s.mode === 'drag' && outside)
    }
    const cancel = (e: PointerEvent) => {
      if (s && e.pointerId === s.id) release(false)
    }

    const opts = { capture: true, passive: true } as const
    document.addEventListener('pointerdown', down, opts)
    document.addEventListener('pointermove', move, opts)
    document.addEventListener('pointerup', up, opts)
    document.addEventListener('pointercancel', cancel, opts)
    return () => {
      release(false)
      document.removeEventListener('pointerdown', down, opts)
      document.removeEventListener('pointermove', move, opts)
      document.removeEventListener('pointerup', up, opts)
      document.removeEventListener('pointercancel', cancel, opts)
    }
  }, [])
}
