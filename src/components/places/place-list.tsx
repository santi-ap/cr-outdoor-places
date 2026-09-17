import type { Place } from '@/lib/validation/schemas';
import { PlaceCard } from './place-card';

export function PlaceList({ places }: { places: Place[] }) {
  if (places.length === 0) {
    return <p className="text-muted-foreground p-4 text-center">No places match these filters.</p>;
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}
