import { createHash } from 'node:crypto'

/**
 * 仅在 Node.js 环境下使用
 */
export function generatorContentHash(content: string, hashLSize?: number) {
  const hash = createHash('sha256').update(content, 'utf8').digest('hex')

  if (hashLSize)
    return hash.slice(0, hashLSize)

  return hash
}
