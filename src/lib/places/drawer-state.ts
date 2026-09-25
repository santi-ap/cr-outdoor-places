// Shared, sessionStorage-backed store for the Explore drawer's snap state
// (low/full) — lives outside any single component so both ListDrawer
// (which owns the drag/tap interactions that change it) and PlaceMap
// (which needs to know the drawer's current height so its own floating UI
// can stay clear of it) read/write the same source of truth. Modeled as a
// tiny external store (read via useSyncExternalStore) rather than
// component state seeded in an effect, so the server/first-client-render
// value ('low', sessionStorage isn't available during SSR) and the real
// restored value can differ without a hydration mismatch.
//
// Only two states, deliberately — an earlier third ("peek", between low
// and full) and a further docked/map-maximizing variant of "low" were
// tried and then removed: once the UI itself got denser, the extra snap
// points stopped earning their complexity.
export type DrawerState = 'low' | 'full';

const DRAWER_STATE_STORAGE_KEY = 'cr-outdoor-places:explore-drawer-state';
const drawerStateListeners = new Set<() => void>();

function isDrawerState(value: string | null): value is DrawerState {
  return value === 'low' || value === 'full';
}

export function getDrawerStateSnapshot(): DrawerState {
  const stored = sessionStorage.getItem(DRAWER_STATE_STORAGE_KEY);
  return isDrawerState(stored) ? stored : 'low';
}

export function getServerDrawerStateSnapshot(): DrawerState {
  return 'low';
}

export function subscribeDrawerState(onStoreChange: () => void) {
  drawerStateListeners.add(onStoreChange);
  return () => drawerStateListeners.delete(onStoreChange);
}

export function setDrawerState(next: DrawerState) {
  sessionStorage.setItem(DRAWER_STATE_STORAGE_KEY, next);
  drawerStateListeners.forEach((listener) => listener());
}

// "low" (the resting/default state) shows just the search bar, filter
// row, and results count — no card list — with MobileTabBar floating
// over the map as its usual pill.
export const LOW_HEIGHT_PX = 260;

// How much of the viewport, measured from the bottom, the drawer
// currently covers — used by anything that needs to stay clear of it.
export function getDrawerHeightPx(state: DrawerState): number {
  if (state === 'full') return Number.POSITIVE_INFINITY;
  return LOW_HEIGHT_PX;
}
