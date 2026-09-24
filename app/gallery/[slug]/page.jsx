import GalleryClient from './GalleryClient';

export async function generateStaticParams() {
  return [{ slug: 'demo' }];
}

export default function Page() {
  return <GalleryClient />;
}
