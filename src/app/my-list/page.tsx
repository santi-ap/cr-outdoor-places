import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MyListClient, type ListItemWithPlace } from '@/components/my-list/my-list-client';

export default async function MyListPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data } = await supabase
    .from('list_items')
    .select('id, status, place:places(*)')
    .order('created_at', { ascending: false });

  const items = (data ?? []) as unknown as ListItemWithPlace[];

  return (
    <main className="mx-auto h-full max-w-2xl overflow-y-auto p-4 pb-24 lg:pb-4">
      <h1 className="mb-4 text-2xl font-semibold">My List</h1>
      <MyListClient items={items} />
    </main>
  );
}
