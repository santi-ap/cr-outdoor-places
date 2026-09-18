import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SuggestionForm } from '@/components/suggestions/suggestion-form';
import type { Place } from '@/lib/validation/schemas';

export default async function SuggestEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: place } = await supabase.from('places').select('*').eq('id', id).maybeSingle();

  if (!place) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex h-full max-w-2xl flex-col gap-4 overflow-y-auto p-4 pb-24 lg:pb-4">
      <Link href={`/places/${place.id}`} className="text-muted-foreground text-sm underline">
        &larr; Back to {place.name}
      </Link>

      <h1 className="text-2xl font-semibold">Suggest an edit</h1>
      <p className="text-muted-foreground text-sm">
        Change only the fields you want to correct — the rest are left as-is.
      </p>

      {user ? (
        <SuggestionForm place={place as unknown as Place} />
      ) : (
        <p className="text-sm">Sign in (top right) to suggest an edit.</p>
      )}
    </main>
  );
}
