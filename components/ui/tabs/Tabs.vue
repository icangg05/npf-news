<script setup lang="ts">
import { TabsRoot } from 'reka-ui'

// Teruskan semua props/emits (mis. v-model, default-value) lewat $attrs
// agar tidak butuh resolusi tipe lintas paket saat kompilasi SFC.
defineOptions({ inheritAttrs: false })
</script>

<template>
  <TabsRoot v-bind="$attrs">
    <slot />
  </TabsRoot>
</template>
