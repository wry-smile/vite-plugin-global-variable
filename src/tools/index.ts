export const useGlobSetting = (envName: string = '__PRODUCTION__APP__CONF__') => import.meta.env.DEV ? import.meta.env : window[envName as any] as unknown as ImportMetaEnv
