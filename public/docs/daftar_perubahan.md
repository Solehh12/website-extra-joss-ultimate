# Daftar Perubahan V2 - Outlet Marking

## Fitur SPG

1. Menu SPG diganti menjadi:
   - Beranda
   - Tambah Outlet
   - Daftar Outlet
   - Profil
2. SPG dapat klik maps atau gunakan lokasi perangkat.
3. Field outlet:
   - Nama outlet wajib
   - Tanda outlet wajib
   - Area wajib
   - Terjual/Kaleng wajib
   - No telp outlet/konsumen opsional
   - Foto outlet tersedia
   - Catatan tersedia
4. Outlet otomatis tercatat atas nama SPG login.
5. SPG hanya melihat outlet yang dia tandai.
6. Jalur outlet SPG tampil sebagai garis warna di maps.

## Fitur Admin/TL

1. Data Outlet menampilkan semua outlet yang ditandai SPG.
2. Maps Admin melihat semua titik outlet dan jalur tiap SPG.
3. Filter data per area, SPG, dan tanda outlet.
4. Export Excel sesuai filter.
5. Export PDF sesuai filter.
6. Dashboard menghitung total outlet, kaleng terjual, outlet hari ini, dan ranking SPG.

## Fitur yang dihapus/disederhanakan

- Input selling SPG
- Upload nota SPG
- Input sampling SPG
- Absen SPG
- Laporan harian SPG
- Prioritas outlet
- Pilih SPG manual saat SPG menambah outlet

## Database

Schema Supabase diperbarui dengan field baru pada tabel `web_maps_spg_outlets`:

- tanda
- sold
- phone
- photo
- marked_by
- marked_by_id
- marked_at
