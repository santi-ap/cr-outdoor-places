import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SharedListClient } from '@/components/shared-list/shared-list-client';
import type { Place } from '@/lib/validation/schemas';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SharedListPage({
  searchParams,
}: {
  searchParams: Promise<{ places?: string }>;
}) {
  const { places: placesParam } = await searchParams;
  const placeIds = (placesParam ?? '').split(',').filter((id) => UUID_RE.test(id));

  let places: Place[] = [];
  if (placeIds.length > 0) {
    const supabase = await createServerSupabaseClient();
    // places is publicly readable (RLS "places_select_all") — no auth
    // check needed, this page works for a signed-out visitor following a
    // shared link same as it does for the list's own owner.
    const { data } = await supabase.from('places').select('*').in('id', placeIds);
    // .in() doesn't preserve the given order, so re-sort to match the
    // shared link's own order (My List's newest-saved-first).
    const byId = new Map((data ?? []).map((place) => [place.id, place as unknown as Place]));
    places = placeIds.map((id) => byId.get(id)).filter((place): place is Place => !!place);
  }

  return (
    <main className="max-lg:no-scrollbar mx-auto h-full max-w-2xl overflow-y-auto p-4 pb-24 lg:pb-4">
      <SharedListClient places={places} />
    </main>
  );
}
