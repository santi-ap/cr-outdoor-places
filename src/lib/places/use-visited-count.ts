import { useQuery } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

// RLS scopes list_items to rows the caller owns, so visited resolves to 0
// when signed out rather than erroring.
async function fetchVisitedStats(): Promise<{ visited: number; total: number }> {
  const supabase = createBrowserSupabaseClient();
  const [placesResult, visitedResult] = await Promise.all([
    supabase.from('places').select('id', { count: 'exact', head: true }),
    supabase.from('list_items').select('id', { count: 'exact', head: true }).eq('status', 'visited'),
  ]);
  return { total: placesResult.count ?? 0, visited: visitedResult.count ?? 0 };
}

export function useVisitedStats() {
  return useQuery({
    queryKey: ['visited-stats'],
    queryFn: fetchVisitedStats,
  });
}
