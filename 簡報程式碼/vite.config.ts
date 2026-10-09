import { defineConfig, type UserConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * mode 'pages'（npm run build:pages，公開網站）：完整上課錄音換成空的（classAudio.public.ts），
 * 錄音只留在離線檔（build:offline）和本機開發。
 */
export const makeConfig = (mode: string): UserConfig => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias:
      mode === 'pages'
        ? [{ find: /^\.\/classAudio$/, replacement: fileURLToPath(new URL('./src/data/classAudio.public.ts', import.meta.url)) }]
        : [],
  },
})

export default defineConfig(({ mode }) => makeConfig(mode))
