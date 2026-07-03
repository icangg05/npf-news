<script setup lang="ts">
import type { Trade, Currency, ExchangeRate } from '~/types/trade'
import { CURRENCIES } from '~/types/trade'
import { ChevronLeft, ChevronRight, RefreshCw, CalendarDays, TrendingUp, TrendingDown, X } from 'lucide-vue-next'

const user = useSupabaseUser()
const { listRange } = useTrades()
const { getRate, updateRate } = useRates()

const now = new Date()
const firstOf = (y: number, m: number) => toDateStr(new Date(y, m, 1))
const lastOf = (y: number, m: number) => toDateStr(new Date(y, m + 1, 0))

// ---- filter periode (sumber utama untuk kartu ringkasan) ----
const from = ref(firstOf(now.getFullYear(), now.getMonth()))
const to = ref(lastOf(now.getFullYear(), now.getMonth()))
const currency = ref<Currency>('USC')

// bulan yang ditampilkan di grid = bulan dari tanggal "Dari"
const viewYear = computed(() => Number(from.value.split('-')[0]) || now.getFullYear())
const viewMonth = computed(() => (Number(from.value.split('-')[1]) || now.getMonth() + 1) - 1)

// ---- kurs ----
const { data: rate } = await useAsyncData<ExchangeRate | null>('exchange-rate', () => getRate(), { default: () => null })
const usdIdr = computed(() => rate.value?.usd_idr ?? 16000)

const toast = useToast()
const updatingRate = ref(false)
async function onUpdateRate() {
  updatingRate.value = true
  try {
    rate.value = await updateRate()
    toast.success(`Kurs diperbarui: 1 USD = Rp${new Intl.NumberFormat('id-ID').format(rate.value.usd_idr)}`)
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || e?.statusMessage || 'Gagal update kurs.')
  } finally {
    updatingRate.value = false
  }
}

// ---- jendela 42 sel utk grid ----
const gridWindow = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const offset = (first.getDay() + 6) % 7
  const start = new Date(viewYear.value, viewMonth.value, 1 - offset)
  const end = new Date(start)
  end.setDate(start.getDate() + 41)
  return { start: toDateStr(start), end: toDateStr(end) }
})

// rentang fetch = gabungan grid + [from,to]
const fetchRange = computed(() => {
  const starts = [gridWindow.value.start, from.value].sort()
  const ends = [gridWindow.value.end, to.value].sort()
  return { start: starts[0], end: ends[ends.length - 1] }
})

const { data: trades } = await useAsyncData<Trade[]>(
  'calendar-trades',
  () => listRange(fetchRange.value.start, fetchRange.value.end),
  { default: () => [], watch: [fetchRange] },
)

function sumConverted(items: Trade[]): number {
  return items.reduce((a, t) => a + convert(t.amount, t.currency, currency.value, usdIdr.value), 0)
}

// ---- ringkasan mengikuti filter [from,to] ----
const rangeTrades = computed(() =>
  (trades.value ?? []).filter((t) => t.trade_date >= from.value && t.trade_date <= to.value),
)
const rangeTotal = computed(() => sumConverted(rangeTrades.value))
const wins = computed(() => rangeTrades.value.filter((t) => t.amount > 0).length)
const loss = computed(() => rangeTrades.value.filter((t) => t.amount < 0).length)
const winrate = computed(() => {
  const decided = wins.value + loss.value
  return decided ? Math.round((wins.value / decided) * 100) : null
})

// navigasi bulan menyetel filter ke bulan tsb
function shiftMonth(delta: number) {
  const d = new Date(viewYear.value, viewMonth.value + delta, 1)
  from.value = firstOf(d.getFullYear(), d.getMonth())
  to.value = lastOf(d.getFullYear(), d.getMonth())
}
function resetRange() {
  from.value = firstOf(now.getFullYear(), now.getMonth())
  to.value = lastOf(now.getFullYear(), now.getMonth())
}
</script>

<template>
  <div class="space-y-5">
    <PageHero
      :icon="CalendarDays"
      eyebrow="Jurnal profit harian"
      subtitle="Profit/loss tiap hari. Input boleh beda mata uang; total dihitung akurat dalam mata uang pilihan."
    >
      <template #title>Kalender <span class="text-gold">Profit</span></template>
    </PageHero>

    <!-- Kontrol + filter (di atas, memengaruhi semua kartu) -->
    <Card>
      <CardContent class="flex flex-wrap items-end gap-3 p-4">
        <!-- navigasi bulan -->
        <div class="flex items-center gap-1 rounded-md border bg-card p-1">
          <Button variant="ghost" size="icon" class="h-8 w-8" @click="shiftMonth(-1)"><ChevronLeft class="h-4 w-4" /></Button>
          <span class="min-w-[120px] text-center text-sm font-semibold sm:min-w-[140px]">{{ monthNameFull(viewMonth) }} {{ viewYear }}</span>
          <Button variant="ghost" size="icon" class="h-8 w-8" @click="shiftMonth(1)"><ChevronRight class="h-4 w-4" /></Button>
        </div>

        <!-- filter periode kustom -->
        <div>
          <Label class="mb-1.5 block text-xs text-muted-foreground">Dari</Label>
          <Input v-model="from" type="date" class="w-36" />
        </div>
        <div>
          <Label class="mb-1.5 block text-xs text-muted-foreground">Sampai</Label>
          <Input v-model="to" type="date" class="w-36" />
        </div>
        <Button variant="ghost" size="sm" @click="resetRange">
          <X class="h-4 w-4" /> Reset
        </Button>

        <!-- mata uang -->
        <div class="flex items-center gap-0.5 rounded-md border bg-card p-1">
          <button
            v-for="c in CURRENCIES"
            :key="c"
            class="rounded px-3 py-1 text-xs font-semibold transition-colors"
            :class="currency === c ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'"
            @click="currency = c"
          >{{ c }}</button>
        </div>

        <!-- kurs + update -->
        <div class="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span class="hidden rounded-md border bg-card px-2.5 py-1.5 sm:inline">
            1 USD = <span class="font-semibold text-foreground">Rp{{ new Intl.NumberFormat('id-ID').format(usdIdr) }}</span>
          </span>
          <Button v-if="user" variant="gold" size="sm" :disabled="updatingRate" @click="onUpdateRate">
            <RefreshCw class="h-4 w-4" :class="updatingRate && 'animate-spin'" /> Update kurs
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Ringkasan (mengikuti filter) -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Card class="hover-lift">
        <CardContent class="p-4">
          <div class="text-xs font-medium text-muted-foreground">Total periode</div>
          <div class="mt-1 font-display text-xl font-bold sm:text-2xl" :class="rangeTotal > 0 ? 'text-emerald-600 dark:text-emerald-400' : rangeTotal < 0 ? 'text-destructive' : ''">
            {{ formatCurrency(rangeTotal, currency) }}
          </div>
        </CardContent>
      </Card>
      <Card class="hover-lift">
        <CardContent class="p-4">
          <div class="text-xs font-medium text-muted-foreground">Winrate</div>
          <div class="mt-1 font-display text-xl font-bold sm:text-2xl" :class="winrate != null && winrate >= 50 ? 'text-emerald-600 dark:text-emerald-400' : winrate != null ? 'text-destructive' : ''">
            {{ winrate != null ? `${winrate}%` : '—' }}
          </div>
        </CardContent>
      </Card>
      <Card class="hover-lift">
        <CardContent class="p-4">
          <div class="text-xs font-medium text-muted-foreground">Hari profit</div>
          <div class="mt-1 flex items-center gap-1.5 font-display text-xl font-bold text-emerald-600 dark:text-emerald-400 sm:text-2xl">
            <TrendingUp class="h-4 w-4" /> {{ wins }}
          </div>
        </CardContent>
      </Card>
      <Card class="hover-lift">
        <CardContent class="p-4">
          <div class="text-xs font-medium text-muted-foreground">Hari loss</div>
          <div class="mt-1 flex items-center gap-1.5 font-display text-xl font-bold text-destructive sm:text-2xl">
            <TrendingDown class="h-4 w-4" /> {{ loss }}
          </div>
        </CardContent>
      </Card>
      <Card class="hover-lift">
        <CardContent class="p-4">
          <div class="text-xs font-medium text-muted-foreground">Jumlah trade</div>
          <div class="mt-1 font-display text-xl font-bold sm:text-2xl">{{ rangeTrades.length }}</div>
        </CardContent>
      </Card>
    </div>

    <!-- Kalender -->
    <CalendarView :year="viewYear" :month="viewMonth" :trades="trades ?? []" :currency="currency" :usd-idr="usdIdr" />
  </div>
</template>
