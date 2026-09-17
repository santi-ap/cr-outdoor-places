'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { placeSuggestionInsertSchema, type PlaceSuggestionInsert } from '@/lib/validation/schemas';

export async function createPlaceSuggestion(
  input: Pick<PlaceSuggestionInsert, 'place_id' | 'changes'>,
) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: 'You must be signed in to suggest a place or edit.' };
  }

  const parsed = placeSuggestionInsertSchema.safeParse({
    ...input,
    suggested_by: user.id,
  });

  if (!parsed.success) {
    return { success: false as const, error: parsed.error.message };
  }

  const { error } = await supabase.from('place_suggestions').insert(parsed.data);

  if (error) {
    return { success: false as const, error: error.message };
  }

  return { success: true as const };
}
