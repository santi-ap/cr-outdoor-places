'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';

export type TabBarItem = {
  label: string;
  href: string;
};

export function TabBarMobile({ items }: { items: TabBarItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="border-line-strong bg-cream mx-auto flex w-fit items-center gap-1 rounded-pill border p-1 shadow-lg"
    >
      {items.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-pill px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200',
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
