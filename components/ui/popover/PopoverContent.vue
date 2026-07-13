<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { PopoverContent, PopoverPortal } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    align?: 'start' | 'center' | 'end'
    sideOffset?: number
  }>(),
  { align: 'start', sideOffset: 4 },
)
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      :align="props.align"
      :side-offset="props.sideOffset"
      :class="cn('z-50 w-auto rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', props.class)"
    >
      <slot />
    </PopoverContent>
  </PopoverPortal>
</template>
