'use client';

import Link from 'next/link';
import { AuthStatus } from '@/components/auth/auth-status';
import { LanguageToggle } from '@/components/layout/language-toggle';
import { useLanguage } from '@/lib/i18n/language-context';

export function SiteHeader() {
  const { t } = useLanguage();

  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b p-3 lg:hidden">
      <Link href="/" className="font-display text-lg font-semibold">
        {t.brand}
      </Link>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <AuthStatus />
      </div>
    </header>
  );
}
