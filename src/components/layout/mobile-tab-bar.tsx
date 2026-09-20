'use client';

import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { TabBarMobile } from '@/components/ui/tab-bar-mobile';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  DOCKED_TAB_BAR_HEIGHT_PX,
  getDrawerStateSnapshot,
  getServerDrawerStateSnapshot,
  subscribeDrawerState,
} from '@/lib/places/drawer-state';

export function MobileTabBar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const drawerState = useSyncExternalStore(subscribeDrawerState, getDrawerStateSnapshot, getServerDrawerStateSnapshot);
  // Only the Explore map (drawer-owning) screen ever docks — everywhere
  // else this stays the usual floating pill, since docking only exists to
  // free up map space while the drawer is pulled all the way down.
  const docked = pathname === '/' && drawerState === 'low';

  const items = [
    { label: t.tabBar.explore, href: '/' },
    { label: t.tabBar.myList, href: '/my-list' },
    { label: t.tabBar.suggest, href: '/suggest-place' },
  ];

  if (docked) {
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
        style={{ height: DOCKED_TAB_BAR_HEIGHT_PX }}
      >
        <TabBarMobile items={items} docked />
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[26px] lg:hidden">
      <div className="pointer-events-auto">
        <TabBarMobile items={items} />
      </div>
    </div>
  );
}
