import { createClient } from '@/lib/supabase/server';
import { getPhotosFromGDrive } from '@/lib/gdrive';
import AppHeader from '@/components/AppHeader';
import PortfolioGallery from '@/components/PortfolioGallery';
import { notFound } from 'next/navigation';

function parseCategories(value) {
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function PortfolioCategoryPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: setting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'portfolio_categories')
    .maybeSingle();

  const categories = parseCategories(setting?.value);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  const photos = await getPhotosFromGDrive(category.folderId);
  const shuffledPhotos = [...photos].sort(() => Math.random() - 0.5);

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1c1c1c] dark:bg-[#11110f] dark:text-[#f5f3ee]">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="mb-12 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Portfolio / Selected Works</p>
          <h1 className="mt-4 text-4xl font-medium md:text-6xl">{category.title}</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-500 dark:text-neutral-400">
            A collection of moments and stories captured through our lens.
          </p>
          <div className="mt-7">
            <a href="/pricelist" className="inline-flex items-center rounded-full bg-[#1c1c1c] px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-[#f5f3ee] dark:text-[#1c1c1c] dark:hover:bg-white">
              Lihat Pricelist
            </a>
          </div>
        </div>

        {shuffledPhotos.length > 0 ? (
          <PortfolioGallery photos={shuffledPhotos.map((photo) => ({
            id: photo.id,
            url: photo.url,
            name: photo.name,
          }))} />
        ) : (
          <p className="border-y border-black/10 py-16 text-center text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
            Belum ada foto di folder portofolio ini.
          </p>
        )}
      </section>
    </main>
  );
}
