# Panduan Semua Pengguna - Website Extra Joss SPG v23

Panduan ini memakai bahasa sederhana. Baca bagian sesuai jabatan Anda.

## Cara masuk

1. Buka alamat website dari HP, tablet, atau laptop.
2. Masukkan email dan password.
3. Tekan **Login**.
4. Jika diminta kode verifikasi, buka aplikasi Authenticator lalu masukkan 6 angka.
5. Tekan ikon mata untuk melihat atau menyembunyikan password.
6. Tekan tombol **Gelap** atau **Terang** untuk mengganti tema.

Jika akun pernah disimpan pada perangkat yang sama, pilih akun dari daftar agar tidak perlu mengetik ulang.

## Ikon yang dipakai semua pengguna

- **Lonceng:** membuka pemberitahuan terbaru.
- **Tandai Semua Dibaca:** menandai semua pemberitahuan sudah dibaca.
- **Keluar:** keluar dari perangkat yang sedang dipakai.
- **Keluar dari Semua Perangkat:** dipakai jika akun terasa tidak aman.
- **Perbarui Data:** mengambil data terbaru dari server.

## Admin

Admin hanya mengatur akun dan sistem. Admin tidak membuka laporan operasional SPG.

### Dashboard Admin

- Lihat jumlah akun aktif, perangkat login, akun terkunci, dan cadangan terakhir.
- Lihat kondisi penyimpanan dan waktu respons server.
- Tekan **Periksa Sekarang** untuk memperbarui kondisi website.

### Manajemen Akun

1. Tekan **Buat Akun**.
2. Isi nama, email, password, peran, nomor HP, dan area.
3. Tekan **Simpan**.
4. Gunakan tombol **Kelola** pada tabel untuk edit, reset password, mengaktifkan verifikasi, menonaktifkan akun, atau memindahkan akun ke sampah.

Password yang pernah dibuat dari perangkat Admin dapat dilihat pada perangkat tersebut. Password server yang sudah diacak tidak dapat dibaca kembali.

### Pengaturan - Area dan Harga

1. Buka **Pengaturan**.
2. Pilih **Area & Harga**.
3. Isi **Harga Default per Kaleng**. Satu harga dipakai untuk semua area.
4. Untuk menambah area, isi nama area dan target area.
5. Tekan **Tambah Area**.
6. Gunakan **Edit Area** untuk mengubah nama, kota, atau target.
7. Tekan **Simpan Semua Perubahan**.

Area tidak mempunyai harga sendiri. Hanya Admin dapat mengubah harga global.

### Pengaturan lainnya

- **Tampilan & Teks:** ubah nama website, tulisan, bantuan, dan copyright.
- **Fitur & Menu:** ubah nama, urutan, atau tampilan menu.
- **Field Tambahan:** tambah kolom baru pada bagian yang tersedia.
- **Akun & Keamanan:** atur batas salah login, waktu sesi, MFA, dan lama simpan jalur.
- **Hak Akses:** lihat aturan role.
- **Perangkat & Sesi:** keluarkan satu perangkat atau semua perangkat milik akun.
- **Sampah & Pemulihan:** kembalikan akun yang sebelumnya dipindahkan ke sampah.
- **Notifikasi:** kirim pemberitahuan ke role atau area tertentu.
- **Status Website:** periksa Netlify, Supabase, dan kondisi layanan.
- **Cadangan Data:** buat, lihat, unduh, atau pulihkan cadangan.
- **Riwayat:** lihat perubahan beserta nilai sebelum dan sesudah.

## TL

TL mengelola seluruh pekerjaan operasional dan laporan.

### Dashboard TL

- Lihat hasil utama tim dan area.
- Lihat daftar yang perlu ditindaklanjuti hari ini.
- Gunakan filter periode, area, atau SPG bila tersedia.
- Area yang dipilih sebagai fokus diberi label **FOKUS** hanya pada tampilan TL.

### Cek Stock

1. Pilih periode dan area.
2. Periksa stok awal, PO tambahan, penjualan tiap minggu, stok aktual, dan status.
3. Tambah atau ubah baris bila diperlukan.
4. Export setelah data diperiksa.

### Reporting SPG

1. Pilih periode, area, dan SPG.
2. Pilih tanggal laporan.
3. Pilih lokasi toko atau grosir.
4. Kecamatan terisi dari Master Lokasi.
5. Isi status kehadiran, HK, selling, value, PO tambahan, sampling, dan catatan.
6. Pilih file nota bila ada. Tunggu sampai proses upload selesai.
7. Tekan **Simpan Reporting**.

Nilai laporan baru memakai Harga Default per Kaleng yang diatur Admin. TL tidak dapat mengubah harga tersebut.

### Setujui dan kunci laporan

1. Pastikan periode, area, dan SPG sudah benar.
2. Periksa angka harian dan nota.
3. Tekan **Setujui & Kunci**.
4. Data pada periode itu tidak dapat diubah.
5. Jika ada koreksi, tekan **Buka Kunci**, perbaiki, lalu kunci kembali.

### Export Excel Reporting

File TL berisi lima sheet:

- **Daily Report & WIP:** WIP lengkap dan laporan setiap SPG untuk seluruh tanggal pada bulan.
- **HK:** HK aktual, target, sisa HK, rencana kerja/OFF, proyeksi, gap, dan status.
- **ZONA SPG:** area, toko, target, selling, value, rasio, zona, sisa target, dan sisa karton.
- **STATISTIK:** ringkasan angka sesuai filter.
- **SAMPLING:** target, hasil, dan selisih sampling.

Tanggal tanpa laporan ditulis **BELUM ADA DATA**. Sheet COACHING dan PICA tidak dibuat.

### Export PDF Reporting

PDF memuat WIP, laporan harian, planning HK, dan Zona SPG. Semua tabel memakai garis. Pastikan filter sudah benar sebelum menekan Export PDF.

### Rekap Nota

1. Pilih tanggal, area, SPG, dan status.
2. Tekan **Lihat** untuk membuka nota.
3. Tekan **Periksa** untuk memberi status.
4. Pilih Belum Diperiksa, Sesuai, Perlu Perbaikan, atau Ditolak.
5. Tambahkan catatan lalu simpan.
6. Tekan **Export PDF** untuk membuat rekap lengkap dengan foto nota.

### Data SPG

- Tambah atau ubah data SPG.
- Periksa nama, area, status, toko, tanggal join, nomor HP, dan target.
- Hanya TL yang menambah Data SPG.

### Screening & Training

1. Buka **Screening & Training**.
2. Isi nama calon SPG, nomor telepon, area, dan status.
3. Isi jadwal interview, training, atau tanggal join bila sudah diketahui.
4. Pilih CV. Format yang diterima: PDF, JPG, PNG, WEBP, DOC, atau DOCX dengan ukuran di bawah 6 MB.
5. Tambahkan catatan singkat.
6. Tekan **Simpan Kandidat**.

Gunakan status berikut sesuai perkembangan:

- Kandidat Baru;
- Jadwal Interview;
- Sudah Interview;
- Jadwal Training;
- Sudah Training;
- Siap Join;
- Sudah Join;
- Gagal Join;
- Menghilang.

Gunakan filter status/area, pencarian, dan tombol halaman untuk menemukan kandidat. Tekan **Buka CV** untuk melihat file. CV hanya dapat dibuka TL. Tekan **Export PDF** untuk rekap; link CV pada PDF meminta login TL.

### Data Outlet

1. Buka **Data Outlet**.
2. Pilih area.
3. Pilih nama SPG.
4. Periksa nama toko, tanggal, tanda outlet, kaleng terjual, alamat, koordinat, ketepatan GPS, lokasi acuan, dan jarak.
5. Tekan **Detail** untuk melihat seluruh informasi atau **Maps** untuk membuka titik lokasi.

Tombol TL dibuat singkat:

- **Kelola SPG:** membuka profil SPG;
- **Edit:** memperbaiki data outlet;
- **Catatan:** menambahkan catatan TL;
- **Hapus:** dipakai hanya jika data salah atau ganda.

Tekan **Export Excel** atau **Export PDF**. File mengikuti tingkat yang sedang dibuka: seluruh area yang diizinkan, satu area, atau satu SPG. Excel berisi Ringkasan dan Detail Outlet. PDF memakai tabel bergaris dan tombol Maps dapat diklik.

### Master Lokasi Penempatan

1. Isi nama grosir atau toko.
2. Pilih area.
3. Isi kecamatan dan alamat.
4. Pilih titik pada peta.
5. Simpan.

Kecamatan pada Reporting akan mengikuti data lokasi ini.

### Penempatan SPG Harian

1. Pilih tanggal.
2. Pilih SPG dan toko.
3. Simpan penempatan.
4. Periksa tanda bentrok.

Dua SPG pada satu toko diperbolehkan. Bentrok berarti satu SPG mendapat lebih dari satu penempatan pada tanggal yang sama.

### Tindak Lanjut

Halaman ini menyatukan outlet bermasalah, foto kurang, data ganda, PICA terbuka, GPS tidak tersedia, dan SPG di luar lokasi tugas. Gunakan filter jenis catatan, area, dan SPG.

### Monitoring Jalan SPG

- Pilih tanggal dan area.
- Periksa posisi terakhir, jumlah titik, jarak dari toko, dan status lokasi.
- Hanya TL dapat melihat rincian jalur.

### Pengaturan TL

- **Umum & Laporan:** atur target, penanggung jawab, periode, rasio, dan format nama file. Harga hanya dapat dilihat.
- **Menu TL:** tampilkan atau urutkan menu operasional TL.
- **Pengaturan SPG:** atur bagian yang tampil dan aturan isian SPG.
- **Status Lokasi:** ubah nama status dan batas meter untuk Sesuai Lokasi, Di Sekitar Lokasi, dan Di Luar Lokasi.
- **Area & Tim:** atur jumlah SPG, biaya per HK, nama SCO/MS, dan pilih area fokus.
- **Penyimpanan:** perbarui data, kirim ke Supabase, dan unduh cadangan.
- **Riwayat:** lihat perubahan pengaturan.

### Mengirim data ke Supabase

1. Pastikan internet aktif.
2. Buka **Pengaturan - Penyimpanan**.
3. Tekan **Kirim ke Supabase Sekarang**.
4. Tunggu pesan berhasil.
5. Jika muncul pesan environment belum dipasang, hubungi Admin dan ikuti Panduan Supabase.

## SCO, MS, dan AM

Ketiga role ini hanya melihat dan export data. Semua halaman mengikuti area akun.

### Dashboard

- Pilih periode dan area tugas.
- Lihat hasil per minggu setiap SPG.
- Bandingkan minggu sebelumnya dan minggu berjalan.
- Lihat SPG yang perlu perhatian beserta alasannya.
- Pilihan periode, area, SPG, dan fokus perhatian tersimpan otomatis pada perangkat.

### Reporting SPG

- Lihat HK, W1-W5, selling, rata-rata, pencapaian, value, rasio, sampling, dan status.
- Pilih bulan awal dan akhir untuk export beberapa bulan.
- Excel hanya memuat area akun dan SPG pada area itu.
- Setiap periode mempunyai WIP, laporan seluruh tanggal, HK, dan Zona.
- PDF hanya memuat data area akun dengan garis tabel yang rapi.

### Rekap Nota

- Lihat nota dan status pemeriksaan TL sesuai area.
- Tekan **Lihat** untuk membuka file.
- Tekan **Export PDF** untuk membuat rekap dengan foto nota.
- SCO, MS, dan AM tidak dapat upload, edit, memeriksa, atau menghapus nota.

### Data SPG dan Data Outlet

- Data SPG hanya menampilkan SPG pada area akun.
- Data Outlet hanya menampilkan outlet pada area akun.
- Pada Data Outlet, pilih SPG untuk melihat nama toko, kaleng, alamat, koordinat, lokasi acuan, dan jarak.
- Gunakan nomor halaman, **Sebelumnya**, dan **Berikutnya** untuk berpindah halaman.
- Tekan **Detail** untuk melihat data lengkap atau **Maps** untuk membuka lokasi outlet.
- Tekan **Export Excel** atau **Export PDF**. File hanya memuat area akun dan mengikuti SPG yang sedang dipilih.
- SCO, MS, dan AM hanya dapat melihat dan mengekspor. Tombol Edit, Catatan, dan Hapus tidak tersedia.

## SPG

### Beranda

- Baca Notifikasi Penempatan.
- Lihat toko, tanggal, dan alamat.
- Tekan **Petunjuk Arah** untuk membuka rute.
- Lokasi wajib aktif saat menandai outlet dan selama kegiatan kerja.
- Tekan **Laporkan Kendala** untuk menghubungi TL melalui WhatsApp. Keterangan toko dan masalah akan terisi otomatis.

### Tambah Outlet

1. Aktifkan lokasi pada HP.
2. Izinkan website menggunakan lokasi.
3. Pilih titik yang benar.
4. Isi nama outlet, tanda outlet, jumlah kaleng terjual, dan data lain yang diminta.
5. Ambil foto outlet yang jelas.
6. Periksa kembali lalu simpan.

Foto diperkecil otomatis agar lebih cepat dikirim pada jaringan lemah.

### Daftar Outlet

- Lihat outlet yang pernah ditandai sendiri.
- Perbaikan hanya tersedia pada waktu yang diizinkan.
- SPG tidak dapat mengubah data SPG lain atau titik perjalanan.

### Progress Saya

1. Pilih bulan.
2. Lihat selling, HK, sampling, value, rasio, dan persentase target.
3. Lihat hasil tiap minggu.
4. Lihat sisa kaleng dan sisa karton menuju 100 persen.

Angka berasal dari Reporting yang diisi TL.

### Profil

Lihat nama, email, password yang sedang diketahui pada sesi/perangkat, area, dan jumlah outlet. Jika lupa password, hubungi Admin atau TL.

## Jika data belum muncul

1. Pastikan internet aktif.
2. Tekan **Perbarui Data** bila tombol tersedia.
3. Muat ulang halaman.
4. Periksa periode dan area.
5. Pastikan login dengan akun yang benar.
6. Jangan membuat data yang sama berulang kali.

## Bantuan

Jika ada data salah atau bermasalah, hubungi **087805435987 - Solehudin (Team Leader)** melalui WhatsApp.

Sampaikan nama dan jabatan, area, nama menu, tanggal kejadian, keterangan singkat, serta foto layar bila ada.

Jangan mengirim password, kode Authenticator, atau service-role key kepada siapa pun.
