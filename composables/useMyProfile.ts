import type { Profile } from '~/types/trade'

/**
 * Profil milik user login (baca & edit sendiri). Kolom `role` tidak bisa
 * diubah lewat sini — dijaga trigger DB `protect_profile_role`.
 */
export function useMyProfile() {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  async function getMine(): Promise<Profile | null> {
    if (!user.value) return null
    const { data, error } = await client
      .from('profiles')
      .select('user_id, role, display_name, phone')
      .eq('user_id', user.value.id)
      .maybeSingle()
    if (error) throw error
    return (data as unknown as Profile) ?? null
  }

  async function updateMine(payload: { display_name: string | null; phone: string | null }): Promise<Profile> {
    if (!user.value) throw new Error('Harus login.')
    // Lewat RPC SECURITY DEFINER: role tetap terkunci, tak butuh policy UPDATE.
    const { data, error } = await client.rpc('update_my_profile', {
      p_display_name: payload.display_name,
      p_phone: payload.phone,
    })
    if (error) throw error
    return data as unknown as Profile
  }

  // Ganti password akun sendiri (Supabase Auth).
  async function changePassword(newPassword: string): Promise<void> {
    const { error } = await client.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  return { getMine, updateMine, changePassword }
}
