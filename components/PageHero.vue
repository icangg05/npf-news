<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  eyebrow?: string
  icon?: Component
  subtitle?: string
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-md border border-primary/20 bg-gradient-to-br from-primary via-primary to-indigo-700 p-6 text-primary-foreground shadow-lg sm:p-8">
    <!-- ornamen -->
    <div class="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gold/25 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.1]"
      style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 34px 34px;"
    />

    <div class="relative flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <span
          v-if="eyebrow"
          class="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-white/25"
        >
          <component :is="icon" v-if="icon" class="h-3.5 w-3.5" />
          {{ eyebrow }}
        </span>
        <h1 class="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          <slot name="title" />
        </h1>
        <p v-if="subtitle" class="mt-1.5 max-w-2xl text-sm text-primary-foreground/70">
          {{ subtitle }}
        </p>
      </div>

      <div v-if="$slots.actions" class="relative flex shrink-0 flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
