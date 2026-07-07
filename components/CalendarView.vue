<script setup lang="ts">
import type { Trade, Currency } from '~/types/trade'
import { StickyNote } from 'lucide-vue-next'

export interface DayCell {
  date: string
  day: number
  inMonth: boolean
  isToday: boolean
  items: Trade[]
  total: number
}

const props = defineProps<{
  year: number
  month: number // 0-11
  trades: Trade[]
  currency: Currency
  usdIdr: number
  size?: 'default' | 'lg'
}>()

const emit = defineEmits<{ select: [cell: DayCell] }>()

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const todayStr = toDateStr(new Date())

// kelompokkan trade per tanggal
const byDate = computed(() => {
  const map = new Map<string, Trade[]>()
  for (const t of props.trades) {
    const arr = map.get(t.trade_date) ?? []
    arr.push(t)
    map.set(t.trade_date, arr)
  }
  return map
})

function sumConverted(items: Trade[]): number {
  return items.reduce((acc, t) => acc + convert(t.amount, t.currency, props.currency, props.usdIdr), 0)
}

// 42 sel (6 baris), Senin sebagai awal minggu
const cells = computed<DayCell[]>(() => {
  const first = new Date(props.year, props.month, 1)
  const offset = (first.getDay() + 6) % 7 // 0=Sen
  const start = new Date(props.year, props.month, 1 - offset)
  const out: DayCell[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const date = toDateStr(d)
    const items = byDate.value.get(date) ?? []
    out.push({
      date,
      day: d.getDate(),
      inMonth: d.getMonth() === props.month,
      isToday: date === todayStr,
      items,
      total: items.length ? sumConverted(items) : 0,
    })
  }
  return out
})

function toneClass(total: number, hasItems: boolean): string {
  if (!hasItems) return 'text-muted-foreground/40'
  if (total > 0) return 'text-emerald-600 dark:text-emerald-400'
  if (total < 0) return 'text-destructive'
  return 'text-muted-foreground'
}

const minH = computed(() => (props.size === 'lg' ? 'min-h-[68px] sm:min-h-[116px]' : 'min-h-[54px] sm:min-h-[92px]'))
</script>

<template>
  <div class="overflow-hidden rounded-lg border bg-card">
    <!-- header hari -->
    <div class="grid grid-cols-7 border-b bg-muted/40 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      <div v-for="w in WEEKDAYS" :key="w" class="py-2">{{ w }}</div>
    </div>
    <!-- sel tanggal -->
    <div class="grid grid-cols-7">
      <template v-for="c in cells" :key="c.date">
        <!-- sel dengan trade: klik -> modal -->
        <button
          v-if="c.items.length"
          type="button"
          class="group relative flex w-full flex-col items-start gap-0.5 border-b border-r p-1.5 text-left transition-colors last:border-r-0 hover:bg-accent/40 focus:outline-none focus-visible:bg-accent/60 sm:p-2"
          :class="[minH, !c.inMonth && 'bg-muted/20', c.isToday && 'ring-1 ring-inset ring-primary/30']"
          @click="emit('select', c)"
        >
          <span
            class="flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-medium sm:text-xs"
            :class="c.isToday ? 'bg-primary text-primary-foreground' : c.inMonth ? 'text-foreground' : 'text-muted-foreground/50'"
          >{{ c.day }}</span>
          <span class="mt-auto w-full truncate text-[11px] font-bold sm:text-sm" :class="toneClass(c.total, true)">
            {{ formatCompact(c.total, currency) }}
          </span>
          <StickyNote class="absolute right-1 top-1 h-3 w-3 text-muted-foreground/40 group-hover:text-gold sm:h-3.5 sm:w-3.5" />
        </button>

        <!-- sel kosong -->
        <div
          v-else
          class="border-b border-r p-1.5 last:border-r-0 sm:p-2"
          :class="[minH, !c.inMonth && 'bg-muted/20', c.isToday && 'ring-1 ring-inset ring-primary/30']"
        >
          <span
            class="flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-medium sm:text-xs"
            :class="c.isToday ? 'bg-primary text-primary-foreground' : c.inMonth ? 'text-foreground' : 'text-muted-foreground/40'"
          >{{ c.day }}</span>
        </div>
      </template>
    </div>
  </div>
</template>
