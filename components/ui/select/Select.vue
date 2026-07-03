<script setup lang="ts">
import { SelectRoot } from 'reka-ui'

const props = defineProps<{
  modelValue?: string | null
  defaultValue?: string | null
}>()
const emits = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <SelectRoot
    :model-value="props.modelValue ?? undefined"
    :default-value="props.defaultValue ?? undefined"
    @update:model-value="emits('update:modelValue', $event as string)"
  >
    <slot />
  </SelectRoot>
</template>
