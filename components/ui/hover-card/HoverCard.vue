<script setup lang="ts">
import { HoverCardRoot } from 'reka-ui'

const props = defineProps<{ openDelay?: number; closeDelay?: number }>()
</script>

<template>
  <HoverCardRoot :open-delay="props.openDelay ?? 120" :close-delay="props.closeDelay ?? 80">
    <slot />
  </HoverCardRoot>
</template>
