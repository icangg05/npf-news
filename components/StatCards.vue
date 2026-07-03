<script setup lang="ts">
import type { NfpSession } from '~/types/nfp'
import { CalendarClock, Activity, Waves, Newspaper, Zap, Gauge, MoveRight } from 'lucide-vue-next'

const props = defineProps<{ sessions: NfpSession[] }>()

function avg(nums: number[]): number | null {
  return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null
}

const stats = computed(() => {
  const list = props.sessions
  const news = list.flatMap((s) => s.nfp_news ?? [])

  const avgMinor = avg(list.map((s) => s.minor_pips).filter((v): v is number => v != null))
  const avgMajor = avg(list.map((s) => s.major_pips).filter((v): v is number => v != null))

  // spike hanya 'up' (atas) / 'down' (bawah). 'one_way' (satu arah) dihitung terpisah.
  const spikes = list.filter((s) => s.spike === 'up' || s.spike === 'down').length
  const oneWay = list.filter((s) => s.spike === 'one_way').length

  // kesesuaian: % berita yang aktualnya memenuhi/melebihi consensus (miss = tidak sesuai)
  const withBoth = news.filter((n) => n.actual != null && n.consensus != null)
  const met = withBoth.filter((n) => (n.actual as number) >= (n.consensus as number)).length
  const accuracy = withBoth.length ? Math.round((met / withBoth.length) * 100) : null

  return { total: list.length, totalNews: news.length, avgMinor, avgMajor, spikes, oneWay, accuracy }
})

const cards = computed(() => [
  { label: 'Total sesi', value: stats.value.total, icon: CalendarClock, tone: 'text-foreground' },
  { label: 'Total berita', value: stats.value.totalNews, icon: Newspaper, tone: 'text-foreground' },
  {
    label: 'Rata-rata pips minor',
    value: stats.value.avgMinor != null ? `${stats.value.avgMinor}` : '—',
    icon: Waves,
    tone: 'text-sky-600 dark:text-sky-400',
  },
  {
    label: 'Rata-rata pips major',
    value: stats.value.avgMajor != null ? `${stats.value.avgMajor}` : '—',
    icon: Activity,
    tone: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    label: 'Kesesuaian cons vs act',
    value: stats.value.accuracy != null ? `${stats.value.accuracy}%` : '—',
    icon: Gauge,
    tone: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Spike (atas/bawah)',
    value: stats.value.spikes,
    icon: Zap,
    tone: 'text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Satu arah',
    value: stats.value.oneWay,
    icon: MoveRight,
    tone: 'text-slate-600 dark:text-slate-300',
  },
])
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
    <Card v-for="c in cards" :key="c.label" class="hover-lift">
      <CardContent class="p-4">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-medium text-muted-foreground">{{ c.label }}</span>
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <component :is="c.icon" class="h-4 w-4" />
          </span>
        </div>
        <div class="mt-2 font-display text-2xl font-bold tracking-tight" :class="c.tone">{{ c.value }}</div>
      </CardContent>
    </Card>
  </div>
</template>
