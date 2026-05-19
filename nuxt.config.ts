import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/color-mode',
    'motion-v/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@vee-validate/nuxt',
    '@morev/vue-transitions/nuxt',
  ],
  ssr: false,
  eslint: {
    config: {
      stylistic: false, // usamos Prettier, no Stylistic
    },
  },
  imports: {
    imports: [
      {
        from: 'tailwind-variants',
        name: 'tv',
      },
      {
        from: 'tailwind-variants',
        name: 'VariantProps',
        type: true,
      },
    ],
  },
  devtools: { enabled: true },
  app: {
    // Deshabilita el sistema de transiciones nativo de Nuxt
    pageTransition: false,
    layoutTransition: false,
  },
  css: ['~/assets/css/tailwind.css'],

  colorMode: {
    storageKey: 'frontend-tua-susalud-color-mode',
    classSuffix: '',
  },
  compatibilityDate: '2025-07-15',

  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:9000',
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  icon: {
    clientBundle: {
      scan: true,
      sizeLimitKb: 0,
    },

    mode: 'svg',
    class: 'shrink-0',
    fetchTimeout: 2000,
    serverBundle: 'local',
  },
})
