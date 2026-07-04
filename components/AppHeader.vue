<script setup lang="ts">
import { LineChart, LogOut, Menu, X } from 'lucide-vue-next'

interface NavLink {
  to: string
  label: string
  match: (path: string) => boolean
}

const user = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()
const route = useRoute()

const open = ref(false)

const links = computed<NavLink[]>(() => {
  const base: NavLink[] = [
    { to: '/', label: 'Riwayat', match: (p) => p === '/' },
    { to: '/calendar', label: 'Kalender', match: (p) => p.startsWith('/calendar') },
  ]
  if (user.value) {
    base.push(
      { to: '/admin', label: 'Sesi', match: (p) => p === '/admin' || (p.startsWith('/admin/') && !p.startsWith('/admin/trades')) },
      { to: '/admin/trades', label: 'Trade', match: (p) => p.startsWith('/admin/trades') },
    )
  }
  return base
})

const isActive = (l: NavLink) => l.match(route.path)

async function logout() {
  open.value = false
  await client.auth.signOut()
  await router.push('/login')
}

watch(() => route.fullPath, () => (open.value = false))
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-40 border-b bg-background">
    <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
      <NuxtLink to="/" class="flex items-center gap-2.5 font-display font-bold">
        <span class="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm shadow-primary/30 ring-1 ring-gold/40">
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
      </nav>

      <!-- Tombol hamburger mobile -->
      <Button
        variant="ghost"
        size="icon"
        class="h-9 w-9 sm:hidden"
        :aria-expanded="open"
        aria-label="Menu"
        @click="open = !open"
      >
        <X v-if="open" class="h-5 w-5" />
        <Menu v-else class="h-5 w-5" />
      </Button>
    </div>

    <!-- Panel menu mobile -->
    <Transition name="sheet">
      <nav v-if="open" class="border-t bg-background px-3 py-2 sm:hidden">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="block rounded-md px-3 py-2.5 text-sm font-medium"
          :class="isActive(l) ? 'bg-accent font-semibold text-primary' : 'text-foreground hover:bg-accent'"
        >
          {{ l.label }}
        </NuxtLink>
        <button
          v-if="user"
          class="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-accent"
          @click="logout"
        >
          <LogOut class="h-4 w-4" /> Keluar
        </button>
        <NuxtLink
          v-else
          to="/login"
          class="mt-1 block rounded-md border px-3 py-2.5 text-center text-sm font-medium hover:bg-accent"
        >
          Login admin
        </NuxtLink>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
