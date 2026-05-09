import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      vuesortable: fileURLToPath(new URL('../src/index.ts', import.meta.url)),
    },
  },
})
