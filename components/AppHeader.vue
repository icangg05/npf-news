<script setup lang="ts">
import { LineChart, LogOut } from 'lucide-vue-next'

const { links, isActive, user } = useNav()
const client = useSupabaseClient()
const router = useRouter()

async function logout() {
  await client.auth.signOut()
  await router.push('/login')
}
</script>

<template>
  <header class="glass fixed inset-x-0 top-0 z-40 border-x-0 border-t-0">
    <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
      <NuxtLink to="/" class="flex items-center gap-2.5 font-display font-bold">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-amber-600 text-gold-foreground shadow-lg shadow-gold/30 ring-1 ring-white/20">
          <LineChart class="h-5 w-5" />
        </span>
        <span>NFP <span class="text-gold">×</span> <span class="text-muted-foreground font-medium">Emas</span></span>
      </NuxtLink>

      <!-- Nav desktop -->
      <nav class="hidden items-center gap-1 text-sm sm:flex">
        <Button
          v-for="l in links"
          :key="l.to"
          variant="ghost"
          size="sm"
          :class="isActive(l) ? 'bg-accent font-semibold text-primary' : 'text-muted-foreground'"
          as-child
        >
          <NuxtLink :to="l.to">{{ l.label }}</NuxtLink>
        </Button>
        <Button v-if="user" variant="ghost" size="sm" class="text-muted-foreground" @click="logout">
          <LogOut class="h-4 w-4" /> Keluar
        </Button>
        <Button v-else variant="outline" size="sm" as-child>
          <NuxtLink to="/login">Login admin</NuxtLink>
        </Button>
        <div class="ml-1 h-5 w-px bg-border" />
        <ThemeToggle />
      </nav>

      <!-- Mobile: hanya toggle tema (navigasi ada di tab bar bawah) -->
      <div class="sm:hidden">
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
