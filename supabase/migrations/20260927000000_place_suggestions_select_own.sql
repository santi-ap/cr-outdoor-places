-- Lets a signed-in user see the status of place suggestions they've
-- submitted themselves (Issue #74) -- a read-only personal history, not
-- the admin/moderation UI that's still deliberately out of scope for v0
-- (see docs/build-plan.md Section 4 and the original place_suggestions
-- RLS comment in 20260916000000_init_schema.sql). Santi's own
-- review/approve/reject step still happens directly in the Supabase
-- dashboard.
create policy "place_suggestions_select_own"
  on place_suggestions for select
  to authenticated
  using (auth.uid() = suggested_by);
