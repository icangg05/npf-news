// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxtjs/color-mode',
    'shadcn-nuxt',
    '@nuxtjs/supabase',
    '@nuxt/icon',
    '@vite-pwa/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  // Font tema: Space Grotesk (judul + teks), di-selfhost
  googleFonts: {
    families: {
      'Space Grotesk': [400, 500, 600, 700],
    },
    display: 'swap',
    download: true,
  },

  // Dark/light mode via class (`.dark`). Default mengikuti sistem.
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark',
    storageKey: 'nfp-color-mode',
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
      title: 'AuPulse — NFP × Emas',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'AuPulse — pantau denyut emas (XAU/USD) terhadap rilis Non-Farm Payrolls.' },
        { name: 'theme-color', content: '#0B0E14' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'AuPulse' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  // Progressive Web App — installable, offline-ready shell.
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'AuPulse',
      short_name: 'AuPulse',
      description: 'AuPulse — pantau denyut emas (XAU/USD) terhadap rilis Non-Farm Payrolls.',
      lang: 'id',
      theme_color: '#0B0E14',
      background_color: '#0B0E14',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      scope: '/',
      categories: ['finance', 'business'],
      icons: [
        { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
    },
    client: {
      installPrompt: true,
    },
    // Aktifkan `enabled: true` bila ingin menguji service worker saat `npm run dev`.
    // Dimatikan secara default agar SW tidak meng-cache saat HMR (build produksi tetap PWA penuh).
    devOptions: {
      enabled: false,
      type: 'module',
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
