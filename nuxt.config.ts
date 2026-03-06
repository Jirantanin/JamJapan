// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
  ],

  i18n: {
    locales: [
      { code: 'th', name: 'ไทย', file: 'th.json' },
    ],
    defaultLocale: 'th',
    lazy: true,
    langDir: 'locales',
    strategy: 'prefix_except_default',
  },

  vite: {
    server: {
      hmr: {
        protocol: 'ws',
      },
    },
  },

  app: {
    head: {
      title: 'JamJapan - เส้นทางเดินเท้าในญี่ปุ่น',
      meta: [
        { name: 'description', content: 'แนะนำเส้นทางเดินเท้าในญี่ปุ่นที่หาทางยาก พร้อม step-by-step และแผนที่' },
      ],
      link: [
        { rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' },
      ],
    },
  },
})
