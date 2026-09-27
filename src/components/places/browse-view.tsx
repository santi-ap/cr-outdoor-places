'use client';

import { useState, useSyncExternalStore } from 'react';
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
import { isWithinBounds, type MapBounds } from '@/lib/places/map-bounds';
import {
  getDrawerStateSnapshot,
  getServerDrawerStateSnapshot,
  subscribeDrawerState,
} from '@/lib/places/drawer-state';
import {
  getServerUserLocationSnapshot,
  getUserLocationSnapshot,
  subscribeUserLocation,
} from '@/lib/geo/user-location-state';
import { haversineDistanceMeters } from '@/lib/geo/distance';
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
  // Kept separate per layout (not one shared value): mobile and desktop
  // each mount their own PlaceMap simultaneously, switched with a CSS
  // breakpoint rather than an unmount, so at any given viewport width one
  // of the two is only there for the *other* breakpoint — sharing a single
  // bounds value would let that one's (possibly stale) state leak into the
  // layout actually on screen.
  const [mobileMapBounds, setMobileMapBounds] = useState<MapBounds | null>(null);
  const [desktopMapBounds, setDesktopMapBounds] = useState<MapBounds | null>(null);
  const [nearMeRadiusKm, setNearMeRadiusKm] = useState<number | null>(null);
  const userLocationState = useSyncExternalStore(
    subscribeUserLocation,
    getUserLocationSnapshot,
    getServerUserLocationSnapshot,
  );
  const { data: places = [], isLoading } = usePlaces(filter);
  const { data: savedIds } = useSavedPlaceIds();
  const queryClient = useQueryClient();
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const isSignedIn = useIsSignedIn();
  const drawerState = useSyncExternalStore(
    subscribeDrawerState,
    getDrawerStateSnapshot,
    getServerDrawerStateSnapshot,
  );

  const trimmedQuery = normalizeForSearch(searchQuery.trim());
  const searchedPlaces = trimmedQuery
    ? places.filter((place) => normalizeForSearch(place.name).includes(trimmedQuery))
    : places;
  // Straight-line distance from the user (#82) -- only actually narrows
  // results once a radius is picked AND a location has resolved; picking a
  // radius before permission resolves (or after it's denied) is a no-op
  // rather than hiding everything.
  const userLocation = userLocationState.location;
  const visiblePlaces =
    nearMeRadiusKm && userLocation
      ? searchedPlaces.filter(
          (place) => haversineDistanceMeters(userLocation, { lat: place.lat, lng: place.lng }) <= nearMeRadiusKm * 1000,
        )
      : searchedPlaces;

  // The map's own visible area doubles as a filter (#68) — but only while
  // the map itself is actually on screen. On mobile that's the drawer's
  // 'low' state; once it's dragged to 'full' the map is covered by the
  // list, so the area it was last showing shouldn't keep narrowing results
  // you can no longer see it against. Desktop always shows the map
  // alongside the grid, so there it's unconditional.
  const mobileBoundsFilteredPlaces = mobileMapBounds
    ? visiblePlaces.filter((place) => isWithinBounds(place, mobileMapBounds))
    : visiblePlaces;
  const mobilePlaces = drawerState === 'full' ? visiblePlaces : mobileBoundsFilteredPlaces;
  const boundsFilteredPlaces = desktopMapBounds
    ? visiblePlaces.filter((place) => isWithinBounds(place, desktopMapBounds))
    : visiblePlaces;

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
          <PlaceMap places={visiblePlaces} hasDrawer onBoundsChange={setMobileMapBounds} showUserLocation />
        </div>
        <ListDrawer
          places={mobilePlaces}
          isLoading={isLoading}
          savedIds={savedIds}
          savingPlaceId={savingPlaceId}
          onToggleSave={handleToggleSave}
          resultsLabel={`${mobilePlaces.length} ${t.filters.resultsCount}`}
          onOpenFilters={() => setSheetOpen(true)}
          filter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          nearMeRadiusKm={nearMeRadiusKm}
          onNearMeRadiusChange={setNearMeRadiusKm}
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
                  {boundsFilteredPlaces.length} {t.filters.resultsCount}
                </p>
              </div>
              <PlaceSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t.browse.searchPlaceholder}
              />
            </div>

            <div className="rounded-card-lg border-line h-[240px] shrink-0 overflow-hidden border">
              <PlaceMap places={visiblePlaces} onBoundsChange={setDesktopMapBounds} showUserLocation />
            </div>

            {isLoading ? (
              <p className="text-ink-muted">{t.browse.loadingPlaces}</p>
            ) : boundsFilteredPlaces.length === 0 ? (
              <p className="text-ink-muted">{t.placeCard.noMatches}</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                {boundsFilteredPlaces.map((place) => (
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
          <FilterPanelDesktop
            filter={filter}
            onChange={setFilter}
            matchCount={boundsFilteredPlaces.length}
            nearMeRadiusKm={nearMeRadiusKm}
            onNearMeRadiusChange={setNearMeRadiusKm}
          />
        </div>
      </div>

      <FilterSheetMobile
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        filter={filter}
        onChange={setFilter}
        matchCount={mobilePlaces.length}
        nearMeRadiusKm={nearMeRadiusKm}
        onNearMeRadiusChange={setNearMeRadiusKm}
      />

      <SignInRequiredDialog
        open={signInDialogOpen}
        onOpenChange={setSignInDialogOpen}
        message={t.placeActions.signInPrompt}
      />
    </div>
  );
}
