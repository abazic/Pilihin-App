import { createClient } from '@/lib/supabase/server';
import AppHeader from '@/components/AppHeader';

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
  addons: [
    { name: 'Extra 60 menit', price: '+Rp 100K' }, { name: 'Extra lokasi', price: '+Rp 100K' },
    { name: 'Extra 10 foto edited', price: '+Rp 50K' }, { name: 'Same Day Edit', price: '+Rp 300K' },
    { name: 'Family >5 orang', price: '+Rp 50K/orang' },
  ],
  video: { name: 'Shoot & Edit', price: 'Rp 600K', description: 'Video dokumentasi graduation' },
  whatsappMessage: 'Halo kak, bisa booking foto graduation?',
};

function parseValue(value) {
  try { const parsed = typeof value === 'string' ? JSON.parse(value) : value; return { ...DEFAULT_PRICELIST, ...parsed }; }
  catch { return DEFAULT_PRICELIST; }
}

export default async function PricelistPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('settings').select('value').eq('key', 'pricelist_content').maybeSingle();
  const prices = parseValue(data?.value);
  const { data: waSetting } = await supabase.from('settings').select('value').eq('key', 'whatsapp_number').maybeSingle();
  const wa = String(waSetting?.value || process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP || '201553538819').replace(/\\D/g, '');
  const bookingUrl = `https://wa.me/${wa}?text=${encodeURIComponent(prices.whatsappMessage || 'Halo, saya ingin booking sesi foto.')}`;

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1c1c1c] dark:bg-[#11110f] dark:text-stone-100">
      <AppHeader navigation={<><a href="/#portfolio" className="hover:text-amber-700">Portfolio</a><a href="/pricelist" className="text-amber-700 dark:text-amber-400">Pricelist</a><a href="/#services" className="hover:text-amber-700">Services</a><a href="/#contact" className="hover:text-amber-700">Contact</a></>} actions={<a href="/admin" className="rounded-full bg-black px-4 py-2 text-sm text-white dark:bg-stone-100 dark:text-neutral-900">Dashboard</a>} />
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-800 dark:text-amber-400">Photography & Visual Stories · Pricing</p>
          <h1 className="mt-5 font-serif text-4xl font-medium tracking-tight md:text-6xl">{prices.title}</h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-neutral-500 dark:text-neutral-400">{prices.subtitle}</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {prices.packages.map((item, i) => <article key={i} className="flex flex-col rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1b1b18]">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">{item.detail}</p><h2 className="mt-3 text-xl font-medium">{item.name}</h2><p className="mt-5 font-serif text-3xl">{item.price}</p>
            <div className="mt-6 space-y-3 border-t border-black/10 pt-5 text-sm text-neutral-600 dark:border-white/10 dark:text-neutral-300">
              {[item.duration,item.locations,item.photos,item.extras].filter(Boolean).map((feature,j)=><p key={j} className="flex gap-2"><span className="text-amber-700">✦</span>{feature}</p>)}
            </div><a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="mt-7 rounded-full bg-black px-5 py-3 text-center text-sm text-white transition hover:bg-neutral-700 dark:bg-stone-100 dark:text-neutral-900">Book Package ↗</a>
          </article>)}
        </div>
        <section className="mt-20 grid gap-12 md:grid-cols-[1.2fr_0.8fr]">
          <div><p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Customize your session</p><h2 className="mt-3 font-serif text-3xl md:text-4xl">Add-ons</h2><div className="mt-7 divide-y divide-black/10 dark:divide-white/10">{prices.addons.map((item,i)=><div key={i} className="flex items-center justify-between gap-4 py-4 text-sm"><span>{item.name}</span><span className="font-medium">{item.price}</span></div>)}</div></div>
          <div className="rounded-2xl bg-[#eeeae2] p-7 dark:bg-[#24231f]"><p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Video Package</p><h2 className="mt-4 font-serif text-3xl">{prices.video?.name || 'Shoot & Edit'}</h2><p className="mt-3 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{prices.video?.description}</p><p className="mt-6 text-3xl font-medium">{prices.video?.price}</p><a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex rounded-full bg-black px-6 py-3 text-sm text-white dark:bg-stone-100 dark:text-neutral-900">Book Video ↗</a></div>
        </section>
        <div className="mt-20 border-t border-black/10 pt-10 text-center dark:border-white/10"><p className="text-sm text-neutral-500">Setiap momen, setiap cerita, layak untuk dikenang.</p><a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-full bg-amber-700 px-8 py-4 text-sm text-white transition hover:bg-amber-800">Book Now via WhatsApp ↗</a></div>
      </section>
    </main>
  );
}
