import { resolve } from "path"
import chalk from 'chalk'
import pkg from '../package.json'

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

export function useLog(prefix: string = `[${pkg.name} ${pkg.version}]`) {
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
      const firstVal = value.at(0)
      const endVal = value.at(-1)
      const isSingleQuoted = firstVal === "'" && endVal === "'"
      const isDoubleQuoted = firstVal === '"' && endVal === '"'

      // if ()

      res[key] = JSON.parse(env[key])
    } catch (err) {
      error(`Check that your environment variables(${key}) follow JSON syntax rules. More infomation(${err as string})`)
    }
  })

  return res
}
