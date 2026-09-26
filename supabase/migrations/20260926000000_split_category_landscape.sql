-- Splits the old single `category` enum (which mixed protected-area
-- designation with physical landscape) into two independent dimensions:
--   category   -- protection/administrative designation: national_park,
--                  municipal_park, private_reserve, other. Nullable --
--                  not every place has one.
--   landscape  -- physical terrain/feature(s): beach, mountain, forest,
--                  trail, field, other. A place can be more than one
--                  (e.g. a national park that's both beach and rainforest),
--                  so this is an array, not a single value.
--
-- Named `landscape`, not `terrain` -- `terrain` already exists as the
-- walking-surface column (paved/dirt/rocky/mixed) and reusing that name
-- here would collide with its existing label ("Terreno") on the detail
-- page.
alter table places
  add column landscape text[] not null default '{}',
  alter column category drop not null;

-- Existing rows: a mechanical move, not an enrichment pass. Whatever value
-- was already in `category` moves into `landscape` (as a single-element
-- array) where it structurally belongs there -- see Issue #66.
update places
  set landscape = array[category], category = null
  where category in ('beach', 'mountain', 'trail');

alter table places
  drop constraint places_category_check,
  add constraint places_category_check
    check (category in ('national_park', 'municipal_park', 'private_reserve', 'other')),
  add constraint places_landscape_check
    check (landscape <@ array['beach', 'mountain', 'forest', 'trail', 'field', 'other']::text[]);

create index places_landscape_idx on places using gin (landscape);
