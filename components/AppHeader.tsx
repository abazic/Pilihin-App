'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

interface AppHeaderProps {
  navigation?: ReactNode;
  actions?: ReactNode;
}

export default function AppHeader({ navigation, actions }: AppHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full px-4 transition-all duration-300 sm:px-6 ${
        isScrolled
          ? 'bg-[#faf9f6]/90 shadow-sm backdrop-blur-xl dark:bg-[#11110f]/90'
          : 'bg-gradient-to-b from-[#faf9f6]/90 via-[#faf9f6]/55 to-transparent backdrop-blur-[2px] dark:from-[#11110f]/90 dark:via-[#11110f]/55 dark:to-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-3">
          <Link href="/" className="flex w-fit shrink-0 items-center gap-2 leading-tight">
            <img
              src="/instories.svg"
              alt="Logo inStories creative"
              className="h-10 w-7 shrink-0 object-contain transition-[filter] duration-200 dark:invert"
            />
            <span className="flex flex-col">
              <span className="font-raleway text-xl not-italic tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                in<span className="font-bold not-italic">Stories</span> creative
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-3">
            {actions}
            <ThemeToggle />
          </div>
        </div>

        {navigation && (
          <nav className="flex min-h-11 w-full items-center justify-center gap-2 overflow-x-auto px-1 py-2 text-xs whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3 sm:text-sm [&>a]:rounded-full [&>a]:border [&>a]:border-black/10 [&>a]:bg-black/[0.035] [&>a]:px-3 [&>a]:py-2 [&>a]:transition-all [&>a:hover]:border-amber-700/25 [&>a:hover]:bg-amber-700/10 dark:[&>a]:border-white/10 dark:[&>a]:bg-white/[0.06] dark:[&>a:hover]:bg-white/10 [&>span]:rounded-full [&>span]:border [&>span]:border-amber-700/30 [&>span]:bg-amber-700/15 [&>span]:px-3 [&>span]:py-2 [&>span]:font-medium [&>span]:text-amber-800 dark:[&>span]:border-amber-400/25 dark:[&>span]:bg-amber-400/10 dark:[&>span]:text-amber-300 [&>button]:rounded-full [&>button]:border [&>button]:border-black/10 [&>button]:bg-black/[0.035] [&>button]:px-3 [&>button]:py-2 [&>button]:transition-all [&>button:hover]:border-amber-700/25 [&>button:hover]:bg-amber-700/10 dark:[&>button]:border-white/10 dark:[&>button]:bg-white/[0.06] dark:[&>button:hover]:bg-white/10"
          >
            {navigation}
          </nav>
        )}
      </div>
    </header>
  );
}
