// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    'shadcn-nuxt',
    '@nuxtjs/supabase',
    '@nuxt/icon',
  ],

  css: ['~/assets/css/main.css'],

  // Font tema: Plus Jakarta Sans (judul) + Inter (teks), di-selfhost
  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
      'Plus Jakarta Sans': [500, 600, 700, 800],
    },
    display: 'swap',
    download: true,
  },

  // shadcn-vue components live in components/ui and import without a prefix
  shadcn: {
    prefix: '',
    componentDir: '~/components/ui',
  },

  // Auth: only /admin/** is protected. Public pages stay open.
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: ['/admin(/*)?'],
      exclude: ['/', '/login'],
    },
  },

  app: {
    head: {
      title: 'Riwayat NFP vs Emas',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Riwayat rilis Non-Farm Payrolls dan dampaknya terhadap harga emas (XAU/USD).' },
      ],
    },
  },

  // Hot reload reliability inside Docker (bind-mounted source).
  vite: {
    server: {
      watch: {
        usePolling: true,
      },
    },
  },
})
