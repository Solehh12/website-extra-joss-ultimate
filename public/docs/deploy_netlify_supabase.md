# Panduan Deploy WEB MAPS SPG

## 1. Jalankan schema Supabase
Buka Supabase > SQL Editor > paste isi `supabase/schema.sql` > Run.

Tabel inti:
- web_maps_spg_users
- web_maps_spg_areas
- web_maps_spg_outlets
- web_maps_spg_routes
- web_maps_spg_settings

## 2. Ambil koneksi Supabase
- Supabase URL: `https://xxxx.supabase.co`
- Supabase Anon/Public/Publishable Key: key public, bukan secret/service_role.

## 3. Deploy ke Netlify
- Login Netlify.
- Pilih Add new site / Deploy manually.
- Drag folder `WEB_MAPS_SPG_DEPLOY_READY`.
- Buka link HTTPS dari Netlify.

## 4. Koneksi website ke Supabase
Login admin awal:
- Email: `admin@webmapsspg.local`
- Password: `admin123`

Masuk Pengaturan, isi Supabase URL dan key, klik Simpan Pengaturan, lalu Upload ke Supabase.

## 5. Buat akun SPG
Masuk menu Data SPG > tambah SPG. Setelah itu SPG login dan mulai menandai outlet.

## Catatan GPS
Rekam jalur GPS berjalan paling aman di HTTPS/Netlify atau `http://localhost`. Jangan buka via `file:///...` untuk uji GPS dan maps.
