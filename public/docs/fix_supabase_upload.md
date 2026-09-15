# Fix Upload Supabase

Versi ini tidak lagi bergantung pada library Supabase dari CDN.
Sync database memakai REST API langsung, jadi error berikut sudah diperbaiki:

```text
Library Supabase belum termuat. Cek koneksi internet CDN.
```

## Cara pakai

1. Jalankan Apache XAMPP.
2. Buka website melalui localhost, contoh:

```text
http://localhost/WEB_MAPS_SPG/
```

3. Masuk sebagai TL/Admin.
4. Menu Pengaturan.
5. Isi Supabase URL seperti:

```text
https://nama-project.supabase.co
```

Jangan tambahkan `/rest/v1/`.

6. Isi Supabase Anon Key dengan salah satu:

```text
sb_publishable_...
```

atau legacy anon public key:

```text
eyJ...
```

7. Klik Simpan Pengaturan.
8. Klik Upload ke Supabase.
9. Cek data di Supabase > Table Editor.

## Catatan

Jangan gunakan secret key / service_role di frontend.
