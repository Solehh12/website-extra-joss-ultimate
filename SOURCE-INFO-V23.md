# Informasi Source v23

Nama aplikasi: **Website Extra Joss SPG**  
Versi: **23.0.0**  
Tanggal finalisasi: **2 September 2026**

## Bagian utama

- `public/netlify/`: tampilan responsif untuk seluruh role.
- `netlify/functions/extra-joss-api.mjs`: login, data bersama, role, area, nota, CV, kunci periode, sinkronisasi, sesi, notifikasi, cadangan, dan status sistem.
- `netlify/functions/_shared/storage-adapter.mjs`: Supabase/Netlify Blobs serta ruang nota dan CV privat.
- `netlify/functions/_shared/core.mjs`: aturan role, area, harga global, fokus area, kandidat, dan keamanan.
- `netlify/functions/extra-joss-daily-backup.mjs`: cadangan otomatis.
- `supabase/schema.sql`: data aktif `app_kv_store`, tabel berelasi, RLS, bucket nota, dan bucket CV.
- `tests/`: pengujian role, area, perangkat, export, nota, CV, Supabase, kunci periode, dan tampilan.
- Data Outlet menggunakan tampilan Area → SPG → Outlet dan dapat diekspor ke Excel/PDF sesuai cakupan yang sedang dibuka.

## Paket bersih dan latihan

- Paket tanpa data contoh berisi akun awal Admin dan pengaturan dasar. Tidak berisi SPG, laporan, outlet, nota, CV, kandidat, jalur, atau aktivitas contoh.
- Paket dengan data contoh hanya untuk latihan dan memakai namespace penyimpanan berbeda.
- Jangan memakai paket latihan untuk produksi.

## Penyimpanan dinamis

- Supabase aktif bila `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` tersedia pada Environment variables Netlify Functions.
- Tanpa kedua nilai tersebut, aplikasi memakai Netlify Blobs.
- Browser tidak pernah menerima service-role key.
- Data aktif disimpan pada `app_kv_store`; tabel relasional disiapkan untuk migrasi bertahap.
- Nota dan CV tidak dimasukkan sebagai data base64 ke JSON operasional.

## Deployment

Gunakan ZIP Netlify v23 sebagai project lengkap. Folder `public`, `netlify/functions`, dan `netlify.toml` harus berada pada root paket. Website aktif tidak berubah hanya karena ZIP dibuat; deployment dilakukan terpisah setelah izin pengguna.
