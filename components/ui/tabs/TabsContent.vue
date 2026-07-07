<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { TabsContent } from 'reka-ui'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ value: string | number; class?: HTMLAttributes['class'] }>()
</script>

<template>
  <TabsContent
    v-bind="$attrs"
    :value="props.value"
    :class="cn('ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', props.class)"
  >
    <slot />
  </TabsContent>
</template>
