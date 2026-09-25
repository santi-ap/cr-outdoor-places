// Verifies the /shared-list public read path (Issue #60): a signed-out
// visitor following a shared My List link can read exactly the shared
// places, with no session at all, relying on the "places_select_all" RLS
// policy rather than any auth check in the page itself.
//
// Usage: node --env-file=.env.local scripts/verify-shared-list.mjs
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error('Missing required env vars');
  process.exit(1);
}

const admin = createClient(url, serviceKey);
const testEmail = `test-shared-list-${Date.now()}@example.com`;
const testPassword = 'test-password-' + Math.random().toString(36).slice(2);
let userId;
let listId;

async function main() {
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  });
  if (createError) throw createError;
  userId = created.user.id;
  console.log('created test user:', userId);

  const owner = createClient(url, anonKey);
  const { error: signInError } = await owner.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  if (signInError) throw signInError;

  const { data: places } = await owner.from('places').select('id').limit(2);
  const [placeA, placeB] = places;

  const { data: list, error: listError } = await owner
    .from('lists')
    .insert({ user_id: userId })
    .select('id')
    .single();
  if (listError) throw listError;
  listId = list.id;

  await owner.from('list_items').insert([
    { list_id: list.id, place_id: placeA.id, status: 'saved' },
    { list_id: list.id, place_id: placeB.id, status: 'visited', visited_at: new Date().toISOString() },
  ]);
  console.log('owner saved 2 places, built the shared link from:', [placeA.id, placeB.id]);

  // The visitor: a completely fresh, signed-out anon client — no session,
  // no cookies, exactly what a stranger clicking the shared link gets.
  const visitor = createClient(url, anonKey);
  const {
    data: { user: visitorUser },
  } = await visitor.auth.getUser();
  if (visitorUser) throw new Error('expected the visitor client to be signed out');

  const { data: sharedPlaces, error: sharedError } = await visitor
    .from('places')
    .select('*')
    .in('id', [placeA.id, placeB.id]);
  if (sharedError) throw sharedError;
  if (sharedPlaces.length !== 2) {
    throw new Error(`expected 2 shared places visible while signed out, got ${sharedPlaces.length}`);
  }
  console.log('confirmed a signed-out visitor can read both shared places by id:', sharedPlaces.map((p) => p.name));

  // The visitor must NOT be able to see the owner's list_items themselves
  // (only the places table is public) — confirms sharing a list doesn't
  // leak who saved what.
  const { data: visibleListItems } = await visitor.from('list_items').select('id').eq('list_id', list.id);
  if ((visibleListItems ?? []).length !== 0) {
    throw new Error('expected the signed-out visitor to see zero list_items rows (RLS should hide them)');
  }
  console.log('confirmed list_items stay owner-only even via a shared link');

  // Cleanup.
  await admin.from('list_items').delete().eq('list_id', listId);
  await admin.from('lists').delete().eq('id', listId);
  await admin.auth.admin.deleteUser(userId);
  console.log('cleanup ok');
}

main().catch(async (err) => {
  console.error(err);
  if (listId) {
    await admin.from('list_items').delete().eq('list_id', listId).catch(() => {});
    await admin.from('lists').delete().eq('id', listId).catch(() => {});
  }
  if (userId) await admin.auth.admin.deleteUser(userId).catch(() => {});
  process.exit(1);
});
