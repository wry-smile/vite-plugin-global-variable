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
}>()

console.log(config.appName)
console.log(config.apiUrl)
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

That lets you replace the generated config file after deployment without rebuilding your frontend bundle.

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

### `transformRuntimEnv`

- Type: `((env: Recordable) => Recordable) | 'camelCase' | 'snakeCase'`
- Default: `undefined`

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
    const result: Record<string, string> = {}

    for (const [key, value] of Object.entries(env)) {
      result[key.toLowerCase()] = value
    }

    return result
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
