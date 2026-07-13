<script setup lang="ts">
import type { NfpSession } from '~/types/nfp'
import { CalendarClock, Activity, Waves, Newspaper, Zap, Gauge } from 'lucide-vue-next'

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

  // kesesuaian arah: prediksi = arah consensus terhadap previous (naik/turun).
  // benar bila actual benar-benar bergerak ke arah yang sama dari previous.
  // contoh: prev 150, cons 110 (prediksi turun), actual 90 -> turun -> benar.
  const predicted = news.filter(
    (n) => n.actual != null && n.consensus != null && n.previous != null && n.consensus !== n.previous,
  )
  const correct = predicted.filter((n) => {
    const predUp = (n.consensus as number) > (n.previous as number)
    const actUp = (n.actual as number) > (n.previous as number)
    return (n.actual as number) !== (n.previous as number) && predUp === actUp
  }).length
  const accuracy = predicted.length ? Math.round((correct / predicted.length) * 100) : null

  return { total: list.length, totalNews: news.length, avgMinor, avgMajor, spikes, oneWay, accuracy }
})

const cards = computed(() => [
  {
    label: 'Total sesi',
    value: formatThousands(stats.value.total),
    icon: CalendarClock,
    tone: 'text-foreground',
    hint: 'Jumlah sesi rilis NFP yang tercatat sesuai filter yang sedang aktif.',
  },
  {
    label: 'Total berita',
    value: formatThousands(stats.value.totalNews),
    icon: Newspaper,
    tone: 'text-foreground',
    hint: 'Total item berita/event ekonomi dari seluruh sesi yang ditampilkan.',
  },
  {
    label: 'Rata-rata pips minor',
    value: formatThousands(stats.value.avgMinor),
    icon: Waves,
    tone: 'text-sky-600 dark:text-sky-400',
    hint: 'Rata-rata pergerakan pips minor emas (XAU/USD) — reaksi awal saat rilis.',
  },
  {
    label: 'Rata-rata pips major',
    value: formatThousands(stats.value.avgMajor),
    icon: Activity,
    tone: 'text-indigo-600 dark:text-indigo-400',
    hint: 'Rata-rata pergerakan pips major emas (XAU/USD) — reaksi lanjutan yang dominan.',
  },
  {
    label: 'Akurasi arah prediksi',
    value: stats.value.accuracy != null ? `${stats.value.accuracy}%` : '—',
    icon: Gauge,
    tone: 'text-emerald-600 dark:text-emerald-400',
    hint: 'Persentase rilis yang arah aktualnya (naik/turun dari data sebelumnya) sesuai dengan konsensus.',
  },
  {
    label: 'Spike / Satu arah',
    value: `${stats.value.spikes} / ${stats.value.oneWay}`,
    icon: Zap,
    tone: 'text-amber-600 dark:text-amber-400',
    hint: 'Jumlah sesi dengan spike (naik-turun tajam) dibanding yang bergerak satu arah saja.',
  },
])

// Hover tak ada di layar sentuh: simpan kartu yang aktif agar tap juga membuka hint.
const openIdx = ref<number | null>(null)
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
    <HoverCard
      v-for="(c, i) in cards"
      :key="c.label"
      :open="openIdx === i"
      @update:open="(v: boolean) => { if (v) openIdx = i; else if (openIdx === i) openIdx = null }"
    >
      <HoverCardTrigger>
        <Card class="hover-lift cursor-help" @click="openIdx = openIdx === i ? null : i">
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
      </HoverCardTrigger>
      <HoverCardContent class="w-64">
        <div class="flex items-center gap-2">
          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <component :is="c.icon" class="h-4 w-4" />
          </span>
          <span class="text-sm font-semibold">{{ c.label }}</span>
        </div>
        <p class="mt-2 text-xs leading-relaxed text-muted-foreground">{{ c.hint }}</p>
      </HoverCardContent>
    </HoverCard>
  </div>
</template>
