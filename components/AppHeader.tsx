'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

interface AppHeaderProps {
  navigation?: ReactNode;
  actions?: ReactNode;
}

export default function AppHeader({ navigation, actions }: AppHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const nav = document.querySelector('header nav');
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll('a'));
    const markActive = (key: string) => {
      links.forEach((link) => {
        const href = link.getAttribute('href') || '';
        const linkKey = href === '/' ? 'home' : href.replace(/^\/#?/, '').split('#').pop() || '';
        link.dataset.active = linkKey === key ? 'true' : 'false';
      });
    };
    if (pathname !== '/') {
      markActive(pathname.slice(1));
      return;
    }
    const sections = ['portfolio', 'services', 'contact'].map((id) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    markActive('home');
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target instanceof HTMLElement) markActive(visible.target.id);
    }, { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5] });
    sections.forEach((section) => observer.observe(section));
    const handleTop = () => { if (window.scrollY < 120) markActive('home'); };
    window.addEventListener('scroll', handleTop, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener('scroll', handleTop); };
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full px-4 transition-all duration-300 sm:px-6 ${
        isScrolled
          ? 'border-b border-black/5 bg-[#faf9f6]/65 shadow-sm backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-[#11110f]/65'
          : 'bg-gradient-to-b from-[#faf9f6]/90 via-[#faf9f6]/55 to-transparent backdrop-blur-[2px] dark:from-[#11110f]/90 dark:via-[#11110f]/55 dark:to-transparent'
      }`}
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-3">
          <Link href="/" className="flex w-fit shrink-0 items-center gap-2 leading-tight">
            <img src="/instories.svg" alt="Logo inStories creative" className="h-10 w-7 shrink-0 object-contain transition-[filter] duration-200 dark:invert" />
            <span className="flex flex-col">
              <span className="font-raleway text-xl not-italic tracking-tight text-amber-700 dark:text-amber-400 sm:text-2xl">in<span className="font-bold not-italic">Stories</span> <span className="text-gray-900 dark:text-white">creative</span></span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-3">
            {actions}
            <ThemeToggle />
          </div>
        </div>
        {navigation && (
          <nav className="flex min-h-11 w-full items-center justify-start gap-2 overflow-x-auto px-1 py-2 text-xs whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 sm:gap-3 sm:text-sm md:absolute md:left-1/2 md:top-1/2 md:min-h-0 md:w-auto md:justify-center md:-translate-x-1/2 md:-translate-y-1/2 md:px-0 md:py-0 [&>a]:rounded-full [&>a]:border [&>a]:border-black/10 [&>a]:bg-black/[0.035] [&>a]:px-3 [&>a]:py-2 [&>a]:transition-all [&>a:hover]:border-amber-700/25 [&>a:hover]:bg-amber-700/10 dark:[&>a]:border-white/10 dark:[&>a]:bg-white/[0.06] dark:[&>a:hover]:bg-white/10 [&>span]:rounded-full [&>span]:border [&>span]:border-amber-700/30 [&>span]:bg-amber-700/15 [&>span]:px-3 [&>span]:py-2 [&>span]:font-medium [&>span]:text-amber-800 dark:[&>span]:border-amber-400/25 dark:[&>span]:bg-amber-400/10 dark:[&>span]:text-amber-300 [&>button]:rounded-full [&>button]:border [&>button]:border-black/10 [&>button]:bg-black/[0.035] [&>button]:px-3 [&>button]:py-2 [&>button]:transition-all [&>button:hover]:border-amber-700/25 [&>button:hover]:bg-amber-700/10 dark:[&>button]:border-white/10 dark:[&>button]:bg-white/[0.06] dark:[&>button:hover]:bg-white/10 [&>a[data-active=true]]:border-amber-700/30 [&>a[data-active=true]]:bg-amber-700/15 [&>a[data-active=true]]:font-medium [&>a[data-active=true]]:text-amber-800 dark:[&>a[data-active=true]]:border-amber-400/25 dark:[&>a[data-active=true]]:bg-amber-400/10 dark:[&>a[data-active=true]]:text-amber-300">
            {navigation}
          </nav>
        )}
      </div>
    </header>
  );
}
