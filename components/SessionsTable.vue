<script setup lang="ts">
import type { NfpSession } from '~/types/nfp'
import { Trash2, ChevronRight } from 'lucide-vue-next'

defineProps<{ sessions: NfpSession[] }>()
const emit = defineEmits<{ edit: [id: string]; remove: [session: NfpSession] }>()

const majorTone = (s: NfpSession) =>
  s.direction === 'up' ? 'text-emerald-600 dark:text-emerald-400'
  : s.direction === 'down' ? 'text-destructive'
  : 'text-foreground'
</script>

<template>
  <div>
    <!-- ===== Mobile: kartu ringkas (tanpa tabel, hindari scroll horizontal) ===== -->
    <div class="space-y-3 sm:hidden">
      <button
        v-for="s in sessions"
        :key="s.id"
        type="button"
        class="glass-card hover-lift block w-full p-3 text-left"
        @click="emit('edit', s.id)"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="text-sm font-semibold">{{ formatDate(s.released_at) }}</div>
            <div class="text-[11px] text-muted-foreground">
              {{ formatTime(s.released_at) }} · {{ s.period_label || monthLabel(s.released_at) }} · {{ s.nfp_news?.length || 0 }} berita
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <SpikeBadge v-if="s.spike" :spike="s.spike" />
            <DirectionBadge :direction="s.direction" />
          </div>
        </div>

        <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs">
          <span class="text-muted-foreground">Minor: <span class="font-semibold text-foreground">{{ formatThousands(s.minor_pips) }}</span></span>
          <span class="text-muted-foreground">Major: <span class="font-bold" :class="majorTone(s)">{{ formatThousands(s.major_pips) }}</span></span>
        </div>

        <div class="mt-2 flex items-center justify-between gap-2 border-t pt-2">
          <span class="truncate text-[11px] text-muted-foreground">
            {{ s.nfp_news?.map((n) => n.event_name).join(', ') || '—' }}
          </span>
          <span
            role="button"
            tabindex="0"
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
            aria-label="Hapus"
            @click.stop="emit('remove', s)"
            @keydown.enter.stop="emit('remove', s)"
          >
            <Trash2 class="h-4 w-4" />
          </span>
        </div>
      </button>

      <Card v-if="!sessions.length">
        <CardContent class="py-10 text-center text-sm text-muted-foreground">Belum ada data sesi.</CardContent>
      </Card>
    </div>

    <!-- ===== Desktop: tabel, klik baris untuk edit ===== -->
    <Card class="hidden sm:block">
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead>Tanggal</TableHead>
            <TableHead>Periode</TableHead>
            <TableHead>Berita</TableHead>
            <TableHead>Arah</TableHead>
            <TableHead class="text-right">Minor</TableHead>
            <TableHead class="text-right">Major</TableHead>
            <TableHead class="text-center">Spike</TableHead>
            <TableHead class="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="s in sessions"
            :key="s.id"
            class="cursor-pointer"
            @click="emit('edit', s.id)"
          >
            <TableCell class="whitespace-nowrap">
              <div class="font-medium">{{ formatDate(s.released_at) }}</div>
              <div class="text-xs text-muted-foreground">{{ formatTime(s.released_at) }}</div>
            </TableCell>
            <TableCell>{{ s.period_label || monthLabel(s.released_at) }}</TableCell>
            <TableCell>
              <div class="flex flex-col gap-0.5">
                <span v-for="n in s.nfp_news" :key="n.id" class="text-sm">
                  {{ n.event_name }}
                  <span class="text-xs" :class="actualColorClass(n)">({{ formatNumber(n.actual, n.unit) }})</span>
                </span>
                <span v-if="!s.nfp_news?.length" class="text-xs text-muted-foreground">—</span>
              </div>
            </TableCell>
            <TableCell><DirectionBadge :direction="s.direction" /></TableCell>
            <TableCell class="text-right">{{ formatThousands(s.minor_pips) }}</TableCell>
            <TableCell class="text-right font-semibold" :class="majorTone(s)">{{ formatThousands(s.major_pips) }}</TableCell>
            <TableCell class="text-center">
              <SpikeBadge :spike="s.spike" />
            </TableCell>
            <TableCell class="whitespace-nowrap text-right">
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 text-destructive hover:text-destructive"
                aria-label="Hapus"
                @click.stop="emit('remove', s)"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
              <ChevronRight class="ml-1 inline h-4 w-4 text-muted-foreground/50" />
            </TableCell>
          </TableRow>
          <TableEmpty v-if="!sessions.length" :colspan="8">Belum ada data sesi.</TableEmpty>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
