import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { globalVariable } from '../../dist/main'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {

  console.log(loadEnv(mode, './', 'VITE_GLOB_'))
  return {
    plugins: [vue(), globalVariable()],
  }
})
