import type { CamelCaseRuntimeEnv } from '@wry-smile/vite-plugin-runtime-env/runtime'
import { getRuntimeConfig } from '@wry-smile/vite-plugin-runtime-env/runtime'

export function useRuntimeConfig() {
  return getRuntimeConfig<CamelCaseRuntimeEnv<AppRuntimeEnv>>()
}
