# Pilihin Fotomu — Project Blueprint

> Dokumen acuan untuk AI coding agent dan developer.  
> Tujuan: mengembangkan **Pilihin Fotomu** dari aplikasi client photo-selection menjadi platform website dan pengelolaan bisnis vendor fotografi, tanpa merusak fitur galeri yang sudah berjalan.

---

## 1. Visi Produk

**Pilihin Fotomu** adalah platform untuk vendor fotografi yang menggabungkan:

1. **Vendor Website** — situs publik untuk memperkenalkan brand, layanan, portofolio, dan informasi kontak.
2. **Client Gallery** — galeri privat agar klien dapat melihat, memilih, dan memberi catatan pada foto.
3. **Business Dashboard** — panel admin untuk mengelola konten website, paket harga, klien, galeri, dan inquiry.

Prioritas utama: **website vendor yang profesional + client gallery yang stabil + dashboard admin yang mudah dikelola.**

## 2. Prinsip Pengembangan

- **Preserve existing features:** jangan menghapus atau mengubah perilaku galeri, autentikasi, Google Drive, notifikasi, dan selection workflow tanpa alasan serta migrasi yang jelas.
- **Incremental delivery:** implementasikan per fase; jangan melakukan rewrite besar sekaligus.
- **Single-vendor first:** arsitektur saat ini ditujukan untuk satu vendor/brand. Jangan membangun multi-tenant sebelum dibutuhkan.
- **Public/private boundary:** halaman publik hanya menampilkan data yang memang dipublikasikan; dashboard dan galeri privat wajib dilindungi.
- **Database as source of truth:** data bisnis dan konfigurasi disimpan di Supabase; Google Drive digunakan untuk penyimpanan/akses file foto sesuai integrasi saat ini.
- **Responsive by default:** desain mobile-first dan nyaman digunakan di desktop.
- **Minimalist UI:** visual bersih, tipografi jelas, whitespace cukup, navigasi sederhana, tanpa dekorasi berlebihan.
- **Type-safe and maintainable:** gunakan TypeScript untuk kode baru dan hindari duplikasi logic.
- **No speculative features:** jangan membuat fitur di luar scope tanpa menjelaskan manfaat, dampak, dan kebutuhan datanya.

## 3. Kondisi Arsitektur Saat Ini

Stack yang diketahui:

- Next.js (App Router)
- TypeScript / JavaScript
- Supabase Auth dan database
- `@supabase/ssr` dan `@supabase/supabase-js`
- Google Drive integration
- Vercel deployment

Area kode yang telah teridentifikasi:

```text
app/
├── admin/page.tsx
├── gallery/[slug]/
│   ├── page.jsx
│   └── GalleryClient.jsx
├── api/
│   ├── gallery/selection/route.js
│   └── drive/image/route.js
├── login/page.tsx
├── auth/callback/...
└── page.tsx                 # saat ini mengarahkan ke /admin

lib/
├── constants.ts
├── gallery-expiry.js
├── gdrive.js
└── supabase/
    ├── client.ts
    └── server.ts
```

Dashboard admin saat ini sudah menjadi area utama pengelolaan galeri. Struktur ini adalah **baseline**, bukan alasan untuk langsung mengganti seluruh implementasi.

> Sebelum perubahan besar, AI agent harus memeriksa repository aktual, dependencies, schema Supabase, middleware/proxy, dan seluruh alur fitur yang terkait. Jangan menganggap daftar di dokumen ini sebagai inventaris lengkap.

## 4. Target Arsitektur

### 4.1 Target route structure

```text
app/
├── (public)/
│   ├── page.tsx                 # Homepage vendor
│   ├── portfolio/page.tsx
│   ├── portfolio/[slug]/page.tsx
│   ├── pricelist/page.tsx
│   ├── services/page.tsx
│   ├── about/page.tsx
│   └── contact/page.tsx
│
├── (auth)/
│   ├── login/page.tsx
│   └── ...                      # alur auth existing
│
├── gallery/[slug]/
│   ├── page.tsx
│   └── GalleryClient.tsx        # client gallery existing
│
├── admin/
│   ├── layout.tsx
│   ├── page.tsx                 # dashboard overview
│   ├── portfolio/
│   ├── pricelist/
│   ├── inquiries/
│   ├── clients/
│   ├── bookings/                # fase lanjutan
│   ├── galleries/                # jika pemisahan dari dashboard diperlukan
│   └── settings/
│
└── api/
    ├── gallery/selection/route.ts
    ├── drive/image/route.ts
    └── ...                      # API existing dan baru

components/
├── ui/                           # komponen UI reusable
├── layout/                        # navbar, footer, sidebar
├── public/                        # komponen situs publik
├── gallery/                       # komponen client gallery
└── admin/                          # komponen dashboard

lib/
├── supabase/
├── services/                       # business logic/data access
├── validations/                    # schema validasi
├── utils/
└── constants/

types/
└── ...                            # shared types jika diperlukan
```

**Catatan arsitektur:**
- Route groups `(public)` dan `(auth)` tidak mengubah URL.
- `/` menjadi homepage vendor; jangan lagi redirect otomatis ke `/admin`.
- `/admin` tetap menjadi dashboard dan harus membutuhkan autentikasi.
- Jangan memindahkan file existing secara massal jika tidak memberi manfaat langsung.
- Route/API existing boleh tetap memakai `.js/.jsx` sementara; gunakan `.ts/.tsx` untuk kode baru dan migrasikan bertahap.

### 4.2 Batas tanggung jawab

| Area | Tanggung jawab |
|---|---|
| Public website | Menampilkan profil vendor, layanan, portfolio, pricelist, dan kontak |
| Client gallery | Akses galeri privat, preview foto, seleksi, catatan, batas pilihan, expiry |
| Admin | Mengelola konten publik, paket harga, galeri, dan inquiry |
| API / server services | Validasi, otorisasi, operasi database, integrasi Google Drive |
| Supabase | Auth, data bisnis, metadata, status, dan konfigurasi |
| Google Drive | Penyimpanan foto dan integrasi file sesuai implementasi existing |

## 5. Fitur Produk

### 5.1 Public Website — fase utama

- Homepage: hero, ringkasan layanan, portfolio pilihan, CTA kontak/booking.
- Portfolio: grid foto, kategori, detail project.
- Pricelist: paket, detail deliverables, add-on, syarat, CTA inquiry.
- Services: penjelasan layanan fotografi.
- About: profil vendor, pendekatan kerja, dan value.
- Contact: WhatsApp, form inquiry, dan social links.
- SEO dasar: metadata, Open Graph, sitemap, robots, struktur heading yang baik.
- Responsive layout dan optimasi gambar.

### 5.2 Client Gallery — fitur existing yang harus dipertahankan

- Galeri dengan slug privat.
- Preview foto.
- Pemilihan foto oleh klien.
- Batas maksimal foto pilihan.
- Catatan/feedback jika sudah tersedia.
- Event date dan expiry.
- Integrasi Google Drive.
- Notifikasi dan realtime jika sudah berjalan.
- Admin dapat membuat dan mengelola galeri.

**Jangan mengubah flow selection atau format data galeri tanpa audit kompatibilitas.**

### 5.3 Admin Dashboard — pengembangan

- Overview: ringkasan galeri aktif, inquiry baru, dan aktivitas.
- Portfolio CMS: tambah/edit/hapus project dan kategori.
- Pricelist CMS: tambah/edit/hapus paket dan add-on.
- Inquiry management: lihat, ubah status, dan catat tindak lanjut.
- Gallery management: pertahankan fungsi existing.
- Vendor settings: brand name, logo, deskripsi, kontak, social media, dan informasi publik.
- Pengelolaan konten sebaiknya menggunakan form dengan validasi dan feedback yang jelas.

### 5.4 Fitur lanjutan — bukan scope awal

- Booking calendar dan availability.
- CRM klien.
- Invoice dan payment tracking.
- Digital photo delivery.
- Testimonial management.
- Promo/voucher dan referral.
- Statistik website/gallery.
- Multi-tenant/vendor website builder.

Tambahkan hanya setelah kebutuhan dan alur dasarnya tervalidasi.

## 6. Data Model — Usulan

**Audit schema Supabase terlebih dahulu.** Reuse tabel/kolom existing jika sesuai; jangan membuat duplikasi.

Entitas yang mungkin diperlukan:

| Entitas | Tujuan |
|---|---|
| `vendor_profile` | Informasi brand dan kontak vendor |
| `portfolio_projects` | Project/album portfolio publik |
| `portfolio_categories` | Kategori portfolio |
| `pricelist_packages` | Paket layanan dan harga |
| `package_addons` | Add-on paket |
| `inquiries` | Permintaan informasi/booking dari pengunjung |
| `testimonials` | Testimoni yang disetujui untuk publik |

Aturan data:
- Gunakan primary key yang konsisten dan foreign key untuk relasi.
- Tambahkan `created_at` dan `updated_at` jika relevan.
- Gunakan `slug` unik untuk halaman publik.
- Simpan status publikasi (`draft`/`published`) untuk konten yang dikelola admin.
- Harga dan durasi harus memiliki format/tipe data yang konsisten.
- Jangan menyimpan secret, token, atau kredensial Google Drive di tabel yang dapat diakses publik.

## 7. Keamanan dan Akses

- Admin routes dan admin mutations harus memverifikasi sesi serta role/otorisasi di server.
- Jangan mengandalkan proteksi UI/client-side saja.
- Public queries hanya mengambil data dengan status `published`.
- Terapkan Supabase RLS sesuai kebutuhan akses.
- API route harus memvalidasi input dan memeriksa otorisasi.
- Jangan expose service-role key, access token, atau credential di browser.
- Slug galeri bukan pengganti kontrol keamanan; pertahankan mekanisme privasi yang sudah ada dan evaluasi risikonya.
- Hindari menampilkan informasi klien atau galeri privat pada halaman publik.

## 8. UI/UX Direction

- Gaya: modern, editorial, minimalis, photography-first.
- Foto menjadi fokus utama; UI tidak boleh bersaing dengan visual.
- Warna netral dengan satu accent color brand.
- Tipografi maksimal 2 keluarga font.
- Gunakan spacing, radius, dan ukuran heading yang konsisten.
- CTA jelas: **Lihat Portfolio**, **Lihat Pricelist**, **Hubungi via WhatsApp**.
- Public navbar sederhana; admin memakai sidebar/topbar terpisah.
- Sediakan loading, empty, error, success, dan confirmation states.
- Jangan menambahkan animasi berat atau efek dekoratif tanpa alasan UX.

## 9. Roadmap Implementasi

### Phase 0 — Audit dan baseline
- Audit repository, route, komponen, dependencies, schema Supabase, RLS, dan integrasi Drive.
- Petakan fitur existing dan risiko regresi.
- Catat keputusan arsitektur dan migration plan.
- Pastikan build/typecheck/test baseline.

### Phase 1 — Public website
- [x] Ubah `/` menjadi homepage vendor.
- Bangun layout publik: navbar, footer, container, typography.
- [x] Implementasikan Portfolio: kategori, kartu portfolio di homepage, dan halaman detail kategori.
- [ ] Implementasikan Pricelist.
- Tambahkan About, Services, Contact sesuai kebutuhan.
- Pastikan halaman publik mengambil data yang aman.

### Phase 2 — Admin CMS
- [x] Tambahkan pengelolaan kategori portfolio (tambah, edit, hapus, dan urutkan kategori berbasis folder Google Drive).
- [ ] Tambahkan CRUD project portfolio secara terpisah.
- Tambahkan CRUD pricelist dan add-on.
- Tambahkan vendor settings.
- Hubungkan konten admin ke halaman publik.
- Terapkan validasi, authorization, dan RLS.

### Phase 3 — Inquiry workflow
- Form inquiry/contact.
- Penyimpanan inquiry di Supabase.
- Admin dapat melihat dan mengubah status inquiry.
- Integrasi WhatsApp sebagai CTA/notification jika sesuai.

### Phase 4 — Business management
- Booking, CRM, invoice/payment tracking, dan delivery.
- Prioritaskan berdasarkan kebutuhan nyata, bukan asumsi.

## 10. Instruksi untuk AI Coding Agent

AI agent bertindak sebagai **software engineer yang mengimplementasikan task secara bertahap**, bukan melakukan rewrite tanpa kontrol.

### Workflow wajib

1. Baca dokumen ini dan instruksi repository (`README`, `AGENTS.md`, atau sejenis).
2. Periksa file dan implementasi aktual sebelum membuat asumsi.
3. Identifikasi scope task, dependency, dan risiko terhadap fitur existing.
4. Buat rencana singkat dan daftar file yang akan diubah.
5. Implementasikan perubahan terkecil yang menyelesaikan task.
6. Jalankan pemeriksaan yang tersedia: lint, typecheck, test, dan build.
7. Perbaiki error yang disebabkan perubahan.
8. Laporkan hasil: perubahan, file terkait, test yang dijalankan, hasil, dan pekerjaan tersisa.

### Aturan coding

- Jangan menghapus fitur existing tanpa persetujuan eksplisit.
- Jangan melakukan refactor luas di luar scope.
- Jangan mengubah schema database tanpa migration yang jelas.
- Jangan mengedit `.env` atau menampilkan secret.
- Jangan mengarang nama tabel, kolom, API, atau dependency; verifikasi terlebih dahulu.
- Gunakan komponen reusable jika benar-benar mengurangi duplikasi.
- Pisahkan UI, data access, dan business logic bila kompleksitas membutuhkannya.
- Server Components menjadi default; gunakan Client Components hanya ketika membutuhkan state, event, atau browser API.
- Hindari `any` jika tipe yang tepat dapat dibuat.
- Jangan menambahkan dependency baru jika solusi native sudah memadai.
- Pertahankan konsistensi style dan konvensi repository.
- Jangan menyatakan task selesai jika build/test belum dijalankan atau ada error yang belum dijelaskan.

### Format laporan akhir agent

```text
## Ringkasan
- ...

## Perubahan
- ...

## File
- `path/to/file`: ...

## Validasi
- lint: ...
- typecheck: ...
- test/build: ...

## Catatan / Risiko
- ...

## Next step
- ...
```

## 11. Definition of Done

Task dianggap selesai jika:

- Implementasi sesuai scope dan acceptance criteria.
- Fitur existing yang relevan tetap berfungsi.
- Tidak ada error baru pada pemeriksaan yang dijalankan.
- Akses publik/admin sesuai batas keamanan.
- UI responsive dan memiliki state penting.
- Perubahan database disertai migration dan penjelasan.
- Dokumentasi/konfigurasi diperbarui jika diperlukan.
- Agent melaporkan validasi secara jujur.

---

## 12. Task Pertama yang Direkomendasikan

**Audit repository dan susun implementation plan untuk Phase 1.**

Output audit:
1. Struktur route dan komponen aktual.
2. Fitur existing yang harus dipertahankan.
3. Schema Supabase dan policy yang relevan.
4. Rekomendasi route/layout target.
5. Daftar perubahan Phase 1 yang paling kecil dan aman.
6. Risiko, dependency, dan urutan implementasi.

Jangan langsung mengimplementasikan semua fase dalam satu task.
