import { ConfigEnv } from "vite";
import { GlobalVariableOptions } from "./types";
import { isBoolean, isNullOrUnDef } from "@wry-smile/utils";

/**
 * Get the configuration file variable name
 * @param env
 */
export const getGlobalConfigName = (env: ConfigEnv) => {
  return `__${env.mode.toUpperCase()}__APP__CONF__`
    .toUpperCase()
    .replace(/\s/g, '');
};


export function parseEnv(env: Record<string, string>) {
  const res: Record<string, string> = {}

  Object.keys(env).forEach(key => {
    try {
      const value = env[key]
      res[key] = stringToJSONParse(value)
    } catch (err) {
      console.log(`env variable ${key} can't serialization!`)
    }
  })

  return res
}


const stringToJSONParse = (string: string) => {
  try {
    return JSON.parse(string)
  } catch (error) {
    return string
  }
}

export function transformToCamelCase(keyName: string) {
  return keyName.toLowerCase().replace(
    /([-_][a-z])/gi,
    function ($1) {
      return $1.toUpperCase().replace('-', '').replace('_', '')
    }
  )
}


export function doTransformEnvName(env: Record<string, any>, prefix: string = '', transformEnvKeyName: GlobalVariableOptions['envNameToCamelCase']) {
  if (transformEnvKeyName === false) return env

  const _result: Record<string, any> = {}
  let isCustom = false


  isBoolean(transformEnvKeyName) || isNullOrUnDef(transformEnvKeyName)
    ? (transformEnvKeyName = transformToCamelCase)
    : (isCustom = true)

  for (let key of Object.keys(env)) {
    const value = env[key]
    key = isCustom ? key : key.replace(prefix, '')
    const newKey = transformEnvKeyName(key)
    _result[newKey] = value
  }

  return _result
}
