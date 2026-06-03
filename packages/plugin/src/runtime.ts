import { GLOBAL_VARIABLE_NAME } from './constant'
export type {
  CamelCaseRuntimeEnv,
  Capitalize,
  ExcludePrefix,
  SnakeCaseRuntimeEnv,
  SnakeToCamel,
} from './types'
export { camelCase, snakeCase } from './utils/share'

export interface GetRuntimeConfigOptions {
  globalVariableName?: string
}

export function getRuntimeConfig<RuntimeEnv = Record<string, unknown>>(
  options?: GetRuntimeConfigOptions,
): RuntimeEnv {
  if (typeof window === 'undefined')
    throw new Error('[vite-plugin-runtime-env] getRuntimeConfig can only be used in the browser.')

  const globalVariableName = options?.globalVariableName || GLOBAL_VARIABLE_NAME
  const runtimeConfig = window[globalVariableName as keyof Window]

  if (typeof runtimeConfig === 'undefined') {
    throw new TypeError(
      `[vite-plugin-runtime-env] Runtime config "${globalVariableName}" was not found on window.`,
    )
  }

  return runtimeConfig as RuntimeEnv
}
