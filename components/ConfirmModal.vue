<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
}>(), {
  title: 'Hapus data?',
  confirmLabel: 'Hapus',
  cancelLabel: 'Batal',
  loading: false,
})

const emit = defineEmits<{ 'update:open': [value: boolean]; confirm: [] }>()

const openModel = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})
</script>

<template>
  <Dialog v-model:open="openModel">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert class="h-5 w-5" />
          </span>
          <DialogTitle>{{ title }}</DialogTitle>
        </div>
        <DialogDescription v-if="description" class="pt-1">{{ description }}</DialogDescription>
      </DialogHeader>

      <DialogFooter class="mt-2">
        <Button type="button" variant="ghost" :disabled="loading" @click="openModel = false">{{ cancelLabel }}</Button>
        <Button type="button" variant="destructive" :disabled="loading" @click="emit('confirm')">{{ confirmLabel }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
