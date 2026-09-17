'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function toggleListItemStatus(itemId: string, newStatus: 'saved' | 'visited') {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: 'You must be signed in.' };
  }

  const { error } = await supabase
    .from('list_items')
    .update({
      status: newStatus,
      visited_at: newStatus === 'visited' ? new Date().toISOString() : null,
    })
    .eq('id', itemId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  return { success: true as const };
}

export async function removeListItem(itemId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: 'You must be signed in.' };
  }

  const { error } = await supabase.from('list_items').delete().eq('id', itemId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  return { success: true as const };
}
