<script setup lang="ts">
import type { NfpSession } from '~/types/nfp'
import { Plus, Layers } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const { list, remove } = useNfpSessions()
const router = useRouter()
const toast = useToast()

const { data: sessions, pending, refresh } = await useCachedData<NfpSession[]>(
  'admin-nfp-sessions',
  () => list(),
  { default: () => [] },
)

function edit(id: string) {
  router.push(`/admin/${id}`)
}

// ---- hapus (modal konfirmasi) ----
const toDelete = ref<NfpSession | null>(null)
const deleting = ref(false)
const confirmOpen = computed({
  get: () => !!toDelete.value,
  set: (v: boolean) => { if (!v) toDelete.value = null },
})
async function confirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await remove(toDelete.value.id)
    toDelete.value = null
    await refresh()
    toast.success('Sesi dihapus.')
  } catch (e: any) {
    toast.error(e?.message ?? 'Gagal menghapus sesi.')
  } finally {
    deleting.value = false
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
    <SessionsTable v-else :sessions="sessions" @edit="edit" @remove="(s) => toDelete = s" />

    <ConfirmModal
      v-model:open="confirmOpen"
      title="Hapus sesi?"
      :description="toDelete ? `Sesi ${formatDate(toDelete.released_at)} beserta ${toDelete.nfp_news?.length ?? 0} berita akan dihapus permanen.` : ''"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>
