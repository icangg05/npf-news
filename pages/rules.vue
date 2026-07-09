<script setup lang="ts">
import type { TradeRules, TradeRulesInput, Currency } from '~/types/trade'
import { CURRENCIES } from '~/types/trade'
import {
  ScrollText, Wallet, ShieldAlert, Target, Lock, Layers, Pencil, X, Loader2, Check, TrendingDown, Zap,
} from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const { getRules, saveRules } = useRules()
const toast = useToast()

const { data: rules, refresh } = await useCachedData<TradeRules | null>('trade-rules', () => getRules(), { default: () => null })

const currency = computed<Currency>(() => rules.value?.base_currency ?? 'USC')
const modal = computed(() => rules.value?.modal_awal ?? 0)

// Persentase terhadap modal (dinamis) — null bila modal 0 / nilai kosong.
function pct(v: number | null | undefined): string | null {
  if (v == null || !modal.value) return null
  return `${((Math.abs(v) / modal.value) * 100).toFixed(1)}%`
}
function fmt(v: number | null | undefined): string {
  return v == null ? '—' : formatCurrency(v, currency.value)
}

// ---- Form edit (modal) ----
const formOpen = ref(false)
const saving = ref(false)
const f = reactive({
  modal_awal: '',
  base_currency: 'USC' as Currency,
  daily_loss_limit: '',
  daily_profit_target: '',
  daily_profit_max: '',
  daily_profit_secure: '',
  risk_per_trade: '',
  max_lot_size: '',
  max_layer: '',
})

// ---- Format ribuan (id-ID, pemisah titik) untuk field nominal (bilangan bulat) ----
type NominalKey = 'modal_awal' | 'daily_loss_limit' | 'daily_profit_target' | 'daily_profit_max' | 'daily_profit_secure' | 'risk_per_trade'
function groupThousands(raw: string | number): string {
  const digits = String(raw).replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('id-ID') : ''
}
function parseNominal(s: string): number | null {
  const digits = s.replace(/\D/g, '')
  return digits === '' ? null : Number(digits)
}
function onNominalInput(key: NominalKey, e: Event) {
  f[key] = groupThousands((e.target as HTMLInputElement).value)
}

function openEdit() {
  const r = rules.value
  f.modal_awal = r?.modal_awal != null ? groupThousands(r.modal_awal) : ''
  f.base_currency = r?.base_currency ?? 'USC'
  f.daily_loss_limit = r?.daily_loss_limit != null ? groupThousands(r.daily_loss_limit) : ''
  f.daily_profit_target = r?.daily_profit_target != null ? groupThousands(r.daily_profit_target) : ''
  f.daily_profit_max = r?.daily_profit_max != null ? groupThousands(r.daily_profit_max) : ''
  f.daily_profit_secure = r?.daily_profit_secure != null ? groupThousands(r.daily_profit_secure) : ''
  f.risk_per_trade = r?.risk_per_trade != null ? groupThousands(r.risk_per_trade) : ''
  f.max_lot_size = r?.max_lot_size != null ? String(r.max_lot_size) : ''
  f.max_layer = r?.max_layer != null ? String(r.max_layer) : ''
  formOpen.value = true
}

const num = (s: string): number | null => (s === '' || Number.isNaN(Number(s)) ? null : Number(s))
const valid = computed(() => parseNominal(f.modal_awal) != null)

async function save() {
  if (!valid.value) return
  saving.value = true
  try {
    const payload: TradeRulesInput = {
      modal_awal: parseNominal(f.modal_awal) ?? 0,
      base_currency: f.base_currency,
      daily_loss_limit: parseNominal(f.daily_loss_limit),
      daily_profit_target: parseNominal(f.daily_profit_target),
      daily_profit_max: parseNominal(f.daily_profit_max),
      daily_profit_secure: parseNominal(f.daily_profit_secure),
      risk_per_trade: parseNominal(f.risk_per_trade),
      max_lot_size: num(f.max_lot_size),
      max_layer: f.max_layer === '' ? null : Math.round(Number(f.max_layer)),
    }
    rules.value = await saveRules(payload)
    formOpen.value = false
    await refresh()
    toast.success('Aturan tersimpan.')
  } catch (e: any) {
    toast.error(e?.message ?? 'Gagal menyimpan aturan.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHero
      :icon="ScrollText"
      eyebrow="SOP / Aturan Trading"
      subtitle="Batasi risiko, amankan profit. Nilai bersifat dinamis — sesuaikan dengan modal & psikologi Anda."
    >
      <template #title>Aturan <span class="text-gold">Trading</span></template>
      <template #actions>
        <Button variant="gold" @click="openEdit">
          <Pencil class="h-4 w-4" /> {{ rules ? 'Edit aturan' : 'Atur sekarang' }}
        </Button>
      </template>
    </PageHero>

    <!-- Belum ada aturan -->
    <Card v-if="!rules">
      <CardContent class="flex flex-col items-center gap-3 py-12 text-center">
        <ScrollText class="h-10 w-10 text-muted-foreground/40" />
        <p class="text-sm text-muted-foreground">Belum ada aturan. Mulai dengan mengisi modal awal & batas risiko.</p>
        <Button variant="gold" @click="openEdit"><Pencil class="h-4 w-4" /> Atur sekarang</Button>
      </CardContent>
    </Card>

    <template v-else>
      <!-- Ringkasan modal + lot -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card class="hover-lift">
          <CardContent class="flex items-center gap-4 p-5">
            <div class="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400"><Wallet class="h-6 w-6" /></div>
            <div>
              <div class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Modal Awal</div>
              <div class="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ fmt(modal) }}</div>
            </div>
          </CardContent>
        </Card>
        <Card class="hover-lift">
          <CardContent class="flex items-center gap-4 p-5">
            <div class="rounded-xl bg-sky-500/10 p-3 text-sky-600 dark:text-sky-400"><Layers class="h-6 w-6" /></div>
            <div>
              <div class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max Lot / Layer</div>
              <div class="font-display text-2xl font-bold text-sky-600 dark:text-sky-400">
                {{ rules.max_lot_size ?? '—' }} <span class="text-sm font-medium text-muted-foreground">Lot</span>
                <span v-if="rules.max_layer" class="ml-1 text-sm font-medium text-muted-foreground">· {{ rules.max_layer }} layer</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Batas risiko -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card class="hover-lift border-destructive/30">
          <CardHeader class="pb-2">
            <div class="flex items-center gap-2">
              <div class="rounded-lg bg-destructive/10 p-2 text-destructive"><ShieldAlert class="h-5 w-5" /></div>
              <CardTitle class="text-base">Batas Kerugian Harian</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div class="font-display text-3xl font-bold text-destructive">
              {{ fmt(rules.daily_loss_limit != null ? -Math.abs(rules.daily_loss_limit) : null) }}
              <span v-if="pct(rules.daily_loss_limit)" class="text-base font-semibold text-muted-foreground">({{ pct(rules.daily_loss_limit) }})</span>
            </div>
            <p class="mt-2 text-xs text-muted-foreground">Jika akumulasi loss hari ini menyentuh angka ini, <span class="font-semibold text-destructive">berhenti trading hari itu</span>. Market selalu ada besok.</p>
          </CardContent>
        </Card>

        <Card class="hover-lift border-amber-500/30">
          <CardHeader class="pb-2">
            <div class="flex items-center gap-2">
              <div class="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400"><Zap class="h-5 w-5" /></div>
              <CardTitle class="text-base">Batas Risiko per Setup</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div class="font-display text-3xl font-bold text-amber-600 dark:text-amber-400">
              {{ fmt(rules.risk_per_trade != null ? -Math.abs(rules.risk_per_trade) : null) }}
              <span v-if="pct(rules.risk_per_trade)" class="text-base font-semibold text-muted-foreground">({{ pct(rules.risk_per_trade) }})</span>
            </div>
            <p class="mt-2 text-xs text-muted-foreground">Risiko maksimal tiap posisi. Jaga agar tidak habis sekaligus dalam satu momen emosi.</p>
          </CardContent>
        </Card>
      </div>

      <!-- Target & pengaman profit -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card class="hover-lift border-emerald-500/30">
          <CardHeader class="pb-2">
            <div class="flex items-center gap-2">
              <div class="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400"><Target class="h-5 w-5" /></div>
              <CardTitle class="text-base">Target Profit Harian</CardTitle>
            </div>
          </CardHeader>
          <CardContent class="space-y-1">
            <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              Awal: {{ fmt(rules.daily_profit_target) }}
              <span v-if="pct(rules.daily_profit_target)" class="text-sm font-medium text-muted-foreground">({{ pct(rules.daily_profit_target) }})</span>
            </div>
            <div class="font-display text-2xl font-bold text-emerald-500 dark:text-emerald-300">
              Maks: {{ fmt(rules.daily_profit_max) }}
              <span v-if="pct(rules.daily_profit_max)" class="text-sm font-medium text-muted-foreground">({{ pct(rules.daily_profit_max) }})</span>
            </div>
            <p class="pt-1 text-xs text-muted-foreground">Target realistis harian. Bila pasar mendukung, boleh maksimalkan hingga target maks.</p>
          </CardContent>
        </Card>

        <Card class="hover-lift border-teal-500/30">
          <CardHeader class="pb-2">
            <div class="flex items-center gap-2">
              <div class="rounded-lg bg-teal-500/10 p-2 text-teal-600 dark:text-teal-400"><Lock class="h-5 w-5" /></div>
              <CardTitle class="text-base">Pengaman Profit</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div class="font-display text-3xl font-bold text-teal-600 dark:text-teal-400">
              {{ fmt(rules.daily_profit_secure) }}
              <span v-if="pct(rules.daily_profit_secure)" class="text-base font-semibold text-muted-foreground">({{ pct(rules.daily_profit_secure) }})</span>
            </div>
            <p class="mt-2 text-xs text-muted-foreground">Jika sudah profit lalu mencoba mengejar target maks namun gagal, <span class="font-semibold text-teal-600 dark:text-teal-400">wajib berhenti</span> di angka kenyamanan ini.</p>
          </CardContent>
        </Card>
      </div>

      <!-- Aturan emas -->
      <Card class="border-l-4 border-l-gold bg-gradient-to-r from-gold/5 to-transparent">
        <CardContent class="p-5">
          <div class="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold">
            <TrendingDown class="h-4 w-4" /> Aturan Emas
          </div>
          <p class="text-sm font-medium italic text-foreground">
            "Jangan pernah membiarkan hari yang sudah PROFIT berakhir menjadi LOSS hanya karena ego dan keserakahan."
          </p>
        </CardContent>
      </Card>
    </template>

    <!-- ===== Modal form edit ===== -->
    <Dialog v-model:open="formOpen">
      <DialogContent class="max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ rules ? 'Edit aturan' : 'Atur aturan trading' }}</DialogTitle>
          <DialogDescription>Nilai batas dinyatakan dalam mata uang dasar. Persentase dihitung otomatis dari modal.</DialogDescription>
        </DialogHeader>

        <form class="grid gap-4 sm:grid-cols-12" @submit.prevent="save">
          <div class="sm:col-span-8">
            <Label class="mb-1.5 block text-xs">Modal awal *</Label>
            <Input :value="f.modal_awal" type="text" inputmode="numeric" placeholder="mis. 20.000" @input="onNominalInput('modal_awal', $event)" />
          </div>
          <div class="sm:col-span-4">
            <Label class="mb-1.5 block text-xs">Mata uang</Label>
            <Select v-model="f.base_currency">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="sm:col-span-6">
            <Label class="mb-1.5 block text-xs">Batas kerugian harian</Label>
            <Input :value="f.daily_loss_limit" type="text" inputmode="numeric" placeholder="mis. 600" @input="onNominalInput('daily_loss_limit', $event)" />
          </div>
          <div class="sm:col-span-6">
            <Label class="mb-1.5 block text-xs">Batas risiko per setup</Label>
            <Input :value="f.risk_per_trade" type="text" inputmode="numeric" placeholder="mis. 200" @input="onNominalInput('risk_per_trade', $event)" />
          </div>

          <div class="sm:col-span-6">
            <Label class="mb-1.5 block text-xs">Target profit awal</Label>
            <Input :value="f.daily_profit_target" type="text" inputmode="numeric" placeholder="mis. 600" @input="onNominalInput('daily_profit_target', $event)" />
          </div>
          <div class="sm:col-span-6">
            <Label class="mb-1.5 block text-xs">Target profit maksimal</Label>
            <Input :value="f.daily_profit_max" type="text" inputmode="numeric" placeholder="mis. 900" @input="onNominalInput('daily_profit_max', $event)" />
          </div>

          <div class="sm:col-span-6">
            <Label class="mb-1.5 block text-xs">Pengaman profit</Label>
            <Input :value="f.daily_profit_secure" type="text" inputmode="numeric" placeholder="mis. 400" @input="onNominalInput('daily_profit_secure', $event)" />
          </div>
          <div class="sm:col-span-3">
            <Label class="mb-1.5 block text-xs">Max lot</Label>
            <Input v-model="f.max_lot_size" type="number" inputmode="decimal" step="any" placeholder="mis. 0.20" />
          </div>
          <div class="sm:col-span-3">
            <Label class="mb-1.5 block text-xs">Max layer</Label>
            <Input v-model="f.max_layer" type="number" inputmode="numeric" min="0" step="1" placeholder="mis. 4" />
          </div>

          <DialogFooter class="sm:col-span-12">
            <Button type="button" variant="ghost" @click="formOpen = false"><X class="h-4 w-4" /> Batal</Button>
            <Button type="submit" :disabled="!valid || saving">
              <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
              <Check v-else class="h-4 w-4" />
              {{ saving ? 'Menyimpan…' : 'Simpan' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
