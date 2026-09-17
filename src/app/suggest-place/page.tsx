import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SuggestionForm } from '@/components/suggestions/suggestion-form';

export default async function SuggestPlacePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex h-full max-w-2xl flex-col gap-4 overflow-y-auto p-4">
      <Link href="/" className="text-muted-foreground text-sm underline">
        &larr; Back to map
      </Link>

      <h1 className="text-2xl font-semibold">Suggest a new place</h1>
      <p className="text-muted-foreground text-sm">
        Know a great outdoor spot that isn&apos;t listed? Fill in what you know — it&apos;ll be
        reviewed before it goes live.
      </p>

      {user ? (
        <SuggestionForm />
      ) : (
        <p className="text-sm">Sign in (top right) to suggest a place.</p>
      )}
    </main>
  );
}
