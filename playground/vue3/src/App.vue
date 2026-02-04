<script lang="ts" setup>
import { useRuntimeConfig } from './config'

const appConfig = useRuntimeConfig(import.meta.env, import.meta.env.PROD)
</script>

<template>
  <div>
    <div>
      {{ appConfig.appName }}
      {{ appConfig.appTitle }}
    </div>
  </div>
</template>
