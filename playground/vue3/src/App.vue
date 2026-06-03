<script lang="ts" setup>
import { useRuntimeConfig } from './config'

const appConfig = useRuntimeConfig()
console.log(appConfig)
</script>

<template>
  <div>
    <div>
      {{ appConfig.appName }}
      {{ appConfig.appTitle }}
    </div>
  </div>
</template>
