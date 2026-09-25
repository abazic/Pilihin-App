# Pilihin App

Aplikasi Next.js untuk admin mengelola client/project/foto dan client memilih foto secara persistent di Supabase.

## Stack
Next.js 16, React 19, Supabase Auth/Postgres/RLS, Google Drive API, WhatsApp wa.me.

## Local setup
1. Install Node.js LTS.
2. `git clone https://github.com/abazic/Pilihin-App.git && cd Pilihin-App && npm install`.
3. Buat project Supabase.
4. Copy `.env.example` ke `.env.local` dan isi variabelnya.
5. Jalankan `supabase/migrations/202609250001_pilihin_core.sql` di Supabase SQL Editor.
6. Pastikan Google Drive API key dapat membaca folder foto.
7. Buat user admin di Supabase Dashboard > Authentication > Users. Lalu, memakai SQL Editor, set role secara eksplisit: `update public.profiles set role='admin', client_id=null where id='USER_UUID';`. Jangan ubah role dari browser.
8. Jalankan `npm run dev`, buka `http://localhost:3000`.

## Admin
Login -> buat client -> buat project + folder Drive -> Sync Foto. Ringkasan, notes, nomor WhatsApp, project, dan foto tersimpan di database.

## Client
Register/login -> dashboard -> project -> pilih/batalkan foto -> Simpan Pilihan. Data pilihan berada di `photo_selections`, bukan localStorage. Tombol WhatsApp memakai nomor client dari database dan `encodeURIComponent`.

## Production
Set env yang sama di Vercel/platform Next.js. Tambahkan production URL pada Supabase Authentication > URL Configuration, termasuk redirect `/reset-password`.

## Checks
`npm run lint` dan `npm run build`. Repository tidak memiliki script test pada `package.json` saat audit.

## Security
Middleware melindungi route, tetapi authorization utama dilakukan server-side dan RLS. Client hanya dapat membaca/mengubah selection miliknya dan tidak dapat membaca client/project/photo milik client lain. Password sepenuhnya dikelola Supabase Auth; tidak ada kolom password di profiles.
