'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Map as MapIcon, List as ListIcon, SlidersHorizontal } from 'lucide-react';
import { usePlaces } from '@/lib/places/use-places';
import { PlaceFilters } from './place-filters';
import { PlaceList } from './place-list';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { PlacesFilter } from '@/lib/validation/schemas';

const PlaceMap = dynamic(() => import('./place-map').then((m) => m.PlaceMap), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center">Loading map…</div>,
});

export function BrowseView() {
  const [filter, setFilter] = useState<PlacesFilter>({});
  const [view, setView] = useState<'map' | 'list'>('map');
  const { data: places = [], isLoading } = usePlaces(filter);

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="flex items-center justify-between gap-2 border-b p-3">
        <h1 className="text-lg font-semibold">CR Outdoor Places</h1>
        <div className="flex items-center gap-2">
          <ToggleGroup
            value={[view]}
            onValueChange={(values) => {
              const next = values[0];
              if (next) setView(next as 'map' | 'list');
            }}
            className="md:hidden"
          >
            <ToggleGroupItem value="map" aria-label="Map view">
              <MapIcon className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <ListIcon className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="sm" className="md:hidden" />}>
              <SlidersHorizontal className="size-4" />
              Filters
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <PlaceFilters filter={filter} onChange={setFilter} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="hidden border-b p-3 md:block">
        <PlaceFilters filter={filter} onChange={setFilter} />
      </div>

      <div className="flex min-h-0 flex-1">
        <div
          className={`w-full overflow-y-auto md:block md:w-[380px] md:border-r ${
            view === 'list' ? 'block' : 'hidden'
          }`}
        >
          {isLoading ? (
            <p className="text-muted-foreground p-4">Loading places…</p>
          ) : (
            <PlaceList places={places} />
          )}
        </div>
        <div className={`min-h-0 flex-1 md:block ${view === 'map' ? 'block' : 'hidden'}`}>
          <PlaceMap places={places} />
        </div>
      </div>
    </div>
  );
}
