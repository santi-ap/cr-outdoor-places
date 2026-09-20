'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';

export type TabBarItem = {
  label: string;
  href: string;
};

// docked: the low-drawer-state Explore layout flushes this to a full-width
// bar attached to the screen's bottom edge instead of the usual floating
// rounded pill, to give the map as much room as possible (see
// MobileTabBar).
export function TabBarMobile({ items, docked = false }: { items: TabBarItem[]; docked?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'border-line-strong bg-cream flex items-center',
        docked
          ? 'w-full justify-around border-t px-2 py-2'
          : 'mx-auto w-fit gap-1 rounded-pill border p-1 shadow-lg',
      )}
    >
      {items.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-pill px-3.5 py-2 text-[13px] font-medium whitespace-nowrap transition-colors duration-200',
              active ? 'bg-forest text-cream' : 'text-ink-muted hover:text-bark',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
