<script setup lang="ts">
import type { Trade, Currency } from '~/types/trade'
import { TrendingUp, TrendingDown, Trophy, Activity, LineChart } from 'lucide-vue-next'

const props = defineProps<{
  trades: Trade[]
  modalAwal: number
  currency: Currency
  usdIdr: number
}>()

// ---- Susun titik kurva ekuitas (saldo berjalan dari modal awal) ----
interface Point { date: string; balance: number; dayPl: number }

const points = computed<Point[]>(() => {
  // Gabungkan trade per tanggal → 1 titik/hari, lalu kumulatif.
  const byDay = new Map<string, number>()
  for (const t of props.trades) {
    const v = convert(t.amount, t.currency, props.currency, props.usdIdr)
    byDay.set(t.trade_date, (byDay.get(t.trade_date) ?? 0) + v)
  }
  const days = [...byDay.keys()].sort()
  let running = props.modalAwal
  const out: Point[] = [{ date: '', balance: props.modalAwal, dayPl: 0 }] // titik awal = modal
  for (const d of days) {
    const pl = byDay.get(d) ?? 0
    running += pl
    out.push({ date: d, balance: running, dayPl: pl })
  }
  return out
})

const hasData = computed(() => points.value.length > 1)

// ---- Skala ----
const W = 800
const H = 300
const PAD = { top: 16, right: 16, bottom: 28, left: 64 }
const innerW = W - PAD.left - PAD.right
const innerH = H - PAD.top - PAD.bottom

const bounds = computed(() => {
  const vals = points.value.map((p) => p.balance)
  vals.push(props.modalAwal)
  let min = Math.min(...vals)
  let max = Math.max(...vals)
  if (min === max) { min -= 1; max += 1 }
  const pad = (max - min) * 0.08
  return { min: min - pad, max: max + pad }
})

const xAt = (i: number) => {
  const n = points.value.length
  return PAD.left + (n <= 1 ? 0 : (i / (n - 1)) * innerW)
}
const yAt = (v: number) => {
  const { min, max } = bounds.value
  return PAD.top + (1 - (v - min) / (max - min)) * innerH
}

const linePath = computed(() =>
  points.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(p.balance).toFixed(1)}`).join(' '),
)
const areaPath = computed(() => {
  if (!hasData.value) return ''
  const first = xAt(0)
  const last = xAt(points.value.length - 1)
  const base = PAD.top + innerH
  return `${linePath.value} L${last.toFixed(1)},${base} L${first.toFixed(1)},${base} Z`
})

// gridline + label sumbu Y
const yTicks = computed(() => {
  const { min, max } = bounds.value
  const n = 4
  return Array.from({ length: n + 1 }, (_, i) => min + ((max - min) * i) / n)
})

// label sumbu X (awal, tengah, akhir)
const xLabels = computed(() => {
  const pts = points.value
  if (pts.length < 2) return []
  const idxs = [1, Math.floor(pts.length / 2), pts.length - 1]
  const seen = new Set<number>()
  return idxs
    .filter((i) => !seen.has(i) && (seen.add(i), true) && pts[i]?.date)
    .map((i) => ({ x: xAt(i), label: shortDate(pts[i].date) }))
})

const baselineY = computed(() => yAt(props.modalAwal))

// ---- KPI ----
const current = computed(() => points.value[points.value.length - 1]?.balance ?? props.modalAwal)
const totalPl = computed(() => current.value - props.modalAwal)
const growthPct = computed(() => (props.modalAwal ? (totalPl.value / props.modalAwal) * 100 : null))
const peak = computed(() => Math.max(...points.value.map((p) => p.balance)))
const maxDrawdown = computed(() => {
  let peakSoFar = -Infinity
  let mdd = 0
  let mddPct = 0 // persentase pada titik drawdown terbesar (relatif puncak saat itu)
  for (const p of points.value) {
    peakSoFar = Math.max(peakSoFar, p.balance)
    const dd = peakSoFar - p.balance
    if (dd > mdd) {
      mdd = dd
      mddPct = peakSoFar > 0 ? (dd / peakSoFar) * 100 : 0
    }
  }
  return { value: mdd, pct: mddPct }
})

const up = computed(() => totalPl.value >= 0)

function shortDate(d: string): string {
  const [, m, day] = d.split('-')
  return `${Number(day)}/${Number(m)}`
}

const tone = (v: number) =>
  v > 0 ? 'text-emerald-600 dark:text-emerald-400' : v < 0 ? 'text-destructive' : 'text-foreground'
</script>

<template>
  <div class="space-y-4">
    <!-- KPI ringkas -->
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card class="hover-lift">
        <CardContent class="p-4">
          <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Activity class="h-3.5 w-3.5" /> Saldo kini
          </div>
          <div class="mt-1 font-display text-lg font-bold sm:text-xl">{{ formatCurrency(current, currency) }}</div>
        </CardContent>
      </Card>
      <Card class="hover-lift">
        <CardContent class="p-4">
          <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <component :is="up ? TrendingUp : TrendingDown" class="h-3.5 w-3.5" /> Total P/L
          </div>
          <div class="mt-1 font-display text-lg font-bold sm:text-xl" :class="tone(totalPl)">
            {{ formatCurrency(totalPl, currency) }}
            <span v-if="growthPct != null" class="text-xs font-semibold">({{ growthPct >= 0 ? '+' : '' }}{{ growthPct.toFixed(1) }}%)</span>
          </div>
        </CardContent>
      </Card>
      <Card class="hover-lift">
        <CardContent class="p-4">
          <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Trophy class="h-3.5 w-3.5" /> Puncak saldo
          </div>
          <div class="mt-1 font-display text-lg font-bold sm:text-xl">{{ formatCurrency(peak, currency) }}</div>
        </CardContent>
      </Card>
      <Card class="hover-lift">
        <CardContent class="p-4">
          <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <TrendingDown class="h-3.5 w-3.5" /> Drawdown maks
          </div>
          <div class="mt-1 font-display text-lg font-bold sm:text-xl" :class="maxDrawdown.value > 0 ? 'text-destructive' : 'text-foreground'">
            {{ maxDrawdown.value > 0 ? '-' : '' }}{{ formatCurrency(maxDrawdown.value, currency) }}
            <span v-if="maxDrawdown.value > 0" class="text-xs font-semibold">(-{{ maxDrawdown.pct.toFixed(1) }}%)</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Grafik -->
    <Card>
      <CardContent class="p-3 sm:p-4">
        <div v-if="!hasData" class="flex min-h-[240px] flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <LineChart class="h-8 w-8 opacity-40" />
          <p>Belum ada trade untuk digambar.</p>
          <p class="text-xs">Set <span class="font-semibold text-foreground">modal awal</span> di halaman Aturan dan tambahkan trade.</p>
        </div>

        <svg
          v-else
          :viewBox="`0 0 ${W} ${H}`"
          class="h-auto w-full"
          :class="up ? 'text-emerald-500 dark:text-emerald-400' : 'text-destructive'"
          role="img"
          aria-label="Kurva ekuitas kumulatif"
        >
          <defs>
            <linearGradient id="equity-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="currentColor" stop-opacity="0.28" />
              <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
            </linearGradient>
          </defs>

          <!-- gridlines + label Y -->
          <g class="text-muted-foreground">
            <template v-for="(t, i) in yTicks" :key="i">
              <line
                :x1="PAD.left" :x2="W - PAD.right" :y1="yAt(t)" :y2="yAt(t)"
                stroke="currentColor" stroke-opacity="0.12" stroke-width="1"
              />
              <text
                :x="PAD.left - 8" :y="yAt(t) + 3" text-anchor="end"
                fill="currentColor" font-size="11"
              >{{ formatCompact(t, currency) }}</text>
            </template>
          </g>

          <!-- baseline modal awal -->
          <line
            :x1="PAD.left" :x2="W - PAD.right" :y1="baselineY" :y2="baselineY"
            stroke="currentColor" class="text-gold" stroke-width="1.5" stroke-dasharray="5 4" stroke-opacity="0.7"
          />

          <!-- area + garis -->
          <path :d="areaPath" fill="url(#equity-fill)" stroke="none" />
          <path :d="linePath" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

          <!-- titik + tooltip native -->
          <g>
            <circle
              v-for="(p, i) in points" :key="i"
              :cx="xAt(i)" :cy="yAt(p.balance)" r="3.5"
              fill="currentColor" stroke="hsl(var(--background))" stroke-width="1.5"
            >
              <title>{{ p.date ? formatDateStr(p.date) : 'Modal awal' }} — {{ formatCurrency(p.balance, currency) }}{{ p.date ? ` (${p.dayPl >= 0 ? '+' : ''}${formatCurrency(p.dayPl, currency)})` : '' }}</title>
            </circle>
          </g>

          <!-- label X -->
          <g class="text-muted-foreground">
            <text
              v-for="(l, i) in xLabels" :key="i"
              :x="l.x" :y="H - 8" text-anchor="middle" fill="currentColor" font-size="11"
            >{{ l.label }}</text>
          </g>
        </svg>

        <p v-if="hasData" class="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span class="inline-block h-0 w-4 border-t-2 border-dashed border-gold" /> Garis putus-putus = modal awal ({{ formatCurrency(modalAwal, currency) }})
        </p>
      </CardContent>
    </Card>
  </div>
</template>
