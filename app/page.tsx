import { createClient } from '@/lib/supabase/server';
import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants';
import AppHeader from '@/components/AppHeader';
import Link from 'next/link';
import { getPhotosPageFromGDrive } from '@/lib/gdrive';
import HeroSlideshow from '@/components/HeroSlideshow';
import PortfolioImage from '@/components/PortfolioImage';
import { Globe } from 'lucide-react';
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
const normalizedPricelist = (() => {
  let parsed: any = {};
  try { parsed = typeof pricelistSetting?.value === 'string' ? JSON.parse(pricelistSetting.value) : (pricelistSetting?.value || {}); } catch {}
  const current = Array.isArray(parsed.services) ? parsed.services : [];
  if (current.some((service:any) => Array.isArray(service?.photoPackages) || Array.isArray(service?.videoPackages))) {
    return current.map((service:any,index:number)=>({...service,id:service.id||'service-'+index,photoPackages:service.photoPackages||[],videoPackages:service.videoPackages||[],addons:service.addons||[]}));
  }
  const label = (service:any) => String(service?.id||'')+' '+String(service?.title||'');
  const oldPhoto = current.find((service:any)=>/photo|package/i.test(label(service))&&!/video/i.test(label(service)));
  const oldVideo = current.find((service:any)=>/video/i.test(label(service)));
  const oldAddons = current.find((service:any)=>/addon/i.test(label(service)));
  return [{id:'graduation',title:'Graduation Photography',description:'Sesi foto dan video untuk merayakan kelulusan.',showInService:true,
    photoPackages:oldPhoto?.items||parsed.packages||[{"name":"Solo Graduate","price":"Rp 250K","detail":"1 Graduate","duration":"1 jam","locations":"1 lokasi","photos":"20 foto edited","extras":"Unlimited shots"},{"name":"Duo Graduate","price":"Rp 400K","detail":"2 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"30 foto edited","extras":"Unlimited shots"},{"name":"Group Session","price":"Rp 700K","detail":"3–5 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"60 foto edited","extras":"Unlimited shots"},{"name":"Large Group","price":"Rp 900K","detail":"6–10 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"100 foto edited","extras":"Unlimited shots"},{"name":"Extended Group","price":"Rp 100K/person","detail":">10 Graduates","duration":"3–4 jam","locations":"1 lokasi","photos":"100 foto edited","extras":"Unlimited shots"}],
    videoPackages:oldVideo?.items||(parsed.video?.name?[{name:parsed.video.name,price:parsed.video.price,detail:parsed.video.description,duration:parsed.video.duration}]:[{"name":"Shoot & Edit","price":"Rp 600K","detail":"Video dokumentasi graduation"}]),
    addons:oldAddons?.items||parsed.addons||[{"name":"Extra 60 menit","price":"+Rp 100K"},{"name":"Extra lokasi","price":"+Rp 100K"},{"name":"Extra 10 foto edited","price":"+Rp 50K"},{"name":"Same Day Edit","price":"+Rp 300K"},{"name":"Family >5 orang","price":"+Rp 50K/orang"}]}, {id:"wedding-events",title:"Wedding & Events",description:"Dokumentasi foto dan video untuk pernikahan serta berbagai acara.",showInService:true,photoPackages:[],videoPackages:[],addons:[]}, {id:"personal-projects",title:"Personal Projects",description:"Sesi fotografi dan videografi untuk kebutuhan personal maupun kreatif.",showInService:true,photoPackages:[],videoPackages:[],addons:[]}];
})();
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
  <div className="mx-auto max-w-7xl"><p className="text-xs uppercase tracking-[0.25em] text-neutral-400">What We Do</p>
    <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end"><h2 className="max-w-xl text-4xl font-medium leading-tight md:text-6xl">Photography for every chapter of your story.</h2><p className="max-w-sm text-sm leading-7 text-neutral-500">Explore our photography and videography services.</p></div>
    <div className="mt-16 grid gap-5 border-t border-black/15 pt-8 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/15">
      {normalizedPricelist.filter((service:any)=>service.showInService!==false).map((service:any,index:number)=><Link key={service.id} href={`/pricelist?service=${encodeURIComponent(service.id)}`} className="group flex min-h-48 flex-col justify-between rounded-2xl border border-black/10 bg-white/50 p-6 transition duration-300 hover:-translate-y-1 hover:border-amber-700/50 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
        <div><p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Service {String(index+1).padStart(2,'0')}</p><h3 className="mt-4 text-2xl font-medium transition-colors group-hover:text-amber-800 dark:group-hover:text-amber-400">{service.title}</h3>{service.description&&<p className="mt-3 text-sm leading-7 text-neutral-500">{service.description}</p>}</div>
        <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-400">Explore Service <span aria-hidden="true">↗</span></span>
      </Link>)}
    </div>
  </div>
</section>


      
<footer id="contact" className="border-t border-black/10 px-6 py-10 dark:border-white/10">
  <div className="mx-auto max-w-7xl">
    <div className="flex items-center justify-between gap-6">
      <Link href="/" className="flex w-fit shrink-0 items-center gap-2 leading-tight">
        <img
          src="/instories.svg"
          alt="Logo inStories creative"
          className="h-10 w-7 shrink-0 object-contain transition-[filter] duration-200 dark:invert"
        />
        <span className="flex flex-col">
          <span className="font-raleway text-xl tracking-tight text-gray-900 dark:text-white">in<span className="font-bold">Stories</span></span>
          <span className="font-raleway text-sm tracking-tight text-gray-900 dark:text-white">creative</span>
        </span>
      </Link>

      <a href={whatsappContactUrl} target="_blank" rel="noopener noreferrer"
        aria-label="Chat melalui WhatsApp" title="Chat melalui WhatsApp"
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] transition hover:bg-[#1ebe5d]">
        <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="WhatsApp" width="25" height="25" className="h-[25px] w-[25px]" />
      </a>
    </div>

    <div className="mt-8 flex flex-col items-start gap-4">
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

    <div className="mt-9 border-t border-black/10 pt-5 text-xs text-neutral-500 dark:border-white/10">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} inStories creative</p>
        <p>Capturing moments, preserving memories.</p>
      </div>
    </div>
  </div>
</footer>

    </main>
  );
}
