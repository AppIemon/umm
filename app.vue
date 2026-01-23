<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
const { initUser } = useAuth()

onMounted(() => {
  initUser()
})
</script>
