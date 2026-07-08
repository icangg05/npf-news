<script setup lang="ts">
import { Toaster } from 'vue-sonner'

const route = useRoute()
const colorMode = useColorMode()

// Halaman login tampil fullscreen tanpa header & tab bar.
const isAuthPage = computed(() => route.path === '/login')

// ---- Skeleton pindah halaman (menggantikan indikator loading) ----
// Kerangka konten muncul saat navigasi agar terasa seperti aplikasi native.
const nuxtApp = useNuxtApp()
const pageLoading = ref(false)
// Ditandai true setelah load awal; dibagikan ke useCachedData untuk revalidasi.
const appReady = useState('app-ready', () => false)

// Skeleton hanya tampil bila navigasi benar-benar lambat (>180ms). Halaman
// dengan data cache tampil instan tanpa kedip skeleton (rasa aplikasi native).
let startTimer: ReturnType<typeof setTimeout> | null = null
nuxtApp.hook('page:start', () => {
  if (!appReady.value) return
  if (startTimer) clearTimeout(startTimer)
  startTimer = setTimeout(() => { pageLoading.value = true }, 180)
})
nuxtApp.hook('page:finish', () => {
  if (startTimer) { clearTimeout(startTimer); startTimer = null }
  pageLoading.value = false
})
onMounted(() => {
  nextTick(() => { appReady.value = true })
})
// Skeleton hanya untuk halaman ber-layout (bukan login fullscreen).
const showSkeleton = computed(() => pageLoading.value && !isAuthPage.value)

const year = new Date().getFullYear()
</script>

<template>
  <div class="app-bg flex min-h-screen flex-col" :class="isAuthPage ? '' : 'pt-14'">
    <!-- Ornamen latar dekoratif -->
    <div class="bg-ornaments" aria-hidden="true">
      <div class="bg-grid" />
      <div class="ring-ornament" />
      <div class="blob blob-a" />
      <div class="blob blob-b" />
    </div>

    <AppHeader v-if="!isAuthPage" />

    <ClientOnly>
      <Toaster
        position="top-center"
        rich-colors
        close-button
        :theme="colorMode.value === 'dark' ? 'dark' : 'light'"
        :duration="3500"
      />
    </ClientOnly>

    <!-- pb ekstra di mobile agar konten tidak tertutup tab bar -->
    <main
      class="mx-auto w-full flex-1"
      :class="isAuthPage ? 'flex' : 'max-w-6xl px-4 py-6 pb-24 sm:py-8 sm:pb-8'"
    >
      <PageSkeleton v-if="showSkeleton" class="w-full" />
      <NuxtPage v-show="!showSkeleton" />
    </main>

    <template v-if="!isAuthPage">
      <footer class="border-t py-6 pb-24 text-center text-xs text-muted-foreground sm:pb-6">
        <p>© {{ year }} AuPulse · Analitik Riwayat NFP × Emas (XAU/USD)</p>
        <p class="mt-1 text-[11px]">
          Dikembangkan oleh <span class="font-medium text-foreground">Ilmi Faizan</span>
        </p>
      </footer>

      <!-- Tab bar navigasi (mobile) -->
      <MobileTabBar />
    </template>
  </div>
</template>
