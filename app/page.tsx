import { createClient } from '@/lib/supabase/server';
import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants';
import AppHeader from '@/components/AppHeader';
import Link from 'next/link';
import { getPhotosPageFromGDrive } from '@/lib/gdrive';
import HeroSlideshow from '@/components/HeroSlideshow';
import PortfolioImage from '@/components/PortfolioImage';
import { Globe, MessageCircle } from 'lucide-react';
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
const { data: pricelistSetting } = await supabase.from('settings').select('value').eq('key', 'pricelist_content').maybeSingle();
const DEFAULT_SERVICE_SECTIONS = {
  packages: { title: 'Photo Packages', description: 'Pilihan paket fotografi yang tersedia.', showInService: true },
  video: { title: 'Video Package', description: 'Layanan dokumentasi video.', showInService: true },
  addons: { title: 'Add-ons', description: 'Layanan tambahan untuk melengkapi sesi foto.', showInService: true },
};
let servicePricelist: any = { packages: [], addons: [], video: {}, serviceSections: DEFAULT_SERVICE_SECTIONS };
try {
  const parsed = typeof pricelistSetting?.value === 'string' ? JSON.parse(pricelistSetting.value) : (pricelistSetting?.value || {});
  servicePricelist = { ...servicePricelist, ...parsed, serviceSections: { packages: { ...DEFAULT_SERVICE_SECTIONS.packages, ...(parsed.serviceSections?.packages || {}) }, video: { ...DEFAULT_SERVICE_SECTIONS.video, ...(parsed.serviceSections?.video || {}) }, addons: { ...DEFAULT_SERVICE_SECTIONS.addons, ...(parsed.serviceSections?.addons || {}) } } };
} catch {}
  const whatsappMessage = encodeURIComponent(
  'Halo inStories creative, saya ingin bertanya tentang layanan fotografi.'
);

const whatsappContactUrl = `${whatsappUrl}?text=${whatsappMessage}`;

  const { data: socialSetting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'social_media_links')
    .maybeSingle();
  let socialLinks = [];
  try {
    const parsed = typeof socialSetting?.value === 'string' ? JSON.parse(socialSetting.value) : socialSetting?.value;
    socialLinks = Array.isArray(parsed) ? parsed.filter((item) => item?.platform && typeof item?.url === 'string' && /^https?:\/\//i.test(item.url)) : [];
  } catch { socialLinks = []; }

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
      photos: (await getPhotosPageFromGDrive(category.folderId, { pageSize: 5, imageSize: 900 })).photos,
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
            <a className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400" href="/">Home</a>
            <Link className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400" href="/pricelist">Pricelist</Link>
            <Link className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400" href="/booking">Booking</Link>
            <a className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400" href="#portfolio">Portfolio</a>
            <a className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400" href="#services">Service</a>
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
              Every story deserves to be{" "}
              <span className="text-neutral-400 dark:text-neutral-500">remembered.</span>
            </h1>

            <p className="mt-8 max-w-md text-base leading-7 text-neutral-600 dark:text-neutral-300">
              Mengabadikan momen berharga menjadi cerita visual
              yang dapat kamu kenang selamanya.
            </p>

            <div className="mt-8 flex flex-wrap gap-3"><Link href="/booking" className="inline-block rounded-full bg-amber-700 px-7 py-4 text-sm text-white transition hover:bg-amber-800">Book a Session ↗</Link><a href="#portfolio" className="inline-block rounded-full border border-black/15 px-7 py-4 text-sm transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5">Explore Portfolio</a></div>
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
                <p className="mt-2 text-xs tracking-wide text-neutral-400">Explore collection</p>
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
    <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">What We Do</p>
    <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <h2 className="max-w-xl text-4xl font-medium leading-tight md:text-6xl">Photography for every chapter of your story.</h2>
      <p className="max-w-sm text-sm leading-7 text-neutral-500">Layanan dan pilihan paket yang tersedia di Pricelist.</p>
    </div>
    <div className="mt-16 space-y-14 border-t border-black/15 pt-8 dark:border-white/15">
      {servicePricelist.serviceSections.packages?.showInService && servicePricelist.packages?.length > 0 && <div>
        <div className="mb-6"><h3 className="text-2xl font-medium">{servicePricelist.serviceSections.packages.title}</h3><p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-500">{servicePricelist.serviceSections.packages.description}</p></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{servicePricelist.packages.filter(item=>item?.name).map((item,index)=><article key={`package-${index}`} className="rounded-xl border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-black/10"><p className="text-xs text-neutral-400">{item.detail}</p><h4 className="mt-2 text-xl font-medium">{item.name}</h4>{item.price&&<p className="mt-3 text-lg font-medium text-amber-800 dark:text-amber-400">{item.price}</p>}<div className="mt-3 space-y-1 text-sm text-neutral-500">{[item.duration,item.locations,item.photos,item.extras].filter(Boolean).map((feature,i)=><p key={i}>✦ {feature}</p>)}</div></article>)}</div>
      </div>}
      {servicePricelist.serviceSections.video?.showInService && servicePricelist.video?.name && <div className="grid gap-5 rounded-xl border border-black/10 bg-white/60 p-6 dark:border-white/10 dark:bg-black/10 md:grid-cols-[1fr_auto] md:items-center">
        <div><h3 className="text-2xl font-medium">{servicePricelist.serviceSections.video.title || 'Video Package'}</h3><p className="mt-2 text-sm text-neutral-500">{servicePricelist.serviceSections.video.description}</p><h4 className="mt-4 text-lg font-medium">{servicePricelist.video.name}</h4>{servicePricelist.video.description&&<p className="mt-1 text-sm text-neutral-500">{servicePricelist.video.description}</p>}{servicePricelist.video.duration&&<p className="mt-1 text-sm text-neutral-500">Durasi: {servicePricelist.video.duration}</p>}</div>
        <p className="text-2xl font-medium text-amber-800 dark:text-amber-400">{servicePricelist.video.price}</p>
      </div>}
      {servicePricelist.serviceSections.addons?.showInService && servicePricelist.addons?.length > 0 && <div>
        <div className="mb-5"><h3 className="text-2xl font-medium">{servicePricelist.serviceSections.addons.title}</h3><p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-500">{servicePricelist.serviceSections.addons.description}</p></div>
        <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">{servicePricelist.addons.filter(item=>item?.name).map((item,index)=><div key={`addon-${index}`} className="flex items-center justify-between gap-4 border-b border-black/10 py-4 text-sm dark:border-white/10"><span>{item.name}</span><span className="font-medium whitespace-nowrap">{item.price}</span></div>)}</div>
      </div>}
    </div>
    <div className="mt-12"><a href="/pricelist" className="inline-flex rounded-full border border-black/15 px-6 py-3 text-sm transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5">Lihat Pricelist Lengkap ↗</a></div>
  </div>
</section>


      
<footer id="contact" className="border-t border-black/10 px-6 py-12 dark:border-white/10">
  <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
      {socialLinks.map((social, index) => {
        let host = '';
        try { host = new URL(social.url).hostname.toLowerCase().replace(/^www\\./, ''); } catch {}
        const iconSlug = host.includes('instagram.com') ? 'instagram'
          : host.includes('tiktok.com') ? 'tiktok'
          : host.includes('facebook.com') || host.includes('fb.com') ? 'facebook'
          : host.includes('youtube.com') || host.includes('youtu.be') ? 'youtube'
          : host.includes('threads.net') ? 'threads'
          : host === 'x.com' || host.includes('twitter.com') ? 'x'
          : host.includes('linkedin.com') ? 'linkedin'
          : host.includes('pinterest.') ? 'pinterest'
          : host.includes('telegram.') || host === 't.me' ? 'telegram'
          : '';
        const accountName = social.accountName || social.platform;
        return (
          <a key={`${social.url}-${index}`} href={social.url} target="_blank" rel="noopener noreferrer"
            aria-label={accountName} title={accountName}
            className="inline-flex items-center gap-2 text-sm text-neutral-600 transition hover:text-amber-700 dark:text-neutral-300 dark:hover:text-amber-400">
            {iconSlug ? (
              <img src={`https://cdn.simpleicons.org/${iconSlug}`} alt="" aria-hidden="true" width="19" height="19" className="h-[19px] w-[19px] object-contain dark:brightness-0 dark:invert" />
            ) : <Globe size={19} strokeWidth={1.8} />}
            <span>{accountName}</span>
          </a>
        );
      })}
    </div>

    <a href={whatsappContactUrl} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 self-start text-sm font-medium text-green-700 transition hover:text-green-800 md:self-auto dark:text-green-400 dark:hover:text-green-300">
      <MessageCircle size={20} strokeWidth={1.8} />
      <span>Chat Admin WhatsApp</span>
      <span aria-hidden="true">↗</span>
    </a>
  </div>
  <div className="mx-auto mt-10 max-w-7xl border-t border-black/10 pt-5 text-xs text-neutral-500 dark:border-white/10">
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
      <p>© {new Date().getFullYear()} inStories creative</p>
      <p>Capturing moments, preserving memories.</p>
    </div>
  </div>
</footer>

    </main>
  );
}
