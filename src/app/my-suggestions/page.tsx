import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  MySuggestionsClient,
  type SuggestionWithPlace,
} from '@/components/suggestions/my-suggestions-client';

export default async function MySuggestionsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let suggestions: SuggestionWithPlace[] = [];
  if (user) {
    const { data } = await supabase
      .from('place_suggestions')
      .select('id, place_id, changes, status, created_at, place:places(id, name)')
      .order('created_at', { ascending: false });
    suggestions = (data ?? []) as unknown as SuggestionWithPlace[];
  }

  return (
    <main className="max-lg:no-scrollbar mx-auto h-full max-w-2xl overflow-y-auto p-4 pb-24 lg:pb-4">
      <MySuggestionsClient suggestions={suggestions} isSignedIn={!!user} />
    </main>
  );
}
