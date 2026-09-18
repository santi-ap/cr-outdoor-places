import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PlaceDetailView } from '@/components/places/place-detail-view';
import type { Place } from '@/lib/validation/schemas';

export default async function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: place } = await supabase.from('places').select('*').eq('id', id).maybeSingle();

  if (!place) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
