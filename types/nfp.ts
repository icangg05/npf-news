export type Impact = 'high' | 'medium' | 'low'
export type Direction = 'up' | 'down' | 'neutral'
// spike: 'up' = spike atas, 'down' = spike bawah, 'one_way' = satu arah
export type SpikeKind = 'up' | 'down' | 'one_way'

// Satu berita ekonomi di dalam sebuah session
export interface NfpNews {
  id: string
  session_id: string
  event_name: string
  impact: Impact
  currency: string
  unit: string | null
  actual: number | null
  consensus: number | null
  previous: number | null
  position: number
  created_at: string
  updated_at: string
}

// Satu session = satu tanggal+waktu rilis dengan SATU kesimpulan reaksi emas,
// berisi banyak news.
export interface NfpSession {
  id: string
  period_label: string | null
  released_at: string
  spike: SpikeKind | null
  direction: Direction | null
  minor_pips: number | null
  major_pips: number | null
  note: string | null
  created_at: string
  updated_at: string
  nfp_news: NfpNews[]
}

// ---- Input payloads (form) ----
export interface NfpNewsInput {
  event_name: string
  impact: Impact
  currency: string
  unit: string | null
  actual: number | null
  consensus: number | null
  previous: number | null
}

export interface NfpSessionInput {
  period_label: string | null
  released_at: string
  spike: SpikeKind | null
  direction: Direction | null
  minor_pips: number | null
  major_pips: number | null
  note: string | null
}

export interface NfpFilters {
  search?: string
  direction?: Direction | ''
  from?: string
  to?: string
}

export type Surprise = 'beat' | 'miss' | 'inline' | null
