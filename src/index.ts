import { getRootPath, getGlobalConfigName, isFunction, useLog, parseEnv } from "./utils";
import { CONFIGURATION_FILE_NAME, PREFIX } from "./constant";
import { writeFileSync } from "fs";
import { ConfigEnv, loadEnv, Plugin, UserConfig } from "vite";
import { CreateConfigParams, GlobalVariableOptions } from "./types";
import { name as pluginName } from '../package.json'

const defaultOptions: GlobalVariableOptions = {
  prefixes: PREFIX,
  configurationFileName: CONFIGURATION_FILE_NAME,
}

const { error } = useLog()

export function globalVariable(options: GlobalVariableOptions = {}) {

  options = { ...defaultOptions, ...options }
  const { configurationFileName, configurationName, prefixes, parser } = options

  let viteEnv: Record<string, string> = {}

  let userContext: UserConfig = {}
  let userEnv: ConfigEnv = {} as unknown as ConfigEnv
  return {
    name: pluginName,
    apply: 'build',
    enforce: 'post',
    config(context, env) {
      userEnv = env
      userContext = context
      viteEnv = loadEnv(env.mode, context.envDir ? context.envDir : context.root || './', prefixes)
      if (parser) {
        if (isFunction(parser))
          viteEnv = parser(viteEnv)
        else
          error('parser is not a function!')
      } else {
        viteEnv = parseEnv(viteEnv)
      }
      console.log(env)
    },
    closeBundle() {
      const variable = viteEnv
      const fileName = isFunction(configurationFileName) ? configurationFileName(userContext, userEnv) : configurationFileName!
      const globalVariableName = isFunction(configurationName) ? configurationName(userContext, userEnv) : configurationName! || getGlobalConfigName(userEnv)
      createConfig({ options: { variable, fileName, globalVariableName }, writePath: userContext.build?.outDir || getRootPath('dist') })
    }
  } as Plugin
}


function createConfig(params: CreateConfigParams) {
  const { options } = params
  const { variable, globalVariableName, fileName } = options
  try {
    const windowConf = `window.${globalVariableName}`;
    // Ensure that the variable will not be modified 
    const configStr = `${windowConf}=${JSON.stringify(variable)};
      Object.freeze(${windowConf});
      Object.defineProperty(window, "${globalVariableName}", {
        configurable: false,
        writable: false,
      });
    `.replace(/\s/g, '');

    writeFileSync(getRootPath(`dist/${fileName}`), configStr, { encoding: 'utf-8' })
  } catch (error) {

  }
}
