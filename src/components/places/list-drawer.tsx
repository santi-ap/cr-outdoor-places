'use client';

import { useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from 'react';
import { cn } from 'cn';
import { PlaceCardMobile } from './place-card-mobile';
import { FilterChipCarousel } from './filter-chip-carousel';
import { PlaceSearchInput } from './place-search-input';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  type DrawerState,
  getDrawerStateSnapshot,
  getServerDrawerStateSnapshot,
  subscribeDrawerState,
  setDrawerState,
  LOW_HEIGHT_PX,
} from '@/lib/places/drawer-state';
import type { Place, PlacesFilter } from '@/lib/validation/schemas';

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
  return `calc(100% - ${LOW_HEIGHT_PX}px)`;
}

export function ListDrawer({
  places,
  isLoading,
  savedIds,
  savingPlaceId,
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
  savingPlaceId: string | null;
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
  // results/filter row, filter carousel) and — while fully expanded —
  // the card list below it, so "the whole area" the drawer shows can be
  // dragged, not just the small handle. A gesture only commits to
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
    // Only two states — a drag in either direction just toggles between
    // them, past the release threshold.
    if (delta < 0 && state === 'low') setDrawerState('full');
    else if (delta > 0 && state === 'full') setDrawerState('low');
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
        // z-[2050]: above the map's selected-place preview panel
        // (z-2000, see PlaceMap) — without this, that panel (portaled to
        // document.body, so it isn't naturally behind a later sibling)
        // stays visibly floating on top while the drawer rises past it
        // during the drag from low to full, instead of being covered by
        // the drawer the way a physical sheet would cover it.
        'bg-cream absolute inset-x-0 bottom-0 z-[2050] flex flex-col border',
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
      <div className={cn('flex shrink-0 flex-col', isFull ? 'gap-2.5 pb-2.5' : 'gap-1.5 pb-1.5')} {...dragHandlers}>
        {!isFull && (
          <button
            type="button"
            aria-expanded={isFull}
            aria-label={isFull ? t.browse.mapView : t.browse.listView}
            className="flex cursor-grab items-center justify-center pt-1.5 pb-0.5 active:cursor-grabbing"
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

        <div className={cn('flex items-center gap-2 px-4', isFull ? 'pt-4' : 'pt-0')}>
          <div className="min-w-0 flex-1">
            <PlaceSearchInput value={searchQuery} onChange={onSearchChange} placeholder={t.browse.searchPlaceholder} />
          </div>
          <div
            className={cn(
              'shrink-0 overflow-hidden transition-all duration-200 ease-out',
              isFull ? 'w-[60px] opacity-100' : 'w-0 opacity-0',
            )}
          >
            <button
              type="button"
              onClick={() => setDrawerState('low')}
              className="bg-moss border-moss flex h-11 w-[60px] items-center justify-center rounded-control border text-[13px] font-medium whitespace-nowrap text-[#23281C]"
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

      {/* The resting (low) state hides the card list entirely — just the
          header above (search + filters) shows besides the map itself. */}
      {isFull && (
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-20">
          {isLoading ? (
            <p className="text-ink-muted">{t.browse.loadingPlaces}</p>
          ) : places.length === 0 ? (
            <p className="text-ink-muted">{t.placeCard.noMatches}</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {places.map((place) => (
                <PlaceCardMobile
                  key={place.id}
                  place={place}
                  saved={savedIds?.has(place.id) ?? false}
                  saving={savingPlaceId === place.id}
                  onToggleSave={() => onToggleSave(place.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
