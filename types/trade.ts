export type Currency = 'USC' | 'USD' | 'IDR'

export interface Trade {
  id: string
  user_id: string
  trade_date: string // YYYY-MM-DD
  amount: number
  currency: Currency
  trade_count: number // jumlah transaksi pada entri ini
  note: string | null
  created_at: string
  updated_at: string
}

export interface TradeInput {
  trade_date: string
  amount: number
  currency: Currency
  trade_count: number
  note: string | null
}

export interface ExchangeRate {
  id: number
  usd_idr: number
  source: string | null
  updated_at: string
}

// ---- Peran user ----
export type Role = 'admin' | 'trader'

export interface Profile {
  user_id: string
  role: Role
  display_name: string | null
  phone: string | null
}

// ---- Aturan trading per user (modal awal + batas dinamis) ----
export interface TradeRules {
  user_id: string
  modal_awal: number
  base_currency: Currency
  daily_loss_limit: number | null
  daily_profit_target: number | null
  daily_profit_max: number | null
  daily_profit_secure: number | null
  risk_per_trade: number | null
  max_lot_size: number | null
  max_layer: number | null
  updated_at?: string
}

export interface TradeRulesInput {
  modal_awal: number
  base_currency: Currency
  daily_loss_limit: number | null
  daily_profit_target: number | null
  daily_profit_max: number | null
  daily_profit_secure: number | null
  risk_per_trade: number | null
  max_lot_size: number | null
  max_layer: number | null
}

// ---- Catatan penting (rich HTML) per user ----
export interface ImportantNote {
  user_id: string
  body: string | null
  updated_at?: string
}

export const CURRENCIES: Currency[] = ['USC', 'USD', 'IDR']
