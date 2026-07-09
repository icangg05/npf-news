import type { H3Event } from 'h3'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

/**
 * Pastikan pemanggil route adalah user login berperan `admin`, lalu kembalikan
 * client Supabase ber-service-role (bypass RLS) untuk operasi admin (kelola user).
 * Butuh env `SUPABASE_SERVICE_KEY`.
 */
export async function requireAdmin(event: H3Event) {
  let user
  try {
    user = await serverSupabaseUser(event)
  } catch {
    user = null
  }
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Harus login.' })
  }

  let admin: ReturnType<typeof serverSupabaseServiceRole>
  try {
    admin = serverSupabaseServiceRole(event)
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'SUPABASE_SERVICE_KEY belum diset di server (.env).',
    })
  }

  const { data: profile, error } = await admin
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if ((profile as { role?: string } | null)?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Khusus admin.' })
  }

  return { admin, user }
}
