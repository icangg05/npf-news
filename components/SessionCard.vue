<script setup lang="ts">
import type { NfpSession } from '~/types/nfp'
import { CalendarClock } from 'lucide-vue-next'

const props = defineProps<{ session: NfpSession }>()
const s = computed(() => props.session)

const majorTone = computed(() => {
  if (s.value.direction === 'up') return 'text-emerald-600 dark:text-emerald-400'
  if (s.value.direction === 'down') return 'text-destructive'
  return 'text-foreground'
})
</script>

<template>
  <Card class="hover-lift overflow-hidden">
    <!-- Header: waktu + ringkasan reaksi -->
    <div class="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-4 py-2.5">
      <div class="flex items-center gap-2.5">
        <div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <CalendarClock class="h-4 w-4" />
        </div>
        <div>
          <div class="text-sm font-semibold leading-tight">
            {{ formatDate(s.released_at) }}
            <span class="text-muted-foreground font-normal">· {{ formatTime(s.released_at) }} WITA</span>
          </div>
          <div class="text-[11px] text-muted-foreground">
            Periode {{ monthFullFromLabel(s.period_label, s.released_at) }} · {{ s.nfp_news?.length || 0 }} berita
          </div>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <SpikeBadge v-if="s.spike" :spike="s.spike" />
        <DirectionBadge :direction="s.direction" />
      </div>
    </div>

    <CardContent class="p-0">
      <!-- Berita di sesi ini (compact) -->
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead class="h-8 px-4 text-[10px]">Berita</TableHead>
            <TableHead class="h-8 px-2 text-[10px]">Tingkat</TableHead>
            <TableHead class="h-8 px-2 text-right text-[10px]">Act</TableHead>
            <TableHead class="h-8 px-2 text-right text-[10px]">Cons</TableHead>
            <TableHead class="h-8 px-4 text-right text-[10px]">Prev</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="n in s.nfp_news" :key="n.id">
            <TableCell class="px-4 py-1.5 text-[13px] font-medium">
              {{ n.event_name }}
              <span class="text-[11px] text-muted-foreground">· {{ n.currency }}</span>
            </TableCell>
            <TableCell class="px-2 py-1.5">
              <Badge :variant="n.impact" class="px-1.5 py-0 text-[10px]">{{ n.impact === 'high' ? 'High' : n.impact === 'medium' ? 'Medium' : 'Low' }}</Badge>
            </TableCell>
            <TableCell class="px-2 py-1.5 text-right text-[13px] font-bold" :class="actualColorClass(n)">{{ formatNumber(n.actual, n.unit) }}</TableCell>
            <TableCell class="px-2 py-1.5 text-right text-[13px] text-muted-foreground">{{ formatNumber(n.consensus, n.unit) }}</TableCell>
            <TableCell class="px-4 py-1.5 text-right text-[13px] text-muted-foreground">{{ formatNumber(n.previous, n.unit) }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <!-- Ringkasan pergerakan emas -->
      <div class="flex flex-wrap items-center gap-x-6 gap-y-1 border-t bg-muted/20 px-4 py-2 text-[13px]">
        <span class="inline-flex items-center rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider text-gold">
          XAU/USD
        </span>
        <div>
          <span class="text-muted-foreground">Pips minor: </span>
          <span class="font-semibold">{{ formatThousands(s.minor_pips) }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Pips major: </span>
          <span class="text-sm font-bold" :class="majorTone">{{ formatThousands(s.major_pips) }}</span>
        </div>
        <div v-if="s.note" class="rte-content basis-full text-[11px] text-muted-foreground sm:basis-auto" v-html="s.note" />
      </div>
    </CardContent>
  </Card>
</template>
