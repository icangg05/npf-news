<script setup lang="ts">
import type { NfpSession } from '~/types/nfp'
import { Pencil, Trash2 } from 'lucide-vue-next'

defineProps<{ sessions: NfpSession[] }>()
const emit = defineEmits<{ edit: [id: string]; remove: [session: NfpSession] }>()
</script>

<template>
  <Card>
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
        <TableRow v-for="s in sessions" :key="s.id">
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
          <TableCell class="text-right">{{ formatNumber(s.minor_pips) }}</TableCell>
          <TableCell class="text-right font-semibold">{{ formatNumber(s.major_pips) }}</TableCell>
          <TableCell class="text-center">
            <SpikeBadge :spike="s.spike" />
          </TableCell>
          <TableCell class="text-right whitespace-nowrap">
            <Button variant="ghost" size="icon" class="h-8 w-8" @click="emit('edit', s.id)">
              <Pencil class="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive" @click="emit('remove', s)">
              <Trash2 class="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
        <TableEmpty v-if="!sessions.length" :colspan="8">Belum ada data sesi.</TableEmpty>
      </TableBody>
    </Table>
  </Card>
</template>
