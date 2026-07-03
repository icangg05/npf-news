<script setup lang="ts">
import type { NfpFilters } from '~/types/nfp'
import { Search, X } from 'lucide-vue-next'

const model = defineModel<NfpFilters>({ required: true })

// Select bekerja dengan string; '' berarti "semua"
const directionValue = computed({
  get: () => model.value.direction || 'all',
  set: (v: string) => (model.value.direction = v === 'all' ? '' : (v as NfpFilters['direction'])),
})

function reset() {
  model.value = { search: '', direction: '', from: '', to: '' }
}
</script>

<template>
  <Card>
    <CardContent class="flex flex-wrap items-end gap-3 p-4">
      <div class="flex-1 min-w-[180px]">
        <Label class="mb-1.5 block text-xs text-muted-foreground">Pencarian</Label>
        <div class="relative">
          <Search class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input v-model="model.search" placeholder="Cari berita…" class="pl-8" />
        </div>
      </div>

      <div class="w-40">
        <Label class="mb-1.5 block text-xs text-muted-foreground">Arah emas</Label>
        <Select v-model="directionValue">
          <SelectTrigger>
            <SelectValue placeholder="Semua" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="up">Naik</SelectItem>
            <SelectItem value="down">Turun</SelectItem>
            <SelectItem value="neutral">Sideways</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label class="mb-1.5 block text-xs text-muted-foreground">Dari</Label>
        <Input v-model="model.from" type="date" class="w-40" />
      </div>
      <div>
        <Label class="mb-1.5 block text-xs text-muted-foreground">Sampai</Label>
        <Input v-model="model.to" type="date" class="w-40" />
      </div>

      <Button variant="ghost" size="sm" @click="reset">
        <X class="h-4 w-4" /> Reset
      </Button>
    </CardContent>
  </Card>
</template>
