import { defineConfig, type Plugin, type UserConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** 完整上課錄音的檔名（src/assets/class-1005-part1.m4a 這種） */
const CLASS_AUDIO_FILE = /class-\d{4}-part/

/** 公司版專用頁（companyOnly.tsx）的標記（壓縮後是 companyOnly:!0）或標題：公開網站輸出出現就失敗 */
const COMPANY_MARK = /同等級代替表|companyOnly:\s*(?:!0|true)/

/**
 * 公開網站的保險（10/10 code review）：輸出裡只要出現完整錄音的檔案或網址，建置直接失敗，
 * 不會因為有人改了 import 寫法就把錄音放上公開網站。10/17 加：公司版專用頁也一樣。
 */
const noClassAudio = (): Plugin => ({
  name: 'no-class-audio',
  apply: 'build',
  generateBundle(_, bundle) {
    for (const [file, out] of Object.entries(bundle)) {
      const code = out.type === 'chunk' ? out.code : typeof out.source === 'string' ? out.source : ''
      if (CLASS_AUDIO_FILE.test(file) || CLASS_AUDIO_FILE.test(code)) {
        this.error(`公開網站不能有完整上課錄音：${file}（錄音只放公司版、離線檔）`)
      }
      if (COMPANY_MARK.test(code)) this.error(`公開網站不能有公司版專用頁：${file}（companyOnly.tsx）`)
    }
  },
})

/**
 * mode 'pages'（npm run build:pages，公開網站）：完整上課錄音換成空的（classAudio.public.ts），
 * 錄音只留在公司版（build:company）、離線檔（build:offline）和本機開發。
 */
export const makeConfig = (mode: string): UserConfig => ({
  plugins: [react(), tailwindcss(), ...(mode === 'pages' ? [noClassAudio()] : [])],
  resolve: {
    alias:
      mode === 'pages'
        ? [
            {
              // ./classAudio、../data/classAudio、./classAudio.ts 都攔
              find: /^(?:\.{1,2}\/)+(?:data\/)?classAudio(?:\.ts)?$/,
              replacement: fileURLToPath(new URL('./src/data/classAudio.public.ts', import.meta.url)),
            },
            {
              find: /^(?:\.{1,2}\/)+(?:data\/)?companyOnly(?:\.tsx)?$/,
              replacement: fileURLToPath(new URL('./src/data/companyOnly.public.tsx', import.meta.url)),
            },
          ]
        : [],
  },
})

export default defineConfig(({ mode }) => makeConfig(mode))
