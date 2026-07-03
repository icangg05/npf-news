<script setup lang="ts">
import type { Trade, Currency } from '~/types/trade'
import { CURRENCIES } from '~/types/trade'
import { Plus, Pencil, Trash2, X, Loader2, Check, Wallet, CalendarDays } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const { listAll, create, update, remove } = useTrades()
const toast = useToast()

const { data: trades, refresh } = await useAsyncData<Trade[]>('admin-trades', () => listAll(), { default: () => [] })

// ---- form ----
const editingId = ref<string | null>(null)
const date = ref('')
const amount = ref('')
const currency = ref<Currency>('USC')
const note = ref('')
const saving = ref(false)

function resetForm() {
  editingId.value = null
  date.value = ''
  amount.value = ''
  currency.value = 'USC'
  note.value = ''
}

function startEdit(t: Trade) {
  editingId.value = t.id
  date.value = t.trade_date
  amount.value = String(t.amount)
  currency.value = t.currency
  note.value = t.note ?? ''
}

const valid = computed(() => !!date.value && amount.value !== '' && !Number.isNaN(Number(amount.value)))

async function save() {
  if (!valid.value) return
  const isEdit = !!editingId.value
  saving.value = true
  try {
    const payload = { trade_date: date.value, amount: Number(amount.value), currency: currency.value, note: note.value || null }
    if (editingId.value) await update(editingId.value, payload)
    else await create(payload)
    resetForm()
    await refresh()
    toast.success(isEdit ? 'Trade diperbarui.' : 'Trade ditambahkan.')
  } catch (e: any) {
    toast.error(e?.message ?? 'Gagal menyimpan trade.')
  } finally {
    saving.value = false
  }
}

async function onRemove(t: Trade) {
  if (!confirm(`Hapus trade ${formatDateStr(t.trade_date)}?`)) return
  try {
    await remove(t.id)
    if (editingId.value === t.id) resetForm()
    await refresh()
    toast.success('Trade dihapus.')
  } catch (e: any) {
    toast.error(e?.message ?? 'Gagal menghapus trade.')
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHero :icon="Wallet" eyebrow="Manajemen data" subtitle="Input profit/loss (bisa negatif) untuk kalender.">
      <template #title>Kelola <span class="text-gold">Trade</span> Harian</template>
      <template #actions>
        <Button variant="outline" class="border-white/30 bg-white/10 text-primary-foreground hover:bg-white/20" as-child>
          <NuxtLink to="/calendar"><CalendarDays class="h-4 w-4" /> Lihat kalender</NuxtLink>
        </Button>
      </template>
    </PageHero>

    <!-- Form -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base">{{ editingId ? 'Edit trade' : 'Tambah trade' }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="grid gap-4 sm:grid-cols-12" @submit.prevent="save">
          <div class="sm:col-span-3">
            <Label class="mb-1.5 block text-xs">Tanggal *</Label>
            <Input v-model="date" type="date" />
          </div>
          <div class="sm:col-span-3">
            <Label class="mb-1.5 block text-xs">Jumlah (- = loss) *</Label>
            <Input v-model="amount" type="number" inputmode="decimal" step="any" placeholder="mis. 250 atau -80" />
          </div>
          <div class="sm:col-span-2">
            <Label class="mb-1.5 block text-xs">Mata uang</Label>
            <Select v-model="currency">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="sm:col-span-12">
            <Label class="mb-1.5 block text-xs">Catatan / kesimpulan</Label>
            <Textarea v-model="note" placeholder="Ringkasan / kesimpulan trade hari itu…" />
          </div>
          <div class="flex items-center gap-2 sm:col-span-12">
            <Button type="submit" :disabled="!valid || saving">
              <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
              <Plus v-else-if="!editingId" class="h-4 w-4" />
              <Check v-else class="h-4 w-4" />
              {{ saving ? 'Menyimpan…' : editingId ? 'Perbarui' : 'Tambah' }}
            </Button>
            <Button v-if="editingId" type="button" variant="ghost" @click="resetForm">
              <X class="h-4 w-4" /> Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- List -->
    <Card>
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead>Tanggal</TableHead>
            <TableHead class="text-right">Jumlah</TableHead>
            <TableHead>Mata uang</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead class="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="t in trades" :key="t.id">
            <TableCell class="whitespace-nowrap">{{ formatDateStr(t.trade_date) }}</TableCell>
            <TableCell class="text-right font-semibold" :class="t.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'">
              {{ formatCurrency(t.amount, t.currency) }}
            </TableCell>
            <TableCell><span class="rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold">{{ t.currency }}</span></TableCell>
            <TableCell class="max-w-[280px] truncate text-muted-foreground">{{ t.note || '—' }}</TableCell>
            <TableCell class="text-right whitespace-nowrap">
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="startEdit(t)"><Pencil class="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive" @click="onRemove(t)"><Trash2 class="h-4 w-4" /></Button>
            </TableCell>
          </TableRow>
          <TableEmpty v-if="!trades.length" :colspan="5">Belum ada trade.</TableEmpty>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
