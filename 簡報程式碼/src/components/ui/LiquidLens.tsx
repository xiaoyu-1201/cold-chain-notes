import { motion, useTransform } from 'framer-motion'
import type { ReactNode, RefObject } from 'react'
import { useLensMagnify, type LensGeom, type LiquidLens } from '../../hooks/useLiquidLens'
import { cn } from '../../lib/cn'

/**
 * 鏡片本體：放在容器裡當第一個子元素（容器要 relative）。
 * 平常＝restClassName 的淡色底＋白色反光邊；按住／拖動時淡入更亮的玻璃（.liquid-lens）並稍微放大。
 * ghost：平常不顯示，只有按住時才出現（一排按鈕）。vertical：上下位置也跟著項目走（按鈕會換行時）。
 */
export function LensView({ lens, className, restClassName, ghost = false, vertical = false }: { lens: LiquidLens; className?: string; restClassName?: string; ghost?: boolean; vertical?: boolean }) {
  const restOpacity = useTransform(lens.a, [0, 1], [1, 0])
  return (
    <motion.span
      aria-hidden
      className={cn('pointer-events-none absolute left-0 rounded-full', vertical && 'top-0', className)}
      style={{
        x: lens.left,
        width: lens.w,
        ...(vertical ? { y: lens.top, height: lens.h } : null),
        scaleX: lens.reduced ? 1 : lens.scaleX,
        scaleY: lens.reduced ? 1 : lens.scaleY,
        opacity: ghost ? lens.a : 1,
      }}
    >
      {!ghost && <motion.span className={cn('liquid-lens-rest absolute inset-0 rounded-full', restClassName)} style={{ opacity: restOpacity }} />}
      <motion.span className="liquid-lens absolute inset-0 rounded-full" style={{ opacity: ghost ? 1 : lens.a }} />
    </motion.span>
  )
}

/** 包住項目的字／圖示：鏡片經過時稍微放大 */
export function LensMagnify({ lens, geom, index, className, children }: { lens: LiquidLens; geom: RefObject<LensGeom[]>; index: number; className?: string; children: ReactNode }) {
  const scale = useLensMagnify(lens, geom, index)
  return (
    <motion.span className={cn('inline-flex items-center', className)} style={{ scale }}>
      {children}
    </motion.span>
  )
}
