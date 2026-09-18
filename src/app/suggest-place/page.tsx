import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SuggestPlaceClient } from '@/components/suggestions/suggest-place-client';

export default async function SuggestPlacePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <SuggestPlaceClient isSignedIn={!!user} />;
}
