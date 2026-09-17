// Verifies the save-place / mark-visited flow (Issue #7) against the real
// database as an authenticated user, since no sign-in UI exists until
// Issue #8 — creates a throwaway test user, signs in as them, replicates
// the exact queries the savePlace/markVisited server actions run, then
// cleans up.
//
// Usage: node --env-file=.env.local scripts/verify-list-items.mjs
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error('Missing required env vars');
  process.exit(1);
}

const admin = createClient(url, serviceKey);
const testEmail = `test-list-items-${Date.now()}@example.com`;
const testPassword = 'test-password-' + Math.random().toString(36).slice(2);
let userId;

async function main() {
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  });
  if (createError) throw createError;
  userId = created.user.id;
  console.log('created test user:', userId);

  const anon = createClient(url, anonKey);
  const { error: signInError } = await anon.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  if (signInError) throw signInError;
  console.log('signed in as test user');

  const { data: place } = await anon.from('places').select('id').limit(1).single();
  console.log('using place:', place.id);

  // Replicates savePlace: get-or-create list, then insert list_item.
  const { data: list, error: listError } = await anon
    .from('lists')
    .insert({ user_id: userId })
    .select('id')
    .single();
  if (listError) throw listError;
  console.log('created list:', list.id);

  const { error: itemError } = await anon
    .from('list_items')
    .insert({ list_id: list.id, place_id: place.id, status: 'saved' });
  if (itemError) throw itemError;
  console.log('saved place to list');

  const { data: afterSave } = await anon
    .from('list_items')
    .select('status')
    .eq('list_id', list.id)
    .eq('place_id', place.id)
    .single();
  if (afterSave.status !== 'saved') throw new Error('expected status=saved after insert');
  console.log('confirmed status=saved');

  // Replicates markVisited.
  const { error: updateError } = await anon
    .from('list_items')
    .update({ status: 'visited', visited_at: new Date().toISOString() })
    .eq('list_id', list.id)
    .eq('place_id', place.id);
  if (updateError) throw updateError;

  const { data: afterVisit } = await anon
    .from('list_items')
    .select('status, visited_at')
    .eq('list_id', list.id)
    .eq('place_id', place.id)
    .single();
  if (afterVisit.status !== 'visited' || !afterVisit.visited_at) {
    throw new Error('expected status=visited with visited_at set');
  }
  console.log('confirmed status=visited, visited_at set');

  // A different (unauthenticated) client must not see this user's list_item.
  const otherAnon = createClient(url, anonKey);
  const { data: leaked } = await otherAnon.from('list_items').select('id').eq('list_id', list.id);
  if (leaked && leaked.length > 0)
    throw new Error('RLS leak: another session could read this list_item');
  console.log('confirmed RLS blocks other sessions from reading this list_item');

  // Cleanup.
  await admin.from('list_items').delete().eq('list_id', list.id);
  await admin.from('lists').delete().eq('id', list.id);
  await admin.auth.admin.deleteUser(userId);
  console.log('cleanup ok');
}

main().catch(async (err) => {
  console.error(err);
  if (userId) await admin.auth.admin.deleteUser(userId).catch(() => {});
  process.exit(1);
});
