<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { HoverCardContent, HoverCardPortal } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{ class?: HTMLAttributes['class']; sideOffset?: number }>(),
  { sideOffset: 6 },
)
</script>

<template>
  <HoverCardPortal>
    <HoverCardContent
      :side-offset="props.sideOffset"
      :class="cn('z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95', props.class)"
    >
      <slot />
    </HoverCardContent>
  </HoverCardPortal>
</template>
