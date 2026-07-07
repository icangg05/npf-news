<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

// Logo AuPulse: garis tren emas menanjak dengan denyut (pulse) di latar gelap.
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <span :class="cn('relative inline-flex h-9 w-9 items-center justify-center rounded-lg', props.class)">
    <svg viewBox="0 0 512 512" class="h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="aupulse-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#141A24" />
          <stop offset="1" stop-color="#0B0E14" />
        </linearGradient>
        <linearGradient id="aupulse-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FFD873" />
          <stop offset="0.55" stop-color="#F5B72E" />
          <stop offset="1" stop-color="#E0961B" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="128" fill="url(#aupulse-bg)" />
      <rect x="7" y="7" width="498" height="498" rx="121" fill="none" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="2" />
      <!-- pulse / trend line -->
      <polyline
        points="88,300 168,300 208,196 256,356 300,268 344,268 360,232 424,232"
        fill="none" stroke="url(#aupulse-gold)" stroke-width="26"
        stroke-linecap="round" stroke-linejoin="round"
      />
      <circle cx="424" cy="232" r="20" fill="#5CE1E6" />
      <circle cx="424" cy="232" r="34" fill="none" stroke="#5CE1E6" stroke-opacity="0.35" stroke-width="8" />
    </svg>
  </span>
</template>
