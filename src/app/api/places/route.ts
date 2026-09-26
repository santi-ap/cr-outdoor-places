import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { placesFilterSchema } from '@/lib/validation/schemas';

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = placesFilterSchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { category, landscape, difficulty, pet_friendly, cost_type, max_distance_m } = parsed.data;

  const supabase = await createServerSupabaseClient();
  let query = supabase.from('places').select('*');

  if (category?.length) query = query.in('category', category);
  // `landscape` is an array column (a place can be more than one) --
  // matches if any selected filter value overlaps it, not `.in()`.
  if (landscape?.length) query = query.overlaps('landscape', landscape);
  if (difficulty?.length) query = query.in('difficulty', difficulty);
  if (pet_friendly?.length) query = query.in('pet_friendly', pet_friendly);
  if (cost_type?.length) query = query.in('cost_type', cost_type);
  if (max_distance_m !== undefined) {
    query = query.not('distance_m', 'is', null).lte('distance_m', max_distance_m);
  }

  const { data, error } = await query.order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ places: data });
}
