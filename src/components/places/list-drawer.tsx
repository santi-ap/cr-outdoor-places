'use client';

import { useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from 'react';
import { cn } from 'cn';
import { PlaceCardMobile } from './place-card-mobile';
import { FilterChipCarousel } from './filter-chip-carousel';
import { PlaceSearchInput } from './place-search-input';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Place, PlacesFilter } from '@/lib/validation/schemas';

// Three snap points, drag-adjacent only (low <-> peek <-> full), matching
// the order they naturally appear top-to-bottom of a drag gesture.
type DrawerState = 'low' | 'peek' | 'full';

// Persisted across a round trip to a place's detail page and back — the
// drawer otherwise unmounts on navigation and would always reset to
// 'peek'. sessionStorage (not a DB-backed preference) since this is a
// per-tab UI convenience, not something that needs to follow the user
// across devices. Modeled as a tiny external store (read via
// useSyncExternalStore) rather than component state seeded in an effect,
// so the server/first-client-render value ('peek', sessionStorage isn't
// available during SSR) and the real restored value can differ without a
// hydration mismatch — that's exactly what this hook is for.
const DRAWER_STATE_STORAGE_KEY = 'cr-outdoor-places:explore-drawer-state';
const drawerStateListeners = new Set<() => void>();

function isDrawerState(value: string | null): value is DrawerState {
  return value === 'low' || value === 'peek' || value === 'full';
}

function getDrawerStateSnapshot(): DrawerState {
  const stored = sessionStorage.getItem(DRAWER_STATE_STORAGE_KEY);
  return isDrawerState(stored) ? stored : 'peek';
}

function getServerDrawerStateSnapshot(): DrawerState {
  return 'peek';
}

function subscribeDrawerState(onStoreChange: () => void) {
  drawerStateListeners.add(onStoreChange);
  return () => drawerStateListeners.delete(onStoreChange);
}

function setDrawerState(next: DrawerState) {
  sessionStorage.setItem(DRAWER_STATE_STORAGE_KEY, next);
  drawerStateListeners.forEach((listener) => listener());
}

// "peek" (the default) shows the search bar, results count, filter row,
// and a hint of the first card. "low" shows just enough of the header
// (search + filters) for those to stay usable while the map dominates the
// screen — the extra MOBILE_TAB_BAR_CLEARANCE_PX keeps that content clear
// of the floating MobileTabBar pill (~76px reserved the same way
// place-detail-view.tsx's sticky action bar clears it).
const PEEK_HEIGHT_PX = 340;
const MOBILE_TAB_BAR_CLEARANCE_PX = 76;
const LOW_HEIGHT_PX = 190 + MOBILE_TAB_BAR_CLEARANCE_PX;

// A pointer move below this (and not more vertical than horizontal) is
// still a tap/native-scroll candidate, not a drawer drag.
const DRAG_COMMIT_THRESHOLD_PX = 8;
// Once dragging, a release below this snaps back to the state the drag
// started from instead of advancing to the next snap point.
const DRAG_RELEASE_THRESHOLD_PX = 60;

// 'full' isn't just "100% - 0px" (that's translateY(100%), which pushes
// the whole drawer off-screen below the viewport, not fully open) — it
// needs its own translateY(0px) base, since the drawer's own height
// already spans the full container.
function restingTransformBase(state: DrawerState): string {
  if (state === 'full') return '0px';
  if (state === 'peek') return `calc(100% - ${PEEK_HEIGHT_PX}px)`;
  return `calc(100% - ${LOW_HEIGHT_PX}px)`;
}

export function ListDrawer({
  places,
  isLoading,
  savedIds,
  onToggleSave,
  resultsLabel,
  onOpenFilters,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: {
  places: Place[];
  isLoading: boolean;
  savedIds: Set<string> | undefined;
  onToggleSave: (placeId: string) => void;
  resultsLabel: string;
  onOpenFilters: () => void;
  filter: PlacesFilter;
  onFilterChange: (filter: PlacesFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  const { t } = useLanguage();
  const state = useSyncExternalStore(
    subscribeDrawerState,
    getDrawerStateSnapshot,
    getServerDrawerStateSnapshot,
  );

  const [isDragging, setIsDragging] = useState(false);
  const [dragDeltaY, setDragDeltaY] = useState(0);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const activePointerIdRef = useRef<number | null>(null);
  // Mirrors of the two state values above, read/written inside the pointer
  // handlers instead of the state itself: several pointermove events (or a
  // move immediately followed by up) can be dispatched within the same
  // React batch/tick on a fast gesture, and closures in that batch would
  // otherwise see the pre-gesture (stale) state, letting a drag miss its
  // own release and get stuck mid-transform.
  const isDraggingRef = useRef(false);
  const dragDeltaYRef = useRef(0);

  // Drag detection is shared by the header (grab handle, search bar,
  // results/filter row, filter carousel) and — while not fully expanded —
  // the peeking card list below it, so "the whole area" the drawer shows
  // can be dragged, not just the small handle. A gesture only commits to
  // "dragging the sheet" once it moves past a small threshold and is more
  // vertical than horizontal, so plain taps (search input focus, filter
  // chip taps, card links) and the filter carousel's own horizontal
  // scroll are left alone.
  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    startYRef.current = e.clientY;
    startXRef.current = e.clientX;
    activePointerIdRef.current = e.pointerId;
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (activePointerIdRef.current !== e.pointerId) return;
    const deltaY = e.clientY - startYRef.current;
    const deltaX = e.clientX - startXRef.current;
    if (!isDraggingRef.current) {
      if (Math.abs(deltaY) < DRAG_COMMIT_THRESHOLD_PX || Math.abs(deltaY) <= Math.abs(deltaX)) return;
      isDraggingRef.current = true;
      setIsDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    dragDeltaYRef.current = deltaY;
    setDragDeltaY(deltaY);
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (activePointerIdRef.current !== e.pointerId) return;
    activePointerIdRef.current = null;
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    const delta = dragDeltaYRef.current;
    dragDeltaYRef.current = 0;
    setDragDeltaY(0);
    if (Math.abs(delta) < DRAG_RELEASE_THRESHOLD_PX) return;
    if (delta < 0) {
      if (state === 'low') setDrawerState('peek');
      else if (state === 'peek') setDrawerState('full');
    } else {
      if (state === 'full') setDrawerState('peek');
      else if (state === 'peek') setDrawerState('low');
    }
  }

  const dragHandlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
  };

  const isFull = state === 'full';

  return (
    <div
      className={cn(
        'bg-cream absolute inset-x-0 bottom-0 flex flex-col border',
        isFull ? 'top-0 rounded-none border-transparent' : 'top-6 rounded-t-[28px] border-line',
      )}
      style={{
        transform: `translateY(calc(${restingTransformBase(state)} + ${dragDeltaY}px))`,
        boxShadow: isFull ? 'none' : '0 -8px 24px rgba(0,0,0,0.12)',
        transition: isDragging
          ? 'none'
          : 'transform 220ms ease-out, border-radius 200ms ease-out, box-shadow 200ms ease-out',
      }}
    >
      {/* Once fully expanded this reads as a plain full-page list, not a
          floating sheet — no grab handle, no rounded/shadowed drawer look.
          Dragging from anywhere in this header (still not the card list
          below) still collapses it back — the Map button is just a more
          discoverable, explicit way to do the same thing. */}
      <div className="flex shrink-0 flex-col gap-3 pb-3" {...dragHandlers}>
        {!isFull && (
          <button
            type="button"
            aria-expanded={isFull}
            aria-label={isFull ? t.browse.mapView : t.browse.listView}
            className="flex cursor-grab items-center justify-center pt-3 pb-1 active:cursor-grabbing"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // This control only renders while !isFull, so the toggle
                // always means "expand."
                setDrawerState('full');
              }
            }}
          >
            <span className="bg-line-strong h-1 w-10 rounded-full" />
          </button>
        )}

        <div className={cn('flex items-center gap-2 px-5', isFull ? 'pt-5' : 'pt-2')}>
          <div className="min-w-0 flex-1">
            <PlaceSearchInput value={searchQuery} onChange={onSearchChange} placeholder={t.browse.searchPlaceholder} />
          </div>
          <div
            className={cn(
              'shrink-0 overflow-hidden transition-all duration-200 ease-out',
              isFull ? 'w-[68px] opacity-100' : 'w-0 opacity-0',
            )}
          >
            <button
              type="button"
              onClick={() => setDrawerState('peek')}
              className="bg-moss border-moss flex h-11 w-[68px] items-center justify-center rounded-control border text-sm font-medium whitespace-nowrap text-[#23281C]"
            >
              {t.browse.mapView}
            </button>
          </div>
        </div>
        <FilterChipCarousel
          filter={filter}
          onChange={onFilterChange}
          onOpenAllFilters={onOpenFilters}
          resultsLabel={resultsLabel}
        />
      </div>

      <div
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-24"
        style={!isFull ? { touchAction: 'none' } : undefined}
        {...(!isFull ? dragHandlers : {})}
      >
        {isLoading ? (
          <p className="text-ink-muted">{t.browse.loadingPlaces}</p>
        ) : places.length === 0 ? (
          <p className="text-ink-muted">{t.placeCard.noMatches}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {places.map((place) => (
              <PlaceCardMobile
                key={place.id}
                place={place}
                saved={savedIds?.has(place.id) ?? false}
                onToggleSave={() => onToggleSave(place.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
