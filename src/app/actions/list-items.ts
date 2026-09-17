'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

async function getOrCreateList(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
) {
  const { data: existing } = await supabase
    .from('lists')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from('lists')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (error) throw error;
  return created;
}

export async function savePlace(placeId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: 'You must be signed in to save a place.' };
  }

  try {
    const list = await getOrCreateList(supabase, user.id);

    const { data: existingItem } = await supabase
      .from('list_items')
      .select('id')
      .eq('list_id', list.id)
      .eq('place_id', placeId)
      .maybeSingle();

    if (!existingItem) {
      const { error } = await supabase
        .from('list_items')
        .insert({ list_id: list.id, place_id: placeId, status: 'saved' });
      if (error) throw error;
    }

    return { success: true as const, status: 'saved' as const };
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function markVisited(placeId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: 'You must be signed in to mark a place visited.' };
  }

  const { data: list } = await supabase
    .from('lists')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!list) {
    return { success: false as const, error: 'Save this place before marking it visited.' };
  }

  const { error } = await supabase
    .from('list_items')
    .update({ status: 'visited', visited_at: new Date().toISOString() })
    .eq('list_id', list.id)
    .eq('place_id', placeId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  return { success: true as const, status: 'visited' as const };
}
