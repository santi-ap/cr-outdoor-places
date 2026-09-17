// Verifies the suggest-a-place / suggest-an-edit flow (Issue #10) against
// the real database, replicating the exact insert createPlaceSuggestion
// runs for both a new-place suggestion (place_id: null) and an edit
// suggestion (place_id set, partial changes).
//
// place_suggestions intentionally has no select policy for authenticated
// users (Section 4: only the service role can read them back, no admin UI
// yet), which also means an insert can't chain `.select()` as that user —
// PostgREST's INSERT...RETURNING needs a SELECT policy to read the row it
// just wrote. createPlaceSuggestion already avoids this (plain `.insert()`,
// no `.select()`); this script assigns its own client-side ids so it can
// look the rows up afterwards via the service-role client, the same way a
// real moderation pass would.
//
// Usage: node --env-file=.env.local scripts/verify-place-suggestions.mjs
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error('Missing required env vars');
  process.exit(1);
}

const admin = createClient(url, serviceKey);
const testEmail = `test-suggestions-${Date.now()}@example.com`;
const testPassword = 'test-password-' + Math.random().toString(36).slice(2);
let userId;
const editId = randomUUID();
const newPlaceId = randomUUID();

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

  const { data: place } = await anon.from('places').select('id, name').limit(1).single();
  console.log('using place:', place.name);

  // Replicates createPlaceSuggestion for "suggest an edit" — plain insert,
  // no `.select()` chained (see header comment for why).
  const editChanges = { hours_text: '6am-6pm daily (verified on site)' };
  const { error: editError } = await anon
    .from('place_suggestions')
    .insert({ id: editId, place_id: place.id, suggested_by: userId, changes: editChanges });
  if (editError) throw editError;
  console.log('inserted edit suggestion:', editId);

  // Replicates createPlaceSuggestion for "suggest a new place".
  const newPlaceChanges = {
    name: 'Test Verify Place',
    category: 'municipal_park',
    lat: 9.9,
    lng: -84.1,
  };
  const { error: newError } = await anon
    .from('place_suggestions')
    .insert({ id: newPlaceId, place_id: null, suggested_by: userId, changes: newPlaceChanges });
  if (newError) throw newError;
  console.log('inserted new-place suggestion:', newPlaceId);

  // Confirm shape via the service-role client (mirrors the moderation path).
  const { data: rows, error: readError } = await admin
    .from('place_suggestions')
    .select('id, place_id, suggested_by, changes, status')
    .in('id', [editId, newPlaceId]);
  if (readError) throw readError;
  if (rows.length !== 2) throw new Error(`expected 2 rows, got ${rows.length}`);

  const editRow = rows.find((r) => r.id === editId);
  if (editRow.place_id !== place.id) throw new Error('expected edit suggestion place_id to match');
  if (editRow.suggested_by !== userId) throw new Error('expected suggested_by to match test user');
  if (editRow.status !== 'pending') throw new Error('expected status=pending by default');
  if (editRow.changes.hours_text !== editChanges.hours_text)
    throw new Error('expected edit changes to round-trip correctly');
  console.log('confirmed edit suggestion row shape');

  const newRow = rows.find((r) => r.id === newPlaceId);
  if (newRow.place_id !== null) throw new Error('expected new-place suggestion place_id to be null');
  if (
    newRow.changes.name !== newPlaceChanges.name ||
    newRow.changes.category !== newPlaceChanges.category
  ) {
    throw new Error('expected new-place changes to round-trip correctly');
  }
  console.log('confirmed new-place suggestion row shape');

  // An authenticated (non-owner) client must not be able to read
  // suggestions back — no select policy exists for anon/authenticated.
  const { data: leaked, error: leakError } = await anon
    .from('place_suggestions')
    .select('id')
    .eq('id', editId);
  if (leakError) throw leakError;
  if (leaked.length > 0) throw new Error('RLS leak: authenticated client could read place_suggestions');
  console.log('confirmed RLS blocks authenticated read of place_suggestions');

  // Cleanup.
  await admin.from('place_suggestions').delete().in('id', [editId, newPlaceId]);
  await admin.auth.admin.deleteUser(userId);
  console.log('cleanup ok');
}

main().catch(async (err) => {
  console.error(err);
  if (userId) await admin.auth.admin.deleteUser(userId).catch(() => {});
  process.exit(1);
});
