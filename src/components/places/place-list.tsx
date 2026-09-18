'use client';

import type { Place } from '@/lib/validation/schemas';
import { PlaceCard } from './place-card';
import { useLanguage } from '@/lib/i18n/language-context';

export function PlaceList({ places }: { places: Place[] }) {
  const { t } = useLanguage();

  if (places.length === 0) {
    return <p className="text-muted-foreground p-4 text-center">{t.placeCard.noMatches}</p>;
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}
