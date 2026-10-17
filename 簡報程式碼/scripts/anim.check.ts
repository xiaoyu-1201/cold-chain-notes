// 數字跑動的自我檢查：node scripts/anim.check.ts
import assert from 'node:assert/strict'
import { countTo, parseNum } from '../src/lib/anim.ts'

assert.equal(parseNum('12,000')?.n, 12000)
assert.equal(parseNum('> 4')?.pre, '> ')
assert.equal(parseNum('0.5')?.decimals, 1)
assert.equal(parseNum('≤100°C')?.post, '°C')
assert.equal(parseNum('R404A'), null) // 型號不跑
assert.equal(parseNum('2026/1/1'), null) // 日期不跑
assert.equal(parseNum('冷藏'), null)

const el = { textContent: '' } as HTMLElement
countTo(el, '12,000', 0)
assert.equal(el.textContent, '0') // 一開始就有字，不會空白
await new Promise((r) => setTimeout(r, 1200))
assert.equal(el.textContent, '12,000') // 最後一定停在原本的字
console.log('anim ok')
