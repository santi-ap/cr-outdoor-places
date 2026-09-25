'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlaces } from '@/lib/places/use-places';
import { useSavedPlaceIds } from '@/lib/places/use-saved-places';
import { toggleSavedPlace } from '@/app/actions/list-items';
import { SignInRequiredDialog } from '@/components/auth/sign-in-required-dialog';
import { useIsSignedIn } from '@/lib/auth/use-is-signed-in';
import { PlaceCardDesktop } from './place-card-desktop';
import { FilterSheetMobile } from './filter-sheet-mobile';
import { FilterPanelDesktop } from './filter-panel-desktop';
import { ListDrawer } from './list-drawer';
import { PlaceSearchInput } from './place-search-input';
import { normalizeForSearch } from '@/lib/places/search';
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
  const [searchQuery, setSearchQuery] = useState('');
  const { data: places = [], isLoading } = usePlaces(filter);
  const { data: savedIds } = useSavedPlaceIds();
  const queryClient = useQueryClient();
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const isSignedIn = useIsSignedIn();

  const trimmedQuery = normalizeForSearch(searchQuery.trim());
  const visiblePlaces = trimmedQuery
    ? places.filter((place) => normalizeForSearch(place.name).includes(trimmedQuery))
    : places;

  const toggleSaved = useMutation({
    mutationFn: (placeId: string) => toggleSavedPlace(placeId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['saved-place-ids'] });
      } else {
        // Signed out — toggleSavedPlace resolves with success:false rather
        // than throwing, so this is the only place that failure surfaces
        // for a session that expired between page load and this tap.
        setSignInDialogOpen(true);
      }
    },
  });

  // Skips the round trip to the server action entirely when we already
  // know (from the local session, no network call) that it's just going
  // to fail with "sign in required" — that's what made the dialog feel
  // slow to appear.
  function handleToggleSave(placeId: string) {
    if (isSignedIn === false) {
      setSignInDialogOpen(true);
      return;
    }
    toggleSaved.mutate(placeId);
  }

  const savingPlaceId = toggleSaved.isPending ? toggleSaved.variables : null;

  return (
    <div className="bg-cream h-full">
      {/* Mobile explore screen (<1024px): full-bleed map with the place
          list living in a drawer that peeks over the bottom of the map and
          can be dragged up to fully cover it — AllTrails-style layout, but
          our own card style and no route-tracking features. Replaces the
          Map/List toggle from #24. */}
      <div className="relative h-full overflow-hidden lg:hidden">
        <div className="absolute inset-0">
          <PlaceMap places={visiblePlaces} hasDrawer />
        </div>
        <ListDrawer
          places={visiblePlaces}
          isLoading={isLoading}
          savedIds={savedIds}
          savingPlaceId={savingPlaceId}
          onToggleSave={handleToggleSave}
          resultsLabel={`${visiblePlaces.length} ${t.filters.resultsCount}`}
          onOpenFilters={() => setSheetOpen(true)}
          filter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Desktop explore screen (>=1024px): nav rail (global, layout.tsx)
          + content column (real map + 3-column card grid) + filter panel. */}
      <div className="hidden h-full overflow-y-auto lg:block">
        <div className="mx-auto flex max-w-[1100px] gap-6 p-8">
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div>
                <h1 className="font-display text-bark text-[32px] leading-[1.05] font-medium">
                  {t.browse.heading}
                </h1>
                <p className="text-ink-muted mt-1 text-[13px]">
                  {visiblePlaces.length} {t.filters.resultsCount}
                </p>
              </div>
              <PlaceSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t.browse.searchPlaceholder}
              />
            </div>

            <div className="rounded-card-lg border-line h-[240px] shrink-0 overflow-hidden border">
              <PlaceMap places={visiblePlaces} />
            </div>

            {isLoading ? (
              <p className="text-ink-muted">{t.browse.loadingPlaces}</p>
            ) : visiblePlaces.length === 0 ? (
              <p className="text-ink-muted">{t.placeCard.noMatches}</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                {visiblePlaces.map((place) => (
                  <PlaceCardDesktop
                    key={place.id}
                    place={place}
                    saved={savedIds?.has(place.id) ?? false}
                    saving={savingPlaceId === place.id}
                    onToggleSave={() => handleToggleSave(place.id)}
                  />
                ))}
              </div>
            )}
          </div>
          <FilterPanelDesktop filter={filter} onChange={setFilter} matchCount={visiblePlaces.length} />
        </div>
      </div>

      <FilterSheetMobile
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        filter={filter}
        onChange={setFilter}
        matchCount={visiblePlaces.length}
      />

      <SignInRequiredDialog
        open={signInDialogOpen}
        onOpenChange={setSignInDialogOpen}
        message={t.placeActions.signInPrompt}
      />
    </div>
  );
}
