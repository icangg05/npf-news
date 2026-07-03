<script setup lang="ts">
import { Toaster } from '@/components/ui/toast'
</script>

<template>
  <div class="app-bg flex min-h-screen flex-col">
    <!-- Indikator loading pindah halaman (warna brand: indigo -> emas) -->
    <NuxtLoadingIndicator
      color="linear-gradient(to right, hsl(231 55% 50%), hsl(38 92% 50%))"
      :height="3"
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
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
      <NuxtPage />
    </main>
    <footer class="border-t py-6 text-center text-xs text-muted-foreground">
      Riwayat NFP vs Emas · Developer by Ilmi Faizan
    </footer>
  </div>
</template>
