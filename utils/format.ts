import type { Surprise } from '~/types/nfp'

type ActCons = { actual: number | null; consensus: number | null }

// Beat/Miss dari selisih actual - consensus
export function surpriseOf(e: ActCons): Surprise {
  if (e.actual == null || e.consensus == null) return null
  if (e.actual > e.consensus) return 'beat'
  if (e.actual < e.consensus) return 'miss'
  return 'inline'
}

// class warna untuk nilai actual relatif consensus
export function actualColorClass(e: ActCons): string {
  const s = surpriseOf(e)
  if (s === 'miss') return 'text-destructive'
  if (s === 'beat') return 'text-emerald-600 dark:text-emerald-400'
  return 'text-foreground'
}

export function formatNumber(value: number | null | undefined, unit?: string | null): string {
  if (value == null) return '—'
  const n = Number(value)
  const str = Number.isInteger(n) ? n.toString() : n.toFixed(1)
  return unit ? `${str}${unit}` : str
}

// input string -> number | null (untuk field angka opsional)
export function numOrNull(value: string): number | null {
  if (value === '' || value == null) return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`
}

// ISO -> nilai untuk <input type="datetime-local"> (waktu lokal)
export function toDatetimeLocal(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// nilai datetime-local -> ISO string
export function fromDatetimeLocal(value: string): string {
  if (!value) return ''
  return new Date(value).toISOString()
}

// nama bulan Indonesia dari ISO
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
export function monthLabel(iso: string): string {
  return MONTHS[new Date(iso).getMonth()] ?? ''
}

const MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
export function monthNameFull(month: number): string {
  return MONTHS_FULL[month] ?? ''
}

// Singkatan bulan ("Jun") -> nama lengkap ("Juni").
// Bila label kosong, ambil dari tanggal ISO.
export function monthFullFromLabel(label: string | null | undefined, fallbackIso?: string): string {
  if (label) {
    const i = MONTHS.indexOf(label)
    return i >= 0 ? MONTHS_FULL[i] : label
  }
  return fallbackIso ? monthNameFull(new Date(fallbackIso).getMonth()) : ''
}

// Date -> 'YYYY-MM-DD' (waktu lokal)
export function toDateStr(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 'YYYY-MM-DD' -> tanggal tampil singkat "02 Jul 2026"
export function formatDateStr(s: string): string {
  const [y, m, d] = s.split('-').map(Number)
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`
}
