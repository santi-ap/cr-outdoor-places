import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SuggestEditClient } from '@/components/suggestions/suggest-edit-client';
import type { Place } from '@/lib/validation/schemas';

export default async function SuggestEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const [{ data: place }, {
    data: { user },
  }] = await Promise.all([
    supabase.from('places').select('*').eq('id', id).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!place) {
    notFound();
  }

  return <SuggestEditClient place={place as unknown as Place} isSignedIn={!!user} />;
}
