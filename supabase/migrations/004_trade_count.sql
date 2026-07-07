-- ============================================================
-- Tambah kolom jumlah trade (berapa transaksi pada entri hari itu)
-- ============================================================
alter table public.trades
  add column if not exists trade_count integer not null default 1
  check (trade_count >= 0);
