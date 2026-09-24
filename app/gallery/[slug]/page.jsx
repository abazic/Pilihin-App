import GalleryClient from './GalleryClient';
import { supabase } from '@/lib/supabase';

export async function generateStaticParams() {
  return [{ slug: 'demo' }];
}

export default function Page() {
  return <GalleryClient />;
}
