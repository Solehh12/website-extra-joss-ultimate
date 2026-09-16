# Website Extra Joss SPG — Vercel + Supabase

Paket ini adalah versi Vercel-only untuk website Extra Joss SPG.

## Sebelum deploy
1. Jalankan `supabase/schema.sql` pada Supabase project.
2. Jalankan `supabase/import_current_backup.sql` satu kali untuk memasukkan snapshot data yang tersedia di backup recovered.
3. Buat environment variables di Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `CRON_SECRET` (disarankan; buat string acak minimal 16 karakter)

## Deploy dari GitHub (tanpa ZIP ke Vercel)
- Buat repository GitHub baru, misalnya `website-extra-joss-vercel`.
- Upload **isi** paket ini ke root repository, bukan file ZIP dan bukan folder pembungkus `vercel_final`.
- Di Vercel pilih Add New → Project → import repository tersebut.
- Framework Preset: Other.
- Build Command: `npm run build`.
- Output Directory: `public`.
- Node.js 22+.
- Tambahkan Environment Variables untuk Production.
- Deploy.

## Cek
Buka `https://NAMA-PROYEK.vercel.app/api/extra-joss-api?action=health`.
Normalnya:
`{"ok":true,"storage":"supabase","supabaseConfigured":true}`

## Backup
`/api/daily-backup` dipanggil Vercel Cron sekali sehari. Data backup disimpan kembali ke Supabase.

## Catatan skala
Backend sudah memindahkan storage dari Netlify ke Supabase dan tidak menyalin dataset penuh ke localStorage. Namun model data lama masih berupa satu JSONB document (`app_kv_store`). Untuk benar-benar menargetkan ratusan ribu record operasional, koleksi besar perlu dinormalisasi ke tabel Postgres terpisah dan ditulis secara incremental/paginated. Infrastruktur Supabase dapat menangani skala yang lebih besar pada plan yang sesuai, tetapi source ini tidak mengklaim optimasi 100k+ record tanpa refactor tersebut.
