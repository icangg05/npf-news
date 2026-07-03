<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { Primitive } from 'reka-ui'
import { type ButtonVariants, buttonVariants } from '.'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    as?: string | Component
    asChild?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { as: 'button' },
)
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
