<script setup lang="ts">
import { Toaster } from '@/components/ui/toast'
</script>

<template>
  <div class="app-bg flex min-h-screen flex-col pt-14">
    <!-- Indikator loading pindah halaman (aksen emas -> cyan) -->
    <NuxtLoadingIndicator
      color="linear-gradient(to right, hsl(43 96% 56%), hsl(187 92% 56%))"
      :height="2"
    />

    <!-- Ornamen latar dekoratif -->
    <div class="bg-ornaments" aria-hidden="true">
      <div class="bg-grid" />
      <div class="ring-ornament" />
      <div class="blob blob-a" />
      <div class="blob blob-b" />
    </div>

    <AppHeader />
    <Toaster />
    <!-- pb ekstra di mobile agar konten tidak tertutup tab bar -->
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:py-8 sm:pb-8">
      <NuxtPage />
    </main>
    <footer class="border-t py-6 pb-24 text-center text-xs text-muted-foreground sm:pb-6">
      Riwayat NFP vs Emas · Developer by Ilmi Faizan
    </footer>

    <!-- Tab bar navigasi (mobile) -->
    <MobileTabBar />
  </div>
</template>
