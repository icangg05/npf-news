Tips Agar Database Tidak Mati / Di-pause
Jika website Anda memang sepi pengunjung tetapi Anda ingin datanya tetap aktif tanpa perlu repot mengecek dashboard Supabase, ada beberapa solusi:

Gunakan Layanan Berbayar (Pro Plan): Kebijakan otomatis pause karena tidak aktif hanya berlaku untuk Free Plan. Jika Anda berlangganan Pro Plan ($25/bulan), database Anda akan tetap menyala selamanya meskipun tidak dibuka berbulan-bulan.

Gunakan Trik Cron Job / Ping Otomatis: Jika ingin tetap gratis, Anda bisa memanfaatkan layanan eksternal seperti GitHub Actions atau Vercel Cron Jobs untuk mengirimkan query sederhana (seperti SELECT 1;) ke database Anda sekali sehari atau seminggu sekali. Hal ini akan membuat sistem Supabase membaca bahwa database Anda tetap "aktif".

# Riwayat NFP vs Emas + Jurnal Trading per-user

Pencatatan riwayat rilis **Non-Farm Payrolls (NFP)** dan dampaknya terhadap harga **emas (XAU/USD)**, plus **jurnal trading per-user** (kalender profit, aturan, kurva ekuitas).

**Stack:** Nuxt 3 · TailwindCSS · **shadcn-nuxt** (reka-ui) · Supabase (Postgres + Auth) · Docker.

## Peran (roles)
Ada dua peran, disimpan di tabel `profiles`:

- **admin** — mengelola **data berita/NFP** bersama (halaman Riwayat `/` & Sesi `/admin`). Hanya admin yang boleh menulis `nfp_sessions`/`nfp_news` (RLS via `is_admin()`).
- **trader** — mengelola **data trade miliknya sendiri**: Kalender (`/calendar`), Aturan (`/rules`), Trade (`/admin/trades`). Tiap trader hanya melihat datanya sendiri (RLS `user_id = auth.uid()`), sehingga bisa menambah banyak akun trader.

Data NFP tetap **dibaca publik**; data trade/aturan/catatan **privat per-user** (perlu login).

## Model data
Satu **sesi** = satu tanggal+waktu rilis dengan **satu kesimpulan reaksi emas**
(spike, arah, pips minor, pips major, catatan). Satu sesi berisi **banyak berita**
(mis. *Non Farm Payrolls* + *Nonfarm Payrolls Private* yang rilis bersamaan dan
sama-sama menggerakkan market, mis. **748 pips**).

- `nfp_sessions` — period (bulan), released_at, spike, direction, minor_pips, major_pips, note
- `nfp_news` — session_id, event_name, impact, currency, unit, actual, consensus, previous

Tiap berita menampilkan badge **Beat/Miss** otomatis dari `actual − consensus`.

## Alur input (admin)
1. **Waktu rilis** — pilih bulan, lalu tanggal & jam.
2. **Kesimpulan reaksi emas** (satu) — spike, arah, pips minor, pips major, catatan.
3. **Daftar berita** — tambah 1+ berita (nama, tingkat, Act/Cons/Prev).

## 1. Setup Supabase
1. Buat proyek di [supabase.com](https://supabase.com).
2. SQL Editor → jalankan [`supabase/schema.sql`](supabase/schema.sql) (tabel NFP), lalu semua migrasi di [`supabase/migrations/`](supabase/migrations/) berurutan — termasuk [`005_multiuser_roles.sql`](supabase/migrations/005_multiuser_roles.sql) (profiles/peran, RLS per-user, trade_rules, important_notes) dan [`006_profile_fields.sql`](supabase/migrations/006_profile_fields.sql) (display_name & phone + edit profil sendiri).
3. Authentication → Providers → Email → matikan "Allow new users to sign up" (registrasi hanya oleh admin).
4. **Membuat akun admin pertama** (belum ada admin, jadi lewat Dashboard):
   - Authentication → Users → **Add user** → isi email + password, centang **Auto Confirm User**. Trigger otomatis membuat profil peran `trader`.
   - **Promosikan jadi admin** via SQL Editor:
     ```sql
     update public.profiles set role = 'admin'
     where user_id = (select id from auth.users where email = 'admin@email.com');
     ```
   - Akun trader/admin **berikutnya** cukup dibuat dari dalam aplikasi: login admin → menu **User** (`/admin/users`) → **Register user**.
5. Project Settings → API → salin `Project URL`, `anon public key`, dan **`service_role key`** (untuk kelola user).

## 2. Konfigurasi env
```bash
cp .env.example .env   # isi SUPABASE_URL, SUPABASE_KEY, dan SUPABASE_SERVICE_KEY
```
> `SUPABASE_SERVICE_KEY` (service_role) bersifat **rahasia** & hanya dipakai di server (route `/api/admin/users`) untuk register/kelola user. Jangan pernah diekspos ke klien.

## 3. Menjalankan (Docker)

### Dev (hot reload)
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```
Buka http://localhost:3000 — edit file di host, browser auto-refresh.

### Production
```bash
docker compose up --build -d
```

### Tanpa Docker
```bash
npm install
npm run dev
```

## Rute
| Rute | Akses | Fungsi |
|---|---|---|
| `/` | Publik | Riwayat sesi NFP (kartu) + filter + statistik |
| `/login` | Publik | Login (admin & trader) |
| `/admin` | Admin | Tabel sesi NFP + hapus |
| `/admin/new` · `/admin/:id` | Admin | Tambah / edit sesi NFP |
| `/admin/users` | Admin | Register user + daftar user + ubah peran / hapus |
| `/calendar` | Trader | Kalender profit + Ringkasan + **Grafik ekuitas** + Catatan penting |
| `/rules` | Trader | Aturan trading (modal awal, batas loss/profit dinamis) |
| `/admin/trades` | Trader | CRUD trade harian (per-user) |
| `/profile` | Login | Edit profil sendiri (nama, telepon, password) |

## Komponen shadcn
UI di [`components/ui/`](components/ui/) (button, card, table, badge, input, textarea,
label, select, checkbox, separator) berbasis reka-ui, ditargetkan Tailwind v3.
Konfigurasi di [`components.json`](components.json) & [`nuxt.config.ts`](nuxt.config.ts) (modul `shadcn-nuxt`).

## Roadmap
- Hitung pips otomatis dari API harga emas.
- Grafik korelasi surprise vs pips.
- Export CSV.
