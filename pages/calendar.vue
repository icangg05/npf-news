<script setup lang="ts">
import type { Trade, TradeRules, ImportantNote, ExchangeRate } from '~/types/trade'
import { CURRENCIES } from '~/types/trade'
import { ChevronLeft, ChevronRight, RefreshCw, CalendarDays, TrendingUp, TrendingDown, X, LayoutDashboard, CalendarRange, LineChart, StickyNote, Pencil, Check, Loader2, Scale, Award, Flame, Percent, ShieldCheck, Info, Calendar as CalendarIcon } from 'lucide-vue-next'
import { parseDate, type DateValue } from '@internationalized/date'

definePageMeta({ middleware: 'auth' })

interface DayCell {
  date: string
  day: number
  inMonth: boolean
  isToday: boolean
  items: Trade[]
  total: number
}

const user = useSupabaseUser()
const { listRange, listAll } = useTrades()
const { getRate, updateRate } = useRates()
const { getRules } = useRules()
const { getNote, saveNote } = useNotes()

const now = new Date()
const firstOf = (y: number, m: number) => toDateStr(new Date(y, m, 1))
const lastOf = (y: number, m: number) => toDateStr(new Date(y, m + 1, 0))

// ---- filter periode (sumber utama untuk kartu ringkasan) ----
const from = ref(firstOf(now.getFullYear(), now.getMonth()))
const to = ref(lastOf(now.getFullYear(), now.getMonth()))
const currency = useDisplayCurrency()

// proxy string 'YYYY-MM-DD' <-> DateValue untuk Calendar (sama seperti form sesi)
const fromValue = computed<DateValue | undefined>({
  get: () => (from.value ? parseDate(from.value) : undefined),
  set: (v) => { if (v) from.value = v.toString() },
})
const toValue = computed<DateValue | undefined>({
  get: () => (to.value ? parseDate(to.value) : undefined),
  set: (v) => { if (v) to.value = v.toString() },
})

// bulan yang ditampilkan di grid = bulan dari tanggal "Dari"
const viewYear = computed(() => Number(from.value.split('-')[0]) || now.getFullYear())
const viewMonth = computed(() => (Number(from.value.split('-')[1]) || now.getMonth() + 1) - 1)

// ---- kurs ----
const { data: rate } = await useCachedData<ExchangeRate | null>('exchange-rate', () => getRate(), { default: () => null })
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

const { data: trades } = await useCachedData<Trade[]>(
  'calendar-trades',
  () => listRange(fetchRange.value.start, fetchRange.value.end),
  { default: () => [], watch: [fetchRange] },
)

// ---- data grafik ekuitas (semua trade + modal awal dari aturan) ----
const { data: allTrades } = await useCachedData<Trade[]>('equity-trades', () => listAll(), { default: () => [] })
const { data: rules } = await useCachedData<TradeRules | null>('trade-rules', () => getRules(), { default: () => null })
const modalAwal = computed(() => convert(rules.value?.modal_awal ?? 0, rules.value?.base_currency ?? 'USC', currency.value, usdIdr.value))

// ---- catatan penting (rich text) ----
const { data: note } = await useCachedData<ImportantNote | null>('important-note', () => getNote(), { default: () => null })
const noteEditing = ref(false)
const noteDraft = ref('')
const noteSaving = ref(false)
function startEditNote() {
  noteDraft.value = note.value?.body ?? ''
  noteEditing.value = true
}
async function saveNoteBody() {
  noteSaving.value = true
  try {
    note.value = await saveNote(noteDraft.value)
    noteEditing.value = false
    toast.success('Catatan tersimpan.')
  } catch (e: any) {
    toast.error(e?.message ?? 'Gagal menyimpan catatan.')
  } finally {
    noteSaving.value = false
  }
}

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

// rata-rata dihitung hanya atas hari yang ada trade-nya
const avgDaily = computed(() => rangeTrades.value.length ? rangeTotal.value / rangeTrades.value.length : 0)
const avgWeekly = computed(() => avgDaily.value * 7)

// ---- metrik evaluasi (semua ikut filter [from,to] + mata uang) ----
// P/L agregat per tanggal (bukan per-entri) → basis metrik hari yang benar
const dailyPl = computed(() => {
  const m = new Map<string, number>()
  for (const t of rangeTrades.value)
    m.set(t.trade_date, (m.get(t.trade_date) ?? 0) + convert(t.amount, t.currency, currency.value, usdIdr.value))
  return [...m.entries()].map(([date, pl]) => ({ date, pl })).sort((a, b) => a.date.localeCompare(b.date))
})

// Profit factor = Σ hari profit ÷ |Σ hari loss|
const profitFactor = computed(() => {
  let gain = 0, lossAbs = 0
  for (const { pl } of dailyPl.value) { if (pl > 0) gain += pl; else if (pl < 0) lossAbs += -pl }
  if (lossAbs === 0) return gain > 0 ? Infinity : null
  return gain / lossAbs
})

// Hari terbaik & terburuk
const bestDay = computed(() => dailyPl.value.reduce<{ date: string; pl: number } | null>((b, d) => (!b || d.pl > b.pl ? d : b), null))
const worstDay = computed(() => dailyPl.value.reduce<{ date: string; pl: number } | null>((w, d) => (!w || d.pl < w.pl ? d : w), null))

// Rata-rata hari profit vs hari loss (null = tak ada hari jenis itu → tampil '—', bukan 0)
const avgWinDay = computed<number | null>(() => {
  const w = dailyPl.value.filter((d) => d.pl > 0)
  return w.length ? w.reduce((a, d) => a + d.pl, 0) / w.length : null
})
const avgLossDay = computed<number | null>(() => {
  const l = dailyPl.value.filter((d) => d.pl < 0)
  return l.length ? l.reduce((a, d) => a + d.pl, 0) / l.length : null
})

// Kepatuhan aturan: batas dikonversi dari base_currency aturan ke mata uang tampilan
const ruleLimits = computed(() => {
  const base = rules.value?.base_currency ?? 'USC'
  const loss = rules.value?.daily_loss_limit
  const target = rules.value?.daily_profit_target
  return {
    loss: loss != null ? convert(loss, base, currency.value, usdIdr.value) : null,
    target: target != null ? convert(target, base, currency.value, usdIdr.value) : null,
  }
})
const hasRuleLimits = computed(() => ruleLimits.value.loss != null || ruleLimits.value.target != null)
const daysBreachLoss = computed(() => {
  const lim = ruleLimits.value.loss
  return lim == null ? 0 : dailyPl.value.filter((d) => d.pl <= -Math.abs(lim)).length
})
const daysHitTarget = computed(() => {
  const t = ruleLimits.value.target
  return t == null ? 0 : dailyPl.value.filter((d) => d.pl >= t).length
})

// Streak beruntun (terpanjang + berjalan), tanda dari hari terakhir
const streaks = computed(() => {
  let longWin = 0, longLoss = 0, curWin = 0, curLoss = 0
  for (const { pl } of dailyPl.value) {
    if (pl > 0) { curWin++; curLoss = 0; longWin = Math.max(longWin, curWin) }
    else if (pl < 0) { curLoss++; curWin = 0; longLoss = Math.max(longLoss, curLoss) }
    else { curWin = 0; curLoss = 0 }
  }
  const last = dailyPl.value[dailyPl.value.length - 1]?.pl ?? 0
  const current = last > 0 ? curWin : last < 0 ? -curLoss : 0
  return { longWin, longLoss, current }
})

// Return % periode terhadap modal awal
const returnPct = computed(() => (modalAwal.value ? (rangeTotal.value / modalAwal.value) * 100 : null))

// Performa per hari-pekan (Senin–Minggu)
const WEEKDAY_LABELS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const byWeekday = computed(() => {
  const totals = Array(7).fill(0) as number[]
  for (const { date, pl } of dailyPl.value) {
    const idx = (new Date(date).getDay() + 6) % 7 // 0=Sen
    totals[idx] += pl
  }
  return WEEKDAY_LABELS.map((label, i) => ({ label, total: totals[i] }))
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

// Tekan tombol kembali (browser/HP) menutup modal, bukan pindah halaman.
let poppingFromBack = false
function onPopState() {
  if (selectedDay.value) {
    poppingFromBack = true
    selectedDay.value = null
  }
}
watch(selectedDay, (val, old) => {
  if (val && !old) {
    // modal dibuka → sisipkan entri history agar "kembali" tertangkap di sini
    history.pushState({ dayModal: true }, '')
  } else if (!val && old) {
    // modal ditutup lewat X/backdrop → buang entri history yang tadi disisipkan
    if (poppingFromBack) poppingFromBack = false
    else history.back()
  }
})
onMounted(() => window.addEventListener('popstate', onPopState))
onBeforeUnmount(() => window.removeEventListener('popstate', onPopState))
const dayTradeCount = computed(() =>
  (selectedDay.value?.items ?? []).reduce((a, t) => a + (t.trade_count ?? 1), 0),
)
const dayTone = (total: number) =>
  total > 0 ? 'text-emerald-600 dark:text-emerald-400' : total < 0 ? 'text-destructive' : 'text-muted-foreground'

// ---- deskriptor kartu (data-driven) + tooltip penjelasan, pola sama seperti StatCards ----
const EMERALD = 'text-emerald-600 dark:text-emerald-400'
// tingkatan winrate realistis untuk trader profesional: <40 buruk, 40–49 pas-pasan, 50–59 baik, ≥60 sangat baik
const winrateTone = computed(() => {
  const w = winrate.value
  if (w == null) return ''
  if (w < 40) return 'text-destructive'
  if (w < 50) return 'text-orange-500'
  if (w < 60) return 'text-amber-500'
  return EMERALD
})

// Grup 1 — Ringkasan cepat
const ringkasanCards = computed(() => [
  { key: 'total', label: 'Total periode', icon: TrendingUp, value: formatCurrency(rangeTotal.value, currency.value), tone: dayTone(rangeTotal.value),
    hint: 'Jumlah seluruh profit/loss pada rentang tanggal terpilih, dalam mata uang tampilan.' },
  { key: 'winrate', label: 'Winrate', icon: Percent, value: winrate.value != null ? `${winrate.value}%` : '—', tone: winrateTone.value,
    hint: 'Persentase hari untung dari total hari untung + rugi. Warna: <40% merah, 40–49% oranye, 50–59% kuning, ≥60% hijau — kisaran realistis untuk trader profesional.' },
  { key: 'pl', label: 'Hari profit / loss', icon: Scale, dual: { a: `${wins.value}`, b: `${loss.value}` }, sub: 'hari untung / rugi', tone: 'text-foreground',
    hint: 'Banyaknya hari untung (hijau) berbanding hari rugi (merah) pada rentang ini.' },
  { key: 'days', label: 'Total hari', icon: CalendarDays, value: `${rangeTrades.value.length}`, sub: 'hari tercatat', tone: 'text-foreground',
    hint: 'Banyaknya hari yang punya catatan trade pada rentang ini.' },
  { key: 'avgd', label: 'Rata-rata harian', icon: TrendingUp, value: formatCurrency(avgDaily.value, currency.value), tone: dayTone(avgDaily.value),
    hint: 'Total periode dibagi jumlah hari yang ada trade-nya (bukan semua hari kalender).' },
  { key: 'avgw', label: 'Rata-rata mingguan', icon: CalendarRange, value: formatCurrency(avgWeekly.value, currency.value), tone: dayTone(avgWeekly.value),
    hint: 'Rata-rata harian dikali 7 — perkiraan kasar pendapatan per minggu.' },
])

// Grup 2 — Evaluasi
const evaluasiCards = computed(() => [
  { key: 'pf', label: 'Profit factor', icon: Scale,
    value: profitFactor.value == null ? '—' : profitFactor.value === Infinity ? '∞' : profitFactor.value.toFixed(2),
    tone: profitFactor.value == null ? '' : profitFactor.value >= 1 ? EMERALD : 'text-destructive',
    hint: 'Total profit hari untung ÷ total rugi hari rugi. >1 = untung lebih besar dari rugi (sistem menguntungkan); ≥1,5 umumnya sehat; <1 = rugi bersih.' },
  { key: 'ret', label: 'Return periode', icon: Percent,
    value: returnPct.value == null ? '—' : `${returnPct.value >= 0 ? '+' : ''}${returnPct.value.toFixed(1)}%`,
    tone: returnPct.value == null ? '' : dayTone(returnPct.value),
    hint: 'Total periode dibagi modal awal (dari halaman Aturan), dalam persen. Pertumbuhan modal untuk rentang ini.' },
  { key: 'best', label: 'Hari terbaik', icon: Award, value: bestDay.value ? formatCompact(bestDay.value.pl, currency.value) : '—',
    sub: bestDay.value ? formatDateStr(bestDay.value.date) : undefined, tone: EMERALD,
    hint: 'Hari dengan profit tertinggi pada rentang ini, beserta tanggalnya.' },
  { key: 'worst', label: 'Hari terburuk', icon: TrendingDown, value: worstDay.value ? formatCompact(worstDay.value.pl, currency.value) : '—',
    sub: worstDay.value ? formatDateStr(worstDay.value.date) : undefined, tone: 'text-destructive',
    hint: 'Hari dengan kerugian terbesar pada rentang ini, beserta tanggalnya.' },
  { key: 'awin', label: 'Rata-rata hari profit', icon: TrendingUp, value: avgWinDay.value == null ? '—' : formatCurrency(avgWinDay.value, currency.value), tone: avgWinDay.value == null ? '' : EMERALD,
    hint: 'Rata-rata besar profit pada hari-hari yang untung saja. "—" bila tak ada hari untung pada rentang ini.' },
  { key: 'aloss', label: 'Rata-rata hari loss', icon: TrendingDown, value: avgLossDay.value == null ? '—' : formatCurrency(avgLossDay.value, currency.value), tone: avgLossDay.value == null ? '' : 'text-destructive',
    hint: 'Rata-rata besar rugi pada hari-hari yang rugi saja. "—" bila tak ada hari rugi. Kalau jauh lebih besar dari rata-rata hari profit, berarti menang kecil kalah besar.' },
  { key: 'streak', label: 'Streak', icon: Flame,
    value: streaks.value.current === 0 ? '—' : `${Math.abs(streaks.value.current)} hari ${streaks.value.current > 0 ? 'profit' : 'loss'}`,
    sub: `Terpanjang: ${streaks.value.longWin}W / ${streaks.value.longLoss}L`,
    tone: streaks.value.current > 0 ? EMERALD : streaks.value.current < 0 ? 'text-destructive' : '',
    hint: 'Beruntun hari untung/rugi berjalan dari hari terakhir. "Terpanjang" = rekor beruntun untung (W) dan rugi (L) pada rentang ini — sinyal disiplin/tilt.' },
  { key: 'rules', label: 'Kepatuhan aturan', icon: ShieldCheck,
    value: hasRuleLimits.value ? `${daysBreachLoss.value} / ${daysHitTarget.value}` : '—',
    sub: hasRuleLimits.value ? 'tembus loss / capai target' : 'atur batas di Aturan', tone: 'text-foreground',
    hint: 'Berapa hari menembus batas loss harian, dan berapa hari mencapai target profit harian. Batas diatur di halaman Aturan.' },
])

const cardGroups = computed(() => [
  { title: 'Ringkasan', cards: ringkasanCards.value },
  { title: 'Evaluasi', cards: evaluasiCards.value },
])

const weekdayHint = 'Total P/L dikelompokkan per hari dalam seminggu — membantu melihat hari mana yang paling menguntungkan atau rawan rugi.'

// Hover tak ada di layar sentuh: simpan kartu aktif agar tap juga membuka penjelasan.
const openCard = ref<string | null>(null)
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
      <div class="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList>
          <TabsTrigger value="ringkasan"><LayoutDashboard class="h-4 w-4" /> Ringkasan</TabsTrigger>
          <TabsTrigger value="kalender"><CalendarRange class="h-4 w-4" /> Kalender</TabsTrigger>
          <TabsTrigger value="grafik"><LineChart class="h-4 w-4" /> Grafik</TabsTrigger>
        </TabsList>

        <!-- Kurs saat ini + format uang + tombol update kurs -->
        <div class="flex flex-wrap items-center justify-center gap-2">
          <span class="hidden items-center rounded-md border bg-card px-2.5 py-1.5 text-xs text-muted-foreground lg:inline-flex">
            1&nbsp;USD&nbsp;= <span class="ml-1 font-semibold text-foreground">Rp{{ new Intl.NumberFormat('id-ID').format(usdIdr) }}</span>
          </span>

          <!-- Format uang -->
          <div class="flex items-center gap-0.5 rounded-md border bg-card p-1">
            <button
              v-for="c in CURRENCIES"
              :key="c"
              class="rounded px-3 py-1 text-xs font-semibold transition-colors"
              :class="currency === c ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'"
              @click="currency = c"
            >{{ c }}</button>
          </div>

          <Button
            v-if="user"
            variant="gold"
            :disabled="updatingRate"
            class="h-8 gap-1.5 rounded-md px-3 text-xs [&_svg]:size-3.5"
            @click="onUpdateRate"
          >
            <RefreshCw :class="updatingRate && 'animate-spin'" /> Update kurs
          </Button>
        </div>
      </div>

      <!-- Filter bulan: dipakai kedua tab, jadi disimpan di luar tab (shared) -->
      <div class="flex items-center justify-center gap-2">
        <div class="flex items-center gap-1 rounded-md border bg-card p-1">
          <Button variant="ghost" size="icon" class="h-8 w-8" @click="shiftMonth(-1)"><ChevronLeft class="h-4 w-4" /></Button>
          <span class="min-w-[130px] text-center text-sm font-semibold sm:min-w-[160px]">{{ monthNameFull(viewMonth) }} {{ viewYear }}</span>
          <Button variant="ghost" size="icon" class="h-8 w-8" @click="shiftMonth(1)"><ChevronRight class="h-4 w-4" /></Button>
        </div>
      </div>

      <!-- ===== TAB 1: Ringkasan (kontrol + statistik + kalender) ===== -->
      <TabsContent value="ringkasan" class="space-y-5">
        <!-- Kontrol + filter (date picker sama seperti form sesi) -->
        <Card>
          <CardContent class="flex flex-wrap items-end gap-3 p-4">
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Dari</Label>
              <Popover>
                <PopoverTrigger as-child>
                  <Button type="button" variant="outline" class="w-44 justify-start font-normal" :class="!from && 'text-muted-foreground'">
                    <CalendarIcon class="mr-2 h-4 w-4" />
                    {{ from ? formatDateStr(from) : 'Pilih tanggal' }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent><Calendar v-model="fromValue" /></PopoverContent>
              </Popover>
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Sampai</Label>
              <Popover>
                <PopoverTrigger as-child>
                  <Button type="button" variant="outline" class="w-44 justify-start font-normal" :class="!to && 'text-muted-foreground'">
                    <CalendarIcon class="mr-2 h-4 w-4" />
                    {{ to ? formatDateStr(to) : 'Pilih tanggal' }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent><Calendar v-model="toValue" /></PopoverContent>
              </Popover>
            </div>

            <!-- Reset rentang tanggal -->
            <Button variant="ghost" size="sm" @click="resetRange">
              <X class="h-4 w-4" /> Reset
            </Button>
          </CardContent>
        </Card>

        <!-- ===== Grup kartu (Ringkasan + Evaluasi), tiap kartu punya tooltip penjelasan ===== -->
        <section v-for="g in cardGroups" :key="g.title" class="space-y-2.5">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{{ g.title }}</h3>
          <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <HoverCard
              v-for="c in g.cards"
              :key="c.key"
              :open="openCard === c.key"
              @update:open="(v: boolean) => { if (v) openCard = c.key; else if (openCard === c.key) openCard = null }"
            >
              <HoverCardTrigger>
                <Card class="hover-lift cursor-help" @click="openCard = openCard === c.key ? null : c.key">
                  <CardContent class="p-4">
                    <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <component :is="c.icon" class="h-3.5 w-3.5" /> {{ c.label }}
                    </div>
                    <div v-if="c.dual" class="mt-1 flex items-baseline gap-2 font-display text-xl font-bold sm:text-2xl">
                      <span :class="EMERALD">{{ c.dual.a }}</span>
                      <span class="text-sm text-border">/</span>
                      <span class="text-destructive">{{ c.dual.b }}</span>
                    </div>
                    <div v-else class="mt-1 font-display text-xl font-bold sm:text-2xl" :class="c.tone">{{ c.value }}</div>
                    <div v-if="c.sub" class="text-[11px] text-muted-foreground">{{ c.sub }}</div>
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent class="w-64">
                <div class="flex items-center gap-2">
                  <component :is="c.icon" class="h-4 w-4 text-primary" />
                  <span class="text-sm font-semibold">{{ c.label }}</span>
                </div>
                <p class="mt-2 text-xs leading-relaxed text-muted-foreground">{{ c.hint }}</p>
              </HoverCardContent>
            </HoverCard>
          </div>
        </section>

        <!-- ===== Rincian: performa per hari ===== -->
        <section class="space-y-2.5">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rincian</h3>
          <Card>
            <CardHeader class="flex flex-row items-center gap-2 space-y-0 pb-3">
              <div class="rounded-lg bg-gold/10 p-2 text-gold"><CalendarRange class="h-4 w-4" /></div>
              <CardTitle class="text-base">Performa per Hari</CardTitle>
              <HoverCard :open="openCard === 'weekday'" @update:open="(v: boolean) => { if (v) openCard = 'weekday'; else if (openCard === 'weekday') openCard = null }">
                <HoverCardTrigger><Info class="h-4 w-4 cursor-help text-muted-foreground" @click="openCard = openCard === 'weekday' ? null : 'weekday'" /></HoverCardTrigger>
                <HoverCardContent class="w-64"><p class="text-xs leading-relaxed text-muted-foreground">{{ weekdayHint }}</p></HoverCardContent>
              </HoverCard>
            </CardHeader>
            <CardContent>
              <!-- mobile: per-kolom (label kiri, angka kanan); sm+: satu baris 7 kolom (label atas, angka bawah) -->
              <ul class="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-7 sm:gap-1 sm:text-center">
                <li v-for="d in byWeekday" :key="d.label" class="flex min-w-0 items-center justify-between sm:flex-col sm:items-stretch sm:justify-start">
                  <span class="truncate text-[11px] font-medium text-muted-foreground">{{ d.label }}</span>
                  <span class="truncate font-display text-sm font-bold sm:mt-1 sm:text-xs md:text-sm" :class="d.total === 0 ? 'text-muted-foreground/50' : dayTone(d.total)">{{ formatCompact(d.total, currency) }}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <!-- Catatan penting (kesimpulan / point-point) -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between gap-2 space-y-0">
            <div class="flex items-center gap-2">
              <div class="rounded-lg bg-gold/10 p-2 text-gold"><StickyNote class="h-4 w-4" /></div>
              <CardTitle class="text-base">Catatan Penting</CardTitle>
            </div>
            <Button v-if="!noteEditing" variant="ghost" size="sm" @click="startEditNote">
              <Pencil class="h-4 w-4" /> Edit
            </Button>
          </CardHeader>
          <CardContent>
            <template v-if="noteEditing">
              <RichTextEditor v-model="noteDraft" placeholder="Kesimpulan / point-point penting selama trading…" />
              <div class="mt-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm" @click="noteEditing = false"><X class="h-4 w-4" /> Batal</Button>
                <Button size="sm" :disabled="noteSaving" @click="saveNoteBody">
                  <Loader2 v-if="noteSaving" class="h-4 w-4 animate-spin" />
                  <Check v-else class="h-4 w-4" />
                  {{ noteSaving ? 'Menyimpan…' : 'Simpan' }}
                </Button>
              </div>
            </template>
            <template v-else>
              <div v-if="stripHtml(note?.body ?? '')" class="rte-content text-sm" v-html="note?.body" />
              <button
                v-else
                type="button"
                class="w-full rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground transition-colors hover:bg-accent/50"
                @click="startEditNote"
              >
                Belum ada catatan. Klik untuk menulis kesimpulan penting Anda.
              </button>
            </template>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- ===== TAB 2: Kalender saja (fokus, tampilan lega) ===== -->
      <TabsContent value="kalender" class="space-y-4">
        <CalendarView size="lg" :year="viewYear" :month="viewMonth" :trades="trades ?? []" :currency="currency" :usd-idr="usdIdr" @select="onSelectDay" />
      </TabsContent>

      <!-- ===== TAB 3: Grafik perjalanan trade (kurva ekuitas) ===== -->
      <TabsContent value="grafik" class="space-y-4">
        <EquityCurve :trades="allTrades ?? []" :modal-awal="modalAwal" :currency="currency" :usd-idr="usdIdr" />
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
            <DialogDescription>{{ dayTradeCount }} trade dalam {{ selectedDay.items.length }} hari.</DialogDescription>
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
              <div v-if="t.pairs?.length" class="mt-2 flex flex-wrap gap-1">
                <span v-for="p in t.pairs" :key="p" class="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-semibold text-gold">{{ p }}</span>
              </div>
              <div v-if="t.note" class="rte-content mt-2 border-t pt-2 text-sm" v-html="t.note" />
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
