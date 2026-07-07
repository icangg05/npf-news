<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'

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
        <AppLogo class="shadow-sm shadow-gold/20 ring-1 ring-white/10" />
        <span class="text-lg tracking-tight">Au<span class="text-gold">Pulse</span></span>
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

      <!-- Mobile: toggle tema + logout (navigasi ada di tab bar bawah) -->
      <div class="flex items-center gap-1 sm:hidden">
        <ThemeToggle />
        <Button v-if="user" variant="ghost" size="icon" class="text-muted-foreground" aria-label="Keluar" @click="logout">
          <LogOut class="h-5 w-5" />
        </Button>
      </div>
    </div>
  </header>
</template>
