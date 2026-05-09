import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  root: command === 'serve' ? 'playground' : process.cwd(),
  resolve: {
    alias: {
      vuesortable: resolve(__dirname, 'src/index.ts'),
    },
  },
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      include: ['src'],
      exclude: ['tests', 'playground'],
      rollupTypes: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueSortable',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
}))
