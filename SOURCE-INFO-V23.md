# Source info — Vercel + Supabase

- `public/`: frontend website untuk seluruh role.
- `api/extra-joss-api.mjs`: API utama Vercel.
- `api/daily-backup.mjs`: backup otomatis melalui Vercel Cron.
- `server/functions/_shared/core.mjs`: aturan role, area, keamanan, session, dan business logic.
- `server/functions/_shared/storage-adapter.mjs`: akses Supabase Postgres dan Supabase Storage server-side.
- `supabase/schema.sql`: schema database dan bucket Storage.
- `supabase/import_current_backup.sql`: import awal dari backup recovered yang kita periksa.

## Storage
Supabase adalah satu-satunya storage produksi pada paket ini. Tidak ada fallback ke Netlify Blobs.

Environment Variables Vercel:
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `CRON_SECRET` (opsional tetapi disarankan untuk mengamankan endpoint backup)

## Data awal
`supabase/import_current_backup.sql` memasukkan snapshot backup recovered ke key `shared-data-v22-clean` bila key tersebut belum ada. Script menggunakan `ON CONFLICT DO NOTHING` sehingga tidak menimpa data yang sudah ada.

## Browser storage
Frontend tidak menyimpan salinan penuh dataset produksi ke localStorage. Session/token tetap lokal, sedangkan data operasional diambil dan disimpan melalui API server.
