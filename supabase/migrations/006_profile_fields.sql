-- ============================================================
-- Tambah data profil: display_name & phone, + fungsi edit profil sendiri.
-- Trader mengedit profilnya lewat RPC `update_my_profile` (SECURITY DEFINER),
-- jadi TIDAK perlu policy UPDATE / trigger di tabel — dan `role` aman
-- (tak bisa diubah lewat fungsi ini).
-- Jalankan setelah 005_multiuser_roles.sql.
--
-- CATATAN "must be owner of table profiles":
--   ALTER TABLE ... ADD COLUMN butuh Anda menjadi PEMILIK tabel. Bila muncul
--   error tsb, jalankan dulu (sebagai postgres di SQL Editor) baris berikut,
--   lalu ulangi migrasi ini:
--     alter table public.profiles owner to postgres;
--   Cek pemilik saat ini:
--     select tableowner from pg_tables where schemaname='public' and tablename='profiles';
-- ============================================================

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists phone       text;

-- Edit profil sendiri (nama & telepon). SECURITY DEFINER => berjalan sebagai
-- pemilik fungsi, jadi tak butuh policy UPDATE di tabel. Kolom `role` tidak
-- pernah disentuh sehingga trader tak bisa menaikkan perannya.
create or replace function public.update_my_profile(p_display_name text, p_phone text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Harus login.';
  end if;
  update public.profiles
     set display_name = p_display_name,
         phone        = p_phone
   where user_id = auth.uid()
  returning * into result;
  return result;
end
$$;

grant execute on function public.update_my_profile(text, text) to authenticated;
