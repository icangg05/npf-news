<script setup lang="ts">
import { DialogRoot } from 'reka-ui'

// v-model:open & emit diteruskan via $attrs (hindari resolusi tipe lintas paket).
defineOptions({ inheritAttrs: false })
</script>

<template>
  <DialogRoot v-bind="$attrs">
    <slot />
  </DialogRoot>
</template>
