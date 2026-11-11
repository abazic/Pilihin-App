import type { ReactNode } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

interface AppHeaderProps {
  navigation?: ReactNode;
  actions?: ReactNode;
}

export default function AppHeader({ navigation, actions }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-20 w-full border-b border-black/10 bg-[#faf9f6]/95 px-6 backdrop-blur-md dark:border-white/10 dark:bg-[#11110f]/95">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Link href="/" className="flex w-fit flex-col leading-tight">
          <span className="font-serif text-2xl font-bold italic tracking-tight text-gray-900 dark:text-white">
            Pilihin Fotomu<span className="text-amber-700">.</span>
          </span>
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            by Abazic
          </span>
        </Link>
        <nav className="hidden items-center justify-center gap-8 text-sm md:flex">
          {navigation}
        </nav>
        <div className="flex items-center justify-end gap-3">
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
