import assert from 'node:assert/strict'
import test from 'vitest'
// eslint-disable-next-line antfu/no-import-dist
import { runtimeEnvPlugin } from '../dist/index.mjs'

function createLogger() {
  return {
    error() {},
    info() {},
    warn() {},
  }
}

function createResolvedConfig(env, overrides = {}) {
  return {
    base: '/',
    env,
    logger: createLogger(),
    ...overrides,
  }
}

function setupPlugin(options, env, overrides) {
  const plugin = runtimeEnvPlugin(options)
  plugin.configResolved(createResolvedConfig(env, overrides))
  return plugin
}

function getEmittedAssetSource(plugin) {
  let emittedAsset

  plugin.generateBundle.call({
    emitFile(file) {
      emittedAsset = file
    },
  })

  return emittedAsset.source
}

test('parses runtime env values by default and validates the transformed config', () => {
  const plugin = setupPlugin(
    {
      transformRuntimEnv: 'camelCase',
      validateRuntimeEnv(env) {
        assert.equal(env.enableMock, true)
        assert.equal(env.requestTimeout, 3000)
        assert.deepEqual(env.featureFlags, { beta: true })
      },
    },
    {
      VITE_GLOB_ENABLE_MOCK: 'true',
      VITE_GLOB_REQUEST_TIMEOUT: '3000',
      VITE_GLOB_FEATURE_FLAGS: '{"beta":true}',
    },
  )

  const source = getEmittedAssetSource(plugin)

  assert.match(source, /"enableMock":true/)
  assert.match(source, /"requestTimeout":3000/)
  assert.match(source, /"featureFlags":\{"beta":true\}/)
})

test('keeps env values as strings when parseRuntimeEnvValues is disabled', () => {
  const plugin = setupPlugin(
    {
      parseRuntimeEnvValues: false,
      transformRuntimEnv: 'camelCase',
    },
    {
      VITE_GLOB_REQUEST_TIMEOUT: '3000',
      VITE_GLOB_ENABLE_MOCK: 'false',
    },
  )

  const source = getEmittedAssetSource(plugin)

  assert.match(source, /"requestTimeout":"3000"/)
  assert.match(source, /"enableMock":"false"/)
})

test('injects custom script attributes for CSP and keeps the asset query stable', () => {
  const plugin = setupPlugin(
    {
      scriptAttributes: {
        nonce: 'test-nonce',
        crossorigin: 'anonymous',
        defer: true,
      },
    },
    {
      VITE_GLOB_APP_NAME: 'demo',
    },
    {
      base: '/nested/',
    },
  )

  const firstResult = plugin.transformIndexHtml('')
  const secondResult = plugin.transformIndexHtml('')

  assert.equal(firstResult.tags[0].attrs.src, secondResult.tags[0].attrs.src)
  assert.match(firstResult.tags[0].attrs.src, /^\/nested\/_app\.config\.js\?v=/)
  assert.equal(firstResult.tags[0].attrs.nonce, 'test-nonce')
  assert.equal(firstResult.tags[0].attrs.crossorigin, 'anonymous')
  assert.equal(firstResult.tags[0].attrs.defer, true)
})

test('serves the runtime config file from the dev server middleware', () => {
  const middlewareHandlers = []
  const plugin = setupPlugin(
    undefined,
    {
      VITE_GLOB_APP_NAME: 'dev-app',
    },
    {
      base: '/app/',
    },
  )

  plugin.configureServer({
    middlewares: {
      use(handler) {
        middlewareHandlers.push(handler)
      },
    },
  })

  const headers = {}
  let body
  let nextCalled = false

  middlewareHandlers[0](
    {
      method: 'GET',
      url: '/app/_app.config.js',
    },
    {
      end(value) {
        body = value
      },
      setHeader(name, value) {
        headers[name] = value
      },
      statusCode: 0,
    },
    () => {
      nextCalled = true
    },
  )

  assert.equal(nextCalled, false)
  assert.equal(headers['Content-Type'], 'application/javascript; charset=utf-8')
  assert.equal(headers['Cache-Control'], 'no-store')
  assert.match(body, /"VITE_GLOB_APP_NAME":"dev-app"/)
})

test('throws when validateRuntimeEnv fails', () => {
  assert.throws(
    () =>
      setupPlugin(
        {
          validateRuntimeEnv() {
            throw new TypeError('apiUrl must be a string')
          },
        },
        {
          VITE_GLOB_API_URL: '123',
        },
      ),
    /validateRuntimeEnv failed: apiUrl must be a string/,
  )
})

test('supports schema-like validateRuntimeEnv with safeParse and uses parsed data as final runtime config', () => {
  const plugin = setupPlugin(
    {
      transformRuntimEnv: 'camelCase',
      validateRuntimeEnv: {
        safeParse(env) {
          return {
            success: true,
            data: {
              ...env,
              appName: env.appName.toUpperCase(),
              releaseChannel: 'stable',
            },
          }
        },
      },
    },
    {
      VITE_GLOB_APP_NAME: 'demo',
    },
  )

  const source = getEmittedAssetSource(plugin)

  assert.match(source, /"appName":"DEMO"/)
  assert.match(source, /"releaseChannel":"stable"/)
})

test('supports schema-like validateRuntimeEnv with parse', () => {
  const plugin = setupPlugin(
    {
      validateRuntimeEnv: {
        parse(env) {
          return {
            ...env,
            validated: true,
          }
        },
      },
    },
    {
      VITE_GLOB_APP_NAME: 'demo',
    },
  )

  const source = getEmittedAssetSource(plugin)

  assert.match(source, /"validated":true/)
})

test('throws for invalid scriptAttributes config', () => {
  assert.throws(
    () =>
      setupPlugin(
        {
          scriptAttributes: [],
        },
        {},
      ),
    /scriptAttributes must be an object/,
  )
})

test('throws for invalid validateRuntimeEnv config', () => {
  assert.throws(
    () =>
      setupPlugin(
        {
          validateRuntimeEnv: {
            unknown: true,
          },
        },
        {},
      ),
    /validateRuntimeEnv must be a function or a schema-like object with parse\/safeParse/,
  )
})
