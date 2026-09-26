-- Splits the old single `category` enum (which mixed protected-area
-- designation with physical landscape) into two independent, nullable
-- dimensions:
--   category   -- protection/administrative designation: national_park,
--                  municipal_park, private_reserve, other
--   landscape  -- physical terrain/feature: beach, mountain, forest,
--                  trail, field, other
--
-- Named `landscape`, not `terrain` -- `terrain` already exists as the
-- walking-surface column (paved/dirt/rocky/mixed) and reusing that name
-- here would collide with its existing label ("Terreno") on the detail
-- page.
alter table places
  add column landscape text
    check (landscape in ('beach', 'mountain', 'forest', 'trail', 'field', 'other')),
  alter column category drop not null;

-- Existing rows: a mechanical move, not an enrichment pass. Whatever value
-- was already in `category` moves into whichever new field it structurally
-- belongs to; nothing is inferred for rows that plausibly belong in both
-- (e.g. a national park that's also a beach) -- see Issue #66.
update places
  set landscape = category, category = null
  where category in ('beach', 'mountain', 'trail');

alter table places
  drop constraint places_category_check,
  add constraint places_category_check
    check (category in ('national_park', 'municipal_park', 'private_reserve', 'other'));

create index places_landscape_idx on places (landscape);
