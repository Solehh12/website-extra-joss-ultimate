# Memasang Website Extra Joss SPG v22 di Netlify

Gunakan ZIP **Netlify Dinamis**, bukan folder `public` saja. Paket lengkap menyertakan tampilan, fungsi server, dan penyimpanan bersama sehingga akun dapat dipakai dari HP, tablet, dan laptop berbeda.

## Cara memasang

1. Pilih paket tanpa data dummy untuk website utama atau paket dengan data dummy untuk latihan.
2. Ekstrak ZIP.
3. Masukkan seluruh isi folder hasil ekstrak ke satu repository Git.
4. Di Netlify, pilih **Import from Git** dan hubungkan repository tersebut.
5. Jalankan deploy. Netlify membaca `netlify.toml` dan memasang dependency fungsi server.
6. Setelah selesai, buka `/.netlify/functions/extra-joss-api?action=health` pada domain website.
7. Pastikan hasil memuat `"dynamic": true` dan versi `22.0.0`.
8. Buat akun melalui laptop, lalu coba login akun yang sama melalui HP pada domain yang sama.

## Isi yang wajib ada

- `public/`
- `netlify/functions/`
- `netlify.toml`
- `package.json`

Tanpa konfigurasi tambahan, data dinamis memakai Netlify Blobs. Jika Supabase
dihubungkan, data utama beralih ke Supabase dan nota masuk ke bucket privat
`reporting-nota`. Jangan menghapus fungsi `extra-joss-api`,
`extra-joss-daily-backup`, atau dependency `@netlify/blobs`.

## Mengaktifkan Supabase

1. Buat project Supabase.
2. Jalankan `supabase/schema.sql` melalui SQL Editor.
3. Di Netlify buka **Project configuration → Environment variables**.
4. Tambahkan `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` dengan scope Functions.
5. Tandai service-role key sebagai rahasia. Jangan menaruh nilainya di source atau browser.
6. Deploy ulang website.
7. Login Admin → Dashboard → Periksa Sekarang. Penyimpanan harus tampil **Supabase**.

Saat Supabase pertama kali diaktifkan, v22 menyalin data lama Netlify ke ruang
penyimpanan v22. Admin juga memiliki tombol pemindahan ulang yang selalu meminta
konfirmasi dan membuat cadangan dahulu.

Jangan memakai drag-and-drop folder `public` untuk versi dinamis. Cara tersebut hanya mengunggah tampilan dan tidak menyertakan fungsi login/data bersama.

## Paket tanpa dan dengan data dummy

Paket bersih dan demo memakai kunci penyimpanan server yang berbeda. Data latihan tidak bercampur dengan data utama. Akun awal paket bersih:

- Email: `admin@webmapsspg.local`
- Password: `admin123`

Segera ubah password Admin setelah login pertama.

## Bila deploy gagal

- Pastikan project memakai Node.js 22 atau lebih baru.
- Pastikan folder `netlify/functions` tidak hilang.
- Pastikan dependency `@netlify/blobs` tercantum pada `package.json`.
- Nonaktifkan plugin Next.js Runtime lama bila masih dipasang melalui pengaturan Netlify.
- Jalankan ulang deploy dengan cache dibersihkan.

## Cadangan otomatis

Fungsi `extra-joss-daily-backup` dijadwalkan `@daily`. Setelah website production
dipublikasikan, buka halaman Functions di Netlify dan pastikan fungsi tersebut
memiliki tanda Scheduled. Admin tetap dapat membuat cadangan manual melalui
Pengaturan → Cadangan Data.

## Fitur yang belum diaktifkan

PWA atau pemasangan seperti aplikasi sengaja ditunda untuk tahap berikutnya. Website tetap dapat dibuka secara responsif melalui browser pada perangkat apa pun.
