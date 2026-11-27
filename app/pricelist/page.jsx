import { createClient } from '@/lib/supabase/server';
import AppHeader from '@/components/AppHeader';
import { getGoogleSheetsPricelist } from '@/lib/google-sheets-pricelist';

export default async function PricelistPage({ searchParams }) {
  const params = await searchParams;
  const selectedServiceId = typeof params?.service === 'string' ? params.service : '';
  const supabase = await createClient();
  const prices = await getGoogleSheetsPricelist();
  const { data: waSetting } = await supabase.from('settings').select('value').eq('key', 'whatsapp_number').maybeSingle();
  const wa = String(waSetting?.value || process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP || '201553538819').replace(/\\D/g, '');
  const bookingUrl = '/booking';
  const packageIds = ['solo', 'duo', 'group', 'large', 'extended'];

  return (
    <main className="relative isolate min-h-screen bg-[#faf9f6] text-[#1c1c1c] dark:bg-[#11110f] dark:text-stone-100">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.92)_0%,rgba(250,249,246,0.72)_34%,rgba(250,249,246,0.94)_72%,rgba(250,249,246,0.98)_100%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,236,205,0.13)_0%,rgba(17,17,15,0.55)_36%,rgba(17,17,15,0.88)_72%,rgba(17,17,15,0.96)_100%)]" />
      </div>
      <AppHeader navigation={<><a href="/" className="hover:text-amber-700">Home</a><a href="/pricelist" className="text-amber-700 dark:text-amber-400">Pricelist</a><a href="/booking" className="hover:text-amber-700">Booking</a><a href="/#portfolio" className="hover:text-amber-700">Portfolio</a><a href="/#services" className="hover:text-amber-700">Service</a><a href="/#contact" className="hover:text-amber-700">Contact</a></>} actions={<a href="/admin" className="rounded-full bg-black px-4 py-2 text-sm text-white dark:bg-stone-100 dark:text-neutral-900">Dashboard</a>} />
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 md:pt-28">
        {selectedServiceId && <div className="mt-8 text-center"><a href="/pricelist" className="text-sm text-amber-800 underline underline-offset-4 dark:text-amber-400">← Lihat semua service</a></div>}
        <div className="mt-14 space-y-16">
          {(selectedServiceId ? prices.services.filter(service => service.id === selectedServiceId) : prices.services).map((service,serviceIndex)=><section id={service.id} key={service.id||serviceIndex}>
            <header className="relative left-1/2 isolate mb-8 flex h-[32vw] min-h-40 max-h-[480px] w-screen -translate-x-1/2 items-end overflow-hidden bg-neutral-800 px-7 py-8 text-white shadow-lg sm:h-[24vw] sm:min-h-56 sm:max-h-[420px] sm:px-10 sm:py-10">
              {service.headerImageUrl ? <img src={service.headerImageUrl} alt="" aria-hidden="true" className="absolute inset-0 z-0 h-full w-full object-cover" loading="lazy" /> : <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-br from-stone-700 via-neutral-800 to-black" />}
              <div aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
              <div className="relative z-20 max-w-3xl">
                <p className="text-xs uppercase tracking-[0.25em] text-white/75 drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]">Service {String(serviceIndex+1).padStart(2,'0')}</p>
                <h2 className="mt-2 font-serif text-3xl md:text-5xl drop-shadow-[0_3px_10px_rgba(0,0,0,0.95)]">{service.title}</h2>
                {service.description&&<p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">{service.description}</p>}
              </div>
            </header>
            {([['photoPackages','Photo Packages'],['videoPackages','Video Packages']]).map(([field,heading])=><div className="mt-8" key={field}><h3 className="mb-5 text-lg font-medium">{heading}</h3>{service[field]?.length?<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{service[field].map((item,i)=><article key={i} className="flex flex-col rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1b1b18]">{item.detail&&<p className="text-xs uppercase tracking-[0.2em] text-neutral-400">{item.detail}</p>}<h4 className="mt-3 text-xl font-medium">{item.name}</h4>{item.price&&<p className="mt-5 font-serif text-3xl">{item.price}</p>}<div className="mt-6 space-y-3 border-t border-black/10 pt-5 text-sm text-neutral-600 dark:border-white/10 dark:text-neutral-300">{[item.duration,item.locations,item.photos,item.extras].filter(Boolean).map((feature,j)=><p key={j}>✦ {feature}</p>)}</div><a href={bookingUrl} className="mt-7 rounded-full bg-black px-5 py-3 text-center text-sm text-white transition hover:bg-neutral-700 dark:bg-stone-100 dark:text-neutral-900">Book Service ↗</a></article>)}</div>:<p className="text-sm text-neutral-400">Paket {heading.toLowerCase()} segera tersedia.</p>}</div>)}
            {service.addons?.length>0&&<div className="mt-8 border-t border-black/10 pt-7 dark:border-white/10"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Optional extras</p><h3 className="mt-1 font-serif text-2xl">Add-ons</h3><p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Upgrade sesi kamu dengan tambahan yang tersedia.</p></div><span className="hidden text-sm text-neutral-400 sm:block">Customize your session</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{service.addons.map((item,i)=><div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-black/10 bg-white/70 px-4 py-4 transition-colors hover:border-amber-600/40 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-amber-400/30"><div className="flex min-w-0 items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-600/25 text-sm text-amber-700 dark:border-amber-400/25 dark:text-amber-400">+</span><span className="text-sm font-medium leading-snug">{item.name}</span></div>{item.price&&<span className="shrink-0 text-sm font-medium text-neutral-600 dark:text-neutral-300">{item.price}</span>}</div>)}</div></div>}
          </section>)}
        </div>
      </section>
    </main>
  );
}
