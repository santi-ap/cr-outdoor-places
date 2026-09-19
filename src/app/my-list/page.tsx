import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MyListClient, type ListItemWithPlace } from '@/components/my-list/my-list-client';

export default async function MyListPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let items: ListItemWithPlace[] = [];
  if (user) {
    const { data } = await supabase
      .from('list_items')
      .select('id, status, place:places(*)')
      .order('created_at', { ascending: false });
    items = (data ?? []) as unknown as ListItemWithPlace[];
  }

  return (
    <main className="max-lg:no-scrollbar mx-auto h-full max-w-2xl overflow-y-auto p-4 pb-24 lg:pb-4">
      <MyListClient items={items} isSignedIn={!!user} />
    </main>
  );
}
