import type { CamelCaseRuntimeEnv } from '@wry-smile/vite-plugin-runtime-env'
import { camelCase } from '@wry-smile/vite-plugin-runtime-env'

// The hook automatically handles development and production environments.
export function useRuntimeConfig<T extends ImportMetaEnv>(env: T, isProduction: boolean) {
  const config = isProduction
    ? window.__APP_PROD_CONFIG__
    : Object.fromEntries(
      Object.entries(env).map(([key, value]) => [camelCase(key.replace('VITE_GLOB_', '')), value]),
    ) as CamelCaseRuntimeEnv<AppRuntimeEnv>

  // do something

  return config
}
