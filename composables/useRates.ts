import type { ExchangeRate } from '~/types/trade'

export function useRates() {
  const client = useSupabaseClient()

  async function getRate(): Promise<ExchangeRate | null> {
    const { data, error } = await client
      .from('exchange_rates')
      .select('*')
      .eq('id', 1)
      .single()
    if (error) throw error
    return (data as unknown as ExchangeRate) ?? null
  }

  // Panggil server route (admin) untuk tarik kurs terbaru & simpan ke DB
  async function updateRate(): Promise<ExchangeRate> {
    return await $fetch<ExchangeRate>('/api/rates/update', { method: 'POST' })
  }

  return { getRate, updateRate }
}
