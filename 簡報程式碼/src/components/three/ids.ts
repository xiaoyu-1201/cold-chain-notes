import type { Part3DId } from './models'

/** 有 3D 模型的零件（不引入 three，避免拖慢首頁） */
const IDS: Part3DId[] = ['comp', 'cond', 'txv', 'evap', 'oub', 'kp15', 'receiver', 'gbc', 'dml', 'sgi', 'evr', 'tc', 'acc', 'flare', 'fittings', 'insul']

/** 講義熱點 id → 3D 模型 id */
const ALIASES: Record<string, Part3DId> = { te: 'txv', ekc331: 'tc', drier: 'dml' }

export function part3DFor(id: string): Part3DId | null {
  if (id in ALIASES) return ALIASES[id]
  return (IDS as string[]).includes(id) ? (id as Part3DId) : null
}
