import type { Variants } from 'framer-motion'

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** 子元素依序淡入 */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
}
