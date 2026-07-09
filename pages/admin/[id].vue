<script setup lang="ts">
import type { NfpSession, NfpSessionInput, NfpNewsInput } from '~/types/nfp'
import { ArrowLeft, Layers } from 'lucide-vue-next'

definePageMeta({ middleware: ['auth', 'admin'] })

const route = useRoute()
const router = useRouter()
const { get, create, update } = useNfpSessions()

const id = computed(() => route.params.id as string)
const isNew = computed(() => id.value === 'new')
const mode = computed<'create' | 'edit'>(() => (isNew.value ? 'create' : 'edit'))

const initial = ref<NfpSession | null>(null)
if (!isNew.value) {
  const { data } = await useAsyncData(`session-${id.value}`, () => get(id.value))
  initial.value = data.value as NfpSession | null
}

const submitting = ref(false)
const toast = useToast()

async function onSubmit(payload: { session: NfpSessionInput; news: NfpNewsInput[] }) {
  submitting.value = true
  try {
    if (isNew.value) {
      await create(payload.session, payload.news)
      toast.success('Sesi berhasil ditambahkan.')
    } else {
      await update(id.value, payload.session, payload.news)
      toast.success('Sesi berhasil diperbarui.')
    }
    await router.push('/admin')
  } catch (err: any) {
    toast.error(err?.message ?? 'Gagal menyimpan sesi.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <PageHero :icon="Layers" eyebrow="Form sesi">
      <template #title>{{ isNew ? 'Tambah' : 'Edit' }} <span class="text-gold">Sesi</span> NFP</template>
      <template #actions>
        <Button variant="outline" as-child>
          <NuxtLink to="/admin"><ArrowLeft class="h-4 w-4" /> Kembali</NuxtLink>
        </Button>
      </template>
    </PageHero>

    <SessionForm
      :initial="initial"
      :mode="mode"
      :submitting="submitting"
      @submit="onSubmit"
      @cancel="router.push('/admin')"
    />
  </div>
</template>
