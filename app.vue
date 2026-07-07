<script setup lang="ts">
import { Toaster } from 'vue-sonner'

const route = useRoute()
const colorMode = useColorMode()

// Halaman login tampil fullscreen tanpa header & tab bar.
const isAuthPage = computed(() => route.path === '/login')

const year = new Date().getFullYear()
</script>

<template>
  <div class="app-bg flex min-h-screen flex-col" :class="isAuthPage ? '' : 'pt-14'">
    <!-- Indikator loading pindah halaman (aksen emas -> cyan) -->
    <NuxtLoadingIndicator
      color="linear-gradient(to right, hsl(43 96% 56%), hsl(187 92% 56%))"
      :height="1"
    />

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
      <NuxtPage />
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
