# Panduan Supabase Lengkap - Website Extra Joss SPG v23

Panduan ini menjelaskan pemasangan database produksi dengan langkah yang aman dan sederhana. Website tetap dibuka dari Netlify. Supabase menyimpan data dan file privat melalui Netlify Functions.

## Hasil akhir yang diharapkan

Setelah selesai:

- akun dan data dapat dipakai dari HP, tablet, dan laptop;
- data utama aplikasi disimpan pada tabel `app_kv_store`;
- nota disimpan pada bucket private `reporting-nota`;
- CV kandidat disimpan pada bucket private `spg-cv`;
- service-role key hanya diketahui server;
- TL dapat menekan **Kirim ke Supabase Sekarang**;
- Admin dapat melihat status Supabase dari Dashboard atau Pengaturan;
- tabel berelasi siap dipakai untuk migrasi bertahap berikutnya.

## Pahami dua lapisan data v23

### Lapisan yang sudah dipakai website

- `app_kv_store` menyimpan keadaan aplikasi yang dibaca dan ditulis Netlify Function.
- `reporting-nota` menyimpan file nota secara privat.
- `spg-cv` menyimpan CV kandidat secara privat.
- Login dan hak akses tetap diperiksa oleh Netlify Function.

### Lapisan relasional yang disiapkan

File `supabase/schema.sql` juga membuat tabel role, pengguna, area, outlet, laporan, nota, kandidat, penempatan, stok, sampling, jalur, audit, dan export. Tabel ini sudah mempunyai hubungan dan contoh RLS. Namun, seluruh menu website belum menulis langsung ke semua tabel tersebut.

Jangan menghapus `app_kv_store` sampai adapter relasional selesai, diuji, dan dipindahkan bertahap.

## Sebelum mulai

Siapkan:

- satu project Supabase khusus produksi;
- satu project Netlify;
- ZIP **Netlify Tanpa Data Contoh** v23;
- akses pemilik atau Admin pada Supabase dan Netlify;
- email Admin awal;
- cadangan website terbaru;
- waktu uji sekitar 30-60 menit tanpa perubahan data dari pengguna lain.

Gunakan project uji coba lebih dahulu bila ini pertama kali memasang Supabase.

## Informasi yang tidak boleh dibagikan

- `SUPABASE_SECRET_KEY`;
- password akun pengguna;
- kode Authenticator;
- file `.env`;
- isi cadangan produksi;
- link CV atau nota yang sudah ditandatangani sementara.

Service-role key dapat melewati RLS. Karena itu, key hanya boleh berada di Environment variables Netlify Functions.

## 1. Buat project Supabase

1. Masuk ke Supabase.
2. Tekan **New project**.
3. Pilih organisasi yang benar.
4. Isi nama project, misalnya `website-extra-joss-spg-production`.
5. Buat password database yang kuat dan simpan di password manager.
6. Pilih lokasi server yang paling dekat dengan mayoritas pengguna.
7. Tunggu sampai project aktif.

Jangan memakai project latihan untuk data nyata.

## 2. Jalankan source SQL

1. Ekstrak ZIP source v23.
2. Buka file `supabase/schema.sql` dengan editor teks.
3. Di Supabase, buka **SQL Editor**.
4. Buat query baru.
5. Salin seluruh isi file SQL.
6. Tekan **Run** satu kali.
7. Tunggu sampai selesai tanpa error.

Jika pernah menjalankan schema versi lama pada project yang sama, buat cadangan lebih dahulu. Beberapa perintah `create table` dirancang untuk instalasi awal dan dapat menolak bila tabel sudah ada. Gunakan project baru untuk instalasi paling aman.

## 3. Periksa tabel penting

Di **Table Editor**, pastikan tabel berikut ada:

- `app_kv_store`;
- `roles`;
- `users`;
- `projects`;
- `areas`;
- `organization_assignments`;
- `outlets`;
- `daily_reports`;
- `nota_records`;
- `spg_candidates`;
- `attendance_records`;
- `stock_validation_periods`;
- `stock_validation_rows`;
- `sampling_records`;
- `route_sessions`;
- `route_points`;
- `audit_logs`.

Tabel lain pada schema mendukung pengembangan lanjutan.

## 4. Periksa ruang file privat

1. Buka **Storage**.
2. Pastikan bucket `reporting-nota` tersedia.
3. Pastikan bucket `spg-cv` tersedia.
4. Pastikan keduanya bertanda private, bukan public.
5. Periksa batas nota 2 MB.
6. Periksa batas CV 6 MB.

Format nota: JPG, PNG, WEBP, atau PDF.

Format CV: PDF, JPG, PNG, WEBP, DOC, atau DOCX.

## 5. Ambil Project URL dan service-role key

1. Buka pengaturan API project Supabase.
2. Salin **Project URL**.
3. Cari bagian server key.
4. Salin **service_role key**.
5. Simpan sementara di password manager.

Jangan memakai anon key sebagai pengganti service-role key pada fungsi server. Jangan pula menaruh service-role key di browser.

## 6. Pasang environment pada Netlify

1. Buka project Netlify.
2. Buka **Project configuration**.
3. Buka **Environment variables**.
4. Tambahkan `SUPABASE_URL` dan isi dengan Project URL.
5. Tambahkan `SUPABASE_SECRET_KEY` dan isi dengan service-role key.
6. Bila Netlify meminta scope, pilih scope yang mencakup Functions dan produksi.
7. Tandai nilai rahasia sebagai sensitive/secret bila pilihan tersedia.
8. Simpan.

Jangan menaruh dua nilai tersebut pada `netlify.toml`, `data.js`, JavaScript browser, atau file yang ikut di-ZIP.

## 7. Deploy paket Netlify dinamis

1. Gunakan ZIP **Netlify Tanpa Data Contoh** untuk produksi.
2. Upload melalui Netlify Deploys atau hubungkan repository yang benar.
3. Pastikan folder `netlify/functions` ikut terdeploy.
4. Tunggu sampai status deploy berhasil.
5. Buka domain HTTPS Netlify.

Paket Dengan Data Contoh hanya untuk latihan dan tidak boleh dipakai sebagai produksi.

## 8. Periksa fungsi server

1. Di Netlify, buka **Functions**.
2. Pastikan `extra-joss-api` tersedia.
3. Pastikan fungsi backup harian tersedia.
4. Buka log fungsi bila website memberi pesan error.
5. Jangan menyalin isi environment rahasia ke log atau screenshot.

## 9. Login awal dan periksa status

1. Buka website dari laptop.
2. Login sebagai Admin.
3. Buka Dashboard Admin atau **Pengaturan - Status Website**.
4. Tekan **Periksa Sekarang**.
5. Pastikan penyimpanan tertulis **Supabase**.
6. Pastikan status koneksi baik.
7. Buat cadangan manual.

Jika masih tertulis Netlify Blobs atau belum terhubung, periksa nama environment, isi nilai, scope, lalu deploy ulang.

## 10. Kirim data dari TL

1. Login sebagai TL.
2. Buka **Pengaturan**.
3. Pilih **Penyimpanan**.
4. Tekan **Perbarui Data** lebih dahulu.
5. Tekan **Kirim ke Supabase Sekarang**.
6. Tunggu pesan berhasil.
7. Catat waktu sinkronisasi.
8. Buka Admin dan periksa status kembali.

Tombol ini membuat cadangan sebelum sinkronisasi. Bila environment belum ada, website memberi pesan yang jelas dan data lokal tidak dihapus.

## 11. Pindahkan data Netlify lama

Gunakan langkah ini hanya bila sebelumnya website sudah menyimpan data pada Netlify Blobs.

1. Hentikan sementara perubahan data.
2. Login Admin.
3. Buat dan unduh cadangan JSON.
4. Buka **Pengaturan - Status Website**.
5. Tekan **Pindahkan Ulang Data Netlify Lama** bila tombol tersedia.
6. Baca konfirmasi.
7. Ketik kata konfirmasi yang diminta.
8. Tunggu sampai selesai.
9. Periksa jumlah akun, laporan, outlet, nota, penempatan, dan kandidat.
10. Uji login dari HP.

Jangan menghapus data Netlify lama sebelum hasil Supabase diperiksa dan cadangan aman.

## 12. Uji lintas perangkat

Lakukan lima pemeriksaan berikut.

1. Buat satu akun uji dari Admin pada laptop.
2. Login akun tersebut dari HP dengan domain yang sama.
3. Buat satu data kecil sesuai role.
4. Muat ulang laptop dan pastikan data muncul.
5. Ubah data dari laptop, lalu perbarui HP dan pastikan perubahan muncul.

Lanjutkan dengan uji TL, SCO, dan SPG:

- TL dapat melihat seluruh area yang diizinkan;
- SCO/MS/AM hanya melihat area akun;
- SPG hanya melihat data miliknya;
- jalur SPG hanya terlihat TL;
- CV kandidat hanya dapat dibuka TL;
- nota hanya dapat dibuka TL/SCO/MS/AM sesuai area;
- Admin tidak membuka data operasional.

## 13. Uji nota

1. Login TL.
2. Buat Reporting SPG pada satu area uji.
3. Upload satu nota gambar.
4. Simpan laporan.
5. Buka Rekap Nota dan lihat file.
6. Beri status pemeriksaan.
7. Login SCO area yang sama dan pastikan nota terlihat tanpa tombol edit.
8. Login SCO area lain dan pastikan nota tidak terlihat.
9. Export PDF dan pastikan foto nota masuk secara rapi.

## 14. Uji Screening dan CV

1. Login TL.
2. Buka **Screening & Training**.
3. Tambah kandidat uji.
4. Upload satu CV kecil.
5. Simpan.
6. Buka CV.
7. Export PDF dan coba link CV setelah login TL.
8. Login SCO dan pastikan menu serta CV tidak dapat dibuka.

## Hubungan tabel inti

Bagian ini diringkas dalam tabel pada dokumen Word.

## Cara membaca hubungan data

- `auth.users` ke `users`: satu login Supabase mempunyai satu profil aplikasi.
- `roles` ke `users`: satu role dapat dipakai banyak pengguna.
- `projects` ke `areas`: satu project mempunyai banyak area.
- `users`, `projects`, dan `areas` ke `organization_assignments`: menentukan area tugas pengguna.
- `areas` ke `outlets`: setiap outlet berada pada satu area.
- `users`, `areas`, dan `outlets` ke `daily_reports`: satu laporan menghubungkan SPG, area, toko, dan tanggal.
- `daily_reports` ke `nota_records`: satu laporan mempunyai paling banyak satu nota.
- `projects`, `areas`, dan `users` ke `spg_candidates`: satu kandidat dicatat TL pada satu area.
- `spg_candidates` ke `spg-cv`: metadata berada di database, file asli berada di ruang privat.
- `route_sessions` ke `route_points`: satu sesi perjalanan mempunyai banyak titik.
- `app_kv_store` ke Netlify Function: keadaan aplikasi aktif dibaca dan ditulis server.

## Data Outlet pada v23

Menu Data Outlet membaca data outlet yang dibuat SPG, lalu menampilkannya dalam urutan Area → SPG → Outlet. Informasi titik, alamat, jumlah kaleng, waktu penandaan, foto, dan catatan tetap berada pada data outlet aktif. Lokasi acuan dan jarak ditentukan dari penempatan SPG pada tanggal tersebut; bila tidak tersedia, website memakai lokasi penempatan terdekat pada area yang sama.

Pada tahap v23, data aktif lintas perangkat tetap disimpan melalui `app_kv_store`. Tabel relasional `outlets`, `areas`, `users`, dan tabel penempatan sudah disiapkan untuk migrasi berikutnya. Jangan memindahkan satu menu saja ke tabel relasional tanpa adapter dan uji konsistensi, karena data pada layar, Excel, PDF, cadangan, dan audit harus tetap sama.

Uji setelah pemasangan Supabase:

1. TL membuka Data Outlet, memilih area, lalu memilih SPG.
2. Pastikan detail outlet, koordinat, lokasi acuan, jarak, dan Maps tampil.
3. Export Excel; pastikan sheet **Ringkasan** dan **Detail Outlet** dapat dibuka tanpa pesan perbaikan file.
4. Export PDF; pastikan tabel bergaris dan tautan Maps dapat diklik.
5. Login SCO/MS/AM; pastikan hanya area akun yang terlihat dan tombol Edit, Catatan, serta Hapus tidak tersedia.

## Hak akses sederhana

- **Admin:** mengelola sistem melalui fungsi server. Pada rancangan relasional, Admin mempunyai cakupan luas, tetapi tampilan aplikasi tetap membatasi Admin dari data operasional.
- **TL:** mengelola laporan, nota, kandidat, penempatan, dan data operasional sesuai kewenangan.
- **SCO/MS/AM:** membaca laporan dan nota sesuai area.
- **SPG:** membaca data miliknya dan mencatat outlet melalui fungsi yang dibatasi.

RLS adalah lapisan tambahan. Aplikasi v23 tetap memeriksa role dan area pada Netlify Function karena data aktif memakai `app_kv_store`.

## Cadangan dan pemulihan

### Cadangan otomatis

- Fungsi terjadwal membuat cadangan setiap hari.
- Sistem membuat cadangan sebelum perubahan penting.
- Simpan maksimal mengikuti pengaturan aplikasi.

### Cadangan manual

1. Login Admin.
2. Buka **Pengaturan - Cadangan Data**.
3. Tekan **Buat Cadangan Sekarang**.
4. Tekan **Unduh Cadangan JSON** untuk menyimpan salinan di tempat aman.

### Pemulihan

1. Pastikan file cadangan berasal dari website ini.
2. Buat cadangan baru sebelum memulihkan.
3. Pilih file atau cadangan server.
4. Baca konfirmasi.
5. Pulihkan.
6. Periksa akun dan data.
7. Uji login dari perangkat kedua.

## Mengganti service-role key

1. Pilih waktu saat website tidak banyak dipakai.
2. Buat cadangan.
3. Buat/putar key dari Supabase sesuai kebijakan organisasi.
4. Ganti `SUPABASE_SECRET_KEY` di Netlify.
5. Deploy ulang.
6. Periksa status.
7. Uji login, simpan data, nota, dan CV.
8. Cabut key lama setelah key baru terbukti bekerja.

## Perawatan bulanan

- Periksa cadangan terbaru.
- Periksa akun dan sesi yang tidak dikenal.
- Periksa akun terkunci.
- Periksa nota yang menunggu.
- Periksa ukuran Storage.
- Periksa log error Netlify Functions.
- Periksa jumlah data dan kecepatan respons.
- Periksa jalur GPS yang melewati batas 60/90 hari.
- Uji pemulihan pada project uji, bukan langsung di produksi.

## Masalah umum

### Status masih Netlify Blobs

- Periksa nama `SUPABASE_URL`.
- Periksa nama `SUPABASE_SECRET_KEY`.
- Pastikan tidak ada spasi tambahan.
- Pastikan scope mencakup Functions.
- Deploy ulang.

### Login hanya bekerja pada satu perangkat

- Pastikan memakai paket Netlify dinamis, bukan file HTML statis.
- Pastikan `extra-joss-api` terdeploy.
- Pastikan kedua perangkat memakai domain HTTPS yang sama.
- Periksa log fungsi login.
- Hapus cache lama lalu login kembali bila versi website berubah besar.

### Tombol Kirim ke Supabase gagal

- Pastikan login sebagai Admin atau TL.
- Periksa internet.
- Periksa status Supabase.
- Periksa environment Netlify.
- Buka log `extra-joss-api`.
- Jangan menekan berulang kali sebelum pesan pertama selesai.

### Nota tidak terbuka

- Pastikan role TL/SCO/MS/AM.
- Pastikan area akun sama dengan area nota.
- Pastikan bucket `reporting-nota` private dan tersedia.
- Periksa metadata `receiptId` pada laporan.

### CV tidak terbuka

- Pastikan login TL.
- Pastikan kandidat masih mempunyai `cvId`.
- Pastikan bucket `spg-cv` private.
- Periksa ukuran dan format file.

### Error saat menjalankan SQL

- Baca nama baris dan tabel pada pesan error.
- Jangan menjalankan ulang seluruh schema berulang kali pada project produksi.
- Gunakan project uji baru untuk memastikan source SQL benar.
- Jika tabel lama sudah ada, lakukan migrasi terarah oleh orang yang memahami PostgreSQL.
- Jangan menghapus tabel produksi hanya untuk menghilangkan pesan error.

### Data berbeda antarperangkat

- Tekan **Perbarui Data**.
- Pastikan semua perangkat online.
- Periksa revision conflict pada pesan website.
- Jangan menyimpan perubahan lama setelah data berubah pada perangkat lain.

## Pemeriksaan sebelum produksi

1. SQL selesai tanpa error.
2. `app_kv_store` tersedia dan RLS aktif.
3. `reporting-nota` private.
4. `spg-cv` private.
5. Environment Netlify terpasang.
6. Fungsi API dan backup terdeploy.
7. Admin dapat melihat status Supabase.
8. TL dapat mengirim ke Supabase.
9. Login dua perangkat berhasil.
10. Batas role dan area berhasil.
11. Nota dan CV privat berhasil.
12. Backup dan pemulihan diuji.
13. Tidak ada `.env` atau key rahasia di ZIP.
14. Paket produksi tidak berisi data contoh.

## Referensi resmi

- [Dokumentasi API keys Supabase](https://supabase.com/docs/guides/api/api-keys)
- [Dokumentasi Row Level Security Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Dokumentasi bucket Storage Supabase](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Dokumentasi environment variables Netlify Functions](https://docs.netlify.com/build/functions/environment-variables/)
- [Dokumentasi scheduled functions Netlify](https://docs.netlify.com/build/functions/scheduled-functions/)

## Source SQL lengkap

Source lengkap berada di `supabase/schema.sql` dan juga disertakan sebagai lampiran pada dokumen Word. Gunakan file dari ZIP sebagai sumber utama agar seluruh tanda baca tetap persis.
