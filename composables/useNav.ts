import type { Component } from 'vue'
import { History, CalendarDays, LayoutList, CandlestickChart, ScrollText, Users, UserCog } from 'lucide-vue-next'

export interface NavLink {
  to: string
  label: string
  icon: Component
  match: (path: string) => boolean
}

/**
 * Daftar tautan navigasi bersama untuk header (desktop) dan tab bar (mobile).
 * Bercabang per peran:
 *   - publik  : Riwayat (data NFP bersama).
 *   - admin   : Sesi (kelola berita/NFP).
 *   - trader  : Kalender, Aturan, Trade (data trade miliknya).
 */
export function useNav() {
  const user = useSupabaseUser()
  const route = useRoute()
  const { isAdmin, load } = useProfile()

  // Pastikan peran termuat begitu ada sesi login.
  if (import.meta.client) {
    watch(user, () => load(), { immediate: true })
  }

  const links = computed<NavLink[]>(() => {
    const base: NavLink[] = [
      { to: '/', label: 'Riwayat', icon: History, match: (p) => p === '/' },
    ]
    if (!user.value) return base

    if (isAdmin.value) {
      base.push(
        { to: '/admin', label: 'Sesi', icon: LayoutList, match: (p) => p === '/admin' || (p.startsWith('/admin/') && !p.startsWith('/admin/trades') && !p.startsWith('/admin/users')) },
        { to: '/admin/users', label: 'User', icon: Users, match: (p) => p.startsWith('/admin/users') },
      )
    } else {
      base.push(
        { to: '/calendar', label: 'Kalender', icon: CalendarDays, match: (p) => p.startsWith('/calendar') },
        { to: '/rules', label: 'Aturan', icon: ScrollText, match: (p) => p.startsWith('/rules') },
        { to: '/admin/trades', label: 'Trade', icon: CandlestickChart, match: (p) => p.startsWith('/admin/trades') },
      )
    }
    // Profil tersedia untuk semua user login (admin & trader).
    base.push({ to: '/profile', label: 'Profil', icon: UserCog, match: (p) => p.startsWith('/profile') })
    return base
  })

  const isActive = (l: NavLink) => l.match(route.path)

  return { links, isActive, user }
}
