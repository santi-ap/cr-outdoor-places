// Shared, in-memory store for the browser's Geolocation permission/result
// (Issue #82) — modeled as a tiny external store (useSyncExternalStore),
// matching the pattern already used for the Explore drawer's state
// (lib/places/drawer-state.ts), so both the Explore map (which shows a
// "you are here" marker and offers the near-me filter) and a place's
// detail page (which shows "X km away") read the same source of truth
// without asking for permission twice.
//
// Not persisted (sessionStorage etc.) — the browser itself remembers the
// actual permission grant/denial, so a fresh requestUserLocation() call
// after a reload resolves immediately without a new prompt when
// permission was already granted; there's nothing this store needs to
// remember across a reload on its own.
export type UserLocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';
export type UserLocation = { lat: number; lng: number };
export type UserLocationState = { status: UserLocationStatus; location: UserLocation | null };

const IDLE_STATE: UserLocationState = { status: 'idle', location: null };

let state: UserLocationState = IDLE_STATE;
const listeners = new Set<() => void>();

function setState(next: UserLocationState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function getUserLocationSnapshot(): UserLocationState {
  return state;
}

export function getServerUserLocationSnapshot(): UserLocationState {
  return IDLE_STATE;
}

export function subscribeUserLocation(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

// Triggered by an explicit user action (a "use my location" button) —
// never called automatically on page load, since prompting for a
// permission the user didn't ask for is exactly the kind of dark pattern
// this app should avoid.
export function requestUserLocation() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    setState({ status: 'unsupported', location: null });
    return;
  }
  setState({ status: 'requesting', location: null });
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setState({
        status: 'granted',
        location: { lat: position.coords.latitude, lng: position.coords.longitude },
      });
    },
    () => {
      setState({ status: 'denied', location: null });
    },
    { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
  );
}
