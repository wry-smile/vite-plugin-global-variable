import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import { globalVariable } from '../../dist/main'
import { globalVariablePlugin } from '@wry-smile/vite-plugin-global-variable'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {

  return {
    base: 'test',
    plugins: [vue(), globalVariablePlugin()],
  }
})
