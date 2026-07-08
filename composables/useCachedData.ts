import type { AsyncData, AsyncDataOptions } from '#app'

/**
 * Bungkus `useAsyncData` dengan pola stale-while-revalidate agar navigasi
 * terasa seperti aplikasi native:
 *
 *  - Kunjungan pertama ke halaman → data diambil (skeleton bila lambat).
 *  - Kunjungan berikutnya → data cache langsung tampil (tanpa skeleton/loading),
 *    lalu diperbarui diam-diam di latar belakang.
 *
 * Cara kerja: `getCachedData` kustom membuat Nuxt (1) mengembalikan cache
 * secara instan saat halaman dibuka lagi dan (2) tidak menghapus cache saat
 * komponen unmount. Refetch via `watch`/`refresh()` tetap mengambil data baru
 * (default `experimental.granularCachedData = false`).
 */
export function useCachedData<T>(
  key: string,
  handler: () => Promise<T>,
  options: AsyncDataOptions<T> = {},
): AsyncData<T, Error> {
  const nuxtApp = useNuxtApp()
  const appReady = useState('app-ready', () => false)

  const res = useAsyncData<T>(key, handler, {
    ...options,
    getCachedData: (k) => nuxtApp.payload.data[k] ?? nuxtApp.static.data[k],
  }) as AsyncData<T, Error>

  // Setelah load awal aplikasi, revalidasi diam-diam tiap kali halaman dibuka
  // kembali: cache tampil dulu, data terbaru menyusul tanpa mengganggu tampilan.
  onMounted(() => {
    if (appReady.value) res.refresh()
  })

  return res
}
