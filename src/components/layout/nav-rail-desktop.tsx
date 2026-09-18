'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';
import { AuthStatus } from '@/components/auth/auth-status';
import { LanguageToggle } from '@/components/layout/language-toggle';
import { useLanguage } from '@/lib/i18n/language-context';
import { useVisitedStats } from '@/lib/places/use-visited-count';

export function NavRailDesktop() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { data: stats } = useVisitedStats();

  const items = [
    { label: t.tabBar.explore, href: '/' },
    { label: t.tabBar.myList, href: '/my-list' },
    { label: t.tabBar.suggest, href: '/suggest-place' },
  ];

  return (
    <aside className="bg-rail border-line hidden h-full w-[244px] shrink-0 flex-col border-r lg:flex">
      <Link href="/" className="font-display text-bark p-6 text-xl font-medium">
        {t.brand}
      </Link>

      <nav aria-label="Primary" className="flex flex-col gap-1 px-4">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-control px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-forest text-cream' : 'text-ink-muted hover:text-bark',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-line mt-auto flex flex-col gap-3 border-t p-4">
        {stats && stats.visited > 0 && (
          <p className="text-ink-muted text-xs">
            {stats.visited} {t.navRail.visitedOf} {stats.total} {t.navRail.visitedSuffix}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <LanguageToggle />
        </div>
        <AuthStatus layout="rail" />
      </div>
    </aside>
  );
}
