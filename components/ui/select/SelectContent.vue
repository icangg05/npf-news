<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { SelectContent, SelectPortal, SelectViewport } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    position?: 'item-aligned' | 'popper'
  }>(),
  { position: 'popper' },
)
</script>

<template>
  <SelectPortal>
    <SelectContent
      :position="props.position"
      :class="cn('relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95', props.position === 'popper' && 'data-[side=bottom]:translate-y-1', props.class)"
    >
      <SelectViewport
        :class="cn('p-1', props.position === 'popper' && 'h-[var(--reka-select-trigger-height)] w-full min-w-[var(--reka-select-trigger-width)]')"
      >
        <slot />
      </SelectViewport>
    </SelectContent>
  </SelectPortal>
</template>
