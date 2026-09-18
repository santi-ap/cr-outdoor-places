'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlaces } from '@/lib/places/use-places';
import { useSavedPlaceIds } from '@/lib/places/use-saved-places';
import { toggleSavedPlace } from '@/app/actions/list-items';
import { PlaceFilters } from './place-filters';
import { PlaceList } from './place-list';
import { PlaceCardMobile } from './place-card-mobile';
import { FilterSheetMobile } from './filter-sheet-mobile';
import { ActionButton } from '@/components/ui/action-button';
import { FilterChip } from '@/components/ui/filter-chip';
import { TabBarMobile } from '@/components/ui/tab-bar-mobile';
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

  const toggleSaved = useMutation({
    mutationFn: (placeId: string) => toggleSavedPlace(placeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-place-ids'] }),
  });

  const tabBarItems = [
    { label: t.tabBar.explore, href: '/' },
    { label: t.tabBar.myList, href: '/my-list' },
    { label: t.tabBar.suggest, href: '/suggest-place' },
  ];

  return (
    <div className="bg-cream h-full">
      {/* Mobile explore screen (<1024px): compact real map + scrollable card
          list, both visible at once — no map/list toggle, per the design. */}
      <div className="flex h-full flex-col lg:hidden">
        <div className="flex flex-col gap-1 p-5 pb-0">
          <h1 className="font-display text-bark text-[28px] leading-[1.1] font-medium">{t.browse.heading}</h1>
          <p className="text-ink-muted text-sm">
            {places.length} {t.filters.resultsCount}
          </p>
        </div>

        <div className="flex shrink-0 gap-2 overflow-x-auto px-5 py-4">
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
        </div>

        <div className="rounded-card border-line mx-5 mb-4 h-[200px] shrink-0 overflow-hidden border">
          <PlaceMap places={places} />
        </div>

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
      </div>

      {/* Desktop explore screen (>=1024px) — restyled per #16. */}
      <div className="hidden h-full flex-col lg:flex">
        <div className="border-line flex items-start justify-between gap-4 border-b p-3">
          <PlaceFilters filter={filter} onChange={setFilter} />
          <ActionButton
            label={t.browse.suggestPlace}
            variant="secondary"
            size="desktop"
            href="/suggest-place"
            className="shrink-0"
          />
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="w-[380px] overflow-y-auto border-r">
            {isLoading ? (
              <p className="text-ink-muted p-4">{t.browse.loadingPlaces}</p>
            ) : (
              <PlaceList places={places} />
            )}
          </div>
          <div className="min-h-0 flex-1">
            <PlaceMap places={places} />
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[26px] lg:hidden">
        <div className="pointer-events-auto">
          <TabBarMobile items={tabBarItems} />
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
