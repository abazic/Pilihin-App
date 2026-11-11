
import type { ReactNode } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

interface AppHeaderProps {
  children?: ReactNode;
}

export default function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-20 w-full border-b border-black/10 bg-[#faf9f6]/95 px-6 backdrop-blur-md dark:border-white/10 dark:bg-[#11110f]/95">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4">
        <a href="/" className="flex flex-col leading-tight">
          <span className="font-serif text-2xl font-bold italic tracking-tight text-gray-900 dark:text-white">
            Pilihin Fotomu<span className="text-amber-700">.</span>
          </span>
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            by Abazic
          </span>
        </a>

        <div className="flex items-center gap-3">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
