// Registrasi user baru (khusus admin). Body: { email, password, role }.
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const body = await readBody<{ email?: string; password?: string; role?: 'admin' | 'trader'; display_name?: string; phone?: string }>(event)

  const email = (body?.email ?? '').trim().toLowerCase()
  const password = body?.password ?? ''
  const role: 'admin' | 'trader' = body?.role === 'admin' ? 'admin' : 'trader'
  const display_name = body?.display_name?.trim() || null
  const phone = body?.phone?.trim() || null

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Email tidak valid.' })
  }
  if (password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password minimal 6 karakter.' })
  }

  // Buat user (langsung terkonfirmasi agar bisa login).
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw createError({ statusCode: 400, statusMessage: error.message })

  const newId = data.user?.id
  if (!newId) throw createError({ statusCode: 500, statusMessage: 'Gagal membuat user.' })

  // Trigger DB membuat profil default 'trader'; set peran & data profil.
  const { error: pErr } = await admin
    .from('profiles')
    .upsert({ user_id: newId, role, display_name, phone } as never, { onConflict: 'user_id' })
  if (pErr) throw createError({ statusCode: 500, statusMessage: pErr.message })

  return { id: newId, email, role, display_name, phone }
})
