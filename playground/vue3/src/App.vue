<script setup lang="ts">
import { useGlobSetting } from '@wry-smile/vite-plugin-global-variable/tools'
import HelloWorld from './components/HelloWorld.vue';

const { VITE_GLOB_BOOLEAN, VITE_GLOB_TEST } = useGlobSetting()

</script>  
 
<template>
  {{ VITE_GLOB_BOOLEAN }}
  {{ VITE_GLOB_TEST }}
  <HelloWorld/>
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
