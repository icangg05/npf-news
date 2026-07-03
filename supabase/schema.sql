-- ============================================================
-- Riwayat NFP vs Emas — schema v2
-- Satu SESSION (tanggal+waktu) = satu kesimpulan reaksi emas
-- (spike, arah, pips minor, pips major). Satu session punya
-- BANYAK news (mis. NFP + NFP Private) yang sama-sama menggerakkan.
-- Jalankan di Supabase Dashboard -> SQL Editor.
-- ============================================================

create extension if not exists moddatetime schema extensions;

-- Buang skema lama (v1) bila ada
drop table if exists public.nfp_events cascade;

-- ------------------------------------------------------------
-- SESSION: reaksi pasar per rilis (tanggal + waktu)
-- ------------------------------------------------------------
create table if not exists public.nfp_sessions (
  id           uuid primary key default gen_random_uuid(),
  period_label text,                                          -- bulan data, mis. "Jun"
  released_at  timestamptz not null,                          -- tanggal & waktu rilis
  spike        text check (spike in ('up','down','one_way')), -- spike atas/bawah/satu arah
  direction    text check (direction in ('up','down','neutral')), -- arah emas
  minor_pips   numeric,                                       -- pergerakan pips minor
  major_pips   numeric,                                       -- pergerakan pips major
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists nfp_sessions_released_at_idx
  on public.nfp_sessions (released_at desc);

-- ------------------------------------------------------------
-- NEWS: berita ekonomi di dalam satu session
-- ------------------------------------------------------------
create table if not exists public.nfp_news (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.nfp_sessions(id) on delete cascade,
  event_name  text not null,                                  -- "Non Farm Payrolls"
  impact      text not null default 'high'
                check (impact in ('high','medium','low')),
  currency    text not null default 'USD',
  unit        text default 'K',
  actual      numeric,
  consensus   numeric,
  previous    numeric,
  position    int not null default 0,                         -- urutan tampil
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists nfp_news_session_id_idx on public.nfp_news (session_id);

-- ------------------------------------------------------------
-- Trigger updated_at
-- ------------------------------------------------------------
drop trigger if exists handle_updated_at on public.nfp_sessions;
create trigger handle_updated_at before update on public.nfp_sessions
  for each row execute procedure extensions.moddatetime (updated_at);

drop trigger if exists handle_updated_at on public.nfp_news;
create trigger handle_updated_at before update on public.nfp_news
  for each row execute procedure extensions.moddatetime (updated_at);

-- ------------------------------------------------------------
-- Row Level Security: publik baca, admin (authenticated) tulis
-- ------------------------------------------------------------
alter table public.nfp_sessions enable row level security;
alter table public.nfp_news enable row level security;

drop policy if exists "public read" on public.nfp_sessions;
create policy "public read" on public.nfp_sessions for select using (true);
drop policy if exists "admin write" on public.nfp_sessions;
create policy "admin write" on public.nfp_sessions for all to authenticated using (true) with check (true);

drop policy if exists "public read" on public.nfp_news;
create policy "public read" on public.nfp_news for select using (true);
drop policy if exists "admin write" on public.nfp_news;
create policy "admin write" on public.nfp_news for all to authenticated using (true) with check (true);

-- ------------------------------------------------------------
-- Seed contoh: 1 session (Jun) + 2 news, market naik 748 pips
-- ------------------------------------------------------------
do $$
declare sid uuid;
begin
  insert into public.nfp_sessions (period_label, released_at, spike, direction, minor_pips, major_pips, note)
  values ('Jun', '2026-07-02 12:30:00+00', 'up', 'up', 120, 748, 'NFP + NFP Private sama-sama miss, emas rally 748 pips')
  returning id into sid;

  insert into public.nfp_news (session_id, event_name, impact, currency, unit, actual, consensus, previous, position)
  values
    (sid, 'Non Farm Payrolls', 'high', 'USD', 'K', 57, 110, 129, 0),
    (sid, 'Nonfarm Payrolls Private', 'high', 'USD', 'K', 49, 110, 97, 1);
end $$;
