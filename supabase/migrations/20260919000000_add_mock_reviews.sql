-- Mock/display-only ratings and reviews (Issue #36).
--
-- Read-only: no submission form, no per-user review rows, no write policy
-- for anon/authenticated. Values are seed-authored only (see scripts/seed.ts)
-- to give the place detail page something to show while a real
-- reviews/moderation system stays out of scope for v0 (see
-- docs/build-plan.md Section 2, "Explicitly out of scope").

alter table places
  add column rating numeric(2, 1) check (rating >= 1 and rating <= 5),
  add column reviews jsonb not null default '[]'::jsonb;
