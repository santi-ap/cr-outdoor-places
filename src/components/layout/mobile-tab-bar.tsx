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

  // z-[3000]: above both the map's selected-place preview panel (z-2000)
  // and the Explore drawer (z-[2050], see ListDrawer) — this pill needs
  // to stay visible over the fully-expanded drawer's card list, and above
  // the drawer as it rises during the drag from low to full so the pin
  // preview panel doesn't stay visible over it mid-drag.
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[3000] flex justify-center pb-[26px] lg:hidden">
      <div className="pointer-events-auto">
        <TabBarMobile items={items} />
      </div>
    </div>
  );
}
