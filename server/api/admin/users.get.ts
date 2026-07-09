// Daftar semua user + perannya (khusus admin).
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)

  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const { data: profiles } = await admin.from('profiles').select('user_id, role, display_name, phone')
  const profOf = new Map((profiles ?? []).map((p: any) => [p.user_id, p]))

  const users = (data?.users ?? []).map((u) => {
    const p = profOf.get(u.id)
    return {
      id: u.id,
      email: u.email ?? '',
      role: (p?.role ?? 'trader') as 'admin' | 'trader',
      display_name: p?.display_name ?? null,
      phone: p?.phone ?? null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      confirmed: !!u.email_confirmed_at,
    }
  })
  // Urutkan terbaru dulu
  users.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))

  return users
})
