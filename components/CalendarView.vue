<script setup lang="ts">
import type { Trade, Currency } from '~/types/trade'
import { StickyNote } from 'lucide-vue-next'

const props = defineProps<{
  year: number
  month: number // 0-11
  trades: Trade[]
  currency: Currency
  usdIdr: number
}>()

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

// total (converted) untuk sekumpulan trade
function sumConverted(items: Trade[]): number {
  return items.reduce((acc, t) => acc + convert(t.amount, t.currency, props.currency, props.usdIdr), 0)
}

// 42 sel (6 baris), Senin sebagai awal minggu
const cells = computed(() => {
  const first = new Date(props.year, props.month, 1)
  const offset = (first.getDay() + 6) % 7 // 0=Sen
  const start = new Date(props.year, props.month, 1 - offset)
  const out: {
    date: string
    day: number
    inMonth: boolean
    isToday: boolean
    items: Trade[]
    total: number
  }[] = []
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
</script>

<template>
  <div class="overflow-hidden rounded-md border bg-card">
    <!-- header hari -->
    <div class="grid grid-cols-7 border-b bg-muted/40 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      <div v-for="w in WEEKDAYS" :key="w" class="py-2">{{ w }}</div>
    </div>
    <!-- sel tanggal -->
    <div class="grid grid-cols-7">
      <template v-for="c in cells" :key="c.date">
        <!-- sel dengan trade: hover popup -->
        <HoverCard v-if="c.items.length">
          <HoverCardTrigger>
            <button
              type="button"
              class="group relative flex min-h-[54px] w-full flex-col items-start gap-0.5 border-b border-r p-1.5 text-left transition-colors last:border-r-0 hover:bg-accent/40 focus:outline-none focus-visible:bg-accent/60 sm:min-h-[92px] sm:p-2"
              :class="[!c.inMonth && 'bg-muted/20', c.isToday && 'ring-1 ring-inset ring-primary']"
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
          </HoverCardTrigger>
          <HoverCardContent>
            <div class="mb-2 flex items-center justify-between border-b pb-2">
              <span class="text-xs font-semibold">{{ formatDateStr(c.date) }}</span>
              <span class="text-sm font-bold" :class="toneClass(c.total, true)">
                {{ formatCurrency(c.total, currency) }}
              </span>
            </div>
            <ul class="space-y-2">
              <li v-for="t in c.items" :key="t.id" class="text-xs">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-medium" :class="t.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'">
                    {{ formatCurrency(t.amount, t.currency) }}
                  </span>
                  <span class="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{{ t.currency }}</span>
                </div>
                <p v-if="t.note" class="mt-0.5 text-muted-foreground">{{ t.note }}</p>
              </li>
            </ul>
          </HoverCardContent>
        </HoverCard>

        <!-- sel kosong -->
        <div
          v-else
          class="min-h-[54px] border-b border-r p-1.5 last:border-r-0 sm:min-h-[92px] sm:p-2"
          :class="[!c.inMonth && 'bg-muted/20', c.isToday && 'ring-1 ring-inset ring-primary']"
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
