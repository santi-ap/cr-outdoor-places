import { z } from 'zod';

// Protection/administrative designation. Split from landscape (physical
// terrain/feature) in migration 20260926000000 -- see Issue #66.
export const placeCategorySchema = z.enum([
  'national_park',
  'municipal_park',
  'private_reserve',
  'other',
]);

// Physical terrain/feature. Distinct from `terrainSchema` below, which is
// the walking-surface material (paved/dirt/rocky/mixed) shown separately
// on the detail page.
export const landscapeSchema = z.enum(['beach', 'mountain', 'forest', 'trail', 'field', 'other']);

export const difficultySchema = z.enum(['easy', 'moderate', 'hard']);
export const terrainSchema = z.enum(['paved', 'dirt', 'rocky', 'mixed']);
export const costTypeSchema = z.enum(['free', 'paid', 'unknown']);
export const petFriendlySchema = z.enum(['yes', 'no', 'unknown']);
export const placeSourceSchema = z.enum(['seed', 'community']);
export const placeConfidenceSchema = z.enum(['unverified', 'verified']);
export const listItemStatusSchema = z.enum(['saved', 'visited']);
export const placeSuggestionStatusSchema = z.enum(['pending', 'approved', 'rejected']);

// Mock/display-only — seed-authored, read-only (Issue #36). No submission
// form or user-generated rows; see docs/build-plan.md Section 2 for why a
// real reviews system stays out of scope for v0.
export const placeReviewSchema = z.object({
  author: z.string().min(1),
  rating: z.number().min(1).max(5),
  text: z.string().min(1),
});

export const placeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  category: placeCategorySchema.nullable(),
  // A place can be more than one landscape at once (e.g. a national park
  // that's both beach and rainforest) -- see Issue #66.
  landscape: z.array(landscapeSchema),
  province: z.string().nullable(),
  canton: z.string().nullable(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  difficulty: difficultySchema.nullable(),
  terrain: terrainSchema.nullable(),
  distance_m: z.number().int().positive().nullable(),
  duration_min: z.number().int().positive().nullable(),
  cost_type: costTypeSchema,
  cost_amount: z.string().nullable(),
  pet_friendly: petFriendlySchema,
  hours_text: z.string().nullable(),
  website: z.string().nullable(),
  phone: z.string().nullable(),
  // Digits only (with country code, no symbols/spaces), e.g. "50688881234"
  // — used to build a https://wa.me/<number> deep link, not displayed
  // as-is.
  whatsapp: z.string().nullable(),
  source: placeSourceSchema,
  confidence: placeConfidenceSchema,
  rating: z.number().min(1).max(5).nullable(),
  reviews: z.array(placeReviewSchema),
  created_at: z.string(),
  updated_at: z.string(),
});

export const placeInsertSchema = placeSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .partial({
    description: true,
    category: true,
    landscape: true,
    province: true,
    canton: true,
    difficulty: true,
    terrain: true,
    distance_m: true,
    duration_min: true,
    cost_type: true,
    cost_amount: true,
    pet_friendly: true,
    hours_text: true,
    website: true,
    phone: true,
    whatsapp: true,
    source: true,
    confidence: true,
    rating: true,
    reviews: true,
  });

export const listSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  created_at: z.string(),
});

export const listInsertSchema = listSchema.omit({ id: true, created_at: true }).partial({
  name: true,
});

export const listItemSchema = z.object({
  id: z.string().uuid(),
  list_id: z.string().uuid(),
  place_id: z.string().uuid(),
  status: listItemStatusSchema,
  visited_at: z.string().nullable(),
  created_at: z.string(),
});

export const listItemInsertSchema = listItemSchema
  .omit({ id: true, created_at: true })
  .partial({ status: true, visited_at: true });

// `changes` covers both a full new-place payload (place_id is null) and a
// partial set of proposed edits to an existing place — see Section 4.
export const placeSuggestionChangesSchema = placeInsertSchema.partial();

export const placeSuggestionSchema = z.object({
  id: z.string().uuid(),
  place_id: z.string().uuid().nullable(),
  suggested_by: z.string().uuid().nullable(),
  changes: placeSuggestionChangesSchema,
  status: placeSuggestionStatusSchema,
  created_at: z.string(),
});

export const placeSuggestionInsertSchema = placeSuggestionSchema
  .omit({ id: true, created_at: true })
  .partial({ place_id: true, suggested_by: true, status: true });

// Query params arrive as a single comma-separated string (e.g.
// "easy,hard") since each filter field now supports multiple selected
// values at once.
function commaSeparated<T extends z.ZodTypeAny>(schema: T) {
  return z
    .preprocess(
      (val) => (typeof val === 'string' ? val.split(',').filter(Boolean) : val),
      z.array(schema).min(1),
    )
    .optional();
}

export const placesFilterSchema = z.object({
  category: commaSeparated(placeCategorySchema),
  landscape: commaSeparated(landscapeSchema),
  difficulty: commaSeparated(difficultySchema),
  pet_friendly: commaSeparated(petFriendlySchema),
  cost_type: commaSeparated(costTypeSchema),
  max_distance_m: z.coerce.number().int().positive().optional(),
});

export type Place = z.infer<typeof placeSchema>;
export type PlaceReview = z.infer<typeof placeReviewSchema>;
export type PlacesFilter = z.infer<typeof placesFilterSchema>;
export type PlaceInsert = z.infer<typeof placeInsertSchema>;
export type List = z.infer<typeof listSchema>;
export type ListInsert = z.infer<typeof listInsertSchema>;
export type ListItem = z.infer<typeof listItemSchema>;
export type ListItemInsert = z.infer<typeof listItemInsertSchema>;
export type PlaceSuggestion = z.infer<typeof placeSuggestionSchema>;
export type PlaceSuggestionInsert = z.infer<typeof placeSuggestionInsertSchema>;
