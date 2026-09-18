'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlaces } from '@/lib/places/use-places';
import { useSavedPlaceIds } from '@/lib/places/use-saved-places';
import { toggleSavedPlace } from '@/app/actions/list-items';
import { PlaceCardMobile } from './place-card-mobile';
import { PlaceCardDesktop } from './place-card-desktop';
import { FilterSheetMobile } from './filter-sheet-mobile';
import { FilterPanelDesktop } from './filter-panel-desktop';
import { ActionButton } from '@/components/ui/action-button';
import { FilterChip } from '@/components/ui/filter-chip';
import { ViewToggle, type BrowseView as BrowseViewMode } from './view-toggle';
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
  const [mobileView, setMobileView] = useState<BrowseViewMode>('map');
  const { data: places = [], isLoading } = usePlaces(filter);
  const { data: savedIds } = useSavedPlaceIds();
  const queryClient = useQueryClient();

  const toggleSaved = useMutation({
    mutationFn: (placeId: string) => toggleSavedPlace(placeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-place-ids'] }),
  });

  return (
    <div className="bg-cream h-full">
      {/* Mobile explore screen (<1024px): a Map/List toggle switches between
          a full-height map and a full-height list — showing a compact map
          alongside the list at once left too little room for list items on
          an actual phone. */}
      <div className="flex h-full flex-col lg:hidden">
        <div className="flex flex-col gap-1 p-5 pb-0">
          <h1 className="font-display text-bark text-[28px] leading-[1.1] font-medium">{t.browse.heading}</h1>
          <p className="text-ink-muted text-sm">
            {places.length} {t.filters.resultsCount}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 overflow-x-auto px-5 py-4">
          <ActionButton
            label={t.browse.filters}
            variant="primary"
            size="desktop"
            onPress={() => setSheetOpen(true)}
          />
          <FilterChip
            label={t.filters.petsQuick}
            active={filter.pet_friendly === 'yes'}
            size="mobile"
            onToggle={() =>
              setFilter((f) => ({ ...f, pet_friendly: f.pet_friendly === 'yes' ? undefined : 'yes' }))
            }
          />
          <ViewToggle
            view={mobileView}
            onChange={setMobileView}
            mapLabel={t.browse.mapView}
            listLabel={t.browse.listView}
          />
        </div>

        {mobileView === 'map' ? (
          <div className="rounded-card border-line mx-5 mb-4 min-h-0 flex-1 overflow-hidden border">
            <PlaceMap places={places} />
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-32">
            {isLoading ? (
              <p className="text-ink-muted">{t.browse.loadingPlaces}</p>
            ) : places.length === 0 ? (
              <p className="text-ink-muted">{t.placeCard.noMatches}</p>
            ) : (
              places.map((place) => (
                <PlaceCardMobile
                  key={place.id}
                  place={place}
                  saved={savedIds?.has(place.id) ?? false}
                  onToggleSave={() => toggleSaved.mutate(place.id)}
                />
              ))
            )}
          </div>
        )}
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
