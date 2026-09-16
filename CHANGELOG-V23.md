# CHANGELOG V23 — Vercel + Supabase

- Migrasi platform produksi dari Netlify Functions/Blobs menjadi Vercel Functions + Supabase.
- Supabase menjadi satu-satunya storage produksi untuk data aplikasi.
- Upload nota dan CV kandidat menggunakan Supabase Storage privat.
- Full dataset produksi tidak lagi disalin ke localStorage browser.
- Health check menyediakan status koneksi Supabase yang jelas.
- Backup otomatis dipindahkan ke Vercel Cron + Supabase.
- Region Function diarahkan ke Singapore (`sin1`) untuk mendekatkan compute ke project Supabase yang digunakan.
