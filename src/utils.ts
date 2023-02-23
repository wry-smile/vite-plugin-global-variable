import { resolve } from "path"

export function parseEnv(env: Record<string, any>) {
  const res: Record<string, any> = {}

  for (const envName of Object.keys(env)) {
    let value = env[envName]

    // parese to boolean
    value = value === 'true' ? true : value === 'false' ? false : value

    if (envName === 'VITE_GLOB_PROXY') {
      try {
        value = JSON.parse(value)
      } catch (error) {
        value = ''
      }
    }

    res[envName] = value

    if (typeof value === 'string') {
      process.env[envName] = value
    } else if (typeof value === 'object') {
      process.env[envName] === JSON.stringify(value)
    }

  }

  return res
}


export function getRootPath(...dir: string[]) {
  return resolve(process.cwd(), ...dir);
}


/**
 * Get the configuration file variable name
 * @param env
 */
export const getGlobalConfigName = (env: Record<string, any>) => {
  return `__PRODUCTION__${env.VITE_GLOB_APP_SHORT_NAME || '__APP'}__CONF__`
    .toUpperCase()
    .replace(/\s/g, '');
};
