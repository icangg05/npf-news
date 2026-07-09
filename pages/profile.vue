<script setup lang="ts">
import type { Profile } from '~/types/trade'
import { UserCog, IdCard, Phone, Mail, Lock, Shield, User as UserIcon, Check, Loader2, Eye, EyeOff, KeyRound } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const user = useSupabaseUser()
const { getMine, updateMine, changePassword } = useMyProfile()
const toast = useToast()

const { data: profile, refresh } = await useCachedData<Profile | null>('my-profile', () => getMine(), { default: () => null })

// ---- form profil ----
const displayName = ref('')
const phone = ref('')
const savingProfile = ref(false)

watchEffect(() => {
  displayName.value = profile.value?.display_name ?? ''
  phone.value = profile.value?.phone ?? ''
})

async function saveProfile() {
  savingProfile.value = true
  try {
    profile.value = await updateMine({
      display_name: displayName.value.trim() || null,
      phone: phone.value.trim() || null,
    })
    await refresh()
    toast.success('Profil diperbarui.')
  } catch (e: any) {
    toast.error(e?.message ?? 'Gagal menyimpan profil.')
  } finally {
    savingProfile.value = false
  }
}

// ---- ganti password ----
const pass1 = ref('')
const pass2 = ref('')
const showPass = ref(false)
const savingPass = ref(false)

const passValid = computed(() => pass1.value.length >= 6 && pass1.value === pass2.value)

async function savePassword() {
  if (!passValid.value) return
  savingPass.value = true
  try {
    await changePassword(pass1.value)
    pass1.value = ''
    pass2.value = ''
    toast.success('Password diperbarui.')
  } catch (e: any) {
    toast.error(e?.message ?? 'Gagal mengganti password.')
  } finally {
    savingPass.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHero :icon="UserCog" eyebrow="Akun saya" subtitle="Perbarui nama, nomor telepon, dan password akun Anda.">
      <template #title>Edit <span class="text-gold">Profil</span></template>
    </PageHero>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Info akun -->
      <Card class="lg:col-span-1">
        <CardContent class="flex flex-col items-center gap-3 p-6 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold">
            <UserIcon class="h-8 w-8" />
          </div>
          <div>
            <div class="font-display text-lg font-bold">{{ profile?.display_name || '—' }}</div>
            <div class="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Mail class="h-3 w-3" /> {{ user?.email }}
            </div>
          </div>
          <Badge :variant="profile?.role === 'admin' ? 'default' : 'secondary'" class="gap-1">
            <component :is="profile?.role === 'admin' ? Shield : UserIcon" class="h-3 w-3" /> {{ profile?.role ?? 'trader' }}
          </Badge>
        </CardContent>
      </Card>

      <!-- Form profil + password -->
      <div class="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Data diri</CardTitle>
            <CardDescription>Email tidak dapat diubah sendiri — hubungi admin bila perlu.</CardDescription>
          </CardHeader>
          <CardContent>
            <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveProfile">
              <div>
                <Label class="mb-1.5 block text-xs">Nama tampilan</Label>
                <div class="relative">
                  <IdCard class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input v-model="displayName" type="text" placeholder="Nama Anda" class="pl-9" />
                </div>
              </div>
              <div>
                <Label class="mb-1.5 block text-xs">Telepon</Label>
                <div class="relative">
                  <Phone class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input v-model="phone" type="tel" inputmode="tel" placeholder="08…" class="pl-9" />
                </div>
              </div>
              <div class="sm:col-span-2 flex justify-end">
                <Button type="submit" :disabled="savingProfile">
                  <Loader2 v-if="savingProfile" class="h-4 w-4 animate-spin" />
                  <Check v-else class="h-4 w-4" />
                  {{ savingProfile ? 'Menyimpan…' : 'Simpan profil' }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base"><KeyRound class="h-4 w-4" /> Ganti password</CardTitle>
            <CardDescription>Minimal 6 karakter.</CardDescription>
          </CardHeader>
          <CardContent>
            <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="savePassword">
              <div>
                <Label class="mb-1.5 block text-xs">Password baru</Label>
                <div class="relative">
                  <Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input v-model="pass1" :type="showPass ? 'text' : 'password'" placeholder="••••••••" class="px-9" />
                  <button
                    type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    :aria-label="showPass ? 'Sembunyikan' : 'Tampilkan'" @click="showPass = !showPass"
                  >
                    <EyeOff v-if="showPass" class="h-4 w-4" /><Eye v-else class="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <Label class="mb-1.5 block text-xs">Ulangi password</Label>
                <div class="relative">
                  <Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input v-model="pass2" :type="showPass ? 'text' : 'password'" placeholder="••••••••" class="pl-9" />
                </div>
                <p v-if="pass2 && pass1 !== pass2" class="mt-1 text-[11px] text-destructive">Password tidak sama.</p>
              </div>
              <div class="sm:col-span-2 flex justify-end">
                <Button type="submit" :disabled="!passValid || savingPass">
                  <Loader2 v-if="savingPass" class="h-4 w-4 animate-spin" />
                  <Check v-else class="h-4 w-4" />
                  {{ savingPass ? 'Menyimpan…' : 'Ganti password' }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
