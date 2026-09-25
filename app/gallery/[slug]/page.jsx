// app/gallery/[slug]/page.jsx
import { createClient } from '@/lib/supabase/server'
import GalleryClient from './GalleryClient'
import { notFound } from 'next/navigation'
import { getPhotosFromGDrive } from '@/lib/gdrive' 

export default async function GalleryPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient()

  // Ambil data klien dari Supabase
  const { data: client, error } = await supabase
    .from('galleries') // Pastikan nama tabel benar (clients atau galleries)
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !client) {
    notFound()
  }

  // 🔴 CEK MASA BERLAKU GALERI (Sudah disesuaikan ke expire_date)
  const now = new Date()
 const expirationDate = client.expire_date ? new Date(client.expire_date) : null;
if (expirationDate && now > expirationDate){
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Galeri Telah Berakhir</h1>
          <p className="text-gray-600 text-sm mb-6">
            Masa aktif galeri foto untuk <strong>{client.client_name}</strong> telah habis. Silakan hubungi admin untuk memperpanjang masa akses.
          </p>
          <a
            href={`https://wa.me/${client.admin_whatsapp || '6281234567890'}`} // Disinkronkan dengan skema admin_whatsapp
            className="inline-flex items-center justify-center px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Hubungi Admin
          </a>
        </div>
      </div>
    )
  }

  // Panggil GDrive API di Server-Side
  const photos = await getPhotosFromGDrive(client.folder_id);

  // Oper data ke Client Component menggunakan props bernama 'galleryData' agar konsisten
  return <GalleryClient galleryData={client} initialPhotos={photos} />
}
