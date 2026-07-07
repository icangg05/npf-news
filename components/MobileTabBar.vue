<script setup lang="ts">
import { LogIn } from 'lucide-vue-next'

const { links, isActive, user } = useNav()
</script>

<template>
  <nav
    class="glass pb-safe fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 sm:hidden"
    aria-label="Navigasi utama"
  >
    <ul class="mx-auto flex max-w-lg items-stretch justify-around px-1">
      <li v-for="l in links" :key="l.to" class="flex-1">
        <NuxtLink
          :to="l.to"
          class="group relative flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors"
          :class="isActive(l) ? 'text-primary' : 'text-muted-foreground'"
        >
          <span
            class="pointer-events-none absolute -top-px h-0.5 w-8 rounded-full bg-primary transition-opacity"
            :class="isActive(l) ? 'opacity-100 shadow-[0_0_10px_hsl(var(--primary))]' : 'opacity-0'"
          />
          <component
            :is="l.icon"
            class="h-[22px] w-[22px] transition-transform group-active:scale-90"
            :class="isActive(l) ? 'drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]' : ''"
            :stroke-width="isActive(l) ? 2.4 : 2"
          />
          <span class="leading-none">{{ l.label }}</span>
        </NuxtLink>
      </li>

      <li v-if="!user" class="flex-1">
        <NuxtLink
          to="/login"
          class="group flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors"
        >
          <LogIn class="h-[22px] w-[22px] transition-transform group-active:scale-90" />
          <span class="leading-none">Login</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
