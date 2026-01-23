// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Ultra Music Mania (UMM)',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Ultra Music Mania (UMM) - Rhythm, Orbit, Synchronization' }
      ]
    }
  },
  css: ['~/assets/css/main.css'],
  experimental: {
    appManifest: false
  },
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI,
  },
})
