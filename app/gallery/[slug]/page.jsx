import GalleryClient from './GalleryClient';
import { supabase } from '@/lib/supabase';

export async function generateStaticParams() {
  // 1. Ambil semua slug galeri yang sudah ada di Supabase
  const { data: galleries } = await supabase.from('galleries').select('slug');

  if (galleries && galleries.length > 0) {
    return galleries.map((item) => ({
      slug: item.slug,
    }));
  }

  // 2. Jika database masih kosong, kembalikan 1 slug dummy agar Next.js tidak error
  return [{ slug: 'demo' }];
}

export default function Page() {
  return <GalleryClient />;
}
