<script setup lang="ts">
import type { Trade, Currency, ExchangeRate } from '~/types/trade'
import { CURRENCIES } from '~/types/trade'
import { ChevronLeft, ChevronRight, RefreshCw, CalendarDays, TrendingUp, TrendingDown, X, LayoutDashboard, CalendarRange } from 'lucide-vue-next'

interface DayCell {
  date: string
  day: number
  inMonth: boolean
  isToday: boolean
  items: Trade[]
  total: number
}

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

// ---- modal detail hari (klik tanggal di kalender) ----
const selectedDay = ref<DayCell | null>(null)
const dayOpen = computed({
  get: () => !!selectedDay.value,
  set: (v: boolean) => { if (!v) selectedDay.value = null },
})
function onSelectDay(cell: DayCell) {
  selectedDay.value = cell
}
const dayTradeCount = computed(() =>
  (selectedDay.value?.items ?? []).reduce((a, t) => a + (t.trade_count ?? 1), 0),
)
const dayTone = (total: number) =>
  total > 0 ? 'text-emerald-600 dark:text-emerald-400' : total < 0 ? 'text-destructive' : 'text-muted-foreground'
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

    <Tabs default-value="ringkasan" class="space-y-5">
      <TabsList>
        <TabsTrigger value="ringkasan"><LayoutDashboard class="h-4 w-4" /> Ringkasan</TabsTrigger>
        <TabsTrigger value="kalender"><CalendarRange class="h-4 w-4" /> Kalender</TabsTrigger>
      </TabsList>

      <!-- ===== TAB 1: Ringkasan (kontrol + statistik + kalender) ===== -->
      <TabsContent value="ringkasan" class="space-y-5">
        <!-- Kontrol + filter -->
        <Card>
          <CardContent class="flex flex-wrap items-end gap-3 p-4">
            <div class="flex items-center gap-1 rounded-md border bg-card p-1">
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="shiftMonth(-1)"><ChevronLeft class="h-4 w-4" /></Button>
              <span class="min-w-[120px] text-center text-sm font-semibold sm:min-w-[140px]">{{ monthNameFull(viewMonth) }} {{ viewYear }}</span>
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="shiftMonth(1)"><ChevronRight class="h-4 w-4" /></Button>
            </div>

            <!-- Update kurs: tepat di samping kanan pengubah bulan -->
            <Button v-if="user" variant="gold" size="sm" :disabled="updatingRate" @click="onUpdateRate">
              <RefreshCw class="h-4 w-4" :class="updatingRate && 'animate-spin'" /> Update kurs
            </Button>

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

            <div class="flex items-center gap-0.5 rounded-md border bg-card p-1">
              <button
                v-for="c in CURRENCIES"
                :key="c"
                class="rounded px-3 py-1 text-xs font-semibold transition-colors"
                :class="currency === c ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'"
                @click="currency = c"
              >{{ c }}</button>
            </div>

            <div class="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <span class="hidden rounded-md border bg-card px-2.5 py-1.5 sm:inline">
                1 USD = <span class="font-semibold text-foreground">Rp{{ new Intl.NumberFormat('id-ID').format(usdIdr) }}</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <!-- Ringkasan (kartu profit & loss digabung agar ringkas) -->
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card class="hover-lift">
            <CardContent class="p-4">
              <div class="text-xs font-medium text-muted-foreground">Total periode</div>
              <div class="mt-1 font-display text-xl font-bold sm:text-2xl" :class="dayTone(rangeTotal)">
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
              <div class="text-xs font-medium text-muted-foreground">Profit / Loss</div>
              <div class="mt-1 flex items-center gap-3 font-display text-xl font-bold sm:text-2xl">
                <span class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><TrendingUp class="h-4 w-4" /> {{ wins }}</span>
                <span class="text-border">/</span>
                <span class="flex items-center gap-1 text-destructive"><TrendingDown class="h-4 w-4" /> {{ loss }}</span>
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
      </TabsContent>

      <!-- ===== TAB 2: Kalender saja (fokus, tampilan lega) ===== -->
      <TabsContent value="kalender" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-1 rounded-md border bg-card p-1">
            <Button variant="ghost" size="icon" class="h-8 w-8" @click="shiftMonth(-1)"><ChevronLeft class="h-4 w-4" /></Button>
            <span class="min-w-[130px] text-center text-sm font-semibold sm:min-w-[160px]">{{ monthNameFull(viewMonth) }} {{ viewYear }}</span>
            <Button variant="ghost" size="icon" class="h-8 w-8" @click="shiftMonth(1)"><ChevronRight class="h-4 w-4" /></Button>
          </div>
          <div class="flex items-center gap-0.5 rounded-md border bg-card p-1">
            <button
              v-for="c in CURRENCIES"
              :key="c"
              class="rounded px-3 py-1 text-xs font-semibold transition-colors"
              :class="currency === c ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'"
              @click="currency = c"
            >{{ c }}</button>
          </div>
        </div>

        <CalendarView size="lg" :year="viewYear" :month="viewMonth" :trades="trades ?? []" :currency="currency" :usd-idr="usdIdr" @select="onSelectDay" />
      </TabsContent>
    </Tabs>

    <!-- ===== Modal detail hari (fullscreen) ===== -->
    <Dialog v-model:open="dayOpen">
      <DialogContent v-if="selectedDay" fullscreen>
        <div class="mx-auto w-full max-w-2xl">
          <DialogHeader>
            <div class="flex items-center justify-between gap-3 pr-8">
              <DialogTitle>{{ formatDateStr(selectedDay.date) }}</DialogTitle>
              <span class="font-display text-xl font-bold" :class="dayTone(selectedDay.total)">
                {{ formatCurrency(selectedDay.total, currency) }}
              </span>
            </div>
            <DialogDescription>{{ dayTradeCount }} trade dalam {{ selectedDay.items.length }} entri.</DialogDescription>
          </DialogHeader>

          <ul class="mt-4 space-y-3">
            <li v-for="t in selectedDay.items" :key="t.id" class="glass-card p-3">
              <div class="flex items-center justify-between gap-2">
                <span class="font-display text-lg font-bold" :class="t.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'">
                  {{ formatCurrency(t.amount, t.currency) }}
                </span>
                <div class="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{{ t.trade_count ?? 1 }} trade</span>
                  <span class="rounded-md bg-muted px-2 py-0.5 font-semibold">{{ t.currency }}</span>
                </div>
              </div>
              <div v-if="t.note" class="rte-content mt-2 border-t pt-2 text-sm" v-html="t.note" />
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
