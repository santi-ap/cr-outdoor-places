import { useQuery } from '@tanstack/react-query';
import type { Place, PlacesFilter } from '@/lib/validation/schemas';

async function fetchPlaces(filter: PlacesFilter): Promise<Place[]> {
  const params = new URLSearchParams();
  if (filter.category?.length) params.set('category', filter.category.join(','));
  if (filter.landscape?.length) params.set('landscape', filter.landscape.join(','));
  if (filter.difficulty?.length) params.set('difficulty', filter.difficulty.join(','));
  if (filter.pet_friendly?.length) params.set('pet_friendly', filter.pet_friendly.join(','));
  if (filter.cost_type?.length) params.set('cost_type', filter.cost_type.join(','));
  if (filter.max_distance_m !== undefined) {
    params.set('max_distance_m', String(filter.max_distance_m));
  }

  const response = await fetch(`/api/places?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to load places');
  }
  const { places } = await response.json();
  return places;
}

export function usePlaces(filter: PlacesFilter) {
  return useQuery({
    queryKey: ['places', filter],
    queryFn: () => fetchPlaces(filter),
  });
}
