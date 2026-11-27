import { createClient } from '@/lib/supabase/server';
import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants';
import { getGoogleSheetsPricelist } from '@/lib/google-sheets-pricelist';
import AppHeader from '@/components/AppHeader';
import Link from 'next/link';
import Image from 'next/image';
import { getPhotosPageFromGDrive } from '@/lib/gdrive';
import HeroSlideshow from '@/components/HeroSlideshow';
import PortfolioImage from '@/components/PortfolioImage';
import { Globe } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
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
const pricelistSource = await getGoogleSheetsPricelist();
const normalizedPricelist = pricelistSource.services;
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
      photos: (await getPhotosPageFromGDrive(category.folderId, { pageSize: 3, imageSize: 700 })).photos,
    }))
  );

  // Reuse already-fetched category thumbnails and keep portrait photos only.
  // This avoids a second Google Drive scan and prevents landscape crops in the hero.
  const portfolioHeroPhotos = portfolioCategoriesWithPhotos
    .flatMap((category) => category.photos)
    .filter((photo) => photo.width && photo.height && photo.height > photo.width);

  // Shuffle once per server render so the opening hero image is random.
  for (let i = portfolioHeroPhotos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [portfolioHeroPhotos[i], portfolioHeroPhotos[j]] = [portfolioHeroPhotos[j], portfolioHeroPhotos[i]];
  }

  const heroPhotos = portfolioHeroPhotos.length > 0
    ? portfolioHeroPhotos.map((photo) => photo.url.replace(/=s\d+/, '=s900'))
    : ['https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&h=1600&q=85'];
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

      <section className="relative isolate mx-auto -mt-[8.25rem] max-w-7xl overflow-hidden px-6 pt-[calc(4rem+8.25rem)] pb-16 md:min-h-[720px] md:pt-[calc(6rem+8.25rem)] md:pb-24">
        <div className="absolute inset-y-0 right-0 w-full md:w-[72%]">
          <div className="absolute inset-0">
            <HeroSlideshow images={heroPhotos} interval={12000} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#faf9f6] via-[#faf9f6]/75 to-transparent dark:from-[#11110f] dark:via-[#11110f]/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f6] via-transparent to-[#faf9f6]/25 dark:from-[#11110f] dark:via-transparent dark:to-[#11110f]/20" />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#faf9f6] to-transparent dark:from-[#11110f]" />
        </div>

        <div className="relative z-10 flex min-h-[520px] items-center md:min-h-[570px]">
          <ScrollReveal className="w-full">
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
          </ScrollReveal>
        </div>
        <p className="absolute bottom-6 right-8 z-10 text-right text-xs tracking-widest text-neutral-500 dark:text-neutral-300">
          MOMENTS · STORIES · MEMORIES
        </p>
      </section>

      
<section id="portfolio" className="border-t border-black/10 dark:border-white/10 px-6 py-24">
  <div className="mx-auto max-w-7xl">
    <ScrollReveal><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
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
    </div></ScrollReveal>

    {portfolioCategoriesWithPhotos.length > 0 ? (
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {portfolioCategoriesWithPhotos.map((category, index) => {
          const cover = category.photos[0];
          return (
            <ScrollReveal key={category.slug} delay={index * 90}><Link href={`/portfolio/${category.slug}`} className="group block overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#1b1b18]">
              <div className="relative overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                {cover ? (
                  <PortfolioImage src={cover.url} alt={category.title} width={cover.width} height={cover.height} loading="lazy"
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
            </Link></ScrollReveal>
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
  <div className="mx-auto max-w-7xl"><ScrollReveal><div><p className="text-xs uppercase tracking-[0.25em] text-neutral-400">What We Do</p>
    <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end"><h2 className="max-w-xl text-4xl font-medium leading-tight md:text-6xl">Photography for every chapter of your story.</h2><p className="max-w-sm text-sm leading-7 text-neutral-500">Explore our photography and videography services.</p></div></div></ScrollReveal>
    <div className="mt-16 grid gap-5 border-t border-black/15 pt-8 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/15">
      {normalizedPricelist.filter((service:any)=>service.showInService!==false).map((service:any,index:number)=><ScrollReveal key={service.id} delay={index*100}><Link href={`/pricelist?service=${encodeURIComponent(service.id)}`} className="group relative isolate flex min-h-64 flex-col justify-between overflow-hidden rounded-2xl border border-black/10 bg-neutral-800 p-6 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10">
        {service.headerImageUrl&&<Image src={service.headerImageUrl} alt="" aria-hidden="true" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={75} className="z-0 object-cover transition-transform duration-700 group-hover:scale-105"/>}
        <div aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/15"/>
        <div className="relative z-20"><p className="text-xs uppercase tracking-[0.25em] text-white/70">Service {String(index+1).padStart(2,'0')}</p><h3 className="mt-4 text-2xl font-medium transition-colors group-hover:text-amber-200">{service.title}</h3>{service.description&&<p className="mt-3 text-sm leading-7 text-white/80">{service.description}</p>}</div>
        <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-amber-200">Explore Service <span aria-hidden="true">↗</span></span>
      </Link></ScrollReveal>)}
    </div>
  </div>
</section>


      
<footer id="contact" className="border-t border-black/10 px-6 py-10 dark:border-white/10">
  <div className="mx-auto max-w-7xl">
    <div className="flex items-center justify-between gap-6">
      <Link href="/" className="flex w-fit shrink-0 items-center gap-3 leading-none">
        <img
          src="/instories.svg"
          alt="Logo inStories creative"
          className="h-14 w-10 shrink-0 object-contain transition-[filter] duration-200 dark:invert sm:h-16 sm:w-11"
        />
        <span className="flex flex-col gap-0.5">
          <span className="font-raleway text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">in<span className="font-bold">Stories</span></span>
          <span className="font-raleway text-base tracking-tight text-gray-900 dark:text-white sm:text-lg">creative</span>
        </span>
      </Link>

    </div>

    <div className="mt-8 flex items-start justify-between gap-6">
      <div className="flex flex-col items-start gap-4">
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
            className="inline-flex items-center gap-3 text-sm text-neutral-600 transition hover:text-amber-700 dark:text-neutral-300 dark:hover:text-amber-400">
            {iconSlug ? (
              <img src={`https://cdn.simpleicons.org/${iconSlug}`} alt="" aria-hidden="true" width="19" height="19" className="h-[19px] w-[19px] object-contain dark:brightness-0 dark:invert" />
            ) : <Globe size={19} strokeWidth={1.8} />}
            <span>{accountName}</span>
          </a>
        );
      })}
    </div>

      <a href={whatsappContactUrl} target="_blank" rel="noopener noreferrer"
      aria-label="Chat melalui WhatsApp" title="Chat melalui WhatsApp"
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] transition hover:bg-[#1ebe5d]">
      <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="WhatsApp" width="25" height="25" className="h-[25px] w-[25px]" />
      </a>
    </div>

    <div className="mt-9 border-t border-black/10 pt-5 text-xs text-neutral-500 dark:border-white/10">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} inStories creative</p>
        <p>Capturing moments, preserving memories.</p>
      </div>
    </div>
  </div>
</footer>

      <a href={whatsappContactUrl} target="_blank" rel="noopener noreferrer"
        aria-label="Chat melalui WhatsApp" title="Chat melalui WhatsApp"
        className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40">
        <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="" aria-hidden="true" width="28" height="28" className="h-7 w-7" />
      </a>

    </main>
  );
}
