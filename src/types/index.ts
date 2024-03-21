import { ConfigEnv, UserConfig } from "vite"

export interface GlobalVariableOptions {

  /**
   * @description Load variables that match the prefix in the .env file in envDir
   * @default VITE_GLOB_
   * @type string
   */
  prefix?: string

  /**
   * @description Configuration file name
   * @default .app.config.js
   * @type string
   */
  configurationFileName?: string | ((config: UserConfig, env: ConfigEnv) => string)

  /**
   * @description The configuration name mounted on the window object
   * @default __{import.env.meta.Mode}__APP__CONF__
   * @type string
   */
  configurationName?: string | ((config: UserConfig, env: ConfigEnv) => string)

  /**
   * @description Custom parse environment variables
   * @param env Record<string, string>
   * @returns Record<string, any>
   */
  parser?: (env: Record<string, string>) => Record<string, any>

  /**
   * @description  Append additional information before writing to the file
   */
  additional?: Record<string, any> | (() => Record<string, any>)

  /**
   * @description transform env name to camel case
   */
  envNameToCamelCase?: boolean | ((keyName: string) => string)
}


export interface CreateConfigParams {
  writeOptions: {
    globalVariableName: string
    fileName: string
    variable: Record<string, any>
    writePath: string
  }

  pluginConfig: GlobalVariableOptions
}

export type SnakeToCamel<T extends string> =
  T extends `${infer First}_${infer Rest}` ? `${First}${Capitalize<SnakeToCamel<Rest>>}` : Capitalize<T>;

export type Capitalize<S extends string> = S extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : S;

export type ExcludePrefix<T extends string> = T extends `VITE_GLOB_${infer Other}` ? Other : T

export type CamelKeys<SnakeKeys extends Record<string, any>> = {
  [K in keyof SnakeKeys as Uncapitalize<SnakeToCamel<Lowercase<ExcludePrefix<K & string>>>>]: SnakeKeys[K];
};
 
