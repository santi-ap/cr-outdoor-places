import { useQuery } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

// RLS scopes list_items to rows the caller owns, so this naturally resolves
// to an empty set when signed out rather than erroring.
async function fetchSavedPlaceIds(): Promise<Set<string>> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase.from('list_items').select('place_id');
  return new Set((data ?? []).map((row) => row.place_id));
}

export function useSavedPlaceIds() {
  return useQuery({
    queryKey: ['saved-place-ids'],
    queryFn: fetchSavedPlaceIds,
  });
}
