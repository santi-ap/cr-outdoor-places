import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PlaceDetailView } from '@/components/places/place-detail-view';
import type { Place } from '@/lib/validation/schemas';

export default async function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Independent round trips (the place row and the caller's identity) run
  // in parallel — auth.getUser() calls out to the Supabase Auth server to
  // verify the token, so awaiting it after the place query serialized two
  // full network round trips for no reason.
  const [{ data: place }, {
    data: { user },
  }] = await Promise.all([
    supabase.from('places').select('*').eq('id', id).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!place) {
    notFound();
  }

  let initialStatus: 'saved' | 'visited' | null = null;
  if (user) {
    // RLS restricts list_items to rows the caller owns, so a bare filter
    // on place_id is enough to find only this user's item (if any).
    const { data: listItem } = await supabase
      .from('list_items')
      .select('status')
      .eq('place_id', place.id)
      .maybeSingle();
    initialStatus = (listItem?.status as 'saved' | 'visited' | undefined) ?? null;
  }

  return (
    <PlaceDetailView
      place={place as unknown as Place}
      isSignedIn={!!user}
      initialStatus={initialStatus}
    />
  );
}
