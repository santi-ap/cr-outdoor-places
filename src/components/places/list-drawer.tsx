'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { PlaceCardMobile } from './place-card-mobile';
import { ActionButton } from '@/components/ui/action-button';
import { FilterChipCarousel } from './filter-chip-carousel';
import { PlaceSearchInput } from './place-search-input';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Place, PlacesFilter } from '@/lib/validation/schemas';

// Three snap points, drag-adjacent only (low <-> peek <-> full), matching
// the order they naturally appear top-to-bottom of a drag gesture.
type DrawerState = 'low' | 'peek' | 'full';

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

function restingHeight(state: DrawerState) {
  if (state === 'full') return 0;
  if (state === 'peek') return PEEK_HEIGHT_PX;
  return LOW_HEIGHT_PX;
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
  const [state, setState] = useState<DrawerState>('peek');
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
      if (state === 'low') setState('peek');
      else if (state === 'peek') setState('full');
    } else {
      if (state === 'full') setState('peek');
      else if (state === 'peek') setState('low');
    }
  }

  const dragHandlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
  };

  return (
    <div
      className="rounded-t-[28px] border-line bg-cream absolute inset-x-0 top-6 bottom-0 flex flex-col border shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
      style={{
        transform: `translateY(calc(100% - ${restingHeight(state)}px + ${dragDeltaY}px))`,
        transition: isDragging ? 'none' : 'transform 220ms ease-out',
      }}
    >
      <div className="flex shrink-0 flex-col gap-3 pb-3" {...dragHandlers}>
        <button
          type="button"
          aria-expanded={state === 'full'}
          aria-label={state === 'full' ? t.browse.mapView : t.browse.listView}
          className="flex cursor-grab items-center justify-center pt-3 pb-1 active:cursor-grabbing"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setState((s) => (s === 'full' ? 'peek' : 'full'));
            }
          }}
        >
          <span className="bg-line-strong h-1 w-10 rounded-full" />
        </button>

        <div className="px-5">
          <PlaceSearchInput value={searchQuery} onChange={onSearchChange} placeholder={t.browse.searchPlaceholder} />
        </div>
        <div className="flex items-center justify-between gap-2 px-5">
          <p className="text-ink-muted text-sm">{resultsLabel}</p>
          {state === 'full' && (
            <ActionButton
              label={t.browse.mapView}
              variant="secondary"
              size="desktop"
              onPress={() => setState('peek')}
              className="shrink-0"
            />
          )}
        </div>
        <div className="px-5">
          <FilterChipCarousel filter={filter} onChange={onFilterChange} onOpenAllFilters={onOpenFilters} />
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto px-5 pb-24"
        style={state !== 'full' ? { touchAction: 'none' } : undefined}
        {...(state !== 'full' ? dragHandlers : {})}
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
