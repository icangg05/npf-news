<script setup lang="ts">
import type { Impact, NfpSession, NfpSessionInput, NfpNewsInput } from '~/types/nfp'
import { Plus, Trash2, CalendarClock, TrendingUp, Newspaper } from 'lucide-vue-next'

const props = defineProps<{
  initial?: NfpSession | null
  mode: 'create' | 'edit'
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: { session: NfpSessionInput; news: NfpNewsInput[] }]
  cancel: []
}>()

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const PRESETS = ['Non Farm Payrolls', 'Nonfarm Payrolls Private']

interface NewsRow {
  event_name: string
  impact: Impact
  unit: string
  currency: string
  actual: string
  consensus: string
  previous: string
}

function blankNews(): NewsRow {
  return { event_name: '', impact: 'high', unit: 'K', currency: 'USD', actual: '', consensus: '', previous: '' }
}

// pisahkan ISO -> tanggal & waktu lokal
const dt = props.initial ? toDatetimeLocal(props.initial.released_at).split('T') : ['', '12:30']

// ---- state (waktu) ----
const period = ref<string>(props.initial?.period_label ?? '')
const date = ref<string>(dt[0] ?? '')
const time = ref<string>(dt[1] ?? '12:30')

// ---- state (kesimpulan reaksi) ----
const spike = ref<string>(props.initial?.spike ?? '')
const direction = ref<string>(props.initial?.direction ?? 'up')
const minor = ref<string>(props.initial?.minor_pips != null ? String(props.initial.minor_pips) : '')
const major = ref<string>(props.initial?.major_pips != null ? String(props.initial.major_pips) : '')
const note = ref<string>(props.initial?.note ?? '')

// ---- state (berita) ----
const news = ref<NewsRow[]>(
  props.initial?.nfp_news?.length
    ? props.initial.nfp_news.map((n) => ({
        event_name: n.event_name,
        impact: n.impact,
        unit: n.unit ?? 'K',
        currency: n.currency,
        actual: n.actual != null ? String(n.actual) : '',
        consensus: n.consensus != null ? String(n.consensus) : '',
        previous: n.previous != null ? String(n.previous) : '',
      }))
    : [blankNews()],
)

function addNews() {
  news.value.push(blankNews())
}
function removeNews(i: number) {
  news.value.splice(i, 1)
}

const valid = computed(
  () => !!date.value && !!time.value && news.value.some((n) => n.event_name.trim()),
)

function onSubmit() {
  if (!valid.value) return
  const released_at = fromDatetimeLocal(`${date.value}T${time.value}`)
  const session: NfpSessionInput = {
    period_label: period.value || monthLabel(released_at),
    released_at,
    spike: (spike.value || null) as NfpSessionInput['spike'],
    direction: (direction.value || null) as NfpSessionInput['direction'],
    minor_pips: numOrNull(minor.value),
    major_pips: numOrNull(major.value),
    note: note.value || null,
  }
  const newsPayload: NfpNewsInput[] = news.value
    .filter((n) => n.event_name.trim())
    .map((n) => ({
      event_name: n.event_name.trim(),
      impact: n.impact,
      unit: n.unit || null,
      currency: n.currency || 'USD',
      actual: numOrNull(n.actual),
      consensus: numOrNull(n.consensus),
      previous: numOrNull(n.previous),
    }))
  emit('submit', { session, news: newsPayload })
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <!-- LANGKAH 1: Daftar berita -->
    <Card>
      <CardHeader class="pb-4">
        <CardTitle class="flex items-center gap-2 text-base">
          <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>
          <Newspaper class="h-4 w-4" /> Daftar Berita
        </CardTitle>
        <CardDescription>Berita yang rilis bersamaan (mis. NFP + NFP Private).</CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <datalist id="news-presets">
          <option v-for="p in PRESETS" :key="p" :value="p" />
        </datalist>

        <div
          v-for="(n, i) in news"
          :key="i"
          class="rounded-md border bg-muted/20 p-3"
        >
          <div class="flex flex-wrap items-end gap-3">
            <div class="min-w-[180px] flex-1">
              <Label class="mb-1.5 block text-xs">Nama berita</Label>
              <Input v-model="n.event_name" list="news-presets" placeholder="Non Farm Payrolls" />
            </div>
            <div class="w-32">
              <Label class="mb-1.5 block text-xs">Tingkat</Label>
              <Select v-model="n.impact">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="w-24">
              <Label class="mb-1.5 block text-xs">Actual</Label>
              <Input v-model="n.actual" type="number" inputmode="numeric" placeholder="150" />
            </div>
            <div class="w-24">
              <Label class="mb-1.5 block text-xs">Cons</Label>
              <Input v-model="n.consensus" type="number" inputmode="numeric" placeholder="120" />
            </div>
            <div class="w-24">
              <Label class="mb-1.5 block text-xs">Prev</Label>
              <Input v-model="n.previous" type="number" inputmode="numeric" placeholder="110" />
            </div>
            <div class="w-20">
              <Label class="mb-1.5 block text-xs">Satuan</Label>
              <Input v-model="n.unit" placeholder="K" />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="shrink-0 text-destructive hover:text-destructive"
              :disabled="news.length === 1"
              @click="removeNews(i)"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button type="button" variant="outline" size="sm" @click="addNews">
          <Plus class="h-4 w-4" /> Tambah berita
        </Button>
      </CardContent>
    </Card>

    <!-- LANGKAH 2: Waktu rilis -->
    <Card>
      <CardHeader class="pb-4">
        <CardTitle class="flex items-center gap-2 text-base">
          <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">2</span>
          <CalendarClock class="h-4 w-4" /> Waktu Rilis
        </CardTitle>
        <CardDescription>Tentukan bulan lalu tanggal &amp; jam. Satu tanggal+jam = satu kesimpulan reaksi.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-3">
        <div>
          <Label class="mb-1.5 block">Bulan (periode data)</Label>
          <Select v-model="period">
            <SelectTrigger><SelectValue placeholder="Pilih bulan" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="m in MONTHS" :key="m" :value="m">{{ m }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label class="mb-1.5 block">Tanggal rilis *</Label>
          <Input v-model="date" type="date" />
        </div>
        <div>
          <Label class="mb-1.5 block">Jam rilis *</Label>
          <Input v-model="time" type="time" />
        </div>
      </CardContent>
    </Card>

    <!-- LANGKAH 3: Kesimpulan reaksi emas -->
    <Card>
      <CardHeader class="pb-4">
        <CardTitle class="flex items-center gap-2 text-base">
          <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">3</span>
          <TrendingUp class="h-4 w-4" /> Kesimpulan Reaksi Emas
        </CardTitle>
        <CardDescription>Satu kesimpulan untuk seluruh berita di sesi ini.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-4">
        <div>
          <Label class="mb-1.5 block">Spike</Label>
          <Select v-model="spike">
            <SelectTrigger><SelectValue placeholder="Pilih spike" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="up">Spike atas</SelectItem>
              <SelectItem value="down">Spike bawah</SelectItem>
              <SelectItem value="one_way">Satu arah</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label class="mb-1.5 block">Arah emas</Label>
          <Select v-model="direction">
            <SelectTrigger><SelectValue placeholder="Pilih arah" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="up">Naik</SelectItem>
              <SelectItem value="down">Turun</SelectItem>
              <SelectItem value="neutral">Sideways</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label class="mb-1.5 block">Pips minor</Label>
          <Input v-model="minor" type="number" inputmode="numeric" placeholder="mis. 120" />
        </div>
        <div>
          <Label class="mb-1.5 block">Pips major</Label>
          <Input v-model="major" type="number" inputmode="numeric" placeholder="mis. 748" />
        </div>
        <div class="sm:col-span-4">
          <Label class="mb-1.5 block">Catatan</Label>
          <RichTextEditor v-model="note" placeholder="Konteks pergerakan setelah news…" />
        </div>
      </CardContent>
    </Card>

    <!-- Aksi -->
    <div class="flex items-center gap-3">
      <Button type="submit" :disabled="!valid || submitting">
        {{ submitting ? 'Menyimpan…' : mode === 'create' ? 'Simpan sesi' : 'Perbarui sesi' }}
      </Button>
      <Button type="button" variant="ghost" @click="emit('cancel')">Batal</Button>
    </div>
  </form>
</template>
