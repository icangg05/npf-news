<script setup lang="ts">
import { CheckCircle2, XCircle, Info, X } from 'lucide-vue-next'
import type { ToastType } from '~/composables/useToast'

const { toasts, remove } = useToast()

const cfg: Record<ToastType, { icon: any; ring: string; text: string }> = {
  success: { icon: CheckCircle2, ring: 'ring-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400' },
  error: { icon: XCircle, ring: 'ring-destructive/30', text: 'text-destructive' },
  info: { icon: Info, ring: 'ring-primary/30', text: 'text-primary' },
}
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-md border bg-card p-3 shadow-lg ring-1"
        :class="cfg[t.type].ring"
      >
        <component :is="cfg[t.type].icon" class="mt-0.5 h-4 w-4 shrink-0" :class="cfg[t.type].text" />
        <p class="flex-1 text-sm text-card-foreground">{{ t.message }}</p>
        <button class="text-muted-foreground transition-colors hover:text-foreground" @click="remove(t.id)">
          <X class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-8px) translateX(12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
.toast-leave-active {
  position: absolute;
}
</style>
