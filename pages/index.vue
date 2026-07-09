<script setup lang="ts">
import type { NfpSession, NfpFilters } from '~/types/nfp'
import { Sparkles, BarChart3, History } from 'lucide-vue-next'

const { list } = useNfpSessions()

const { data: sessions, pending, error } = await useCachedData<NfpSession[]>(
  'nfp-sessions',
  () => list(),
  { default: () => [] },
)

const filters = ref<NfpFilters>({ search: '', direction: '', from: '', to: '' })

const filtered = computed(() => {
  const f = filters.value
  return (sessions.value ?? []).filter((s) => {
    if (f.direction && s.direction !== f.direction) return false
    if (f.from && new Date(s.released_at) < new Date(f.from)) return false
    if (f.to && new Date(s.released_at) > new Date(f.to + 'T23:59:59')) return false
    if (f.search) {
      const q = f.search.toLowerCase()
      if (!s.nfp_news?.some((n) => n.event_name.toLowerCase().includes(q))) return false
    }
    return true
  })
})
</script>

<template>
  <div class="space-y-6">
    <PageHero
      :icon="Sparkles"
      eyebrow="XAU/USD · High impact"
      subtitle="Rekap historis dampak rilis Non-Farm Payrolls yang sudah lampau terhadap harga emas (XAU/USD), dikelompokkan per sesi rilis."
    >
      <template #title>Riwayat <span class="text-gold">NFP</span> vs Pergerakan Emas</template>
    </PageHero>

    <Tabs default-value="statistik" class="space-y-5">
      <div class="flex justify-center">
        <TabsList>
          <TabsTrigger value="statistik"><BarChart3 class="h-4 w-4" /> Statistik</TabsTrigger>
          <TabsTrigger value="berita"><History class="h-4 w-4" /> Riwayat Rilis</TabsTrigger>
        </TabsList>
      </div>

      <!-- TAB 1: Kartu statistik -->
      <TabsContent value="statistik">
        <StatCards :sessions="filtered" />
      </TabsContent>

      <!-- TAB 2: Pencarian + daftar berita -->
      <TabsContent value="berita" class="space-y-4">
        <FilterBar v-model="filters" />

        <div v-if="pending" class="py-16 text-center text-muted-foreground">Memuat data…</div>
        <Card v-else-if="error" class="border-destructive/40">
          <CardContent class="py-10 text-center text-destructive">
            Gagal memuat data. Pastikan koneksi Supabase &amp; tabel sudah dibuat.
          </CardContent>
        </Card>
        <template v-else>
          <div class="space-y-4">
            <SessionCard v-for="s in filtered" :key="s.id" :session="s" />
          </div>
          <Card v-if="!filtered.length">
            <CardContent class="py-16 text-center text-muted-foreground">Belum ada data sesi.</CardContent>
          </Card>
        </template>
      </TabsContent>
    </Tabs>
  </div>
</template>
