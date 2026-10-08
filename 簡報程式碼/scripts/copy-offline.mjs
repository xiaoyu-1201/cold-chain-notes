// 把離線單檔版複製到筆記資料夾（與講義、錄音檔放在一起，錄音才能播放）
import { copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const src = fileURLToPath(new URL('../offline/index.html', import.meta.url))
const dest = fileURLToPath(new URL('../../冷凍材料行培訓筆記.html', import.meta.url))

copyFileSync(src, dest)
console.log(`離線版已輸出：${dest}`)
