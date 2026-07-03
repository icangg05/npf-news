<script setup lang="ts">
import type { NfpSession } from '~/types/nfp'
import { Plus, Layers } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const { list, remove } = useNfpSessions()
const router = useRouter()
const toast = useToast()

const { data: sessions, pending, refresh } = await useAsyncData<NfpSession[]>(
  'admin-nfp-sessions',
  () => list(),
  { default: () => [] },
)

function edit(id: string) {
  router.push(`/admin/${id}`)
}

async function onRemove(s: NfpSession) {
  if (!confirm(`Hapus sesi ${formatDate(s.released_at)} beserta ${s.nfp_news?.length ?? 0} berita? Tindakan ini tidak bisa dibatalkan.`)) return
  try {
    await remove(s.id)
    await refresh()
    toast.success('Sesi dihapus.')
  } catch (e: any) {
    toast.error(e?.message ?? 'Gagal menghapus sesi.')
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHero :icon="Layers" eyebrow="Manajemen data" subtitle="Tambah, ubah, atau hapus sesi rilis beserta beritanya.">
      <template #title>Kelola <span class="text-gold">Sesi</span> NFP</template>
      <template #actions>
        <Button variant="gold" as-child>
          <NuxtLink to="/admin/new"><Plus class="h-4 w-4" /> Tambah sesi</NuxtLink>
        </Button>
      </template>
    </PageHero>

    <div v-if="pending" class="py-16 text-center text-muted-foreground">Memuat…</div>
    <SessionsTable v-else :sessions="sessions" @edit="edit" @remove="onRemove" />
  </div>
</template>
