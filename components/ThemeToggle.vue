<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    class="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
    :aria-label="isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'"
    :title="isDark ? 'Mode terang' : 'Mode gelap'"
    @click="toggle"
  >
    <ClientOnly>
      <Transition name="theme-swap" mode="out-in">
        <Sun v-if="isDark" key="sun" class="h-[18px] w-[18px]" />
        <Moon v-else key="moon" class="h-[18px] w-[18px]" />
      </Transition>
      <template #fallback>
        <Sun class="h-[18px] w-[18px]" />
      </template>
    </ClientOnly>
  </Button>
</template>

<style scoped>
.theme-swap-enter-active,
.theme-swap-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.theme-swap-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.6);
}
.theme-swap-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.6);
}
</style>
