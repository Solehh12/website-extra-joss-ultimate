# Prompt Pembuka Chat Baru - Website Extra Joss SPG v23

Gunakan bagian **Prompt siap pakai** untuk memulai percakapan baru. Lampirkan ZIP source v23 yang sesuai. Prompt ini tidak terikat pada alamat website, project ChatGPT Sites, atau percakapan tertentu.

## Prompt siap pakai

Saya ingin melanjutkan pengembangan **Website Extra Joss SPG** dari ZIP source v23 yang saya lampirkan. Jadikan ZIP tersebut sebagai satu-satunya source terbaru. Jangan membuat ulang dari nol, jangan menghapus fitur yang masih dipakai, dan jangan mencampur paket tanpa data contoh dengan paket latihan.

Website ini dipakai untuk reporting, monitoring, penempatan, nota, outlet, dan pengelolaan SPG. Gunakan bahasa Indonesia yang sederhana. Pertahankan tampilan yang rapi, ringan, responsif, serta nyaman pada HP, tablet, dan laptop.

## Nama dan jenis paket

- Nama website: **Website Extra Joss SPG**.
- Paket **Tanpa Data Contoh** dipakai untuk penggunaan nyata. Isinya hanya akun awal Admin dan struktur kosong.
- Paket **Dengan Data Contoh** dipakai untuk latihan. Data latihan tidak boleh masuk ke paket bersih.
- Paket Netlify harus dinamis. Login, akun, dan data harus dapat dipakai dari perangkat berbeda melalui fungsi server.

## Aturan pengguna

- **Admin** hanya mengelola akun, area, harga global, keamanan, perangkat dan sesi, notifikasi, sampah dan pemulihan, cadangan, tampilan, fitur, field tambahan, serta kondisi sistem. Admin tidak membuka data operasional SPG.
- **TL** mengelola pekerjaan operasional, Reporting SPG, nota, Data SPG, screening dan training, lokasi, penempatan, tindak lanjut, export, pelacakan SPG, area fokus, dan penguncian periode.
- **SCO, MS, dan AM** hanya melihat dan mengekspor data sesuai area akun. Mereka tidak dapat menambah, mengubah, menghapus, memeriksa nota, atau melihat jalur SPG.
- **SPG** menandai outlet, melihat penempatan, membuka petunjuk arah, melaporkan kendala, dan melihat progress sendiri. SPG wajib mengaktifkan lokasi. Rincian jalur hanya terlihat oleh TL.

## Fitur v23 yang wajib dipertahankan

1. Admin dapat menambah, mengubah, dan menghapus area. Area tidak mempunyai harga sendiri.
2. **Harga Default per Kaleng** hanya dapat diubah Admin. Satu harga yang sama dipakai dashboard, input laporan baru, Excel, dan PDF. TL hanya dapat melihat harga tersebut.
3. TL dapat memilih satu atau beberapa area fokus di Pengaturan. Nama area disimpan tanpa kata FOKUS. Label FOKUS hanya muncul bagi TL.
4. Pengaturan TL mempunyai bagian **Penyimpanan** dengan tombol **Kirim ke Supabase Sekarang**, **Perbarui Data**, dan **Unduh Cadangan**.
5. Export Excel TL berisi tepat lima sheet: **Daily Report & WIP**, **HK**, **ZONA SPG**, **STATISTIK**, dan **SAMPLING**. Sheet COACHING dan PICA tidak boleh dibuat.
6. Daily Report memuat setiap SPG aktif dan seluruh tanggal dalam bulan, termasuk tanggal 1 sampai tanggal terakhir. Tanggal tanpa laporan diberi keterangan **BELUM ADA DATA**, bukan hilang.
7. Sheet HK membaca HK aktual per bulan, target HK, sisa HK, seluruh tanggal, hari Minggu sebagai OFF bila belum ada laporan, rencana KERJA yang merata, proyeksi HK, gap, dan status.
8. Sheet ZONA SPG memuat area, SPG, toko, kecamatan, tanggal join, target, HK, selling, rata-rata, achievement, value, rasio, zona, sisa target, dan sisa karton secara rinci.
9. SCO, MS, dan AM dapat memilih beberapa bulan untuk export WIP. Setiap file hanya boleh berisi area akun dan SPG pada area tersebut.
10. PDF reporting berisi bagian WIP, laporan harian, planning HK, dan zona dengan garis tabel yang rapi. Jangan menambah halaman Rangkuman Otomatis.
11. PDF Rekap Nota memuat data nota dan foto nota sebagai data tambahan. Foto disusun proporsional dan tidak menutup teks. SCO, MS, dan AM hanya memperoleh nota pada area akun.
12. Menu TL **Screening & Training** memuat nama, nomor telepon, area, CV privat, jadwal interview, jadwal training, tanggal join, status, dan catatan.
13. Status kandidat: Kandidat Baru, Jadwal Interview, Sudah Interview, Jadwal Training, Sudah Training, Siap Join, Sudah Join, Gagal Join, dan Menghilang.
14. Screening mempunyai ringkasan, filter, pencarian, navigasi halaman, edit, dan Export PDF. Link CV pada PDF hanya dapat dibuka setelah login TL.
15. CV disimpan privat. Role selain TL tidak boleh membaca data kandidat atau membuka file CV.
16. Nota tetap diunggah manual oleh TL. Input nota langsung oleh SPG masih ditunda.
17. Penguncian periode bulanan diperiksa di server. Data terkunci tidak dapat diubah sampai TL membuka kunci.
18. Lonceng notifikasi tersedia untuk semua user. Admin dapat melihat perangkat login dan mengeluarkan sesi tertentu atau semua sesi.
19. Cadangan otomatis, cadangan manual, pemulihan, riwayat nilai sebelum dan sesudah, MFA Admin/TL, pembatasan login, dan retensi jalur GPS tetap dipertahankan.
20. Data Outlet memakai urutan **Area → SPG → Outlet**. Detail memuat toko, tanggal, tanda, kaleng, nilai, alamat, koordinat, ketepatan GPS, lokasi acuan, jarak, foto, catatan, dan Maps. TL dapat melihat, mengedit, memberi catatan, menghapus data salah, serta membuka profil SPG. SCO/MS/AM hanya melihat sesuai area akun.
21. Export Data Outlet tersedia dalam Excel dan PDF. Cakupan export mengikuti seluruh area akses, area yang dibuka, atau SPG yang dibuka. Excel mempunyai sheet Ringkasan dan Detail Outlet tanpa formula tersembunyi; PDF memakai tabel bergaris dan tautan Maps.
22. Tema terang dan gelap, copyright di footer, pagination Data Outlet, filter yang tersimpan, serta tampilan mobile tetap dipertahankan.

## Ketentuan Supabase dan keamanan

- `SUPABASE_SERVICE_ROLE_KEY` hanya disimpan pada Environment variables Netlify Functions. Jangan meletakkannya di JavaScript browser, `netlify.toml`, dokumen publik, screenshot, atau repository.
- Source v23 memakai `app_kv_store` sebagai data aplikasi aktif ketika Supabase terpasang. Tabel berelasi disiapkan untuk migrasi bertahap dan tidak boleh diklaim sudah dipakai seluruh modul sebelum adapter relasional selesai.
- Bucket `reporting-nota` dan `spg-cv` harus private.
- Hak akses harus diperiksa oleh server. Menyembunyikan tombol saja tidak cukup.
- Admin tidak dapat mengambil data operasional, SCO/MS/AM tidak dapat mengubah data, SPG hanya dapat mengubah outlet miliknya dalam batas waktu yang berlaku, dan hanya TL dapat membaca CV kandidat.
- Jangan menampilkan password hash atau service-role key. Password yang terlihat pada Admin/SPG hanya berasal dari password yang diketahui pada perangkat atau sesi tersebut.

## Hal yang tidak boleh ditambahkan

- Jangan menambah chatbot AI.
- Jangan menambah grafik yang menampilkan informasi sama.
- Jangan mengaktifkan PWA sebelum diminta.
- Jangan memindahkan upload nota ke SPG sebelum tahap berikutnya.
- Jangan mengembalikan sheet COACHING atau PICA pada export Reporting.
- Jangan mengembalikan tulisan Banjarmasin - FOKUS atau Palangkaraya - FOKUS sebagai nama area permanen.

## Pemeriksaan sebelum menyerahkan perubahan berikutnya

1. Periksa login dan data bersama dari dua perangkat.
2. Periksa setiap role dan batas area melalui server.
3. Periksa seluruh tanggal pada Excel, lima nama sheet, HK, Zona SPG, multi-bulan, dan tidak adanya COACHING/PICA.
4. Periksa PDF reporting dan nota, termasuk garis tabel, foto nota, dan area SCO/MS/AM.
5. Periksa harga Admin, area fokus TL, tombol Supabase, Screening & Training, CV privat, penguncian periode, cadangan, dan notifikasi.
6. Periksa Data Outlet dari Area ke SPG lalu outlet, batas area SCO/MS/AM, tombol kelola TL, pagination, serta Excel/PDF sesuai cakupan yang dipilih.
7. Periksa tampilan HP, tablet, laptop, tema terang/gelap, navigasi halaman, dan footer.
8. Periksa ZIP: tidak ada `.env`, service-role key, `node_modules`, file build lama, atau data contoh pada paket bersih.

Serahkan versi berikutnya dalam empat ZIP: source tanpa data contoh, source dengan data contoh, Netlify tanpa data contoh, dan Netlify dengan data contoh. Sertakan prompt terbaru, panduan semua pengguna, panduan Supabase lengkap, daftar test, ukuran file, dan checksum SHA-256. Jangan melakukan deployment ke website aktif tanpa izin saya.

## Ringkasan progress v13 sampai v23

- **v13:** role Admin, TL, SCO, MS, AM, dan SPG dipisahkan; menu monitoring, login tersimpan, export dasar, dan panduan dibuat.
- **v14-v15:** menu operasional TL dipulihkan, manajemen akun diperluas, dan cakupan role/area diperketat.
- **v16-v18:** server dinamis lintas perangkat, perangkat dan sesi, MFA, notifikasi, sampah dan pemulihan, audit perubahan, cadangan, retensi GPS, dan Tindak Lanjut dibuat.
- **v19:** export multi-bulan per area, WIP detail, PDF bergaris, pengaturan status lokasi, Data Outlet maps, dan Progress Saya SPG dibuat.
- **v20:** pagination Data Outlet, tema terang/gelap, tampilan HP, menu, login, dan footer dirapikan.
- **v21:** upload nota manual TL, Rekap Nota, kecamatan dari Master Lokasi, tampilan password lokal yang aman, dan schema Supabase relasional disiapkan.
- **v22:** Supabase dapat menjadi penyimpanan utama server, penguncian periode, pemeriksaan nota, backup harian, pusat notifikasi, kesehatan sistem, perbandingan mingguan, dan tampilan responsif diperkuat.
- **v23:** harga global dikunci hanya untuk Admin, area fokus TL dibuat dinamis, tombol kirim Supabase tersedia pada TL, export Reporting dibuat ulang menjadi lima sheet lengkap, seluruh tanggal ditampilkan, HK dan Zona diperdalam, PDF nota menyertakan foto, Screening & Training dengan CV privat ditambahkan, serta Data Outlet dibuat bertingkat dengan export Excel/PDF rinci.

## Fitur yang sengaja ditunda

- Input nota langsung oleh SPG.
- Website dipasang sebagai aplikasi/PWA.
- Migrasi penuh seluruh modul dari `app_kv_store` ke tabel relasional.
- Penggantian autentikasi penuh ke Supabase Auth, jika nanti dipilih.
