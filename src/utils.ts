import { resolve } from "path"
import chalk from 'chalk'
import { name, version } from '../package.json'
import { ConfigEnv } from "vite";

export function getRootPath(...dir: string[]) {
  return resolve(process.cwd(), ...dir);
}

const stringToJSONParse = (string: string) => {
  try {
    return JSON.parse(string)
  } catch (error) {
    return string
  }
}


/**
 * Get the configuration file variable name
 * @param env
 */
export const getGlobalConfigName = (env: ConfigEnv, viteEnv: Record<string, any>) => {
  return `__${env.mode.toUpperCase()}__${viteEnv.VITE_GLOB_APP_SHORT_NAME || 'APP'}__CONF__`
    .toUpperCase()
    .replace(/\s/g, '');
};

export function isFunction(val: unknown): val is Function {
  return typeof val === 'function';
}

export function useLog(prefix: string = `[${name} ${version}]`) {
  const log = console.log
  const { green, red, yellow, white, blue } = chalk

  const compose = (string: string) => `${blue(prefix)} ${string}`

  const error = (text: string) => {
    log(compose(red(text)))
  }

  const success = (text: string) => {
    log(compose(green(text)))
  }

  const info = (text: string) => {
    log(compose(white(text)))
  }

  const warning = (text: string) => {
    log(compose(yellow(text)))
  }

  return {
    error,
    success,
    warning,
    info
  }
}



export function parseEnv(env: Record<string, string>) {
  const res: Record<string, string> = {}
  const { error } = useLog()

  Object.keys(env).forEach(key => {
    try {
      const value = env[key]
      res[key] = stringToJSONParse(value)
    } catch (err) {
      error(`Check that your environment variables(${key}) follow JSON syntax rules. If you want to set an object or array, check that your key is enclosed in double quotes. Other infomation(${err as string})`)
    }
  })

  return res
}
