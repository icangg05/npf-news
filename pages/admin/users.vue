<script setup lang="ts">
import type { AdminUser, EditUserInput } from '~/composables/useAdminUsers'
import type { Role } from '~/types/trade'
import { UserPlus, Users, Trash2, X, Loader2, Check, Shield, User as UserIcon, Eye, EyeOff, Mail, Lock, Pencil, Phone, IdCard } from 'lucide-vue-next'

definePageMeta({ middleware: ['auth', 'admin'] })

const { list, create, update, remove } = useAdminUsers()
const me = useSupabaseUser()
const toast = useToast()

const { data: users, pending, refresh } = await useCachedData<AdminUser[]>('admin-users', () => list(), { default: () => [] })

// ---- form register / edit (modal) ----
const formOpen = ref(false)
const editing = ref<AdminUser | null>(null)
const email = ref('')
const password = ref('')
const role = ref<Role>('trader')
const displayName = ref('')
const phone = ref('')
const showPass = ref(false)
const saving = ref(false)

const isEdit = computed(() => !!editing.value)

function openCreate() {
  editing.value = null
  email.value = ''
  password.value = ''
  role.value = 'trader'
  displayName.value = ''
  phone.value = ''
  showPass.value = false
  formOpen.value = true
}

function openEdit(u: AdminUser) {
  editing.value = u
  email.value = u.email
  password.value = ''
  role.value = u.role
  displayName.value = u.display_name ?? ''
  phone.value = u.phone ?? ''
  showPass.value = false
  formOpen.value = true
}

const valid = computed(() => {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
  // Buat baru: password wajib ≥6. Edit: kosong = tidak diubah, kalau diisi ≥6.
  const passOk = isEdit.value ? (password.value === '' || password.value.length >= 6) : password.value.length >= 6
  return emailOk && passOk
})

async function save() {
  if (!valid.value) return
  saving.value = true
  try {
    if (editing.value) {
      const payload: EditUserInput = {
        role: role.value,
        display_name: displayName.value.trim() || null,
        phone: phone.value.trim() || null,
      }
      if (email.value.trim() !== editing.value.email) payload.email = email.value.trim()
      if (password.value) payload.password = password.value
      await update(editing.value.id, payload)
      toast.success('User diperbarui.')
    } else {
      await create({
        email: email.value.trim(),
        password: password.value,
        role: role.value,
        display_name: displayName.value.trim() || null,
        phone: phone.value.trim() || null,
      })
      toast.success('User berhasil dibuat.')
    }
    formOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || e?.statusMessage || 'Gagal menyimpan user.')
  } finally {
    saving.value = false
  }
}

// ---- hapus (modal konfirmasi) ----
const toDelete = ref<AdminUser | null>(null)
const deleting = ref(false)
const confirmOpen = computed({
  get: () => !!toDelete.value,
  set: (v: boolean) => { if (!v) toDelete.value = null },
})
async function confirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await remove(toDelete.value.id)
    toDelete.value = null
    await refresh()
    toast.success('User dihapus.')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || e?.statusMessage || 'Gagal menghapus user.')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHero :icon="Users" eyebrow="Manajemen akun" subtitle="Daftarkan akun baru (admin / trader) dan kelola perannya.">
      <template #title>Kelola <span class="text-gold">User</span></template>
      <template #actions>
        <Button variant="gold" @click="openCreate">
          <UserPlus class="h-4 w-4" /> Register user
        </Button>
      </template>
    </PageHero>

    <!-- ===== Mobile: kartu ===== -->
    <div class="space-y-3 sm:hidden">
      <Card v-for="u in users" :key="u.id">
        <CardContent class="p-3">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="truncate text-sm font-semibold">{{ u.display_name || u.email }}</div>
              <div v-if="u.display_name" class="truncate text-[11px] text-muted-foreground">{{ u.email }}</div>
              <div v-if="u.phone" class="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><Phone class="h-3 w-3" />{{ u.phone }}</div>
              <div class="mt-0.5 text-[11px] text-muted-foreground">Dibuat {{ formatDateStr(u.created_at.slice(0, 10)) }}</div>
            </div>
            <Badge :variant="u.role === 'admin' ? 'default' : 'secondary'" class="shrink-0 gap-1">
              <component :is="u.role === 'admin' ? Shield : UserIcon" class="h-3 w-3" /> {{ u.role }}
            </Badge>
          </div>
          <div class="mt-3 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" class="h-8" @click="openEdit(u)">
              <Pencil class="h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive"
              :disabled="u.id === me?.id" aria-label="Hapus" @click="toDelete = u"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card v-if="!users.length && !pending">
        <CardContent class="py-10 text-center text-sm text-muted-foreground">Belum ada user.</CardContent>
      </Card>
    </div>

    <!-- ===== Desktop: tabel ===== -->
    <Card class="hidden sm:block">
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telepon</TableHead>
            <TableHead>Peran</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead class="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="u in users" :key="u.id" class="hover:bg-transparent">
            <TableCell class="font-medium">
              {{ u.display_name || '—' }}
              <span v-if="u.id === me?.id" class="ml-1 text-[10px] text-muted-foreground">(Anda)</span>
            </TableCell>
            <TableCell class="text-muted-foreground">{{ u.email }}</TableCell>
            <TableCell class="whitespace-nowrap text-muted-foreground">{{ u.phone || '—' }}</TableCell>
            <TableCell>
              <Badge :variant="u.role === 'admin' ? 'default' : 'secondary'" class="gap-1">
                <component :is="u.role === 'admin' ? Shield : UserIcon" class="h-3 w-3" /> {{ u.role }}
              </Badge>
            </TableCell>
            <TableCell class="whitespace-nowrap text-muted-foreground">{{ formatDateStr(u.created_at.slice(0, 10)) }}</TableCell>
            <TableCell class="whitespace-nowrap text-right">
              <Button variant="ghost" size="icon" class="h-8 w-8" aria-label="Edit" @click="openEdit(u)">
                <Pencil class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive"
                :disabled="u.id === me?.id" aria-label="Hapus" @click="toDelete = u"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
          <TableEmpty v-if="!users.length && !pending" :colspan="6">Belum ada user.</TableEmpty>
        </TableBody>
      </Table>
    </Card>

    <!-- ===== Modal register ===== -->
    <Dialog v-model:open="formOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ isEdit ? 'Edit user' : 'Register user baru' }}</DialogTitle>
          <DialogDescription>
            {{ isEdit ? 'Ubah email, peran, atau reset password user.' : 'User langsung aktif (terkonfirmasi) dan bisa login.' }}
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="save">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <Label class="mb-1.5 block text-xs">Nama tampilan</Label>
              <div class="relative">
                <IdCard class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input v-model="displayName" type="text" placeholder="Nama" class="pl-9" />
              </div>
            </div>
            <div>
              <Label class="mb-1.5 block text-xs">Telepon</Label>
              <div class="relative">
                <Phone class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input v-model="phone" type="tel" inputmode="tel" placeholder="08…" class="pl-9" />
              </div>
            </div>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs">Email *</Label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input v-model="email" type="email" placeholder="user@email.com" class="pl-9" />
            </div>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs">
              Password {{ isEdit ? '' : '*' }}
              <span class="text-muted-foreground">{{ isEdit ? '(kosongkan bila tidak diubah)' : '(min. 6 karakter)' }}</span>
            </Label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input v-model="password" :type="showPass ? 'text' : 'password'" :placeholder="isEdit ? 'Password baru…' : '••••••••'" class="px-9" />
              <button
                type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                :aria-label="showPass ? 'Sembunyikan' : 'Tampilkan'" @click="showPass = !showPass"
              >
                <EyeOff v-if="showPass" class="h-4 w-4" /><Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs">Peran</Label>
            <Select v-model="role" :disabled="isEdit && editing?.id === me?.id">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="trader">trader — kelola trade sendiri</SelectItem>
                <SelectItem value="admin">admin — kelola data berita/NFP</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="isEdit && editing?.id === me?.id" class="mt-1 text-[11px] text-muted-foreground">Peran akun sendiri tidak dapat diubah.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" @click="formOpen = false"><X class="h-4 w-4" /> Batal</Button>
            <Button type="submit" :disabled="!valid || saving">
              <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
              <Check v-else class="h-4 w-4" />
              {{ saving ? 'Menyimpan…' : isEdit ? 'Simpan' : 'Buat user' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- ===== Konfirmasi hapus ===== -->
    <ConfirmModal
      v-model:open="confirmOpen"
      title="Hapus user?"
      :description="toDelete ? `Akun ${toDelete.email} beserta seluruh data trade-nya akan dihapus permanen.` : ''"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>
