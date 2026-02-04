import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    plugin: './src/plugin.ts',
    index: './src/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  external: ['vite'],
  treeshake: true,
  inlineOnly: false,
})
