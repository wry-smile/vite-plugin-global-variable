import type { Recordable } from '@wry-smile/utils'

export { default as camelCase } from 'lodash.camelcase'
export { default as snakeCase } from 'lodash.snakecase'

export function noopTransform(env: Recordable) {
  return env
}
