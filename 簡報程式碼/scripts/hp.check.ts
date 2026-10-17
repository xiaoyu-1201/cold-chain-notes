// 幾匹換算的自我檢查：node scripts/hp.check.ts
import assert from 'node:assert/strict'
import { condFor, readModel, sayHp } from '../src/lib/hp.ts'
assert.deepEqual(readModel('5520')?.btu, 20000)
assert.equal(readModel('5520')?.temp, 'high')
assert.equal(readModel('4500'), null)
assert.equal(readModel('5400'), null)
assert.equal(readModel('7512')?.temp, 'mid')
assert.equal(readModel('2446')?.btu, 4600)
assert.equal(readModel('2446')?.temp, 'low')
assert.equal(readModel('12345'), null)
assert.equal(sayHp(13000 / 12000), '一匹足')
assert.equal(sayHp(10300 / 12000), '八分之七') // 老闆：一萬 BTU 左右講八分之七
assert.equal(sayHp(0.8), '四分之三足')
assert.equal(sayHp(1), '一匹')
assert.equal(condFor(1.25), 2.5)
assert.equal(condFor(0.5), 1)
assert.equal(condFor(1.333), 2.5) // 老闆：1.33 匹也配 2.5 匹（差一點點不計較）
assert.equal(condFor(0.6), 1.25) // 老闆：2150（約 0.6 匹）配 1¼ 匹
console.log('hp ok')