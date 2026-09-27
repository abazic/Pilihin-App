// app/api/gallery/selection/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isGalleryExpired } from '@/lib/gallery-expiry';

export async function POST(request) {
  try {
    const { slug, gallery_id, selectedPhotos, is_locked, sent_via_wa } = await request.json();

    // Validasi payload dasar
    if (!slug || !Array.isArray(selectedPhotos)) {
      return NextResponse.json(
        { error: 'Data tidak lengkap atau format salah' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Ambil data gallery untuk validasi
    const { data: gallery, error: fetchError } = await supabase
      .from('galleries')
      .select('id, expire_date, max_photos')
      .eq('slug', slug)
      .single();

    if (fetchError || !gallery) {
      return NextResponse.json({ error: 'Galeri tidak ditemukan' }, { status: 404 });
    }

    // 2. Cek expired
    if (isGalleryExpired(gallery.expire_date)) {
      return NextResponse.json(
        { error: 'Batas waktu pemilihan untuk galeri ini sudah berakhir' },
        { status: 403 }
      );
    }

    // 3. Cek max_photos
    if (gallery.max_photos !== null && selectedPhotos.length > gallery.max_photos) {
      return NextResponse.json(
        { error: `Maksimal pilihan adalah ${gallery.max_photos} foto. Kamu memilih ${selectedPhotos.length} foto.` },
        { status: 400 }
      );
    }

    // 4. Cek apakah sudah terkunci — tolak perubahan apapun kalau is_locked = true di DB
    const { data: existingRow } = await supabase
      .from('photo_selections')
      .select('id, is_locked')
      .eq('slug', slug)
      .maybeSingle();

    if (existingRow?.is_locked === true) {
      return NextResponse.json(
        { error: 'Pilihan sudah dikunci dan tidak bisa diubah' },
        { status: 403 }
      );
    }

    // 5. Susun payload upsert
    const payload = {
      gallery_id: gallery.id,          // pakai id dari DB, bukan dari client (lebih aman)
      slug,
      selected_photos: selectedPhotos, // [{name, url}] — full object dari GalleryClient
      updated_at: new Date().toISOString(),
      ...(is_locked  === true && { is_locked: true }),
      ...(sent_via_wa === true && { sent_via_wa: true, sent_at: new Date().toISOString() }),
    };

    // 6. Upsert ke photo_selections (insert pertama kali, update berikutnya)
    const { error: upsertError } = await supabase
      .from('photo_selections')
      .upsert(payload, {
        onConflict: 'slug',           // unique index di slug
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error('Supabase Upsert Error:', upsertError);
      return NextResponse.json(
        { error: 'Gagal menyimpan pilihan foto ke server' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: is_locked ? 'Pilihan berhasil dikunci' : 'Pilihan foto berhasil disimpan',
    });

  } catch (error) {
    console.error('API Selection Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
