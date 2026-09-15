# Panduan Supabase dan Netlify - WEB MAPS SPG V2

## 1. Supabase

1. Buka Supabase.
2. Buat project bernama `WEB MAPS SPG`.
3. Masuk ke SQL Editor.
4. Copy semua isi file `supabase/schema.sql`.
5. Paste ke SQL Editor.
6. Klik Run.

Tabel utama:

- `web_maps_spg_users`
- `web_maps_spg_areas`
- `web_maps_spg_outlets`
- `web_maps_spg_settings`

Jika kamu sudah pernah membuat database versi lama, tetap jalankan ulang `schema.sql` versi terbaru. File ini akan menambahkan field baru seperti `tanda`, `sold`, `phone`, `photo`, `marked_by`, `marked_by_id`, dan `marked_at`.

## 2. Ambil koneksi Supabase

Ambil 2 data berikut:

- Project URL: contoh `https://xxxxx.supabase.co`
- Anon public key / publishable key

Jangan gunakan `service_role` atau `secret key` untuk website frontend.

## 3. Isi di website

Login sebagai Admin/TL, masuk menu Pengaturan, lalu isi:

- Supabase URL
- Supabase Anon Key

Klik Simpan Pengaturan, lalu coba Upload ke Supabase.

## 4. Netlify

Untuk hosting, upload folder website ke Netlify secara manual atau melalui GitHub. Website ini statis, jadi tidak perlu `npm install`.

Setelah online di Netlify, login lagi dan isi Supabase URL serta key yang sama. Data tetap tersimpan di Supabase.
