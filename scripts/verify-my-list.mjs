// Verifies the My List toggle/remove flow (Issue #9) against the real
// database, replicating the exact queries toggleListItemStatus and
// removeListItem run, since driving the actual UI requires a real magic-link
// email click.
//
// Usage: node --env-file=.env.local scripts/verify-my-list.mjs
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error('Missing required env vars');
  process.exit(1);
}

const admin = createClient(url, serviceKey);
const testEmail = `test-my-list-${Date.now()}@example.com`;
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

  const { data: places } = await anon.from('places').select('id').limit(2);
  const [placeA, placeB] = places;
  console.log('using places:', placeA.id, placeB.id);

  const { data: list, error: listError } = await anon
    .from('lists')
    .insert({ user_id: userId })
    .select('id')
    .single();
  if (listError) throw listError;

  const { data: itemsInserted, error: insertError } = await anon
    .from('list_items')
    .insert([
      { list_id: list.id, place_id: placeA.id, status: 'saved' },
      { list_id: list.id, place_id: placeB.id, status: 'visited', visited_at: new Date().toISOString() },
    ])
    .select('id, status, place:places(id, name)');
  if (insertError) throw insertError;
  console.log('inserted 2 list_items:', itemsInserted.map((i) => `${i.place.name}:${i.status}`));

  // Replicates the My List page's query.
  const { data: fetched, error: fetchError } = await anon
    .from('list_items')
    .select('id, status, place:places(*)')
    .order('created_at', { ascending: false });
  if (fetchError) throw fetchError;
  if (fetched.length !== 2) throw new Error(`expected 2 items, got ${fetched.length}`);
  console.log('confirmed page query returns both items with embedded place data');

  const itemA = fetched.find((i) => i.place.id === placeA.id);

  // Replicates toggleListItemStatus: saved -> visited.
  const { error: toggleError } = await anon
    .from('list_items')
    .update({ status: 'visited', visited_at: new Date().toISOString() })
    .eq('id', itemA.id);
  if (toggleError) throw toggleError;

  const { data: afterToggle } = await anon
    .from('list_items')
    .select('status, visited_at')
    .eq('id', itemA.id)
    .single();
  if (afterToggle.status !== 'visited' || !afterToggle.visited_at) {
    throw new Error('expected status=visited after toggle');
  }
  console.log('confirmed toggle saved -> visited');

  // Toggle back: visited -> saved (visited_at should clear).
  const { error: toggleBackError } = await anon
    .from('list_items')
    .update({ status: 'saved', visited_at: null })
    .eq('id', itemA.id);
  if (toggleBackError) throw toggleBackError;

  const { data: afterToggleBack } = await anon
    .from('list_items')
    .select('status, visited_at')
    .eq('id', itemA.id)
    .single();
  if (afterToggleBack.status !== 'saved' || afterToggleBack.visited_at !== null) {
    throw new Error('expected status=saved with visited_at cleared after toggling back');
  }
  console.log('confirmed toggle visited -> saved, visited_at cleared');

  // Replicates removeListItem.
  const { error: removeError } = await anon.from('list_items').delete().eq('id', itemA.id);
  if (removeError) throw removeError;

  const { data: afterRemove } = await anon.from('list_items').select('id').eq('id', itemA.id);
  if (afterRemove.length !== 0) throw new Error('expected item to be gone after remove');
  console.log('confirmed remove deletes the item');

  const { data: remaining } = await anon.from('list_items').select('id').eq('list_id', list.id);
  if (remaining.length !== 1) throw new Error('expected exactly 1 item left');
  console.log('confirmed the other item is untouched');

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
