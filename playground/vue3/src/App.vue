<script setup lang="ts">
const useGlobSetting = (envName: string = '__PRODUCTION__APP__CONF__') => import.meta.env.DEV ? import.meta.env : window[envName as any] as unknown as ImportMetaEnv

const { VITE_GLOB_BOOLEAN } = useGlobSetting()

</script>  
 
<template>
  {{ VITE_GLOB_BOOLEAN }}
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
