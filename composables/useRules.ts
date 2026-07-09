import type { TradeRules, TradeRulesInput } from '~/types/trade'

export function useRules() {
  const client = useSupabaseClient()
  const user = useSupabaseUser()
  const table = () => client.from('trade_rules')

  // Ambil aturan milik user login (RLS otomatis membatasi). Null bila belum ada.
  async function getRules(): Promise<TradeRules | null> {
    if (!user.value) return null
    const { data, error } = await table().select('*').maybeSingle()
    if (error) throw error
    return (data as unknown as TradeRules) ?? null
  }

  // Simpan (buat/perbarui) aturan. user_id diisi DB via default auth.uid().
  async function saveRules(payload: TradeRulesInput): Promise<TradeRules> {
    if (!user.value) throw new Error('Harus login.')
    const row = { user_id: user.value.id, ...payload }
    const { data, error } = await table()
      .upsert(row as never, { onConflict: 'user_id' })
      .select()
      .single()
    if (error) throw error
    return data as unknown as TradeRules
  }

  return { getRules, saveRules }
}
