-- ============================================================
-- Multi-user + pemisahan peran (admin / trader)
--   * admin  : mengelola data berita/NFP (referensi bersama)
--   * trader : mengelola trade, rules, & catatan miliknya sendiri
-- Data NFP tetap dibaca publik; hanya admin yang boleh menulis.
-- Trades/rules/notes jadi privat per user (RLS user_id = auth.uid()).
-- Jalankan di Supabase Dashboard -> SQL Editor.
-- ============================================================

create extension if not exists moddatetime schema extensions;

-- ------------------------------------------------------------
-- PROFILES: peran tiap user (default 'trader')
-- ------------------------------------------------------------
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'trader' check (role in ('admin','trader')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated
  using (user_id = auth.uid());

-- Auto-buat profil (role=trader) tiap kali admin membuat user baru di Dashboard
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id) on conflict do nothing;
  return new;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper anti-rekursi RLS untuk mengecek admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  );
$$;

-- Backfill profil untuk user yang sudah ada
insert into public.profiles (user_id)
  select id from auth.users
  on conflict do nothing;

-- CATATAN: promosikan akun admin awal secara manual, contoh:
--   update public.profiles set role = 'admin'
--   where user_id = '00000000-0000-0000-0000-000000000000';

-- ------------------------------------------------------------
-- Data NFP: tulis khusus admin (baca tetap publik)
-- ------------------------------------------------------------
drop policy if exists "admin write" on public.nfp_sessions;
create policy "admin write" on public.nfp_sessions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin write" on public.nfp_news;
create policy "admin write" on public.nfp_news for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- TRADES: privat per trader
-- ------------------------------------------------------------
alter table public.trades
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Seed contoh lama tidak punya pemilik -> buang agar tidak jadi baris yatim
delete from public.trades where user_id is null;

alter table public.trades alter column user_id set not null;
alter table public.trades alter column user_id set default auth.uid();
create index if not exists trades_user_id_idx on public.trades (user_id);

drop policy if exists "public read" on public.trades;
drop policy if exists "admin write" on public.trades;
drop policy if exists "own trades" on public.trades;
create policy "own trades" on public.trades for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------------------------------------------------------
-- TRADE_RULES: 1 baris per trader (modal awal + aturan dinamis)
-- ------------------------------------------------------------
create table if not exists public.trade_rules (
  user_id             uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  modal_awal          numeric not null default 0,
  base_currency       text not null default 'USC' check (base_currency in ('USC','USD','IDR')),
  daily_loss_limit    numeric,   -- batas loss harian (besaran absolut)
  daily_profit_target numeric,   -- target profit awal
  daily_profit_max    numeric,   -- target profit maksimal
  daily_profit_secure numeric,   -- pengaman profit minimal
  risk_per_trade      numeric,   -- batas risiko per setup
  max_lot_size        numeric,   -- max total lot
  max_layer           integer,   -- max layer
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists handle_updated_at on public.trade_rules;
create trigger handle_updated_at before update on public.trade_rules
  for each row execute procedure extensions.moddatetime (updated_at);

alter table public.trade_rules enable row level security;
drop policy if exists "own rules" on public.trade_rules;
create policy "own rules" on public.trade_rules for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------------------------------------------------------
-- IMPORTANT_NOTES: 1 baris catatan (rich HTML) per trader
-- ------------------------------------------------------------
create table if not exists public.important_notes (
  user_id    uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  body       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists handle_updated_at on public.important_notes;
create trigger handle_updated_at before update on public.important_notes
  for each row execute procedure extensions.moddatetime (updated_at);

alter table public.important_notes enable row level security;
drop policy if exists "own notes" on public.important_notes;
create policy "own notes" on public.important_notes for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
