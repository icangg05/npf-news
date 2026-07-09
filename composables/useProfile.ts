import type { Role } from '~/types/trade'

/**
 * Peran user saat ini (admin / trader). Dimuat sekali dari tabel `profiles`
 * lalu di-cache di `useState` agar bisa dipakai nav & middleware tanpa
 * fetch berulang. Bila belum login → role null.
 */
export function useProfile() {
  const client = useSupabaseClient()
  const user = useSupabaseUser()
  const role = useState<Role | null>('profile-role', () => null)
  const loaded = useState<boolean>('profile-loaded', () => false)

  async function load(force = false) {
    if (!user.value) {
      role.value = null
      loaded.value = true
      return
    }
    if (loaded.value && !force) return
    const { data, error } = await client
      .from('profiles')
      .select('role')
      .eq('user_id', user.value.id)
      .maybeSingle()
    if (error) throw error
    role.value = ((data as { role?: Role } | null)?.role ?? 'trader') as Role
    loaded.value = true
  }

  // Muat otomatis saat user berubah (login/logout).
  watch(user, (u) => {
    loaded.value = false
    role.value = null
    if (u) load(true)
  })

  const isAdmin = computed(() => role.value === 'admin')
  const isTrader = computed(() => role.value === 'trader')

  return { role, isAdmin, isTrader, load }
}
