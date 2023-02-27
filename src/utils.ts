import { resolve } from "path"
import chalk from 'chalk'
import { name, version } from '../package.json'

export function getRootPath(...dir: string[]) {
  return resolve(process.cwd(), ...dir);
}


/**
 * Get the configuration file variable name
 * @param env
 */
export const getGlobalConfigName = (env: Record<string, any>) => {
  return `__PRODUCTION__${env.VITE_GLOB_APP_SHORT_NAME || 'APP'}__CONF__`
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

enum BoolString {
  TRUE = 'true',
  FALSE = 'false'
}

export function parseEnv(env: Record<string, string>) {
  const res: Record<string, string> = {}
  const { error } = useLog()
  const isIntReg = /\d/g
  const isObjectReg = /[\[\]\{\}]/g

  Object.keys(env).forEach(key => {
    try {
      const value = env[key]

      if (value === BoolString.TRUE || value === BoolString.FALSE || value.match(isIntReg) || value.match(isObjectReg))
        res[key] = JSON.parse(value)
      else
        res[key] = value

    } catch (err) {
      error(`Check that your environment variables(${key}) follow JSON syntax rules. If you want to set an object or array, check that your key is enclosed in double quotes. Other infomation(${err as string})`)
    }
  })

  return res
}
