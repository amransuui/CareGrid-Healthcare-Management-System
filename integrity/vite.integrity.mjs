import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: { '@': resolve(import.meta.dirname, 'src') },
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'integrity', 'entry.ts'),
      formats: ['es'],
      fileName: () => 'integrity.js',
    },
    outDir: 'temp-integrity',
    emptyOutDir: true,
  },
})