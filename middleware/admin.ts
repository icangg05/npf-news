// Guard halaman pengelolaan berita/NFP: hanya untuk peran 'admin'.
// Trader yang mencoba masuk dialihkan ke kalender miliknya.
export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  if (!user.value) return navigateTo('/login')

  const { isAdmin, load } = useProfile()
  await load()
  if (!isAdmin.value) return navigateTo('/calendar')
})
