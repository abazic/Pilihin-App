import { createClient } from '@/lib/supabase/server'
import GalleryClient from './GalleryClient'
import ThemeToggle from '@/components/ThemeToggle'
import { notFound } from 'next/navigation'
import { getPhotosFromGDrive } from '@/lib/gdrive'
import { isGalleryExpired } from '@/lib/gallery-expiry'
import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants'

// Wrapper tombol mengambang, dipakai di semua kondisi halaman
function FloatingThemeToggle() {
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-md">
      <ThemeToggle />
    </div>
  )
}

export default async function GalleryPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient()

  // 1. Ambil data klien dari Supabase
  const { data: client, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !client) {
    notFound()
  }

  // 2. Ambil nomor WhatsApp Admin dari tabel settings (atau fallback ke default)
  const { data: settingData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'whatsapp_number')
    .single()

  const adminWhatsApp = client.admin_whatsapp
    || settingData?.value
    || DEFAULT_WHATSAPP_NUMBER;

  // 3. Cek masa berlaku galeri
  if (isGalleryExpired(client.expire_date)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0f0f0f] p-4 text-center">
        <div className="max-w-md bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Akses Galeri Telah Berakhir</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Masa aktif galeri foto untuk <strong className="text-gray-900 dark:text-gray-200">{client.client_name}</strong> telah habis. Silakan hubungi admin untuk memperpanjang masa akses.
          </p>
          <a
            href={`https://wa.me/${adminWhatsApp}`}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-black dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-white transition-colors"
          >
            Hubungi Admin
          </a>
        </div>
        <FloatingThemeToggle />
      </div>
    )
  }

  // 4. Panggil GDrive API di Server-Side
  const photos = await getPhotosFromGDrive(client.folder_id);

  // 5. Ambil pilihan foto yang sudah ada (jika klien pernah simpan sebelumnya)
  const { data: existingSelection } = await supabase
    .from('photo_selections')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  // Oper data ke Client Component
  return (
    <>
      <GalleryClient galleryData={{ ...client, admin_whatsapp: adminWhatsApp }} initialPhotos={photos} />
      <FloatingThemeToggle />
    </>
  )
}
