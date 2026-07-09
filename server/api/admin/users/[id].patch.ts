// Edit user (khusus admin). Body: { email?, password?, role? }.
export default defineEventHandler(async (event) => {
  const { admin, user } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{ email?: string; password?: string; role?: 'admin' | 'trader'; display_name?: string | null; phone?: string | null }>(event)

  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID user wajib.' })

  const email = body?.email?.trim().toLowerCase()
  const password = body?.password
  const role = body?.role === 'admin' ? 'admin' : body?.role === 'trader' ? 'trader' : undefined
  const display_name = body?.display_name !== undefined ? (body.display_name?.trim() || null) : undefined
  const phone = body?.phone !== undefined ? (body.phone?.trim() || null) : undefined

  // ---- Validasi ----
  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Email tidak valid.' })
  }
  if (password !== undefined && password !== '' && password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password minimal 6 karakter.' })
  }
  if (role !== undefined && id === user.id && role !== 'admin') {
    throw createError({ statusCode: 400, statusMessage: 'Tidak bisa menurunkan peran akun sendiri.' })
  }

  // ---- Update kredensial auth (email / password) bila ada ----
  const authPatch: { email?: string; password?: string; email_confirm?: boolean } = {}
  if (email !== undefined) { authPatch.email = email; authPatch.email_confirm = true }
  if (password) authPatch.password = password
  if (Object.keys(authPatch).length) {
    const { error } = await admin.auth.admin.updateUserById(id, authPatch)
    if (error) throw createError({ statusCode: 400, statusMessage: error.message })
  }

  // ---- Update profil (role / display_name / phone) bila ada ----
  const profPatch: Record<string, unknown> = { user_id: id }
  if (role !== undefined) profPatch.role = role
  if (display_name !== undefined) profPatch.display_name = display_name
  if (phone !== undefined) profPatch.phone = phone
  if (Object.keys(profPatch).length > 1) {
    const { error } = await admin
      .from('profiles')
      .upsert(profPatch as never, { onConflict: 'user_id' })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    id,
    ...(email !== undefined ? { email } : {}),
    ...(role !== undefined ? { role } : {}),
    ...(display_name !== undefined ? { display_name } : {}),
    ...(phone !== undefined ? { phone } : {}),
  }
})
