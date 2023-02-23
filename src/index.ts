import { getRootPath, getGlobalConfigName } from "./utils";
import { GLOB_CONFIG_FILE_NAME } from "./constant";
import { writeFileSync } from "fs";
import { Plugin } from "vite";

export function GenerateBuildConfig(viteEnv: Record<string, any>) {
  return {
    name: '@wry-smile/vite-plugin-global-variable',
    apply: 'build',
    enforce: 'post',
    config(context, env) {
      console.log(context, env)
    },
    closeBundle() {

      function createConfig({ config, configName, configFileName }: { configName: string, config: Record<string, any>, configFileName?: string } = { configName: '', config: {} }) {
        try {
          const windowConf = `window.${configName}`;
          // Ensure that the variable will not be modified 
          const configStr = `${windowConf}=${JSON.stringify(config)};
            Object.freeze(${windowConf});
            Object.defineProperty(window, "${configName}", {
              configurable: false,
              writable: false,
            });
          `.replace(/\s/g, '');

          writeFileSync(getRootPath(`dist/${configFileName}`), configStr, { encoding: 'utf-8' })
        } catch (error) {

        }
      }

      const configName = getGlobalConfigName(viteEnv)

      createConfig({ config: viteEnv, configFileName: GLOB_CONFIG_FILE_NAME, configName })

    }
  } as Plugin
}

