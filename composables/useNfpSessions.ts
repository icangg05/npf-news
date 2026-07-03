import type { NfpSession, NfpSessionInput, NfpNewsInput, NfpFilters } from '~/types/nfp'

export function useNfpSessions() {
  const client = useSupabaseClient()

  const SELECT = '*, nfp_news(*)'

  async function list(filters: NfpFilters = {}): Promise<NfpSession[]> {
    let query = client
      .from('nfp_sessions')
      .select(SELECT)
      .order('released_at', { ascending: false })
      .order('position', { referencedTable: 'nfp_news', ascending: true })

    if (filters.direction) query = query.eq('direction', filters.direction)
    if (filters.from) query = query.gte('released_at', filters.from)
    if (filters.to) query = query.lte('released_at', filters.to)

    const { data, error } = await query
    if (error) throw error
    let rows = (data ?? []) as unknown as NfpSession[]

    // filter berdasarkan nama berita dilakukan di sisi klien (nested)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      rows = rows.filter((s) => s.nfp_news?.some((n) => n.event_name.toLowerCase().includes(q)))
    }
    return rows
  }

  async function get(id: string): Promise<NfpSession | null> {
    const { data, error } = await client
      .from('nfp_sessions')
      .select(SELECT)
      .eq('id', id)
      .order('position', { referencedTable: 'nfp_news', ascending: true })
      .single()
    if (error) throw error
    return (data as unknown as NfpSession) ?? null
  }

  // Buat session + news dalam satu operasi
  async function create(session: NfpSessionInput, news: NfpNewsInput[]): Promise<string> {
    const { data, error } = await client
      .from('nfp_sessions')
      .insert(session as never)
      .select('id')
      .single()
    if (error) throw error
    const sessionId = (data as { id: string }).id
    await replaceNews(sessionId, news)
    return sessionId
  }

  // Update session + ganti seluruh news-nya
  async function update(id: string, session: NfpSessionInput, news: NfpNewsInput[]): Promise<void> {
    const { error } = await client
      .from('nfp_sessions')
      .update(session as never)
      .eq('id', id)
    if (error) throw error
    await replaceNews(id, news)
  }

  async function remove(id: string): Promise<void> {
    const { error } = await client.from('nfp_sessions').delete().eq('id', id)
    if (error) throw error
  }

  // Hapus semua news lama lalu masukkan yang baru (dataset kecil)
  async function replaceNews(sessionId: string, news: NfpNewsInput[]): Promise<void> {
    const del = await client.from('nfp_news').delete().eq('session_id', sessionId)
    if (del.error) throw del.error
    if (!news.length) return
    const rows = news.map((n, i) => ({ ...n, session_id: sessionId, position: i }))
    const ins = await client.from('nfp_news').insert(rows as never)
    if (ins.error) throw ins.error
  }

  return { list, get, create, update, remove }
}
