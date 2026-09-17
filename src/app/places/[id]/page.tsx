import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PlaceActions } from '@/components/places/place-actions';
import { Badge } from '@/components/ui/badge';
import {
  categoryLabels,
  costTypeLabels,
  difficultyLabels,
  petFriendlyLabels,
  terrainLabels,
} from '@/lib/places/labels';

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
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <Link href="/" className="text-muted-foreground text-sm underline">
        &larr; Back to map
      </Link>

      <h1 className="text-2xl font-semibold">{place.name}</h1>
      {place.description && <p className="text-muted-foreground">{place.description}</p>}

      <div className="flex flex-wrap gap-2">
        <Badge>{categoryLabels[place.category] ?? place.category}</Badge>
        {place.difficulty && <Badge variant="outline">{difficultyLabels[place.difficulty]}</Badge>}
        {place.terrain && <Badge variant="outline">{terrainLabels[place.terrain]}</Badge>}
        <Badge variant="outline">{costTypeLabels[place.cost_type]}</Badge>
        <Badge variant="outline">{petFriendlyLabels[place.pet_friendly]}</Badge>
        {place.confidence === 'unverified' && (
          <Badge variant="destructive">Unverified details</Badge>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Province</dt>
        <dd>{place.province ?? '—'}</dd>

        <dt className="text-muted-foreground">Canton</dt>
        <dd>{place.canton ?? '—'}</dd>

        <dt className="text-muted-foreground">Distance</dt>
        <dd>{place.distance_m ? `${place.distance_m} m` : '—'}</dd>

        <dt className="text-muted-foreground">Duration</dt>
        <dd>{place.duration_min ? `${place.duration_min} min` : '—'}</dd>

        <dt className="text-muted-foreground">Cost</dt>
        <dd>{place.cost_amount ?? costTypeLabels[place.cost_type]}</dd>

        <dt className="text-muted-foreground">Hours</dt>
        <dd>{place.hours_text ?? '—'}</dd>
      </dl>

      <PlaceActions placeId={place.id} isSignedIn={!!user} initialStatus={initialStatus} />

      <Link
        href={`/places/${place.id}/suggest-edit`}
        className="text-muted-foreground text-sm underline"
      >
        Suggest an edit
      </Link>
    </main>
  );
}
