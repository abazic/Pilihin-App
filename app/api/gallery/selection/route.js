import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; 
import { isGalleryExpired } from '@/lib/gallery-expiry';

export async function POST(request) {
  try {
    const { slug, selectedPhotos } = await request.json();

    // Validasi payload dasar
    if (!slug || !Array.isArray(selectedPhotos)) {
      return NextResponse.json(
        { error: 'Data tidak lengkap atau format salah' },
        { status: 400 }
      );
    }

    // Inisialisasi Supabase client (Server-side)
    const supabase = await createClient();

    // 1. Cari gallery berdasarkan slug
    const { data: gallery, error: fetchError } = await supabase
      .from('galleries')
      .select('*')
      .eq('slug', slug)
      .single();

    if (fetchError || !gallery) {
      return NextResponse.json(
        { error: 'Galeri tidak ditemukan' },
        { status: 404 }
      );
    }

    // 2. Cek apakah galeri sudah expired (MENGGUNAKAN HELPER KONSISTEN)
    if (isGalleryExpired(gallery.expire_date)) {
      return NextResponse.json(
        { error: 'Batas waktu pemilihan untuk galeri ini sudah berakhir (Expired)' },
        { status: 403 }
      );
    }

    // 3. Cek maksimal jumlah foto (max_photos)
    if (gallery.max_photos !== null && selectedPhotos.length > gallery.max_photos) {
      return NextResponse.json(
        { error: `Maksimal pilihan adalah ${gallery.max_photos} foto. Kamu memilih ${selectedPhotos.length} foto.` },
        { status: 400 }
      );
    }

    // 4. Cek apakah foto yang dikirim memang ada di galeri
    if (gallery.photos && Array.isArray(gallery.photos)) {
      const availablePhotoNames = gallery.photos.map((p) => p.name || p); 
      
      const isAllPhotosValid = selectedPhotos.every(photo => availablePhotoNames.includes(photo));
      
      if (!isAllPhotosValid) {
        return NextResponse.json(
          { error: 'Terdapat foto yang tidak valid atau tidak terdaftar di galeri ini' },
          { status: 400 }
        );
      }
    }

    // 5. Simpan pilihan ke database
    const { error: updateError } = await supabase
      .from('galleries')
      .update({
        selected_photos: selectedPhotos
      })
      .eq('id', gallery.id);

    if (updateError) {
      console.error("Supabase Update Error:", updateError);
      return NextResponse.json(
        { error: 'Gagal menyimpan pilihan foto ke server' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Pilihan foto berhasil disimpan' 
    });

  } catch (error) {
    console.error("API Selection Error:", error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
