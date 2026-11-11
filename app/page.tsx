import { createClient } from '@/lib/supabase/server';
import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants';
import AppHeader from '@/components/AppHeader';
import Link from 'next/link';
import { getPhotosFromGDrive } from '@/lib/gdrive';
import HeroSlideshow from '@/components/HeroSlideshow';
import PortfolioImage from '@/components/PortfolioImage';
export default async function HomePage() {
  const supabase = await createClient();

const { data } = await supabase
  .from('settings')
  .select('value')
  .eq('key', 'whatsapp_number')
  .maybeSingle();

const whatsappNumber = (
  data?.value || DEFAULT_WHATSAPP_NUMBER
).replace(/\D/g, '');

const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const whatsappMessage = encodeURIComponent(
  'Halo Pilihin Fotomu, saya ingin bertanya tentang layanan fotografi.'
);

const whatsappContactUrl = `${whatsappUrl}?text=${whatsappMessage}`;

  const { data: portfolioSetting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'portfolio_categories')
    .maybeSingle();

  let portfolioCategories = [];
  try {
    const parsed = typeof portfolioSetting?.value === 'string'
      ? JSON.parse(portfolioSetting.value)
      : portfolioSetting?.value;
    portfolioCategories = Array.isArray(parsed) ? parsed : [];
  } catch {
    portfolioCategories = [];
  }

  const portfolioCategoriesWithPhotos = await Promise.all(
    portfolioCategories.map(async (category) => ({
      ...category,
      photos: await getPhotosFromGDrive(category.folderId),
    }))
  );

  const portfolioHeroPhotos = portfolioCategoriesWithPhotos
    .flatMap((category) => category.photos)
    .filter((photo) => photo.url);

  // Shuffle once per server render so the opening hero image is random.
  for (let i = portfolioHeroPhotos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [portfolioHeroPhotos[i], portfolioHeroPhotos[j]] = [portfolioHeroPhotos[j], portfolioHeroPhotos[i]];
  }

  const heroPhotos = portfolioHeroPhotos.length > 0
    ? portfolioHeroPhotos.map((photo) => photo.url)
    : ['https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85'];
  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1c1c1c] transition-colors duration-300 dark:bg-[#11110f] dark:text-stone-100">
      <AppHeader
        navigation={
          <>
            <a className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400" href="#portfolio">Portfolio</a>
            <Link className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400" href="/pricelist">Pricelist</Link>
            <a className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400" href="#services">Services</a>
            <a className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400" href="#contact">Contact</a>
          </>
        }
        actions={
          <a href="/admin" className="rounded-full bg-black px-5 py-2 text-sm text-white transition hover:bg-neutral-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Dashboard</a>
        }
      />

      <section className="relative isolate mx-auto max-w-7xl overflow-hidden px-6 py-16 md:min-h-[720px] md:py-24">
        <div className="absolute inset-y-0 right-0 w-full md:w-[72%]">
          <div className="absolute inset-0">
            <HeroSlideshow images={heroPhotos} interval={12000} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#faf9f6] via-[#faf9f6]/75 to-transparent dark:from-[#11110f] dark:via-[#11110f]/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f6] via-transparent to-[#faf9f6]/25 dark:from-[#11110f] dark:via-transparent dark:to-[#11110f]/20" />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#faf9f6] to-transparent dark:from-[#11110f]" />
        </div>

        <div className="relative z-10 flex min-h-[520px] items-center md:min-h-[570px]">
          <div className="max-w-2xl md:w-[62%]">
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-amber-800 dark:text-amber-400">
              Photography & Visual Storytelling
            </p>

            <h1 className="text-5xl font-medium leading-[1.1] tracking-tight md:text-7xl">
              Every moment deserves to be{" "}
              <span className="text-neutral-400 dark:text-neutral-500">remembered.</span>
            </h1>

            <p className="mt-8 max-w-md text-base leading-7 text-neutral-600 dark:text-neutral-300">
              Mengabadikan momen berharga menjadi cerita visual
              yang dapat kamu kenang selamanya.
            </p>

            <a
              href="#portfolio"
              className="mt-8 inline-block rounded-full bg-black px-7 py-4 text-sm text-white transition hover:bg-neutral-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
            >
              Explore Portfolio ↗
            </a>
          </div>
        </div>
        <p className="absolute bottom-6 right-8 z-10 text-right text-xs tracking-widest text-neutral-500 dark:text-neutral-300">
          MOMENTS · STORIES · MEMORIES
        </p>
      </section>

      
<section id="portfolio" className="border-t border-black/10 dark:border-white/10 px-6 py-24">
  <div className="mx-auto max-w-7xl">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
          Selected Works
        </p>
        <h2 className="mt-4 text-4xl font-medium md:text-6xl">
          Stories worth keeping.
        </h2>
      </div>

      <p className="max-w-xs text-sm leading-6 text-neutral-500">
        A collection of moments, emotions, and stories captured through our lens.
      </p>
    </div>

    {portfolioCategoriesWithPhotos.length > 0 ? (
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {portfolioCategoriesWithPhotos.map((category, index) => {
          const cover = category.photos[0];
          return (
            <Link key={category.slug} href={`/portfolio/${category.slug}`} className="group block overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#1b1b18]">
              <div className="relative overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                {cover ? (
                  <PortfolioImage src={cover.url} alt={category.title} loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" />
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center p-6 text-center text-neutral-500 dark:text-neutral-400">
                    <span className="font-serif text-2xl">{category.title}</span>
                  </div>
                )}
                <span className="absolute left-4 top-4 bg-[#faf9f6]/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-neutral-700 backdrop-blur dark:bg-[#11110f]/85 dark:text-neutral-200">
                  {String(index + 1).padStart(2, '0')} / Selected Work
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-medium transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-400">{category.title}</h3>
                  <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-lg transition-all group-hover:border-amber-700 group-hover:bg-amber-700 group-hover:text-white dark:border-white/15 dark:group-hover:border-amber-400 dark:group-hover:bg-amber-400 dark:group-hover:text-neutral-900">↗</span>
                </div>
                <p className="mt-2 text-xs tracking-wide text-neutral-400">{category.photos.length} photographs</p>
              </div>
            </Link>
          );
        })}
      </div>
    ) : (
      <p className="mt-12 border-y border-black/10 py-16 text-center text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
        Portofolio akan segera hadir.
      </p>
    )}
  </div>
</section>


      
<section id="services" className="bg-[#f1efe9] dark:bg-[#1c1c19] px-6 py-24">
  <div className="mx-auto max-w-7xl">
    <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
      What We Do
    </p>

    <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <h2 className="max-w-xl text-4xl font-medium leading-tight md:text-6xl">
        Photography for every chapter of your story.
      </h2>

      <p className="max-w-sm text-sm leading-7 text-neutral-500">
        From intimate celebrations to meaningful milestones,
        we capture every moment with intention.
      </p>
    </div>

    <div className="mt-16 grid gap-10 border-t border-black/15 dark:border-white/15 pt-8 md:grid-cols-3">
      <div>
        <span className="text-xs text-neutral-400">01 / GRADUATION</span>
        <h3 className="mt-5 text-2xl font-medium">Graduation Photography</h3>
        <p className="mt-4 text-sm leading-7 text-neutral-500">
          Mengabadikan momen kelulusan, mulai dari potret wisuda
          hingga kebersamaan bersama keluarga dan sahabat.
        </p>
      </div>

      <div>
        <span className="text-xs text-neutral-400">02 / WEDDING</span>
        <h3 className="mt-5 text-2xl font-medium">Wedding Photography</h3>
        <p className="mt-4 text-sm leading-7 text-neutral-500">
          Mengabadikan setiap momen pernikahan, mulai dari detail kecil
          hingga momen paling berharga.
        </p>
      </div>

      <div>
        <span className="text-xs text-neutral-400">03 / EVENT</span>
        <h3 className="mt-5 text-2xl font-medium">Event Photography</h3>
        <p className="mt-4 text-sm leading-7 text-neutral-500">
          Dokumentasi acara dan perayaan dengan pendekatan visual
          yang natural dan bercerita.
        </p>
      </div>
    </div>
  </div>
</section>


      
<footer id="contact" className="border-t border-black/10 px-6 py-16">
  <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row md:items-end">
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
        Let's Create Memories
      </p>
      <h2 className="mt-4 text-3xl font-medium md:text-5xl">
        Let's talk about your story.
      </h2>
      <a
        href={whatsappContactUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-3 rounded-full bg-green-600 px-7 py-4 text-sm text-white transition hover:bg-green-700"
      >
        Chat via WhatsApp ↗
      </a>
    </div>

    <div className="text-sm text-neutral-500 md:text-right">
      <p>© {new Date().getFullYear()} Pilihin Fotomu</p>
      <p className="mt-2">Capturing moments, preserving memories.</p>
    </div>
  </div>
</footer>

    </main>
  );
}
