// One-off connectivity check for Issue #2's acceptance criteria: confirms a
// real insert/select round-trip against `places` via the Supabase client,
// and that RLS still blocks an unauthenticated write to `lists`.
//
// Usage: node --env-file=.env.local scripts/verify-supabase-connection.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const adminClient = createClient(url, serviceKey);
const anonClient = createClient(url, anonKey);

async function main() {
  const { data: inserted, error: insertError } = await adminClient
    .from("places")
    .insert({
      name: "__connection_test__",
      category: "other",
      lat: 0,
      lng: 0,
    })
    .select()
    .single();

  if (insertError) throw new Error(`insert failed: ${insertError.message}`);
  console.log("insert ok:", inserted.id);

  const { data: selected, error: selectError } = await anonClient
    .from("places")
    .select("*")
    .eq("id", inserted.id)
    .single();

  if (selectError) throw new Error(`select failed: ${selectError.message}`);
  console.log("select ok (via anon client, RLS allows public read):", selected.name);

  const { error: blockedError } = await anonClient.from("lists").insert({ name: "hack" });
  if (!blockedError) throw new Error("expected RLS to block unauthenticated insert into lists, but it succeeded");
  console.log("unauthenticated write to lists correctly blocked:", blockedError.message);

  await adminClient.from("places").delete().eq("id", inserted.id);
  console.log("cleanup ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
