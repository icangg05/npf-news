<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, injectDialogRootContext } from 'reka-ui'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ class?: HTMLAttributes['class']; fullscreen?: boolean }>()

// Khusus mobile: saat modal terbuka, dorong satu entri riwayat agar gesture/tombol
// "kembali" menutup modal alih-alih meninggalkan halaman.
const rootContext = injectDialogRootContext()
if (import.meta.client) {
  let pushed = false

  const onPopState = () => {
    // Kembali ditekan saat modal terbuka -> tutup modal (entri sudah di-pop browser).
    pushed = false
    window.removeEventListener('popstate', onPopState)
    rootContext.onOpenChange(false)
  }

  const engage = () => {
    if (pushed || !window.matchMedia('(max-width: 767px)').matches) return
    window.history.pushState({ rekaDialog: true }, '')
    window.addEventListener('popstate', onPopState)
    pushed = true
  }

  const disengage = () => {
    if (!pushed) return
    // Ditutup bukan lewat tombol kembali -> buang entri riwayat tambahan.
    pushed = false
    window.removeEventListener('popstate', onPopState)
    window.history.back()
  }

  watch(() => rootContext.open.value, (open) => {
    if (open) engage()
    else disengage()
  })

  onScopeDispose(() => {
    if (pushed) window.removeEventListener('popstate', onPopState)
  })
}
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
          ? 'inset-0 h-[100dvh] w-screen max-w-none overflow-y-auto rounded-none border-0 data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:slide-out-to-bottom-4'
          : 'inset-x-0 bottom-0 max-h-[92dvh] w-full overflow-y-auto rounded-b-none data-[state=open]:slide-in-from-bottom-6 data-[state=closed]:slide-out-to-bottom-6 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-b-[var(--radius)]',
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
