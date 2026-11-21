import { createClient } from '@/lib/supabase/server';
import AppHeader from '@/components/AppHeader';
import { getPhotosPageFromGDrive } from '@/lib/gdrive';
import HeroSlideshow from '@/components/HeroSlideshow';

const DEFAULT_PRICELIST = {
  title: 'Graduation Photoshoot 2026',
  subtitle: 'Rayakan perjalanan panjangmu lewat foto yang layak untuk dikenang.',
  packages: [
    { name: 'Solo Graduate', price: 'Rp 250K', detail: '1 Graduate', duration: '1 jam', locations: '1 lokasi', photos: '20 foto edited', extras: 'Unlimited shots' },
    { name: 'Duo Graduate', price: 'Rp 400K', detail: '2 Graduates', duration: '2 jam', locations: '2 lokasi', photos: '30 foto edited', extras: 'Unlimited shots' },
    { name: 'Group Session', price: 'Rp 700K', detail: '3–5 Graduates', duration: '2 jam', locations: '2 lokasi', photos: '60 foto edited', extras: 'Unlimited shots' },
    { name: 'Large Group', price: 'Rp 900K', detail: '6–10 Graduates', duration: '2 jam', locations: '2 lokasi', photos: '100 foto edited', extras: 'Unlimited shots' },
    { name: 'Extended Group', price: 'Rp 100K/person', detail: '>10 Graduates', duration: '3–4 jam', locations: '1 lokasi', photos: '100 foto edited', extras: 'Unlimited shots' },
  ],
  addons: [{ name: 'Extra 60 menit', price: '+Rp 100K' }, { name: 'Extra lokasi', price: '+Rp 100K' }, { name: 'Extra 10 foto edited', price: '+Rp 50K' }, { name: 'Same Day Edit', price: '+Rp 300K' }, { name: 'Family >5 orang', price: '+Rp 50K/orang' }],
  video: { name: 'Shoot & Edit', price: 'Rp 600K', duration: '', description: 'Video dokumentasi graduation' },
  whatsappMessage: 'Halo kak, bisa booking foto graduation?',
  services: [
    { id: 'photo-packages', title: 'Photo Packages', description: 'Pilihan paket fotografi yang tersedia.', showInService: true, items: [
      { name: 'Solo Graduate', price: 'Rp 250K', detail: '1 Graduate', duration: '1 jam', locations: '1 lokasi', photos: '20 foto edited', extras: 'Unlimited shots' },
      { name: 'Duo Graduate', price: 'Rp 400K', detail: '2 Graduates', duration: '2 jam', locations: '2 lokasi', photos: '30 foto edited', extras: 'Unlimited shots' },
      { name: 'Group Session', price: 'Rp 700K', detail: '3–5 Graduates', duration: '2 jam', locations: '2 lokasi', photos: '60 foto edited', extras: 'Unlimited shots' },
      { name: 'Large Group', price: 'Rp 900K', detail: '6–10 Graduates', duration: '2 jam', locations: '2 lokasi', photos: '100 foto edited', extras: 'Unlimited shots' },
      { name: 'Extended Group', price: 'Rp 100K/person', detail: '>10 Graduates', duration: '3–4 jam', locations: '1 lokasi', photos: '100 foto edited', extras: 'Unlimited shots' },
    ] },
    { id: 'video', title: 'Video Package', description: 'Layanan dokumentasi video.', showInService: true, items: [{ name: 'Shoot & Edit', price: 'Rp 600K', detail: 'Video dokumentasi graduation' }] },
    { id: 'addons', title: 'Add-ons', description: 'Layanan tambahan untuk melengkapi sesi foto.', showInService: true, items: [
      { name: 'Extra 60 menit', price: '+Rp 100K' }, { name: 'Extra lokasi', price: '+Rp 100K' }, { name: 'Extra 10 foto edited', price: '+Rp 50K' }, { name: 'Same Day Edit', price: '+Rp 300K' }, { name: 'Family >5 orang', price: '+Rp 50K/orang' },
    ] },
  ],};

function normalizePricelist(value) {
  let parsed = {};
  try { parsed = typeof value === 'string' ? JSON.parse(value) : (value || {}); } catch {}
  const oldServices = Array.isArray(parsed.services) ? parsed.services : [];
  const alreadyNested = oldServices.some(s => Array.isArray(s?.photoPackages) || Array.isArray(s?.videoPackages));
  let services = oldServices;
  if (!alreadyNested) {
    const label = s => String((s && s.id) || '') + ' ' + String((s && s.title) || '');
    const oldPhoto = oldServices.find(s => /photo|package/i.test(label(s)) && !/video/i.test(label(s)));
    const oldVideo = oldServices.find(s => /video/i.test(label(s)));
    const oldAddons = oldServices.find(s => /addon/i.test(label(s)));
    services = [{
      id: 'graduation', title: 'Graduation Photography',
      description: 'Sesi foto dan video untuk merayakan kelulusan.', showInService: true,
      photoPackages: (oldPhoto && oldPhoto.items) || parsed.packages || [{"name":"Solo Graduate","price":"Rp 250K","detail":"1 Graduate","duration":"1 jam","locations":"1 lokasi","photos":"20 foto edited","extras":"Unlimited shots"},{"name":"Duo Graduate","price":"Rp 400K","detail":"2 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"30 foto edited","extras":"Unlimited shots"},{"name":"Group Session","price":"Rp 700K","detail":"3–5 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"60 foto edited","extras":"Unlimited shots"},{"name":"Large Group","price":"Rp 900K","detail":"6–10 Graduates","duration":"2 jam","locations":"2 lokasi","photos":"100 foto edited","extras":"Unlimited shots"},{"name":"Extended Group","price":"Rp 100K/person","detail":">10 Graduates","duration":"3–4 jam","locations":"1 lokasi","photos":"100 foto edited","extras":"Unlimited shots"}],
      videoPackages: (oldVideo && oldVideo.items) || (parsed.video && parsed.video.name ? [{name:parsed.video.name,price:parsed.video.price,detail:parsed.video.description,duration:parsed.video.duration}] : [{"name":"Shoot & Edit","price":"Rp 600K","detail":"Video dokumentasi graduation"}]),
      addons: (oldAddons && oldAddons.items) || parsed.addons || [{"name":"Extra 60 menit","price":"+Rp 100K"},{"name":"Extra lokasi","price":"+Rp 100K"},{"name":"Extra 10 foto edited","price":"+Rp 50K"},{"name":"Same Day Edit","price":"+Rp 300K"},{"name":"Family >5 orang","price":"+Rp 50K/orang"}]
    },
    { id: "wedding-events", title: "Wedding & Events", description: "Dokumentasi foto dan video untuk pernikahan serta berbagai acara.", showInService: true, photoPackages: [], videoPackages: [], addons: [] },
    { id: "personal-projects", title: "Personal Projects", description: "Sesi fotografi dan videografi untuk kebutuhan personal maupun kreatif.", showInService: true, photoPackages: [], videoPackages: [], addons: [] }
    ];
  }
  return { ...parsed, services: services.map((service, index) => ({
    id: String((service && service.id) || 'service-' + index),
    title: String((service && service.title) || 'Service ' + (index + 1)),
    description: String((service && service.description) || ''),
    showInService: !service || service.showInService !== false,
    photoPackages: Array.isArray(service && service.photoPackages) ? service.photoPackages : (Array.isArray(service && service.items) ? service.items : []),
    videoPackages: Array.isArray(service && service.videoPackages) ? service.videoPackages : [],
    addons: Array.isArray(service && service.addons) ? service.addons : []
  })) };
}

export default async function PricelistPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('settings').select('value').eq('key', 'pricelist_content').maybeSingle();
  const prices = normalizePricelist(data?.value);
  const { data: waSetting } = await supabase.from('settings').select('value').eq('key', 'whatsapp_number').maybeSingle();
  const wa = String(waSetting?.value || process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP || '201553538819').replace(/\\D/g, '');
  const bookingUrl = '/booking';
  const packageIds = ['solo', 'duo', 'group', 'large', 'extended'];

  const { data: portfolioSetting } = await supabase.from('settings').select('value').eq('key', 'portfolio_categories').maybeSingle();
  let categories = [];
  try {
    const parsed = typeof portfolioSetting?.value === 'string' ? JSON.parse(portfolioSetting.value) : portfolioSetting?.value;
    categories = Array.isArray(parsed) ? parsed : [];
  } catch { categories = []; }
  const heroPhotos = (await Promise.all(
    categories.map(async (category) => getPhotosPageFromGDrive(category.folderId, { pageSize: 5, imageSize: 900 }))
  )).flatMap((result) => result.photos || []).filter((photo) => photo.url).map((photo) => photo.url);
  for (let i = heroPhotos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [heroPhotos[i], heroPhotos[j]] = [heroPhotos[j], heroPhotos[i]];
  }
  const backgroundPhotos = heroPhotos.length ? heroPhotos : ['https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85'];

  return (
    <main className="relative isolate min-h-screen bg-[#faf9f6] text-[#1c1c1c] dark:bg-[#11110f] dark:text-stone-100">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <HeroSlideshow images={backgroundPhotos} interval={12000} />
        <div className="absolute inset-0 bg-[#faf9f6]/80 backdrop-blur-[5px] dark:bg-[#11110f]/80" />
      </div>
      <AppHeader navigation={<><a href="/" className="hover:text-amber-700">Home</a><a href="/pricelist" className="text-amber-700 dark:text-amber-400">Pricelist</a><a href="/booking" className="hover:text-amber-700">Booking</a><a href="/#portfolio" className="hover:text-amber-700">Portfolio</a><a href="/#services" className="hover:text-amber-700">Service</a><a href="/#contact" className="hover:text-amber-700">Contact</a></>} actions={<a href="/admin" className="rounded-full bg-black px-4 py-2 text-sm text-white dark:bg-stone-100 dark:text-neutral-900">Dashboard</a>} />
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-800 dark:text-amber-400">Photography & Visual Stories · Pricing</p>
          <h1 className="mt-5 font-serif text-4xl font-medium tracking-tight md:text-6xl">{prices.title}</h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-neutral-500 dark:text-neutral-400">{prices.subtitle}</p>
        </div>
        <div className="mt-14 space-y-16">
          {prices.services.map((service,serviceIndex)=><section key={service.id||serviceIndex}>
            <div className="mb-6 border-b border-black/10 pb-4 dark:border-white/10"><p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Service {String(serviceIndex+1).padStart(2,'0')}</p><h2 className="mt-2 font-serif text-3xl md:text-4xl">{service.title}</h2>{service.description&&<p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-500 dark:text-neutral-400">{service.description}</p>}</div>
            {([['photoPackages','Photo Packages'],['videoPackages','Video Packages']]).map(([field,heading])=><div className="mt-8" key={field}><h3 className="mb-5 text-lg font-medium">{heading}</h3>{service[field]?.length?<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{service[field].map((item,i)=><article key={i} className="flex flex-col rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1b1b18]">{item.detail&&<p className="text-xs uppercase tracking-[0.2em] text-neutral-400">{item.detail}</p>}<h4 className="mt-3 text-xl font-medium">{item.name}</h4>{item.price&&<p className="mt-5 font-serif text-3xl">{item.price}</p>}<div className="mt-6 space-y-3 border-t border-black/10 pt-5 text-sm text-neutral-600 dark:border-white/10 dark:text-neutral-300">{[item.duration,item.locations,item.photos,item.extras].filter(Boolean).map((feature,j)=><p key={j}>✦ {feature}</p>)}</div><a href={bookingUrl} className="mt-7 rounded-full bg-black px-5 py-3 text-center text-sm text-white transition hover:bg-neutral-700 dark:bg-stone-100 dark:text-neutral-900">Book Service ↗</a></article>)}</div>:<p className="text-sm text-neutral-400">Paket {heading.toLowerCase()} segera tersedia.</p>}</div>)}
            {service.addons?.length>0&&<div className="mt-8 border-t border-black/10 pt-5 dark:border-white/10"><h3 className="mb-3 text-sm font-medium">Add-ons</h3><div className="flex flex-wrap gap-2">{service.addons.map((item,i)=><span key={i} className="rounded-full border border-black/10 px-4 py-2 text-xs dark:border-white/10">{item.name}{item.price?' · '+item.price:''}</span>)}</div></div>}
          </section>)}
        </div>
        <div className="mt-20 border-t border-black/10 pt-10 text-center dark:border-white/10"><p className="text-sm text-neutral-500">Setiap momen, setiap cerita, layak untuk dikenang.</p><a href={bookingUrl} className="mt-5 inline-flex rounded-full bg-amber-700 px-8 py-4 text-sm text-white transition hover:bg-amber-800">Book Now via WhatsApp ↗</a></div>
      </section>
    </main>
  );
}
