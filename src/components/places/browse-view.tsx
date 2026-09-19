'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlaces } from '@/lib/places/use-places';
import { useSavedPlaceIds } from '@/lib/places/use-saved-places';
import { toggleSavedPlace } from '@/app/actions/list-items';
import { PlaceCardDesktop } from './place-card-desktop';
import { FilterSheetMobile } from './filter-sheet-mobile';
import { FilterPanelDesktop } from './filter-panel-desktop';
import { ListDrawer } from './list-drawer';
import { useLanguage } from '@/lib/i18n/language-context';
import type { PlacesFilter } from '@/lib/validation/schemas';

function MapLoadingFallback() {
  const { t } = useLanguage();
  return (
    <div className="text-ink-muted flex h-full items-center justify-center">{t.browse.loadingPlaces}</div>
  );
}

const PlaceMap = dynamic(() => import('./place-map').then((m) => m.PlaceMap), {
  ssr: false,
  loading: () => <MapLoadingFallback />,
});

export function BrowseView() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<PlacesFilter>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: places = [], isLoading } = usePlaces(filter);
  const { data: savedIds } = useSavedPlaceIds();
  const queryClient = useQueryClient();
  const activeFilterCount = Object.keys(filter).length;

  const toggleSaved = useMutation({
    mutationFn: (placeId: string) => toggleSavedPlace(placeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-place-ids'] }),
  });

  return (
    <div className="bg-cream h-full">
      {/* Mobile explore screen (<1024px): full-bleed map with the place
          list living in a drawer that peeks over the bottom of the map and
          can be dragged up to fully cover it — AllTrails-style layout, but
          our own card style and no route-tracking features. Replaces the
          Map/List toggle from #24. */}
      <div className="relative h-full overflow-hidden lg:hidden">
        <div className="absolute inset-0">
          <PlaceMap places={places} />
        </div>
        <ListDrawer
          places={places}
          isLoading={isLoading}
          savedIds={savedIds}
          onToggleSave={(placeId) => toggleSaved.mutate(placeId)}
          resultsLabel={`${places.length} ${t.filters.resultsCount}`}
          filtersLabel={activeFilterCount > 0 ? `${t.browse.filters} (${activeFilterCount})` : t.browse.filters}
          onOpenFilters={() => setSheetOpen(true)}
        />
      </div>

      {/* Desktop explore screen (>=1024px): nav rail (global, layout.tsx)
          + content column (real map + 3-column card grid) + filter panel. */}
      <div className="hidden h-full overflow-y-auto lg:block">
        <div className="mx-auto flex max-w-[1100px] gap-7 p-10">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div>
              <h1 className="font-display text-bark text-[40px] leading-[1.05] font-medium">
                {t.browse.heading}
              </h1>
              <p className="text-ink-muted mt-1.5 text-sm">
                {places.length} {t.filters.resultsCount}
              </p>
            </div>

            <div className="rounded-card-lg border-line h-[300px] shrink-0 overflow-hidden border">
              <PlaceMap places={places} />
            </div>

            {isLoading ? (
              <p className="text-ink-muted">{t.browse.loadingPlaces}</p>
            ) : places.length === 0 ? (
              <p className="text-ink-muted">{t.placeCard.noMatches}</p>
            ) : (
              <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
                {places.map((place) => (
                  <PlaceCardDesktop
                    key={place.id}
                    place={place}
                    saved={savedIds?.has(place.id) ?? false}
                    onToggleSave={() => toggleSaved.mutate(place.id)}
                  />
                ))}
              </div>
            )}
          </div>
          <FilterPanelDesktop filter={filter} onChange={setFilter} matchCount={places.length} />
        </div>
      </div>

      <FilterSheetMobile
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        filter={filter}
        onChange={setFilter}
        matchCount={places.length}
      />
    </div>
  );
}
