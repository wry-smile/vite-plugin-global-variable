export const getGlobalConfigName = () => {
  return `__${import.meta.env.MODE.toUpperCase()}__${import.meta.env.VITE_GLOB_APP_SHORT_NAME || 'APP'}__CONF__`
    .toUpperCase()
    .replace(/\s/g, '');
}

export const useGlobSetting = (envName: string = getGlobalConfigName()) => import.meta.env.DEV ? import.meta.env : window[envName as any] as unknown as ImportMetaEnv
