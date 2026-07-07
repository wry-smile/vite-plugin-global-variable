import type { Recordable } from '@wry-smile/utils'

export { default as camelCase } from 'lodash.camelcase'
export { default as snakeCase } from 'lodash.snakecase'

function isJsonLikeValue(value: string) {
  return (
    (value.startsWith('{') && value.endsWith('}'))
    || (value.startsWith('[') && value.endsWith(']'))
  )
}

function isNumericLiteral(value: string) {
  return /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(value)
}

export function parseRuntimeEnvValue(value: unknown) {
  if (typeof value !== 'string')
    return value

  const trimmedValue = value.trim()

  if (!trimmedValue)
    return value

  if (trimmedValue === 'true')
    return true

  if (trimmedValue === 'false')
    return false

  if (trimmedValue === 'null')
    return null

  if (isNumericLiteral(trimmedValue))
    return Number(trimmedValue)

  if (isJsonLikeValue(trimmedValue)) {
    try {
      return JSON.parse(trimmedValue)
    }
    catch {
      return value
    }
  }

  return value
}

export function parseRuntimeEnv(env: Recordable) {
  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => [key, parseRuntimeEnvValue(value)]),
  )
}

export function noopTransform(env: Recordable) {
  return env
}
