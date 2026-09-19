// Seeds the `places` table with the starting set from Section 5 of the
// build plan. Re-running this script is safe: it deletes existing
// source='seed' rows first, so it never creates duplicates.
//
// Coordinates/hours/fees below reflect a one-time web check done when this
// script was written — `confidence` is 'verified' only where a specific,
// credible source was found for hours + fee + coordinates together;
// otherwise 'unverified'. A follow-up pass should reconfirm hours and
// entrance fees before this goes in front of real users, since park
// hours/fees change and some data here is necessarily approximate
// (noted per-place below).
//
// Two corrections from the original plan's Section 5 table, found during
// this web check:
//  - Ojo de Agua (San Antonio de Belén) is in Heredia province, not
//    Alajuela — Belén canton belongs to Heredia.
//  - "Bosque del Niño (Recreo Verde)" conflated two unrelated places:
//    Bosque del Niño (a.k.a. the Grecia Forest Reserve) is in San Isidro
//    de Grecia, Alajuela; Recreo Verde is a separate hot-springs resort
//    elsewhere in Alajuela. Seeded the actual Bosque del Niño / Grecia
//    Forest Reserve and dropped the "(Recreo Verde)" name.
//
// Usage: npm run seed  (runs via tsx --env-file=.env.local)
import { createClient } from '@supabase/supabase-js';
import { placeInsertSchema, type PlaceInsert } from '../src/lib/validation/schemas';
import type { Database } from '../src/lib/supabase/database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey);

// Mock/display-only ratings and reviews (Issue #36) — no submission form,
// no per-user rows, generated deterministically per place (same seed run
// always produces the same content) so every place gets a plausible-looking
// but clearly-fabricated rating and a couple of reviews, varied by author
// and phrasing so they don't read as copy-pasted across cards.
const REVIEW_AUTHORS = [
  'Mariana G.',
  'Carlos R.',
  'Ana L.',
  'Diego M.',
  'Sofía P.',
  'Luis T.',
  'Valentina C.',
  'Andrés Q.',
  'Camila S.',
  'Jorge H.',
];

const REVIEW_TEMPLATES: ((name: string) => string)[] = [
  (name) => `Beautiful spot — ${name} was well worth the visit. Would come back.`,
  (name) => `Nice place to spend a few hours. ${name} has good paths and it wasn't too crowded.`,
  (name) => `Loved it! ${name} exceeded expectations, especially the views.`,
  (name) => `Solid choice for a day trip — parking near ${name} was easy to find.`,
  (name) => `A bit more crowded than expected, but ${name} is still worth seeing.`,
  (name) => `Great for families — ${name} has easy paths and clean facilities.`,
  (name) => `Went early morning and had ${name} almost to ourselves. Highly recommend.`,
];

function mockReviewsFor(index: number, name: string): { rating: number; reviews: PlaceInsert['reviews'] } {
  const reviewCount = 2 + (index % 2);
  const reviews = Array.from({ length: reviewCount }, (_, i) => ({
    author: REVIEW_AUTHORS[(index * 3 + i) % REVIEW_AUTHORS.length],
    rating: 3 + ((index + i * 2) % 3),
    text: REVIEW_TEMPLATES[(index * 5 + i * 2) % REVIEW_TEMPLATES.length](name),
  }));
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return { rating: Math.round(average * 10) / 10, reviews };
}

const BASE_PLACES: PlaceInsert[] = [
  {
    // Source: pre-verified in the build plan (Section 5). Hours are the
    // commonly cited range for this park; not independently confirmed.
    name: 'Parque Metropolitano La Sabana',
    description:
      '72-hectare urban park in the heart of San José — flat, paved paths, lake, and open lawns.',
    category: 'municipal_park',
    province: 'San José',
    canton: 'San José',
    lat: 9.9356,
    lng: -84.1042,
    difficulty: 'easy',
    terrain: 'paved',
    distance_m: 3400,
    duration_min: 45,
    cost_type: 'free',
    cost_amount: null,
    pet_friendly: 'unknown',
    hours_text: 'Daily, approx. 5:00 a.m.–10:00 p.m.',
    source: 'seed',
    confidence: 'verified',
  },
  {
    // Source: La Nación, IguanaGo, Montes de Oca municipality. Coordinates
    // approximate (Sabanilla district center) — exact park coords not found.
    name: 'Parque del Este',
    description:
      'Municipal park in Montes de Oca, popular for walking and running; free entry 5–8am for exercisers.',
    category: 'municipal_park',
    province: 'San José',
    canton: 'Montes de Oca',
    lat: 9.9431,
    lng: -84.0332,
    difficulty: 'easy',
    terrain: 'paved',
    distance_m: 1500,
    duration_min: 25,
    cost_type: 'paid',
    cost_amount: '₡1,000 (free 5–8am for exercisers; free for under-12s and 65+)',
    pet_friendly: 'yes',
    hours_text: 'Tue–Sun 8:00 a.m.–4:00 p.m. (closed Mon); free early entry 5–8am',
    source: 'seed',
    confidence: 'unverified',
  },
  {
    // Source: Belén municipality, La Nación history piece. Exact fee/hours
    // not found in this pass — flagged unverified.
    name: 'Ojo de Agua',
    description:
      "Costa Rica's oldest water park, fed by a natural spring; pools plus walking areas.",
    category: 'private_reserve',
    province: 'Heredia',
    canton: 'Belén',
    lat: 9.9781,
    lng: -84.1879,
    difficulty: 'easy',
    terrain: 'paved',
    distance_m: 800,
    duration_min: 15,
    cost_type: 'paid',
    cost_amount: null,
    pet_friendly: 'unknown',
    hours_text: null,
    source: 'seed',
    confidence: 'unverified',
  },
  {
    // Source: jbl.ucr.ac.cr official tarifas-2026 page.
    name: 'Jardín Botánico Lankester',
    description:
      'University of Costa Rica-run botanical garden famous for its orchid collection; flat, easy trails.',
    category: 'private_reserve',
    province: 'Cartago',
    canton: 'Cartago',
    lat: 9.8396,
    lng: -83.8885,
    difficulty: 'easy',
    terrain: 'paved',
    distance_m: 1200,
    duration_min: 40,
    cost_type: 'paid',
    cost_amount: '$10 (non-resident); ₡3,000 (resident); ₡2,000 (preferential)',
    pet_friendly: 'unknown',
    hours_text: 'Daily, including holidays, 8:30 a.m.–4:30 p.m.',
    source: 'seed',
    confidence: 'verified',
  },
  {
    // Source: SINAC official page, multiple 2026 travel guides. Requires
    // advance online reservation via the SINAC portal.
    name: 'Volcán Poás National Park',
    description:
      'Active volcano with a paved path to the main crater viewpoint. Advance online reservation required via SINAC.',
    category: 'national_park',
    province: 'Alajuela',
    canton: 'Poás',
    lat: 10.2,
    lng: -84.2333,
    difficulty: 'easy',
    terrain: 'paved',
    distance_m: 1000,
    duration_min: 30,
    cost_type: 'paid',
    cost_amount: '$15 (foreigner, adult); reservation required',
    pet_friendly: 'no',
    hours_text: 'Daily 8:00 a.m.–4:00 p.m., last admission 2:00 p.m. (reservation required)',
    source: 'seed',
    confidence: 'verified',
  },
  {
    // Source: SINAC official page, multiple 2026 travel guides.
    name: 'Volcán Irazú National Park',
    description:
      "Costa Rica's highest volcano; paved path to the main crater overlook, sparse high-elevation terrain.",
    category: 'national_park',
    province: 'Cartago',
    canton: 'Oreamuno',
    lat: 9.9792,
    lng: -83.8522,
    difficulty: 'easy',
    terrain: 'paved',
    distance_m: 500,
    duration_min: 20,
    cost_type: 'paid',
    cost_amount: '$15 (foreigner, adult); ~$5 (child); reservation via SINAC',
    pet_friendly: 'no',
    hours_text: 'Daily 8:00 a.m.–3:30 p.m.',
    source: 'seed',
    confidence: 'verified',
  },
  {
    // Source: waterfallgardens.com, multiple 2026 travel guides.
    name: 'Catarata La Paz (Peace Waterfall Gardens)',
    description:
      'Private eco-park with paved/stepped walkways to five waterfalls plus wildlife exhibits.',
    category: 'private_reserve',
    province: 'Alajuela',
    canton: 'Poás',
    lat: 10.2017,
    lng: -84.1615,
    difficulty: 'moderate',
    terrain: 'mixed',
    distance_m: 3500,
    duration_min: 120,
    cost_type: 'paid',
    cost_amount: '$52–56 (adult, foreigner); $36–40 (child 3–12)',
    pet_friendly: 'no',
    hours_text: 'Daily 8:00 a.m.–5:00 p.m., last entry 3:30 p.m.',
    source: 'seed',
    confidence: 'verified',
  },
  {
    // Source: SINAC, manuelantonioparktickets.com. Advance online
    // reservation mandatory (600 visitors/day cap); closed Tuesdays.
    name: 'Manuel Antonio National Park',
    description:
      'Beach-and-rainforest-trail combo park with abundant wildlife. Advance SINAC reservation required.',
    category: 'national_park',
    province: 'Puntarenas',
    canton: 'Quepos',
    lat: 9.3756,
    lng: -84.1358,
    difficulty: 'moderate',
    terrain: 'mixed',
    distance_m: 2000,
    duration_min: 90,
    cost_type: 'paid',
    cost_amount: '$18 (foreigner, adult); $5 (child 2–12); reservation required',
    pet_friendly: 'no',
    hours_text: 'Wed–Mon 7:00 a.m.–4:00 p.m. (closed Tue)',
    source: 'seed',
    confidence: 'verified',
  },
  {
    // Source: coordinates approximate (Zurquí sector, nearest confirmed
    // reference point is the Quebrada González sector a few km northeast).
    // Spans three provinces — recorded as free text since it doesn't fit a
    // single canton.
    name: 'Parque Nacional Braulio Carrillo',
    description:
      'Cloud forest national park with three entrance sectors (Zurquí, Quebrada González, Barva); moderate–hard trails.',
    category: 'national_park',
    province: 'Heredia/San José/Limón',
    canton: 'Vázquez de Coronado (Zurquí sector)',
    lat: 10.05,
    lng: -84.02,
    difficulty: 'moderate',
    terrain: 'dirt',
    distance_m: 4000,
    duration_min: 120,
    cost_type: 'paid',
    cost_amount: '₡1,000 (national); $12 (foreigner)',
    pet_friendly: 'no',
    hours_text: 'Daily 8:00 a.m.–4:00 p.m.',
    source: 'seed',
    confidence: 'unverified',
  },
  {
    // Source: Wikipedia, cloudforestmonteverde.com. Fee varies by source
    // ($25–29 non-resident); daily visitor cap in effect.
    name: 'Reserva Biológica Bosque Nuboso Monteverde',
    description:
      'Private cloud forest reserve with suspension bridges and moderate trails through primary forest.',
    category: 'private_reserve',
    province: 'Puntarenas',
    canton: 'Puntarenas',
    lat: 10.3025,
    lng: -84.7956,
    difficulty: 'moderate',
    terrain: 'dirt',
    distance_m: 1900,
    duration_min: 90,
    cost_type: 'paid',
    cost_amount: '$25–29 (non-resident adult); $10 (resident)',
    pet_friendly: 'no',
    hours_text: 'Daily 7:00 a.m.–4:00 p.m.',
    source: 'seed',
    confidence: 'verified',
  },
  {
    // Corrected from the plan's "Bosque del Niño (Recreo Verde)" — see
    // file header. Coordinates approximate (nearest confirmed reference
    // points are Grecia town center and the Calle Rodríguez area).
    name: 'Bosque del Niño',
    description:
      'Community forest reserve (Grecia Forest Reserve) on the slopes of Poás; easy walking trails.',
    category: 'private_reserve',
    province: 'Alajuela',
    canton: 'Grecia',
    lat: 10.09,
    lng: -84.28,
    difficulty: 'easy',
    terrain: 'dirt',
    distance_m: 2000,
    duration_min: 60,
    cost_type: 'paid',
    cost_amount: '₡600 (national/resident adult); ₡500 (child 3–11)',
    pet_friendly: 'unknown',
    hours_text: 'Daily 8:00 a.m.–4:00 p.m.',
    source: 'seed',
    confidence: 'unverified',
  },
  {
    // Source: Wikipedia; coordinate precision uncertain (search results
    // partly conflated with a same-named park in Panama). Kelly Creek
    // entrance is donation-based; Puerto Vargas entrance has a fixed fee.
    name: 'Cahuita National Park',
    description: 'Coastal jungle park with beach and reef; Kelly Creek entrance is donation-based.',
    category: 'national_park',
    province: 'Limón',
    canton: 'Talamanca',
    lat: 9.7292,
    lng: -82.825,
    difficulty: 'easy',
    terrain: 'dirt',
    distance_m: 2000,
    duration_min: 60,
    cost_type: 'free',
    cost_amount:
      '$5–10 suggested donation (Kelly Creek); ₡3,000 fixed (Puerto Vargas, incl. parking)',
    pet_friendly: 'no',
    hours_text: 'Daily 7:00 a.m.–4:00 p.m., last entry 3:30 p.m.',
    source: 'seed',
    confidence: 'unverified',
  },

  // ---------------------------------------------------------------------
  // Mock/fabricated test places (Issue #33) — NOT real, NOT verified.
  // Made-up names/coordinates (plausible but fictional locations within
  // Costa Rica) added purely to widen UI test coverage: categories with no
  // real example yet (beach, mountain, trail, other), a 'hard' difficulty,
  // 'rocky' terrain, missing-optional-field edge cases, and a couple of
  // deliberately long names/strings to keep exercising text wrapping
  // (#21, #27). `source`/`confidence` stay within the existing enum
  // ('seed' | 'community' and 'unverified' | 'verified') — there's no
  // separate "mock" value, so these are flagged by this comment block and
  // by `confidence: 'unverified'` (never 'verified', since none of this
  // is real) rather than by a distinct source tag.
  // ---------------------------------------------------------------------
  {
    name: 'Playa Mock Grande',
    description: 'Fabricated test place: a wide sand beach with easy flat walking above the tideline.',
    category: 'beach',
    province: 'Guanacaste',
    canton: 'Santa Cruz',
    lat: 10.35,
    lng: -85.8,
    difficulty: 'easy',
    terrain: 'dirt',
    distance_m: 2500,
    duration_min: 40,
    cost_type: 'free',
    cost_amount: null,
    pet_friendly: 'yes',
    hours_text: 'Open 24 hours',
    source: 'seed',
    confidence: 'unverified',
  },
  {
    name: 'Playa Ficticia del Caribe',
    description: 'Fabricated test place: a Caribbean-coast beach with a short palm-lined path.',
    category: 'beach',
    province: 'Limón',
    canton: 'Limón',
    lat: 9.98,
    lng: -83.05,
    difficulty: 'easy',
    terrain: 'dirt',
    distance_m: 1200,
    duration_min: 20,
    cost_type: 'free',
    cost_amount: null,
    pet_friendly: 'unknown',
    hours_text: 'Open 24 hours',
    source: 'seed',
    confidence: 'unverified',
  },
  {
    name: 'Cerro Ficticio',
    description: 'Fabricated test place: a steep rocky summit trail with a viewpoint at the top.',
    category: 'mountain',
    province: 'Cartago',
    canton: 'Paraíso',
    lat: 9.83,
    lng: -83.82,
    difficulty: 'hard',
    terrain: 'rocky',
    distance_m: 8200,
    duration_min: 240,
    cost_type: 'paid',
    cost_amount:
      '₡5,000 (national, weekday); ₡7,500 (national, weekend); $20 (foreigner, any day); guide fee not included',
    pet_friendly: 'no',
    hours_text:
      'Daily 5:00 a.m.–2:00 p.m. only (must exit before dark); last entry 10:00 a.m.; closed during heavy rain advisories',
    source: 'seed',
    confidence: 'unverified',
  },
  {
    name: 'Montaña de Prueba',
    description: 'Fabricated test place: another steep, rocky mountain trail for testing the hard/rocky combination.',
    category: 'mountain',
    province: 'Puntarenas',
    canton: 'Pérez Zeledón',
    lat: 9.38,
    lng: -83.62,
    difficulty: 'hard',
    terrain: 'rocky',
    distance_m: 6000,
    duration_min: 200,
    cost_type: 'unknown',
    cost_amount: null,
    pet_friendly: 'no',
    hours_text: null,
    source: 'seed',
    confidence: 'unverified',
  },
  {
    name: 'Sendero de Prueba Larguísimo con Nombre Extremadamente Extenso para Probar el Ajuste de Texto',
    description: 'Fabricated test place with a deliberately very long name, for testing text wrapping in card lists and headings.',
    category: 'trail',
    province: 'Alajuela',
    canton: 'San Ramón',
    lat: 10.09,
    lng: -84.47,
    difficulty: 'moderate',
    terrain: 'mixed',
    distance_m: 3000,
    duration_min: 75,
    cost_type: 'free',
    cost_amount: null,
    pet_friendly: 'yes',
    hours_text: 'Daily 6:00 a.m.–6:00 p.m.',
    source: 'seed',
    confidence: 'unverified',
  },
  {
    name: 'Sendero Corto',
    description: 'Fabricated test place: a short, simple trail for contrast against the longer test entries.',
    category: 'trail',
    province: 'Heredia',
    canton: 'Barva',
    lat: 10.02,
    lng: -84.12,
    difficulty: 'easy',
    terrain: 'dirt',
    distance_m: 600,
    duration_min: 10,
    cost_type: 'free',
    cost_amount: null,
    pet_friendly: 'yes',
    hours_text: 'Daily 6:00 a.m.–6:00 p.m.',
    source: 'seed',
    confidence: 'unverified',
  },
  {
    // Deliberately sparse: exercises every nullable-field code path (no
    // province/canton/difficulty/terrain/distance/duration/cost_amount/
    // hours_text) since every other seed row has most of these filled in.
    name: 'Mirador Genérico',
    description: null,
    category: 'other',
    province: null,
    canton: null,
    lat: 9.6,
    lng: -84.3,
    difficulty: null,
    terrain: null,
    distance_m: null,
    duration_min: null,
    cost_type: 'unknown',
    cost_amount: null,
    pet_friendly: 'unknown',
    hours_text: null,
    source: 'seed',
    confidence: 'unverified',
  },
  {
    name: 'Parque Mock Municipal Extra',
    description: 'Fabricated test place: an additional municipal park for wider category coverage.',
    category: 'municipal_park',
    province: 'San José',
    canton: 'Curridabat',
    lat: 9.92,
    lng: -84.03,
    difficulty: 'easy',
    terrain: 'paved',
    distance_m: 1800,
    duration_min: 30,
    cost_type: 'free',
    cost_amount: null,
    pet_friendly: 'yes',
    hours_text: 'Daily 6:00 a.m.–8:00 p.m.',
    source: 'seed',
    confidence: 'unverified',
  },
  {
    name: 'Reserva Mock Adicional',
    description: 'Fabricated test place: an additional private reserve for wider category coverage.',
    category: 'private_reserve',
    province: 'Alajuela',
    canton: 'Zarcero',
    lat: 10.19,
    lng: -84.38,
    difficulty: 'moderate',
    terrain: 'dirt',
    distance_m: 2700,
    duration_min: 70,
    cost_type: 'paid',
    cost_amount: '₡2,500 (national); $8 (foreigner)',
    pet_friendly: 'no',
    hours_text: 'Daily 7:30 a.m.–3:30 p.m.',
    source: 'seed',
    confidence: 'unverified',
  },
];

const PLACES: PlaceInsert[] = BASE_PLACES.map((place, index) => ({
  ...place,
  ...mockReviewsFor(index, place.name),
}));

async function main() {
  for (const place of PLACES) {
    placeInsertSchema.parse(place);
  }

  const { error: deleteError } = await supabase.from('places').delete().eq('source', 'seed');
  if (deleteError) throw new Error(`failed to clear existing seed rows: ${deleteError.message}`);

  const { data, error: insertError } = await supabase
    .from('places')
    .insert(PLACES)
    .select('id, name');
  if (insertError) throw new Error(`failed to insert seed places: ${insertError.message}`);

  console.log(`Seeded ${data.length} places:`);
  for (const row of data) console.log(`  - ${row.name}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
