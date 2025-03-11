import { doTransformEnvName, parseEnv } from "../parse";
import { PREFIX } from "../constant";
import { CamelKeys, ExcludePrefix, SnakeToCamel, Capitalize } from "../types";
import { isFunction } from "@wry-smile/utils";

export const getGlobalConfigName = () => {
  return `__${import.meta.env.MODE.toUpperCase()}__APP__CONF__`
    .toUpperCase()
    .replace(/\s/g, '');
}

interface UseGlobSettingParams {
  globalName?: string
  transformEnvKeyName?: boolean | ((keyName: string) => string)
  prefix?: string
  importEnv?: ImportMetaEnv
  parseEnv?: (env: Record<string, string>) => Record<string, any>
}


export const useGlobSetting = (params?: UseGlobSettingParams) => {
  let {
    globalName = getGlobalConfigName(),
    transformEnvKeyName,
    prefix = PREFIX,
    importEnv = import.meta.env,
    parseEnv: customParseEnv
  } = params || {}

  const result = import.meta.env.DEV
    ? customParseEnv && isFunction(customParseEnv)
      ? customParseEnv(importEnv)
      : parseEnv(importEnv)
    : window[globalName as any] as unknown as ImportMetaEnv

  return doTransformEnvName(result, prefix, transformEnvKeyName)
}

export { CamelKeys, ExcludePrefix, SnakeToCamel, Capitalize }
