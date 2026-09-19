'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { PlaceCardMobile } from './place-card-mobile';
import { ActionButton } from '@/components/ui/action-button';
import { FilterChipCarousel } from './filter-chip-carousel';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Place, PlacesFilter } from '@/lib/validation/schemas';

// How much of the drawer peeks above the bottom edge when collapsed — tall
// enough to show the results count + filters row + a hint of the first
// card, so it reads as "there's a list here, drag up for more" rather than
// a bare bar.
const PEEK_HEIGHT_PX = 320;
// Below this drag distance a release is treated as a tap (toggle state)
// rather than an intentional drag past/short-of the snap threshold.
const TAP_THRESHOLD_PX = 6;
const DRAG_THRESHOLD_PX = 60;

type DrawerState = 'peek' | 'full';

export function ListDrawer({
  places,
  isLoading,
  savedIds,
  onToggleSave,
  resultsLabel,
  filtersLabel,
  onOpenFilters,
  filter,
  onFilterChange,
}: {
  places: Place[];
  isLoading: boolean;
  savedIds: Set<string> | undefined;
  onToggleSave: (placeId: string) => void;
  resultsLabel: string;
  filtersLabel: string;
  onOpenFilters: () => void;
  filter: PlacesFilter;
  onFilterChange: (filter: PlacesFilter) => void;
}) {
  const { t } = useLanguage();
  const [state, setState] = useState<DrawerState>('peek');
  const [isDragging, setIsDragging] = useState(false);
  const [dragDeltaY, setDragDeltaY] = useState(0);
  const startYRef = useRef(0);

  function handlePointerDown(e: ReactPointerEvent<HTMLButtonElement>) {
    setIsDragging(true);
    startYRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!isDragging) return;
    setDragDeltaY(e.clientY - startYRef.current);
  }

  function handlePointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    const delta = dragDeltaY;
    setDragDeltaY(0);
    if (Math.abs(delta) < TAP_THRESHOLD_PX) {
      setState((s) => (s === 'full' ? 'peek' : 'full'));
      return;
    }
    if (state === 'peek' && delta < -DRAG_THRESHOLD_PX) setState('full');
    else if (state === 'full' && delta > DRAG_THRESHOLD_PX) setState('peek');
  }

  const restingTransform = state === 'full' ? '0px' : `calc(100% - ${PEEK_HEIGHT_PX}px)`;

  return (
    <div
      className="rounded-t-[28px] border-line bg-cream absolute inset-x-0 top-6 bottom-0 flex flex-col border shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
      style={{
        transform: `translateY(calc(${restingTransform} + ${dragDeltaY}px))`,
        transition: isDragging ? 'none' : 'transform 220ms ease-out',
      }}
    >
      <button
        type="button"
        aria-expanded={state === 'full'}
        aria-label={state === 'full' ? t.browse.mapView : t.browse.listView}
        className="flex shrink-0 touch-none cursor-grab items-center justify-center pt-3 pb-2 active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setState((s) => (s === 'full' ? 'peek' : 'full'));
          }
        }}
      >
        <span className="bg-line-strong h-1 w-10 rounded-full" />
      </button>

      <div className="flex shrink-0 flex-col gap-3 px-5 pb-3">
        <p className="text-ink-muted text-sm">{resultsLabel}</p>
        <div className="flex items-center gap-2">
          <ActionButton label={filtersLabel} variant="primary" size="desktop" onPress={onOpenFilters} />
          {state === 'full' && (
            <ActionButton label={t.browse.mapView} variant="secondary" size="desktop" onPress={() => setState('peek')} />
          )}
        </div>
        <FilterChipCarousel filter={filter} onChange={onFilterChange} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-24">
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
