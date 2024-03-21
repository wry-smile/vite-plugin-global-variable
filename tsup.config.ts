import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['./src/main.ts'],
    format: ['esm'],
    dts: true,
    outDir: 'dist',
    clean: true,
    sourcemap: true,
    external: ['vite'],
    treeshake: true
  },
  {
    entry: ['./src/tools/index.ts'],
    format: ['esm'],
    dts: true,
    outDir: 'tools',
    clean: true,
    sourcemap: true,
    treeshake: true,
  },
])
