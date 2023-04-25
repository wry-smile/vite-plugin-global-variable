# @wry-smile/vite-plugin-global-variable

## Usage

```ts
  // vite.config.js
  import { globalVariablePlugin } from '@wry-smile/vite-plugin-global-variable'
  
  export default {
    plugins: [ globalVariablePlugin() ]
  }
```

```ts
  // .env file configures variables 
  VITE_GLOB_BOOL = true
```

```ts
  // use global variables
  import { useGlobSetting } from '@wry-smile/vite-plugin-global-variable/tools'

  const { VITE_GLOB_BOOL } = useGlobSetting()
```

## Options

```ts
interface GlobalVariableOptions {
    /**
     * @description Load variables that match the prefix in the .env file in envDir
     * @default VITE_GLOB_
     * @type string
     */
    prefixes?: string;
    /**
     * @description Configuration file name
     * @default .app.config.js
     * @type string
     */
    configurationFileName?: string | ((config: UserConfig, env: ConfigEnv) => string);
    /**
     * @description The configuration name mounted on the window object, you set VITE_GLOB_APP_SHORT_NAME environment variable to modify name or custom input
     * @default __PRODUCTION__${env.VITE_GLOB_APP_SHORT_NAME || '__APP'}__CONF__
     * @type string
     */
    configurationName?: string | ((config: UserConfig, env: ConfigEnv) => string);
    /**
     * @description Custom parse environment variables
     * @param env Record<string, string>
     * @returns Record<string, any>
     */
    parser?: (env: Record<string, string>) => Record<string, any>;
}
```
