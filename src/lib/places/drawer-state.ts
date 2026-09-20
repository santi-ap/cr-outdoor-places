// Shared, sessionStorage-backed store for the Explore drawer's snap state
// (low/peek/full) — lives outside any single component so both ListDrawer
// (which owns the drag/tap interactions that change it) and PlaceMap
// (which needs to know the drawer's current height so its own floating UI
// can stay clear of it) read/write the same source of truth. Modeled as a
// tiny external store (read via useSyncExternalStore) rather than
// component state seeded in an effect, so the server/first-client-render
// value ('peek', sessionStorage isn't available during SSR) and the real
// restored value can differ without a hydration mismatch.
export type DrawerState = 'low' | 'peek' | 'full';

const DRAWER_STATE_STORAGE_KEY = 'cr-outdoor-places:explore-drawer-state';
const drawerStateListeners = new Set<() => void>();

function isDrawerState(value: string | null): value is DrawerState {
  return value === 'low' || value === 'peek' || value === 'full';
}

export function getDrawerStateSnapshot(): DrawerState {
  const stored = sessionStorage.getItem(DRAWER_STATE_STORAGE_KEY);
  return isDrawerState(stored) ? stored : 'peek';
}

export function getServerDrawerStateSnapshot(): DrawerState {
  return 'peek';
}

export function subscribeDrawerState(onStoreChange: () => void) {
  drawerStateListeners.add(onStoreChange);
  return () => drawerStateListeners.delete(onStoreChange);
}

export function setDrawerState(next: DrawerState) {
  sessionStorage.setItem(DRAWER_STATE_STORAGE_KEY, next);
  drawerStateListeners.forEach((listener) => listener());
}

// "peek" shows the search bar, results count, filter row, and a hint of
// the first card, with MobileTabBar floating over the map as its usual
// pill. "low" hides the card list entirely and docks MobileTabBar to a
// full-width bar flush with the screen's bottom edge (see MobileTabBar)
// instead, to maximize visible map — the drawer only needs to clear that
// docked bar's own height, not the floating pill's separate clearance.
export const PEEK_HEIGHT_PX = 340;
export const LOW_CONTENT_HEIGHT_PX = 190;
export const DOCKED_TAB_BAR_HEIGHT_PX = 64;
export const LOW_HEIGHT_PX = LOW_CONTENT_HEIGHT_PX + DOCKED_TAB_BAR_HEIGHT_PX;

// How much of the viewport, measured from the bottom, the drawer
// currently covers — used by anything that needs to stay clear of it.
export function getDrawerHeightPx(state: DrawerState): number {
  if (state === 'full') return Number.POSITIVE_INFINITY;
  if (state === 'peek') return PEEK_HEIGHT_PX;
  return LOW_HEIGHT_PX;
}
