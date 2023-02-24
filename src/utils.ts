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

export function useLog() {
  const log = console.log
  const { green, red, yellow, white } = chalk


  const error = (text: string) => {
    log(red(text))
  }

  const success = (text: string) => {
    log(green(text))
  }

  const info = (text: string) => {
    log(white(text))
  }

  const warning = (text: string) => {
    log(yellow(text))
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
      res[key] = JSON.parse(env[key])
    } catch (err) {
      error(err as string)
    }
  }) 
   
  return res
}
