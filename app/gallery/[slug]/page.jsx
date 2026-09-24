import GalleryClient from './GalleryClient';

// Fungsi ini memberi tahu Next.js untuk membuat dynamic route saat build
export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <GalleryClient />;
}
