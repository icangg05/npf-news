import type { Currency } from '~/types/trade'

// 1 USD = 100 USC. IDR via kurs usd_idr.
// Konversi lewat basis USD.
export function toUsd(amount: number, from: Currency, usdIdr: number): number {
  switch (from) {
    case 'USD': return amount
    case 'USC': return amount / 100
    case 'IDR': return usdIdr ? amount / usdIdr : 0
  }
}

export function convert(amount: number, from: Currency, to: Currency, usdIdr: number): number {
  const usd = toUsd(amount, from, usdIdr)
  switch (to) {
    case 'USD': return usd
    case 'USC': return usd * 100
    case 'IDR': return usd * usdIdr
  }
}

export function formatCurrency(value: number, currency: Currency): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (currency === 'IDR') {
    return `${sign}Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(abs)}`
  }
  if (currency === 'USC') {
    return `${sign}${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(abs)}¢`
  }
  return `${sign}$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(abs)}`
}

// ringkas untuk sel kalender (mis. 1.2K, 320rb)
export function formatCompact(value: number, currency: Currency): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (currency === 'IDR') {
    if (abs >= 1_000_000) return `${sign}Rp${(abs / 1_000_000).toFixed(1)}jt`
    if (abs >= 1_000) return `${sign}Rp${Math.round(abs / 1_000)}rb`
    return `${sign}Rp${Math.round(abs)}`
  }
  const sym = currency === 'USC' ? '¢' : '$'
  const pre = currency === 'USC' ? '' : sym
  const post = currency === 'USC' ? sym : ''
  if (abs >= 1_000) return `${sign}${pre}${(abs / 1_000).toFixed(1)}K${post}`
  return `${sign}${pre}${abs % 1 === 0 ? abs : abs.toFixed(1)}${post}`
}
