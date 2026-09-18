'use client';

import { TabBarMobile } from '@/components/ui/tab-bar-mobile';
import { useLanguage } from '@/lib/i18n/language-context';

export function MobileTabBar() {
  const { t } = useLanguage();

  const items = [
    { label: t.tabBar.explore, href: '/' },
    { label: t.tabBar.myList, href: '/my-list' },
    { label: t.tabBar.suggest, href: '/suggest-place' },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[26px] lg:hidden">
      <div className="pointer-events-auto">
        <TabBarMobile items={items} />
      </div>
    </div>
  );
}
