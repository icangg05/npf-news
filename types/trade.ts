export type Currency = 'USC' | 'USD' | 'IDR'

export interface Trade {
  id: string
  trade_date: string // YYYY-MM-DD
  amount: number
  currency: Currency
  note: string | null
  created_at: string
  updated_at: string
}

export interface TradeInput {
  trade_date: string
  amount: number
  currency: Currency
  note: string | null
}

export interface ExchangeRate {
  id: number
  usd_idr: number
  source: string | null
  updated_at: string
}

export const CURRENCIES: Currency[] = ['USC', 'USD', 'IDR']
