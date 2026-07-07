<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  eyebrow?: string
  icon?: Component
  subtitle?: string
}>()
</script>

<template>
  <div class="glass-card relative overflow-hidden p-6 shadow-sm sm:p-8">
    <!-- ornamen aksen -->
    <div class="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-gold/25 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.05]"
      style="background-image: linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px); background-size: 34px 34px;"
    />

    <div class="relative flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <span
          v-if="eyebrow"
          class="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold"
        >
          <component :is="icon" v-if="icon" class="h-3.5 w-3.5" />
          {{ eyebrow }}
        </span>
        <h1 class="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          <slot name="title" />
        </h1>
        <p v-if="subtitle" class="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          {{ subtitle }}
        </p>
      </div>

      <div v-if="$slots.actions" class="relative flex shrink-0 flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
