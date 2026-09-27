-- Structured open hours (Issue #75), alongside the existing free-text
-- hours_text rather than replacing it -- hours_text stays as a notes
-- field for exceptions that don't fit a clean day/time shape ("closed
-- during heavy rain advisories", "reservation required").
--
-- Each element is {"days": ["mon", ...], "opens": "08:00", "closes":
-- "16:00"} -- validated at the application boundary (zod), same as the
-- existing `reviews` jsonb column, not with a DB check constraint.
alter table places
  add column hours jsonb not null default '[]';
