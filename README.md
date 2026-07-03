Tips Agar Database Tidak Mati / Di-pause
Jika website Anda memang sepi pengunjung tetapi Anda ingin datanya tetap aktif tanpa perlu repot mengecek dashboard Supabase, ada beberapa solusi:

Gunakan Layanan Berbayar (Pro Plan): Kebijakan otomatis pause karena tidak aktif hanya berlaku untuk Free Plan. Jika Anda berlangganan Pro Plan ($25/bulan), database Anda akan tetap menyala selamanya meskipun tidak dibuka berbulan-bulan.

Gunakan Trik Cron Job / Ping Otomatis: Jika ingin tetap gratis, Anda bisa memanfaatkan layanan eksternal seperti GitHub Actions atau Vercel Cron Jobs untuk mengirimkan query sederhana (seperti SELECT 1;) ke database Anda sekali sehari atau seminggu sekali. Hal ini akan membuat sistem Supabase membaca bahwa database Anda tetap "aktif".

# Riwayat NFP vs Emas

Pencatatan riwayat rilis **Non-Farm Payrolls (NFP)** dan dampaknya terhadap harga **emas (XAU/USD)**. Publik melihat riwayat; satu akun admin mengelola data.

**Stack:** Nuxt 3 · TailwindCSS · **shadcn-nuxt** (reka-ui) · Supabase (Postgres + Auth) · Docker.

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
2. SQL Editor → jalankan [`supabase/schema.sql`](supabase/schema.sql) (tabel, RLS, trigger, seed).
3. Authentication → Providers → Email → matikan "Allow new users to sign up".
4. Authentication → Users → **Add user** (1 akun admin).
5. Project Settings → API → salin `Project URL` + `anon public key`.

## 2. Konfigurasi env
```bash
cp .env.example .env   # isi SUPABASE_URL dan SUPABASE_KEY
```

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
| `/` | Publik | Riwayat sesi (kartu) + filter + statistik |
| `/login` | Publik | Login admin |
| `/admin` | Admin | Tabel sesi + hapus |
| `/admin/new` | Admin | Tambah sesi + berita |
| `/admin/:id` | Admin | Edit sesi |

## Komponen shadcn
UI di [`components/ui/`](components/ui/) (button, card, table, badge, input, textarea,
label, select, checkbox, separator) berbasis reka-ui, ditargetkan Tailwind v3.
Konfigurasi di [`components.json`](components.json) & [`nuxt.config.ts`](nuxt.config.ts) (modul `shadcn-nuxt`).

## Roadmap
- Hitung pips otomatis dari API harga emas.
- Grafik korelasi surprise vs pips.
- Export CSV.
