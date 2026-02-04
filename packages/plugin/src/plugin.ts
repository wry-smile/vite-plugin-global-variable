import { runtimeEnvPlugin } from './core/plugin'

export { runtimeEnvPlugin }

export type {
  BuiltinTransformRuntimeEnvFn,
  CamelCaseRuntimeEnv,
  Capitalize,
  ExcludePrefix,
  PluginConfig,
  SnakeCaseRuntimeEnv,
  SnakeToCamel,
} from './types'

export { camelCase, snakeCase } from './utils/share'

export default runtimeEnvPlugin
