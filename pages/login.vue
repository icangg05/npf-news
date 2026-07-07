<script setup lang="ts">
import { Eye, EyeOff, Mail, Lock, TrendingUp, CalendarDays, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-vue-next'

const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const toast = useToast()

const email = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)

watchEffect(() => {
  if (user.value) router.push('/admin')
})

async function submit() {
  loading.value = true
  const { error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  loading.value = false
  if (error) {
    toast.error(error.message || 'Login gagal.')
    return
  }
  toast.success('Berhasil masuk.')
  await router.push('/admin')
}

const features = [
  { icon: TrendingUp, text: 'Riwayat reaksi emas tiap rilis NFP' },
  { icon: CalendarDays, text: 'Kalender profit multi-mata uang' },
  { icon: ShieldCheck, text: 'Data aman, hanya admin yang mengelola' },
]
</script>

<template>
  <div class="flex min-h-[100dvh] w-full flex-col px-4 py-5 sm:items-center sm:justify-center sm:py-8">
    <div class="mx-auto w-full max-w-4xl">
      <!-- Link kembali ke home/riwayat -->
      <NuxtLink
        to="/"
        class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft class="h-4 w-4" /> Kembali ke Riwayat
      </NuxtLink>

      <Card class="overflow-hidden shadow-sm">
        <div class="grid md:grid-cols-2">
          <!-- Panel brand -->
          <div class="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#12161f] via-[#0d1017] to-[#0B0E14] p-8 text-white md:flex">
            <div class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/25 blur-3xl" />
            <div class="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
            <div
              class="pointer-events-none absolute inset-0 opacity-[0.08]"
              style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 34px 34px;"
            />

            <div class="relative">
              <div class="flex items-center gap-2.5 font-display text-lg font-bold">
                <AppLogo class="ring-1 ring-white/10" />
                Au<span class="-ml-1 text-gold">Pulse</span>
              </div>
              <h2 class="mt-8 font-display text-2xl font-extrabold leading-snug">
                Panel Admin<br >Jurnal Trading Emas
              </h2>
              <p class="mt-2 max-w-xs text-sm text-white/60">
                Kelola riwayat NFP, sesi reaksi, dan kalender profit dalam satu tempat.
              </p>
            </div>

            <ul class="relative mt-8 space-y-3">
              <li v-for="f in features" :key="f.text" class="flex items-center gap-3 text-sm">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/15">
                  <component :is="f.icon" class="h-4 w-4 text-gold" />
                </span>
                {{ f.text }}
              </li>
            </ul>
          </div>

          <!-- Panel form -->
          <div class="p-6 sm:p-8">
            <!-- logo mobile -->
            <div class="mb-6 flex items-center gap-2.5 font-display text-lg font-bold md:hidden">
              <AppLogo class="ring-1 ring-white/10" />
              Au<span class="-ml-1 text-gold">Pulse</span>
            </div>

            <h1 class="font-display text-2xl font-extrabold tracking-tight">Selamat datang 👋</h1>
            <p class="mt-1 text-sm text-muted-foreground">Masuk ke akun admin untuk mengelola data.</p>

            <form class="mt-6 space-y-4" @submit.prevent="submit">
              <div>
                <Label for="email" class="mb-1.5 block">Email</Label>
                <div class="relative">
                  <Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" v-model="email" type="email" required placeholder="admin@email.com" class="pl-9" />
                </div>
              </div>

              <div>
                <Label for="password" class="mb-1.5 block">Password</Label>
                <div class="relative">
                  <Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    v-model="password"
                    :type="showPass ? 'text' : 'password'"
                    required
                    placeholder="••••••••"
                    class="px-9"
                  />
                  <button
                    type="button"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    :aria-label="showPass ? 'Sembunyikan password' : 'Tampilkan password'"
                    @click="showPass = !showPass"
                  >
                    <EyeOff v-if="showPass" class="h-4 w-4" />
                    <Eye v-else class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Button type="submit" class="w-full" :disabled="loading">
                {{ loading ? 'Masuk…' : 'Masuk' }}
                <ArrowRight v-if="!loading" class="h-4 w-4" />
              </Button>
            </form>

            <p class="mt-6 text-center text-xs text-muted-foreground">
              Hanya untuk admin. Butuh akses? Hubungi pengelola.
            </p>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
