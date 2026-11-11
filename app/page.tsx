import { createClient } from '@/lib/supabase/server';
import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants';
import AppHeader from '@/components/AppHeader';
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
  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1c1c1c] transition-colors duration-300 dark:bg-[#11110f] dark:text-stone-100">
      <AppHeader
        navigation={
          <>
            <a className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400" href="#portfolio">Portfolio</a>
            <a className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400" href="#services">Services</a>
            <a className="transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400" href="#contact">Contact</a>
          </>
        }
        actions={
          <>
            <a href="/login" className="rounded-full border border-black/20 px-5 py-2 text-sm transition hover:bg-black hover:text-white dark:border-white/20 dark:hover:bg-stone-100 dark:hover:text-stone-900">Client Login</a>
            <a href="/admin" className="rounded-full bg-black px-5 py-2 text-sm text-white transition hover:bg-neutral-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Admin Login</a>
          </>
        }
      />

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-amber-800 dark:text-amber-400">
              Photography & Visual Storytelling
            </p>

            <h1 className="text-5xl font-medium leading-[1.1] tracking-tight md:text-7xl">
              Every moment deserves to be{" "}
              <span className="text-neutral-400 dark:text-neutral-500 dark:text-neutral-400">remembered.</span>
            </h1>

            <p className="mt-8 max-w-md text-base leading-7 text-neutral-500">
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

          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
              <img
                src="https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85"
                alt="Wedding photography"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-3 text-right text-xs tracking-widest text-neutral-400">
              MOMENTS · STORIES · MEMORIES
            </p>
          </div>
        </div>
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

    <div className="mt-12 grid gap-5 md:grid-cols-2">
      <div className="group">
        <div className="aspect-[4/5] overflow-hidden bg-neutral-200">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85"
            alt="Wedding photography"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </div>
        <h3 className="mt-4 text-lg font-medium">Wedding Stories</h3>
        <p className="mt-1 text-sm text-neutral-400">Love · Celebration · Memories</p>
      </div>

      <div className="group md:mt-24">
        <div className="aspect-[4/5] overflow-hidden bg-neutral-200">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85"
            alt="Portrait photography"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </div>
        <h3 className="mt-4 text-lg font-medium">Portrait Sessions</h3>
        <p className="mt-1 text-sm text-neutral-400">Personality · Expression · Identity</p>
      </div>

      <div className="group">
        <div className="aspect-[4/5] overflow-hidden bg-neutral-200">
          <img
            src="https://images.unsplash.com/photo-1507504031003-b417219a0dde?auto=format&fit=crop&w=1000&q=85"
            alt="Event photography"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </div>
        <h3 className="mt-4 text-lg font-medium">Event Moments</h3>
        <p className="mt-1 text-sm text-neutral-400">People · Energy · Experiences</p>
      </div>

      <div className="group md:mt-24">
        <div className="aspect-[4/5] overflow-hidden bg-neutral-200">
          <img
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85"
            alt="Wedding couple photography"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </div>
        <h3 className="mt-4 text-lg font-medium">Pre-Wedding</h3>
        <p className="mt-1 text-sm text-neutral-400">Connection · Romance · Story</p>
      </div>
    </div>
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
