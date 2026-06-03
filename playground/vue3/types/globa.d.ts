import type { CamelCaseRuntimeEnv } from '@wry-smile/vite-plugin-runtime-env/runtime'

declare global {
  interface Window {
    __APP_PROD_CONFIG__: CamelCaseRuntimeEnv<ImportMetaEnv>
  }
}

export {}
