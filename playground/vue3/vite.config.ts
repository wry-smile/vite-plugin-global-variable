import vue from '@vitejs/plugin-vue'
import { runtimeEnvPlugin } from '@wry-smile/vite-plugin-runtime-env/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    runtimeEnvPlugin({
      runtimeEnvPrefix: 'VITE_GLOB_',
      globalVariableName: '__APP_PROD_CONFIG__',
      configFileName: '_app.config.js',
      transformRuntimEnv: 'camelCase',
    }),
  ],
})
