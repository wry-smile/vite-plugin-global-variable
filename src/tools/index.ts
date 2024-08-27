import { doTransformEnvName, parseEnv } from "../parse";
import { PREFIX } from "../constant";
import { CamelKeys, ExcludePrefix, SnakeToCamel, Capitalize } from "../types";

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
}


export const useGlobSetting = (params?: UseGlobSettingParams) => {
  let {
    globalName = getGlobalConfigName(),
    transformEnvKeyName,
    prefix = PREFIX,
    importEnv = import.meta.env
  } = params || {}

  const result = import.meta.env.DEV
    ? parseEnv(importEnv)
    : window[globalName as any] as unknown as ImportMetaEnv

  return doTransformEnvName(result, prefix, transformEnvKeyName)
}

export { CamelKeys, ExcludePrefix, SnakeToCamel, Capitalize }
