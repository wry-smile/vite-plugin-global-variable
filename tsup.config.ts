import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['./src/main.ts'],
    format: ['esm'],
    dts: true,
    outDir: 'dist',
    clean: true,
    sourcemap: true,
    external: ['vite']
  },
  {
    entry: ['./src/tools/index.ts'],
    format: ['esm'],
    dts: true,
    outDir: 'tools',
    clean: true,
    sourcemap: true,
  },
])
