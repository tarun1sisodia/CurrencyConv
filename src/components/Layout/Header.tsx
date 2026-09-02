'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/Layout/LanguageSwitcher';
import { Link } from '@/i18n/navigation';

/**
 * Site header with skip link, nav, language and theme controls.
 */
export function Header() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
      <a
        href="#main"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-3 focus:py-2"
      >
        {t('skipToContent')}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-indigo-600 dark:text-indigo-400"
        >
          CurrencyConv
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-4 md:flex">
          <NavLinks />
        </nav>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={t('openMenu')}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <Menu aria-hidden />
          </Button>
        </div>
      </div>
      {open ? (
        <nav aria-label="Mobile" className="border-t px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2" onClick={() => setOpen(false)}>
            <NavLinks />
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function NavLinks() {
  const t = useTranslations('nav');
  return (
    <>
      <Link href="/" className="text-sm font-medium hover:underline">
        {t('home')}
      </Link>
      <Link href="/favorites" className="text-sm font-medium hover:underline">
        {t('favorites')}
      </Link>
      <Link href="/alerts" className="text-sm font-medium hover:underline">
        {t('alerts')}
      </Link>
    </>
  );
}

function ThemeToggle() {
  const t = useTranslations('nav');
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={t('theme')}>
          <Sun className="h-4 w-4 dark:hidden" aria-hidden />
          <Moon className="hidden h-4 w-4 dark:block" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" aria-hidden /> {t('themeLight')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" aria-hidden /> {t('themeDark')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" aria-hidden /> {t('themeSystem')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
