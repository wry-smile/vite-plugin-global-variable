import type { Recordable } from '@wry-smile/utils'
import type { Logger, Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import type { PluginConfig, ResolvedPluginConfig } from '../types'
import { isFunction, isObject, isString } from '@wry-smile/utils'
import picocolors from 'picocolors'
import { BUILTIN_TRANSFORM_RUNTIME_ENV_FN, ENV_CONFIG_PREFIX, GLOB_CONFIG_FILE_NAME, GLOBAL_VARIABLE_NAME, PLUGIN_NAME } from '../constant'
import { camelCase, generatorContentHash, noopTransform, parseRuntimeEnv, snakeCase } from '../utils'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function formatValidationError(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function normalizeValidatedRuntimeEnv(env: unknown) {
  if (!isPlainObject(env)) {
    throw new TypeError(`[${PLUGIN_NAME}] validateRuntimeEnv must return an object when using a schema parser.`)
  }

  return env as Recordable
}

function isSchemaLike(value: unknown): value is NonNullable<PluginConfig['validateRuntimeEnv']> {
  return isPlainObject(value) && (isFunction(value.parse) || isFunction(value.safeParse))
}

function assertPluginConfig(pluginConfig?: PluginConfig) {
  if (!pluginConfig)
    return

  const {
    parseRuntimeEnvValues,
    scriptAttributes,
    validateRuntimeEnv,
  } = pluginConfig

  if (typeof parseRuntimeEnvValues !== 'undefined' && typeof parseRuntimeEnvValues !== 'boolean') {
    throw new TypeError(`[${PLUGIN_NAME}] parseRuntimeEnvValues must be a boolean.`)
  }

  if (typeof validateRuntimeEnv !== 'undefined' && !isFunction(validateRuntimeEnv) && !isSchemaLike(validateRuntimeEnv)) {
    throw new TypeError(`[${PLUGIN_NAME}] validateRuntimeEnv must be a function or a schema-like object with parse/safeParse.`)
  }

  if (typeof scriptAttributes !== 'undefined' && !isPlainObject(scriptAttributes)) {
    throw new TypeError(`[${PLUGIN_NAME}] scriptAttributes must be an object.`)
  }
}

function parseTransformEnv(
  envPrefix: string,
  transformRuntimeEnv: PluginConfig['transformRuntimEnv'],
  logger: Logger,
): ResolvedPluginConfig['transformRuntimEnv'] {
  if (!transformRuntimeEnv)
    return noopTransform

  if (isFunction(transformRuntimeEnv)) {
    return (env: Recordable) => {
      let ret = transformRuntimeEnv(env)

      if (!isObject(ret)) {
        logger.info(picocolors.yellow(`\n[${PLUGIN_NAME}]: transformRuntimEnv must return an object:\n${ret}`))
        ret = {}
      }

      return ret
    }
  }

  if (
    isString(transformRuntimeEnv)
    && BUILTIN_TRANSFORM_RUNTIME_ENV_FN.includes(transformRuntimeEnv)
  ) {
    const fn = {
      camelCase,
      snakeCase,
    }

    return (env: Recordable) => {
      return Object.fromEntries(
        Object.entries(env)
          .map(
            ([key, value]) =>
              [
                fn[transformRuntimeEnv](key.replace(envPrefix, '')),
                value,
              ],
          ),
      )
    }
  }

  return noopTransform
}

function parseValidateRuntimeEnv(
  validateRuntimeEnv: PluginConfig['validateRuntimeEnv'],
): (env: Recordable) => Recordable {
  if (!validateRuntimeEnv)
    return env => env

  if (isFunction(validateRuntimeEnv)) {
    return (env: Recordable) => {
      try {
        validateRuntimeEnv(env)
      }
      catch (error) {
        throw new TypeError(`[${PLUGIN_NAME}] validateRuntimeEnv failed: ${formatValidationError(error)}`)
      }

      return env
    }
  }

  if (validateRuntimeEnv.safeParse) {
    return (env: Recordable) => {
      const result = validateRuntimeEnv.safeParse!(env)

      if (!result.success) {
        throw new TypeError(`[${PLUGIN_NAME}] validateRuntimeEnv failed: ${formatValidationError(result.error)}`)
      }

      return normalizeValidatedRuntimeEnv(result.data)
    }
  }

  return (env: Recordable) => {
    try {
      const parsedEnv = validateRuntimeEnv.parse!(env)
      return normalizeValidatedRuntimeEnv(parsedEnv)
    }
    catch (error) {
      throw new TypeError(`[${PLUGIN_NAME}] validateRuntimeEnv failed: ${formatValidationError(error)}`)
    }
  }
}

function normalizeScriptAttributes(
  scriptAttributes: PluginConfig['scriptAttributes'],
): ResolvedPluginConfig['scriptAttributes'] {
  return scriptAttributes ? { ...scriptAttributes } : {}
}

function resolvePluginConfig(logger: Logger, pluginConfig?: PluginConfig): ResolvedPluginConfig {
  assertPluginConfig(pluginConfig)

  const {
    runtimeEnvPrefix = ENV_CONFIG_PREFIX,
    globalVariableName = GLOBAL_VARIABLE_NAME,
    configFileName = GLOB_CONFIG_FILE_NAME,
    parseRuntimeEnvValues = true,
    validateRuntimeEnv,
    scriptAttributes,
    transformRuntimEnv,
  } = pluginConfig || {}

  return {
    configFileName,
    runtimeEnvPrefix,
    globalVariableName,
    parseRuntimeEnvValues,
    validateRuntimeEnv: parseValidateRuntimeEnv(validateRuntimeEnv),
    scriptAttributes: normalizeScriptAttributes(scriptAttributes),
    transformRuntimEnv: parseTransformEnv(runtimeEnvPrefix, transformRuntimEnv, logger),
  }
}

function getRuntimeEnv(userConfig: ResolvedConfig, pluginConfig: ResolvedPluginConfig) {
  const userEnv = userConfig.env
  const { runtimeEnvPrefix, parseRuntimeEnvValues, transformRuntimEnv, validateRuntimeEnv } = pluginConfig

  const runtimeEnv: Recordable = {}

  Object.entries(userEnv).forEach(([key, value]) => {
    if (key.startsWith(runtimeEnvPrefix)) {
      runtimeEnv[key] = value
    }
  })

  const transformedRuntimeEnv = transformRuntimEnv(parseRuntimeEnvValues ? parseRuntimeEnv(runtimeEnv) : runtimeEnv)
  return validateRuntimeEnv(transformedRuntimeEnv)
}

function getRuntimeEnvCodeSource(userConfig: ResolvedConfig, pluginConfig: ResolvedPluginConfig) {
  const runtimeEnv = getRuntimeEnv(userConfig, pluginConfig)
  const { globalVariableName } = pluginConfig
  const windowVariable = `window[${JSON.stringify(globalVariableName)}]`

  let source = `${windowVariable}=${JSON.stringify(runtimeEnv)};`

  source += `
    Object.freeze(${windowVariable});
    Object.defineProperty(window, "${globalVariableName}", {
      configurable: false,
      writable: false,
    });
  `.replaceAll(/\s/g, '')

  return source
}

function getRuntimeConfigPublicPath(base: string, configFileName: string) {
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(base))
    return new URL(configFileName, base.endsWith('/') ? base : `${base}/`).toString()

  const separator = !base || base.endsWith('/') ? '' : '/'

  return `${base}${separator}${configFileName}`
}

function getRuntimeConfigRequestPath(base: string, configFileName: string) {
  return getRequestPathname(getRuntimeConfigPublicPath(base, configFileName))
}

function getRequestPathname(url?: string) {
  if (!url)
    return ''

  return new URL(url, 'http://localhost').pathname
}

function getRuntimeConfigScriptAttributes(runtimeConfigSrc: string, scriptAttributes: ResolvedPluginConfig['scriptAttributes']) {
  const attrs: Record<string, boolean | string> = {
    src: runtimeConfigSrc,
  }

  Object.entries(scriptAttributes).forEach(([key, value]) => {
    if (value === false || value === null || typeof value === 'undefined')
      return

    attrs[key] = value === true ? true : String(value)
  })

  return attrs
}

function setupDevServer(server: ViteDevServer, config: ResolvedConfig, pluginConfig: ResolvedPluginConfig, source: string) {
  const runtimeConfigPath = getRuntimeConfigRequestPath(config.base, pluginConfig.configFileName)

  server.middlewares.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD')
      return next()

    if (getRequestPathname(req.url) !== runtimeConfigPath)
      return next()

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.end(req.method === 'HEAD' ? undefined : source)
  })
}

export function runtimeEnvPlugin(config?: PluginConfig): Plugin {
  let pluginConfig: ResolvedPluginConfig

  let resolvedConfig: ResolvedConfig
  let source: string
  let logger: Logger

  return {
    name: PLUGIN_NAME,
    configResolved(userConfig) {
      resolvedConfig = userConfig
      logger = userConfig.logger
      pluginConfig = resolvePluginConfig(logger, config)
      source = getRuntimeEnvCodeSource(userConfig, pluginConfig)
    },
    configureServer(server) {
      setupDevServer(server, resolvedConfig, pluginConfig, source)
    },
    generateBundle() {
      try {
        this.emitFile({
          fileName: pluginConfig.configFileName,
          source,
          type: 'asset',
        })

        logger.info(picocolors.cyan(`\n[${PLUGIN_NAME}]: ✨ configuration file is build successfully!\n`))
      }
      catch (error) {
        logger.error(picocolors.red(`\n[${PLUGIN_NAME}]: configuration file failed to package:\n${error}\n`))
      }
    },
    transformIndexHtml(html) {
      const query = `v=${generatorContentHash(source, 8)}`

      const { configFileName, scriptAttributes } = pluginConfig
      const { base } = resolvedConfig

      const runtimeConfigSrc = `${getRuntimeConfigPublicPath(base, configFileName)}?${query}`

      return {
        html,
        tags: [
          {
            attrs: getRuntimeConfigScriptAttributes(runtimeConfigSrc, scriptAttributes),
            tag: 'script',
          },
        ],
      }
    },
  }
}
