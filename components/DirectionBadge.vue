<script setup lang="ts">
import type { Direction } from '~/types/nfp'
import { TrendingUp, TrendingDown, MoveRight } from 'lucide-vue-next'

const props = defineProps<{ direction: Direction | null }>()

const map = {
  up: { icon: TrendingUp, cls: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400', label: 'Naik' },
  down: { icon: TrendingDown, cls: 'text-red-700 bg-red-100 dark:bg-red-950/50 dark:text-red-400', label: 'Turun' },
  neutral: { icon: MoveRight, cls: 'text-muted-foreground bg-muted', label: 'Sideways' },
} as const

const cfg = computed(() => (props.direction ? map[props.direction] : null))
</script>

<template>
  <span
    v-if="cfg"
    :class="['inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold', cfg.cls]"
  >
    <component :is="cfg.icon" class="h-3.5 w-3.5" />
    {{ cfg.label }}
  </span>
  <span v-else class="text-muted-foreground">—</span>
</template>
