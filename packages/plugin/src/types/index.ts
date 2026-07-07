import type { Recordable } from '@wry-smile/utils'
import type { BUILTIN_TRANSFORM_RUNTIME_ENV_FN } from '../constant'

export type BuiltinTransformRuntimeEnvFn = (typeof BUILTIN_TRANSFORM_RUNTIME_ENV_FN)[number]
export type RuntimeEnvValidator = (env: Recordable) => void
export type ResolvedRuntimeEnvValidator = (env: Recordable) => Recordable
export type RuntimeScriptAttributeValue = boolean | string | null | undefined
export type RuntimeScriptAttributes = Record<string, RuntimeScriptAttributeValue>
export interface RuntimeEnvSchemaParseSuccess<RuntimeEnv = Recordable> {
  success: true
  data: RuntimeEnv
}

export interface RuntimeEnvSchemaParseFailure {
  success: false
  error?: unknown
}

export interface RuntimeEnvSchemaLike<RuntimeEnv = Recordable> {
  parse?: (env: Recordable) => RuntimeEnv
  safeParse?: (env: Recordable) => RuntimeEnvSchemaParseSuccess<RuntimeEnv> | RuntimeEnvSchemaParseFailure
}

export interface PluginConfig {
  /**
   * @description
   * @default 'VITE_GLOB_'
   */
  runtimeEnvPrefix?: string

  /**
   * @description
   * @default '__APP_PROD_CONFIG__'
   */
  globalVariableName?: string

  /**
   * @description
   * @default '_app.config.js'
   */
  configFileName?: string

  /**
   * @description parse env string values to native values before transform
   * @default true
   */
  parseRuntimeEnvValues?: boolean

  /**
   * @description validate the final runtime config before it is written
   */
  validateRuntimeEnv?: RuntimeEnvValidator | RuntimeEnvSchemaLike

  /**
   * @description extra attributes applied to the injected runtime config script tag
   */
  scriptAttributes?: RuntimeScriptAttributes

  /**
   * @description
   * @param env
   * @returns
   */
  transformRuntimEnv?: ((env: Recordable) => Recordable) | BuiltinTransformRuntimeEnvFn | undefined
}

export interface ResolvedPluginConfig extends Required<PluginConfig> {
  transformRuntimEnv: ((env: Recordable) => Recordable)
  validateRuntimeEnv: ResolvedRuntimeEnvValidator
  scriptAttributes: RuntimeScriptAttributes
}

export type SnakeToCamel<T extends string>
  = T extends `${infer First}_${infer Rest}` ? `${First}${Capitalize<SnakeToCamel<Rest>>}` : Capitalize<T>

export type Capitalize<S extends string> = S extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : S

export type ExcludePrefix<T extends string, Prefix extends string = 'VITE_GLOB_'> = T extends `${Prefix}${infer Other}` ? Other : T

export type CamelCaseRuntimeEnv<RuntimeEnv extends Record<string, any>, Prefix extends string = 'VITE_GLOB_'> = {
  [K in keyof RuntimeEnv as Uncapitalize<SnakeToCamel<Lowercase<ExcludePrefix<K & string, Prefix>>>>]: RuntimeEnv[K];
}

export type SnakeCaseRuntimeEnv<RuntimeEnv extends Record<string, any>, Prefix extends string = 'VITE_GLOB_'> = {
  [K in keyof RuntimeEnv as Lowercase<ExcludePrefix<K & string, Prefix>>]: RuntimeEnv[K];
}
