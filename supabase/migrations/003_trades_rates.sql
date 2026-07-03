-- ============================================================
-- Trades harian (untuk kalender profit) + kurs mata uang
-- USC = US Cent (1 USD = 100 USC), USD, IDR
-- ============================================================
create extension if not exists moddatetime schema extensions;

-- ---- Trades ----
create table if not exists public.trades (
  id          uuid primary key default gen_random_uuid(),
  trade_date  date not null,
  amount      numeric not null,                               -- profit (negatif = loss)
  currency    text not null default 'USC'
                check (currency in ('USC', 'USD', 'IDR')),
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists trades_trade_date_idx on public.trades (trade_date);

drop trigger if exists handle_updated_at on public.trades;
create trigger handle_updated_at before update on public.trades
  for each row execute procedure extensions.moddatetime (updated_at);

alter table public.trades enable row level security;
drop policy if exists "public read" on public.trades;
create policy "public read" on public.trades for select using (true);
drop policy if exists "admin write" on public.trades;
create policy "admin write" on public.trades for all to authenticated using (true) with check (true);

-- ---- Kurs (singleton, base USD) ----
create table if not exists public.exchange_rates (
  id         int primary key default 1,
  usd_idr    numeric not null default 16000,                 -- 1 USD = ? IDR
  source     text,
  updated_at timestamptz not null default now(),
  constraint singleton_row check (id = 1)
);
insert into public.exchange_rates (id, usd_idr, source)
  values (1, 16000, 'default') on conflict (id) do nothing;

drop trigger if exists handle_updated_at on public.exchange_rates;
create trigger handle_updated_at before update on public.exchange_rates
  for each row execute procedure extensions.moddatetime (updated_at);

alter table public.exchange_rates enable row level security;
drop policy if exists "public read" on public.exchange_rates;
create policy "public read" on public.exchange_rates for select using (true);
drop policy if exists "admin write" on public.exchange_rates;
create policy "admin write" on public.exchange_rates for all to authenticated using (true) with check (true);

-- ---- Seed contoh (Jul 2026, mata uang campur) ----
insert into public.trades (trade_date, amount, currency, note) values
  ('2026-07-01', 15,   'USD', 'Scalp pagi, disiplin ikut plan. Entry pullback EMA.'),
  ('2026-07-02', 250,  'USC', 'NFP rally besar, breakout entry, TP 748 pips.'),
  ('2026-07-03', -80,  'USC', 'Market choppy, kena SL kecil. Overtrade, sudah stop.'),
  ('2026-07-06', 320000, 'IDR', 'Swing emas 2 hari, IDR account.')
on conflict do nothing;
