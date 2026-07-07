<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { TabsList } from 'reka-ui'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <TabsList
    v-bind="$attrs"
    :class="cn('inline-flex items-center justify-center gap-1 rounded-lg border bg-muted/40 p-1 text-muted-foreground', props.class)"
  >
    <slot />
  </TabsList>
</template>
