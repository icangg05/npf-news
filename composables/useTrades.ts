import type { Trade, TradeInput } from '~/types/trade'

export function useTrades() {
  const client = useSupabaseClient()
  const table = () => client.from('trades')

  // ambil trades pada rentang tanggal (inklusif). Format 'YYYY-MM-DD'.
  async function listRange(from: string, to: string): Promise<Trade[]> {
    const { data, error } = await table()
      .select('*')
      .gte('trade_date', from)
      .lte('trade_date', to)
      .order('trade_date', { ascending: true })
    if (error) throw error
    return (data ?? []) as unknown as Trade[]
  }

  async function listAll(): Promise<Trade[]> {
    const { data, error } = await table().select('*').order('trade_date', { ascending: false })
    if (error) throw error
    return (data ?? []) as unknown as Trade[]
  }

  async function create(payload: TradeInput): Promise<Trade> {
    const { data, error } = await table().insert(payload as never).select().single()
    if (error) throw error
    return data as unknown as Trade
  }

  async function update(id: string, payload: Partial<TradeInput>): Promise<Trade> {
    const { data, error } = await table().update(payload as never).eq('id', id).select().single()
    if (error) throw error
    return data as unknown as Trade
  }

  async function remove(id: string): Promise<void> {
    const { error } = await table().delete().eq('id', id)
    if (error) throw error
  }

  return { listRange, listAll, create, update, remove }
}
