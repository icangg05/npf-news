// Hapus user (khusus admin). Tidak boleh menghapus akun sendiri.
export default defineEventHandler(async (event) => {
  const { admin, user } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID user wajib.' })
  if (id === user.id) {
    throw createError({ statusCode: 400, statusMessage: 'Tidak bisa menghapus akun sendiri.' })
  }

  // Hapus dari auth; baris profiles & data terkait ikut terhapus (ON DELETE CASCADE).
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) throw createError({ statusCode: 400, statusMessage: error.message })

  return { id }
})
