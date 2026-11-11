
export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1c1c1c]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/" className="text-xl font-semibold tracking-tight">
          Pilihin Fotomu<span className="text-amber-700">.</span>
        </a>

        <div className="hidden items-center gap-8 text-sm md:flex">
          <a href="#portfolio">Portfolio</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>

        <a
          href="/login"
          className="rounded-full border border-black/20 px-5 py-2 text-sm transition hover:bg-black hover:text-white"
        >
          Client Login
        </a>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-amber-800">
              Photography & Visual Storytelling
            </p>

            <h1 className="text-5xl font-medium leading-[1.1] tracking-tight md:text-7xl">
              Every moment deserves to be{" "}
              <span className="text-neutral-400">remembered.</span>
            </h1>

            <p className="mt-8 max-w-md text-base leading-7 text-neutral-500">
              Mengabadikan momen berharga menjadi cerita visual
              yang dapat kamu kenang selamanya.
            </p>

            <a
              href="#portfolio"
              className="mt-8 inline-block rounded-full bg-black px-7 py-4 text-sm text-white transition hover:bg-neutral-700"
            >
              Explore Portfolio ↗
            </a>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden bg-neutral-200">
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

      <section id="portfolio" className="border-t border-black/10 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
            Selected Works
          </p>
          <h2 className="mt-4 text-3xl font-medium md:text-5xl">
            Stories worth keeping.
          </h2>
        </div>
      </section>

      <section id="services" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-medium">Our Services</h2>
          <p className="mt-4 text-neutral-500">
            Wedding · Portrait · Event Photography
          </p>
        </div>
      </section>

      <footer id="contact" className="border-t border-black/10 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Pilihin Fotomu
          </p>
          <p className="text-sm text-neutral-500">
            Capturing moments, preserving memories.
          </p>
        </div>
      </footer>
    </main>
  );
}
