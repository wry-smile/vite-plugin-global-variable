# @wry-smile/vite-plugin-runtime-env

A Vite plugin for exposing selected env variables through a runtime-loaded global config file.

Instead of baking those values into your bundle at build time, the plugin:

- filters env keys by prefix
- generates a standalone config file such as `_app.config.js`
- injects that file into `index.html`
- exposes the values on `window[globalVariableName]`

The same access model works in both `vite dev` and production builds.

## Installation

```bash
pnpm add @wry-smile/vite-plugin-runtime-env -D
# or
yarn add @wry-smile/vite-plugin-runtime-env -D
# or
npm install @wry-smile/vite-plugin-runtime-env -D
```

## Usage

1. Create env variables with the runtime prefix.

```env
VITE_GLOB_APP_NAME="My App"
VITE_GLOB_API_URL="https://api.example.com"
VITE_GLOB_ENABLE_MOCK=true
VITE_GLOB_REQUEST_TIMEOUT=3000
VITE_GLOB_FEATURE_FLAGS={"beta":true}
```

2. Register the plugin in `vite.config.ts`.

```ts
import { runtimeEnvPlugin } from '@wry-smile/vite-plugin-runtime-env'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    runtimeEnvPlugin({
      runtimeEnvPrefix: 'VITE_GLOB_',
      globalVariableName: '__APP_PROD_CONFIG__',
      configFileName: '_app.config.js',
      parseRuntimeEnvValues: true,
      scriptAttributes: {
        nonce: '__CSP_NONCE__',
      },
      validateRuntimeEnv: {
        parse(env) {
          if (typeof env.appName !== 'string')
            throw new TypeError('appName must be a string')

          return env
        },
      },
      transformRuntimEnv: 'camelCase',
    }),
  ],
})
```

3. Read the generated global config through the exported API.

```ts
import { getRuntimeConfig } from '@wry-smile/vite-plugin-runtime-env/runtime'

const config = getRuntimeConfig<{
  appName: string
  apiUrl: string
  enableMock: boolean
  requestTimeout: number
  featureFlags: {
    beta: boolean
  }
}>()

console.log(config.appName)
console.log(config.apiUrl)
console.log(config.enableMock)
console.log(config.requestTimeout)
console.log(config.featureFlags.beta)
```

If you changed `globalVariableName`, pass it explicitly:

```ts
const config = getRuntimeConfig({
  globalVariableName: '__CUSTOM_RUNTIME_CONFIG__',
})
```

## How It Works

- In `vite dev`, the plugin serves the config file from the dev server.
- In `vite build`, the plugin emits the config file into the output directory.
- In both cases, the plugin injects a `<script>` tag into `index.html`.
- Before the config file is generated, env string values can be parsed into native values when enabled.

That lets you replace the generated config file after deployment without rebuilding your frontend bundle.

## Default Value Parsing

Env values are strings by default. When `parseRuntimeEnvValues` is enabled, the plugin will convert them automatically when the value is a clear literal:

- `true` / `false` -> `boolean`
- `null` -> `null`
- valid number literals such as `3000`, `0.5`, `1e3` -> `number`
- valid JSON objects / arrays such as `{"beta":true}` or `["a","b"]`

All other values stay as strings.

If you provide `transformRuntimEnv`, it receives the parsed values instead of the raw env strings.

## Configuration

### `runtimeEnvPrefix`

- Type: `string`
- Default: `'VITE_GLOB_'`

Only env keys starting with this prefix are exposed.

### `globalVariableName`

- Type: `string`
- Default: `'__APP_PROD_CONFIG__'`

The global key used on `window[...]`.

### `configFileName`

- Type: `string`
- Default: `'_app.config.js'`

The emitted runtime config filename.

### `parseRuntimeEnvValues`

- Type: `boolean`
- Default: `true`

Controls whether env string values are parsed into native values before `transformRuntimEnv` runs.

Set it to `false` if you want to keep all runtime env values as strings.

```ts
runtimeEnvPlugin({
  parseRuntimeEnvValues: false,
})
```

### `validateRuntimeEnv`

- Type: `((env: Recordable) => void) | { parse?: (env) => Recordable; safeParse?: (env) => { success: boolean; data?: Recordable; error?: unknown } }`
- Default: `undefined`

Validates the final runtime config object before it is written to the generated file. Throw an error to stop startup or build.

```ts
runtimeEnvPlugin({
  validateRuntimeEnv: (env) => {
    if (typeof env.apiUrl !== 'string')
      throw new TypeError('apiUrl must be a string')
  },
})
```

This hook runs after default value parsing and after `transformRuntimEnv`.

You can also pass a schema-like object with `parse` or `safeParse`, which makes it compatible with Zod-style APIs without coupling the plugin to a specific schema library.

```ts
runtimeEnvPlugin({
  validateRuntimeEnv: {
    parse(env) {
      if (typeof env.apiUrl !== 'string')
        throw new TypeError('apiUrl must be a string')

      return {
        ...env,
        appName: env.appName ?? 'My App',
      }
    },
  },
})
```

When a schema parser returns an object, that parsed object becomes the final runtime config written to the generated file.

### `scriptAttributes`

- Type: `Record<string, string | boolean | null | undefined>`
- Default: `{}`

Adds custom attributes to the injected runtime config `<script>` tag.

This is primarily useful for CSP nonces and other script loading requirements.

```ts
runtimeEnvPlugin({
  scriptAttributes: {
    nonce: '__CSP_NONCE__',
    crossorigin: 'anonymous',
  },
})
```

### `transformRuntimEnv`

- Type: `((env: Recordable) => Recordable) | 'camelCase' | 'snakeCase'`
- Default: `undefined`

The transform runs after the plugin applies its default value parsing when `parseRuntimeEnvValues` is enabled.

Transforms the exposed object keys before writing them to the runtime config.

```ts
runtimeEnvPlugin({
  transformRuntimEnv: 'camelCase',
})
```

With `camelCase`:

```env
VITE_GLOB_APP_NAME=MyApp
VITE_GLOB_API_BASE_URL=/api
```

becomes:

```ts
const config = getRuntimeConfig<{
  appName: string
  apiBaseUrl: string
}>()

console.log(config.appName) // MyApp
console.log(config.apiBaseUrl) // /api
```

You can also provide a custom transformer:

```ts
runtimeEnvPlugin({
  transformRuntimEnv: (env) => {
    const result: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(env)) {
      result[key.toLowerCase()] = value
    }

    return result
  },
})
```

## CSP

If your app uses a Content Security Policy, pass a `nonce` through `scriptAttributes` so the injected runtime config script satisfies your policy.

```ts
runtimeEnvPlugin({
  scriptAttributes: {
    nonce: '__CSP_NONCE__',
  },
})
```

## TypeScript

The plugin does not generate TypeScript declarations automatically. Define them in your app.

```ts
// vite-env.d.ts
interface ImportMetaEnv extends AppRuntimeEnv {}

interface AppRuntimeEnv {
  readonly VITE_GLOB_APP_NAME: string
  readonly VITE_GLOB_API_URL: string
  readonly VITE_GLOB_ENABLE_MOCK: boolean
  readonly VITE_GLOB_REQUEST_TIMEOUT: number
}
```

```ts
// global.d.ts
import type { CamelCaseRuntimeEnv } from '@wry-smile/vite-plugin-runtime-env/runtime'

declare global {
  interface Window {
    __APP_PROD_CONFIG__: CamelCaseRuntimeEnv<AppRuntimeEnv>
  }
}

export {}
```

Then read the config with the helper:

```ts
import type { CamelCaseRuntimeEnv } from '@wry-smile/vite-plugin-runtime-env/runtime'
import { getRuntimeConfig } from '@wry-smile/vite-plugin-runtime-env/runtime'

const config = getRuntimeConfig<CamelCaseRuntimeEnv<AppRuntimeEnv>>()
```

## API Exports

Use the package root for the Vite plugin:

```ts
import { runtimeEnvPlugin } from '@wry-smile/vite-plugin-runtime-env'
```

Use `@wry-smile/vite-plugin-runtime-env/runtime` in browser code:

```ts
import type { CamelCaseRuntimeEnv, SnakeCaseRuntimeEnv } from '@wry-smile/vite-plugin-runtime-env/runtime'
import { camelCase, getRuntimeConfig, snakeCase } from '@wry-smile/vite-plugin-runtime-env/runtime'
```
