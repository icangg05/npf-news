<script setup lang="ts">
import type { SpikeKind } from '~/types/nfp'
import { MoveUp, MoveDown, MoveRight } from 'lucide-vue-next'

const props = defineProps<{ spike: SpikeKind | null }>()

const map = {
  up: { icon: MoveUp, label: 'Spike atas' },
  down: { icon: MoveDown, label: 'Spike bawah' },
  one_way: { icon: MoveRight, label: 'Satu arah' },
} as const

const cfg = computed(() => (props.spike ? map[props.spike] : null))
</script>

<template>
  <span
    v-if="cfg"
    class="inline-flex items-center gap-1 rounded-md bg-gold/15 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-gold/40 dark:text-gold"
  >
    <component :is="cfg.icon" class="h-3.5 w-3.5" />
    {{ cfg.label }}
  </span>
  <span v-else class="text-muted-foreground">—</span>
</template>
