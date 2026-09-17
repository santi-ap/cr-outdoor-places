import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { placesFilterSchema } from '@/lib/validation/schemas';

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = placesFilterSchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { category, difficulty, pet_friendly, cost_type, max_distance_m } = parsed.data;

  const supabase = await createServerSupabaseClient();
  let query = supabase.from('places').select('*');

  if (category) query = query.eq('category', category);
  if (difficulty) query = query.eq('difficulty', difficulty);
  if (pet_friendly) query = query.eq('pet_friendly', pet_friendly);
  if (cost_type) query = query.eq('cost_type', cost_type);
  if (max_distance_m !== undefined) {
    query = query.not('distance_m', 'is', null).lte('distance_m', max_distance_m);
  }

  const { data, error } = await query.order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ places: data });
}
