import type { ReactNode } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

interface AppHeaderProps {
  navigation?: ReactNode;
  actions?: ReactNode;
}

export default function AppHeader({ navigation, actions }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-[#faf9f6]/95 px-3 backdrop-blur-md dark:border-white/10 dark:bg-[#11110f]/95 sm:px-6">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 md:flex-nowrap md:gap-6 md:py-0">
        <Link href="/" className="flex w-fit shrink-0 flex-col leading-tight">
          <span className="font-serif text-xl font-bold italic tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            Pilihin Fotomu<span className="text-amber-700">.</span>
          </span>
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            by Abazic
          </span>
        </Link>

        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-3">
          {actions}
          <ThemeToggle />
        </div>

        {navigation && (
          <nav className="order-3 -mx-1 flex w-[calc(100%+0.5rem)] min-w-0 items-center justify-start gap-5 overflow-x-auto px-1 pb-1 text-xs whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:order-none md:mx-0 md:w-auto md:flex-1 md:justify-center md:gap-8 md:overflow-visible md:pb-0 md:text-sm">
            {navigation}
          </nav>
        )}
      </div>
    </header>
  );
}
