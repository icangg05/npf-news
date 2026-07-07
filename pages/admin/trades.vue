<script setup lang="ts">
import type { Trade, Currency } from '~/types/trade'
import { CURRENCIES } from '~/types/trade'
import { Plus, Trash2, X, Loader2, Check, Wallet, CalendarDays, ChevronRight } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const { listAll, create, update, remove } = useTrades()
const toast = useToast()

const { data: trades, refresh } = await useAsyncData<Trade[]>('admin-trades', () => listAll(), { default: () => [] })

// ---- form (di dalam modal) ----
const formOpen = ref(false)
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

function openCreate() {
  resetForm()
  date.value = toDateStr(new Date())
  formOpen.value = true
}

function openEdit(t: Trade) {
  editingId.value = t.id
  date.value = t.trade_date
  amount.value = String(t.amount)
  currency.value = t.currency
  note.value = t.note ?? ''
  formOpen.value = true
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
    formOpen.value = false
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
    if (editingId.value === t.id) { formOpen.value = false; resetForm() }
    await refresh()
    toast.success('Trade dihapus.')
  } catch (e: any) {
    toast.error(e?.message ?? 'Gagal menghapus trade.')
  }
}

const amountTone = (a: number) => (a >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive')
</script>

<template>
  <div class="space-y-6">
    <PageHero :icon="Wallet" eyebrow="Manajemen data" subtitle="Input profit/loss (bisa negatif) untuk kalender.">
      <template #title>Kelola <span class="text-gold">Trade</span> Harian</template>
      <template #actions>
        <Button variant="outline" as-child>
          <NuxtLink to="/calendar"><CalendarDays class="h-4 w-4" /> Lihat kalender</NuxtLink>
        </Button>
        <Button variant="gold" @click="openCreate">
          <Plus class="h-4 w-4" /> Tambah trade
        </Button>
      </template>
    </PageHero>

    <!-- ===== Mobile: kartu ringkas ===== -->
    <div class="space-y-3 sm:hidden">
      <button
        v-for="t in trades"
        :key="t.id"
        type="button"
        class="glass-card hover-lift block w-full p-3 text-left"
        @click="openEdit(t)"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0">
            <div class="text-sm font-semibold">{{ formatDateStr(t.trade_date) }}</div>
            <div class="mt-0.5 text-base font-bold" :class="amountTone(t.amount)">
              {{ formatCurrency(t.amount, t.currency) }}
            </div>
          </div>
          <span class="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{{ t.currency }}</span>
        </div>
        <div v-if="stripHtml(t.note)" class="mt-2 flex items-center justify-between gap-2 border-t pt-2">
          <span class="truncate text-[11px] text-muted-foreground">{{ stripHtml(t.note) }}</span>
        </div>
        <div class="mt-2 flex justify-end">
          <span
            role="button"
            tabindex="0"
            class="flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
            aria-label="Hapus"
            @click.stop="onRemove(t)"
            @keydown.enter.stop="onRemove(t)"
          >
            <Trash2 class="h-4 w-4" />
          </span>
        </div>
      </button>
      <Card v-if="!trades.length">
        <CardContent class="py-10 text-center text-sm text-muted-foreground">Belum ada trade.</CardContent>
      </Card>
    </div>

    <!-- ===== Desktop: tabel, klik baris untuk edit ===== -->
    <Card class="hidden sm:block">
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
          <TableRow v-for="t in trades" :key="t.id" class="cursor-pointer" @click="openEdit(t)">
            <TableCell class="whitespace-nowrap">{{ formatDateStr(t.trade_date) }}</TableCell>
            <TableCell class="text-right font-semibold" :class="amountTone(t.amount)">
              {{ formatCurrency(t.amount, t.currency) }}
            </TableCell>
            <TableCell><span class="rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold">{{ t.currency }}</span></TableCell>
            <TableCell class="max-w-[280px] truncate text-muted-foreground">{{ stripHtml(t.note) || '—' }}</TableCell>
            <TableCell class="whitespace-nowrap text-right">
              <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive" aria-label="Hapus" @click.stop="onRemove(t)">
                <Trash2 class="h-4 w-4" />
              </Button>
              <ChevronRight class="ml-1 inline h-4 w-4 text-muted-foreground/50" />
            </TableCell>
          </TableRow>
          <TableEmpty v-if="!trades.length" :colspan="5">Belum ada trade.</TableEmpty>
        </TableBody>
      </Table>
    </Card>

    <!-- ===== Modal form (tambah / edit) ===== -->
    <Dialog v-model:open="formOpen">
      <DialogContent class="max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ editingId ? 'Edit trade' : 'Tambah trade' }}</DialogTitle>
          <DialogDescription>Profit/loss satu hari. Nilai negatif untuk loss.</DialogDescription>
        </DialogHeader>

        <form class="grid gap-4 sm:grid-cols-12" @submit.prevent="save">
          <div class="sm:col-span-6">
            <Label class="mb-1.5 block text-xs">Tanggal *</Label>
            <Input v-model="date" type="date" />
          </div>
          <div class="sm:col-span-6">
            <Label class="mb-1.5 block text-xs">Jumlah (- = loss) *</Label>
            <Input v-model="amount" type="number" inputmode="decimal" step="any" placeholder="mis. 250 atau -80" />
          </div>
          <div class="sm:col-span-6">
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
            <RichTextEditor v-model="note" placeholder="Ringkasan / kesimpulan trade hari itu…" />
          </div>

          <DialogFooter class="sm:col-span-12">
            <Button type="button" variant="ghost" @click="formOpen = false">
              <X class="h-4 w-4" /> Batal
            </Button>
            <Button type="submit" :disabled="!valid || saving">
              <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
              <Plus v-else-if="!editingId" class="h-4 w-4" />
              <Check v-else class="h-4 w-4" />
              {{ saving ? 'Menyimpan…' : editingId ? 'Perbarui' : 'Tambah' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
