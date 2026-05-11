import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import { defineConfig, transformWithEsbuild } from 'vite'

function minifyLibraryOutput() {
  return {
    name: 'minify-library-output',
    async generateBundle(_options: unknown, bundle: Record<string, { type: string, code?: string }>) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk' || !chunk.code || !fileName.endsWith('.js')) continue

        const minified = await transformWithEsbuild(chunk.code, fileName, {
          format: 'esm',
          legalComments: 'none',
          minify: true,
          target: 'es2022',
        })

        chunk.code = minified.code
      }
    },
  }
}

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
    minify: 'esbuild',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueSortable',
      fileName: 'index',
      formats: ['es'],
    },
    reportCompressedSize: true,
    rollupOptions: {
      external: ['vue'],
      plugins: [minifyLibraryOutput()],
      output: {
        compact: true,
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
}))
