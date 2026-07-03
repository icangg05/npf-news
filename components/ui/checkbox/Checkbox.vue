<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'
import { Check } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<{
  modelValue?: boolean | 'indeterminate'
  id?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()
const emits = defineEmits<{
  'update:modelValue': [value: boolean | 'indeterminate']
}>()
</script>

<template>
  <CheckboxRoot
    :id="props.id"
    :model-value="props.modelValue"
    :disabled="props.disabled"
    :class="cn('peer h-5 w-5 shrink-0 rounded-[5px] border border-primary shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground', props.class)"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <CheckboxIndicator class="flex h-full w-full items-center justify-center text-current">
      <Check class="h-3.5 w-3.5" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
