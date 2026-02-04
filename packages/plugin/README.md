# @wry-smile/vite-plugin-runtime-env

A Vite plugin that exposes environment variables to your client-side code at runtime. Instead of embedding variables during the build process, this plugin generates a separate configuration file that is fetched by the browser, allowing for dynamic configuration without rebuilding your application.

## Features

- **Runtime Configuration**: Expose environment variables to the client at runtime, not at build time.
- **Dynamic Updates**: Change configuration without a new build. Simply update the generated config file and restart your server.
- **Framework Agnostic**: Works with any frontend framework supported by Vite (Vue, React, Svelte, etc.).
- **Customizable**: Flexible options to control which variables are exposed, how they are named, and more.
- **Type-Safe**: Automatically generates TypeScript declarations for your runtime environment variables.

## Installation

```bash
pnpm add @wry-smile/vite-plugin-runtime-env -D
# or
yarn add @wry-smile/vite-plugin-runtime-env -D
# or
npm install @wry-smile/vite-plugin-runtime-env -D
```

## Usage

1.  **Configure your `.env` file**

    Create a `.env` file (or `.env.production`, `.env.development`) in your project root. Add the environment variables you want to expose, prefixed with a specific string (default is `VITE_GLOB_`).

    ```.env
    VITE_GLOB_APP_TITLE="My Awesome App"
    VITE_GLOB_API_URL="https://api.example.com"
    ```

2.  **Add the plugin to `vite.config.ts`**

    Import and add `runtimeEnvPlugin` to your Vite config.

    ```ts
    import { runtimeEnvPlugin } from '@wry-smile/vite-plugin-runtime-env/vite'
    import { defineConfig } from 'vite'

    export default defineConfig({
      plugins: [
        runtimeEnvPlugin(),
      ],
    })
    ```

3.  **Run your Vite server or build**

    The plugin will generate a config file (e.g., `_app.config.js`) in your output directory and inject a `<script>` tag into your `index.html` to load it.

## Configuration Options

The `runtimeEnvPlugin` accepts an optional configuration object:

```ts
runtimeEnvPlugin({
  // Your options here
})
```

### `runtimeEnvPrefix`

- **Type**: `string`
- **Default**: `'VITE*GLOB*'

  The prefix for environment variables that should be exposed to the client. Only variables starting with this prefix will be processed.

### `globalVariableName`

- **Type**: `string`
- **Default**: `'**APP_PROD_CONFIG**'

  The name of the global variable on the `window` object where the runtime environment variables will be stored.

### `configFileName`

- **Type**: `string`
- **Default**: `'_app.config.js'`

  The name of the generated configuration file.

### `transformRuntimEnv`

- **Type**: `((env: Recordable) => Recordable) | 'camelCase' | 'snakeCase'`
- **Default**: `undefined`

  A function or a built-in transformer to modify the keys of the environment variables before they are exposed.
  - **`'camelCase'`**: Transforms `VITE_GLOB_APP_TITLE` to `appTitle`.
  - **`'snakeCase'`**: Transforms `VITE_GLOB_APP_TITLE` to `app_title`.
  - **Custom Function**: Provide your own function for complex transformations.

    ```ts
    transformRuntimEnv: (env) => {
      const newEnv = {}
      for (const key in env) {
        // Custom logic
        newEnv[key.toLowerCase()] = env[key]
      }
      return newEnv
    }
    ```

## Example

**`.env`**

```
VITE_GLOB_APP_NAME=MyViteApp
VITE_GLOB_API_BASE_URL=/api/v1
```

**`vite.config.ts`**

```ts
import { runtimeEnvPlugin } from '@wry-smile/vite-plugin-runtime-env/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    runtimeEnvPlugin({
      runtimeEnvPrefix: 'VITE_GLOB_',
      transformRuntimEnv: 'camelCase',
    }),
  ],
})
```

## Accessing Variables in Your App (Example)

To access your environment variables in a type-safe and environment-aware manner, you can create a custom hook like `useRuntimeConfig`. This abstracts away the differences between development and production. Here is a recommended implementation:

1.  **Create a configuration module**

    Create a file (e.g., `src/config.ts`) to initialize and export your runtime configuration.

    ```ts
    import type { CamelCaseRuntimeEnv } from '@wry-smile/vite-plugin-runtime-env'
    // src/config.ts
    import { camelCase } from '@wry-smile/vite-plugin-runtime-env'

    // The hook automatically handles development and production environments.
    export function useRuntimeConfig<T extends ImportMetaEnv>(env: T, isProduction: boolean) {
      const config = isProduction
        ? window.__APP_PROD_CONFIG__
        : Object.fromEntries(
          Object.entries(env).map(([key, value]) => [camelCase(key.replace('VITE_GLOB_', '')), value]),
        ) as CamelCaseRuntimeEnv<AppRuntimeEnv>

      // do something

      return config
    }
    ```

2.  **Use it in your application**

    Now you can import `runtimeConfig` anywhere in your app.

    ```ts
    import { useRuntimeConfig } from './config'

    const config = useRuntimeConfig(import.meta.env, import.meta.env.MODE)
    console.log('API URL:', config.apiUrl)
    console.log('App Title:', config.appTitle)
    ```

## TypeScript Integration

To get full type-safety, you need to define the types for your environment variables.

1.  **Update Type Definitions**

    Create or update a type declaration file (e.g., `src/vite-env.d.ts`) to define the shape of your runtime variables. Make sure to use the `globalVariableName` you configured in `vite.config.ts` (default is `__APP_PROD_CONFIG__`).

    ```ts
    // vite-env.d.ts
    interface ImportMetaEnv extends AppRuntimeEnv {

    }

    interface AppRuntimeEnv {
      readonly VITE_GLOB_APP_NAME: string
      readonly VITE_GLOB_APP_TITLE: string
    }
    ```

    ```ts
    // global.d.ts
    import type { CamelCaseRuntimeEnv } from '@wry-smile/vite-plugin-runtime-env'

    declare global {
      interface Window {
        __APP_PROD_CONFIG__: CamelCaseRuntimeEnv<ImportMetaEnv>
      }
    }

    export {}
    ```
