-- spike: boolean -> enum ('up' = spike atas, 'down' = spike bawah, 'one_way' = satu arah)
alter table public.nfp_sessions
  add column if not exists spike_kind text check (spike_kind in ('up', 'down', 'one_way'));

-- data lama: spike=true dianggap "spike atas"
update public.nfp_sessions set spike_kind = 'up' where spike is true and spike_kind is null;

alter table public.nfp_sessions drop column if exists spike;
alter table public.nfp_sessions rename column spike_kind to spike;
