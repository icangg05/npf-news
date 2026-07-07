import type { Component } from 'vue'
import { History, CalendarDays, LayoutList, CandlestickChart } from 'lucide-vue-next'

export interface NavLink {
  to: string
  label: string
  icon: Component
  match: (path: string) => boolean
}

/**
 * Daftar tautan navigasi bersama untuk header (desktop) dan tab bar (mobile).
 * Tautan admin hanya muncul saat pengguna login.
 */
export function useNav() {
  const user = useSupabaseUser()
  const route = useRoute()

  const links = computed<NavLink[]>(() => {
    const base: NavLink[] = [
      { to: '/', label: 'Riwayat', icon: History, match: (p) => p === '/' },
      { to: '/calendar', label: 'Kalender', icon: CalendarDays, match: (p) => p.startsWith('/calendar') },
    ]
    if (user.value) {
      base.push(
        { to: '/admin', label: 'Sesi', icon: LayoutList, match: (p) => p === '/admin' || (p.startsWith('/admin/') && !p.startsWith('/admin/trades')) },
        { to: '/admin/trades', label: 'Trade', icon: CandlestickChart, match: (p) => p.startsWith('/admin/trades') },
      )
    }
    return base
  })

  const isActive = (l: NavLink) => l.match(route.path)

  return { links, isActive, user }
}
