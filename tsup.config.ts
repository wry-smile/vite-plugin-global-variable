import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/main.ts'],
  format: ['esm'],
  dts: true,
  watch: true,
  outDir: 'dist',
  clean: true,
  external: ['vite']
})
