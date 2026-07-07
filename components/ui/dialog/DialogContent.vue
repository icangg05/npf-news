<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DialogClose, DialogContent, DialogOverlay, DialogPortal } from 'reka-ui'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ class?: HTMLAttributes['class']; fullscreen?: boolean }>()
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <DialogContent
      v-bind="$attrs"
      :class="cn(
        'glass-card fixed z-50 grid gap-4 p-5 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        fullscreen
          ? 'inset-0 h-[100dvh] w-screen max-w-none overflow-y-auto rounded-none border-0 data-[state=open]:slide-in-from-bottom-4'
          : 'left-1/2 top-1/2 max-h-[92dvh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
        props.class,
      )"
    >
      <slot />

      <DialogClose
        class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground ring-offset-background transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Tutup"
      >
        <X class="h-4 w-4" />
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
