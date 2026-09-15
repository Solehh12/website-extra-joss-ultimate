# Perubahan v23 - Reporting, Supabase, dan Screening SPG

Tanggal: 2 September 2026

## Admin dan harga

- Admin dapat menambah, mengubah, dan menghapus area tanpa harga per area.
- Harga Default per Kaleng menjadi satu angka global yang hanya dapat diubah Admin.
- Harga global dipakai dashboard, input laporan baru, Excel, dan PDF.
- TL tidak mempunyai input harga kedua.

## Area fokus dan Supabase TL

- Nama area lama dengan akhiran FOKUS dibersihkan otomatis.
- TL dapat memilih area fokus dari Pengaturan Area & Tim.
- Label FOKUS hanya terlihat oleh TL.
- Pengaturan TL mempunyai tombol Kirim ke Supabase Sekarang.
- Sinkronisasi membuat cadangan dan memberi pesan bila environment belum dipasang.

## Export Reporting

- Workbook TL dibangun ulang menjadi lima sheet: Daily Report & WIP, HK, ZONA SPG, STATISTIK, dan SAMPLING.
- Sheet COACHING dan PICA tidak dibuat.
- Seluruh tanggal pada bulan ditampilkan untuk setiap SPG aktif.
- Tanggal tanpa laporan diberi status BELUM ADA DATA.
- Sheet HK memuat HK aktual, target, sisa, seluruh tanggal, OFF Minggu, rencana merata, proyeksi, gap, dan status.
- ZONA SPG memuat rincian area, toko, kecamatan, join, target, HK, selling, value, rasio, zona, dan sisa karton.
- SCO/MS/AM dapat mengekspor beberapa bulan dengan batas area server.
- PDF reporting memuat WIP, harian, HK, dan zona dengan garis tabel.

## Nota

- PDF Rekap Nota dirapikan dalam format landscape.
- Foto nota dimasukkan sebagai kolom data tambahan dan disesuaikan proporsinya.
- Hak akses nota SCO/MS/AM tetap mengikuti area akun.

## Screening dan Training

- Menu baru khusus TL untuk kandidat SPG.
- Form nama, telepon, area, status, jadwal interview, training, join, CV, dan catatan.
- Status lengkap dari Kandidat Baru sampai Sudah Join, Gagal Join, atau Menghilang.
- Ringkasan, filter, pencarian, pagination, edit, CV privat, dan Export PDF.
- Link CV hanya dapat dibuka setelah login TL.
- Bucket Supabase private `spg-cv` dan tabel berelasi `spg_candidates` ditambahkan.

## Data Outlet

- Data Outlet dibuka bertingkat dari Area, SPG, lalu outlet yang ditandai.
- Detail memuat toko, waktu, tanda, kaleng, nilai, alamat, koordinat, ketepatan GPS, lokasi acuan, jarak, foto, catatan, dan Maps.
- TL mendapat tombol Detail, Kelola SPG, Edit, Catatan, dan Hapus; SCO/MS/AM tetap hanya melihat sesuai area akun.
- Export Excel mempunyai sheet Ringkasan dan Detail Outlet, tanpa formula tersembunyi, serta tautan Maps.
- Export PDF memakai tabel A3 landscape bergaris dan mengikuti cakupan tampilan.

## Dokumentasi dan validasi

- Prompt pembuka v23 diperbarui tanpa ikatan URL.
- Panduan semua pengguna diperbarui.
- Panduan Supabase lengkap menjelaskan data aktif, tabel relasional, storage private, Netlify, backup, dan troubleshooting.
- Pengujian otomatis, alur lintas perangkat, role/area, nota, CV, kunci periode, dan export diperbarui.
