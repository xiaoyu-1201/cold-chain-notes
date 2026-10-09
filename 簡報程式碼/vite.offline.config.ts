import { defineConfig, mergeConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { makeConfig } from './vite.config'

const baseConfig = makeConfig('offline')

/**
 * 離線單檔版：JS / CSS / 圖片 / 錄音全部內嵌在一個 HTML，雙擊即可開啟，可單獨放到 NAS 分享。
 */
export default mergeConfig(
  baseConfig,
  defineConfig({
    base: './',
    plugins: [viteSingleFile()],
    build: {
      outDir: 'offline',
      emptyOutDir: true,
      copyPublicDir: false,
      chunkSizeWarningLimit: 60000,
    },
  }),
)
