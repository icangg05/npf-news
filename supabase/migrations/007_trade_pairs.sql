-- ============================================================
-- Tambah kolom pair (bisa lebih dari satu) pada entri trade harian.
-- ============================================================
alter table public.trades
  add column if not exists pairs text[] not null default '{}';
