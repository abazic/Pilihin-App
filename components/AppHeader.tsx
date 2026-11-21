import type { ReactNode } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

interface AppHeaderProps {
  navigation?: ReactNode;
  actions?: ReactNode;
}

export default function AppHeader({ navigation, actions }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-[#faf9f6]/95 px-4 backdrop-blur-md dark:border-white/10 dark:bg-[#11110f]/95 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-3">
          <Link href="/" className="flex w-fit shrink-0 items-center gap-2 leading-tight">
            <img
              src="/instories.svg"
              alt="Logo inStories creative"
              className="h-10 w-7 shrink-0 object-contain transition-[filter] duration-200 dark:invert"
            />
            <span className="flex flex-col">
              <span className="font-raleway text-xl italic tracking-tight text-gray-900 dark:text-white sm:text-2xl">
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
          <nav className="flex min-h-11 w-full items-center justify-center gap-5 overflow-x-auto border-t border-black/5 px-1 py-2 text-xs whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark:border-white/10 sm:gap-8 sm:text-sm">
            {navigation}
          </nav>
        )}
      </div>
    </header>
  );
}
