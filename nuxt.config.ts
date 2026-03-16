// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    'nuxt-auth-utils',
    '@nuxtjs/sitemap',
  ],

  i18n: {
    locales: [
      { code: 'th', name: 'ไทย', file: 'th.json' },
    ],
    defaultLocale: 'th',
    langDir: 'locales',
    strategy: 'prefix_except_default',
  },

  runtimeConfig: {
    session: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    sessionPassword: '',
    oauth: {
      google: {
        clientId: '',
        clientSecret: '',
      },
    },
    geminiApiKey: '',
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
  },

  nitro: {
    preset: 'node-server',
    experimental: {
      openAPI: true,
    },
    openAPI: {
      meta: {
        title: 'JamJapan API',
        description: 'API สำหรับเว็บแนะนำเส้นทางเดินเท้าในญี่ปุ่น สำหรับนักท่องเที่ยวไทย',
        version: '1.0.0',
      },
    },
  },

  sitemap: {
    siteUrl: 'https://jamjapan.com',
    routes: async () => {
      // Dynamic routes for published routes
      try {
        const { getPrisma } = await import('./server/utils/prisma')
        const prisma = await getPrisma()
        const routes = await prisma.route.findMany({
          where: { status: 'published' },
          select: { id: true, updatedAt: true },
        })
        return routes.map((route) => ({
          loc: `/routes/${route.id}`,
          lastmod: route.updatedAt.toISOString().split('T')[0],
          priority: 0.8,
        }))
      } catch {
        return []
      }
    },
    exclude: ['/admin/**', '/my/**', '/api/**', '/auth/**'],
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
