// Belt-and-suspenders guard for /admin pages.
// (The @nuxtjs/supabase module also redirects via redirectOptions.include.)
export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/login')
  }
})
