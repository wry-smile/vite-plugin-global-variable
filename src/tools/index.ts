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
}


export const useGlobSetting = (
  params: UseGlobSettingParams =
    { globalName: getGlobalConfigName(), prefix: PREFIX }
) => {
  let { globalName, transformEnvKeyName, prefix } = params
  const result = import.meta.env.DEV
    ? parseEnv(import.meta.env)
    : window[globalName as any] as unknown as ImportMetaEnv

  return doTransformEnvName(result, prefix, transformEnvKeyName)
}

export { CamelKeys, ExcludePrefix, SnakeToCamel, Capitalize }
