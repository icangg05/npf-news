import type { ImportantNote } from '~/types/trade'

export function useNotes() {
  const client = useSupabaseClient()
  const user = useSupabaseUser()
  const table = () => client.from('important_notes')

  // Ambil catatan penting milik user login (RLS otomatis membatasi).
  async function getNote(): Promise<ImportantNote | null> {
    if (!user.value) return null
    const { data, error } = await table().select('*').maybeSingle()
    if (error) throw error
    return (data as unknown as ImportantNote) ?? null
  }

  // Simpan (buat/perbarui) isi catatan. user_id diisi DB via default auth.uid().
  async function saveNote(body: string): Promise<ImportantNote> {
    if (!user.value) throw new Error('Harus login.')
    const row = { user_id: user.value.id, body: body || null }
    const { data, error } = await table()
      .upsert(row as never, { onConflict: 'user_id' })
      .select()
      .single()
    if (error) throw error
    return data as unknown as ImportantNote
  }

  return { getNote, saveNote }
}
