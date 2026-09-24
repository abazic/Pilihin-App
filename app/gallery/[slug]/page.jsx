import GalleryClient from './GalleryClient';

export async function () {
  return [{ slug: 'demo' }];
}

export default function Page() {
  return <GalleryClient />;
}
