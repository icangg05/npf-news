<script setup lang="ts">
/**
 * Skeleton generik saat berpindah halaman.
 * Menyerupai kerangka umum tiap halaman (hero → kartu statistik → daftar konten)
 * agar transisi terasa seperti aplikasi native tanpa indikator loading terpisah.
 */
</script>

<template>
  <div class="animate-pulse space-y-6" aria-hidden="true">
    <!-- Hero -->
    <div class="glass-card space-y-3 p-6 sm:p-8">
      <div class="h-6 w-32 rounded-full bg-muted" />
      <div class="h-8 w-2/3 rounded-md bg-muted sm:h-9" />
      <div class="h-4 w-full max-w-md rounded bg-muted/70" />
    </div>

    <!-- Baris tab -->
    <div class="flex justify-center">
      <div class="h-9 w-56 rounded-md bg-muted" />
    </div>

    <!-- Kartu statistik -->
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div v-for="i in 4" :key="i" class="glass-card space-y-2.5 p-4">
        <div class="h-3.5 w-20 rounded bg-muted/70" />
        <div class="h-7 w-24 rounded-md bg-muted" />
      </div>
    </div>

    <!-- Daftar konten -->
    <div class="glass-card divide-y divide-border/60">
      <div v-for="i in 5" :key="i" class="flex items-center gap-3 p-4">
        <div class="h-10 w-10 shrink-0 rounded-md bg-muted" />
        <div class="min-w-0 flex-1 space-y-2">
          <div class="h-4 w-2/5 rounded bg-muted" />
          <div class="h-3 w-3/5 rounded bg-muted/70" />
        </div>
        <div class="hidden h-6 w-16 rounded-md bg-muted sm:block" />
      </div>
    </div>
  </div>
</template>
