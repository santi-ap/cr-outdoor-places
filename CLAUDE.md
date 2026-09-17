# CLAUDE.md

Guidance for Claude Code working in this repo. Read this before starting any work here.

## What this project is

CR Outdoor Places — a mobile-first, PWA-installable site to find outdoor places to go in Costa Rica. Full context, product pillars, scope, tech stack, data model, seed data, and the full GitHub issue list live in **[docs/build-plan.md](docs/build-plan.md)** — read it before doing anything else. The pillars and scope are also duplicated in README.md for anyone browsing the repo.

Master prompt intent (from the build plan): work the GitHub issues in `docs/build-plan.md` Section 6 **one at a time, in order**, without waiting for check-ins, as long as each issue is unambiguous and stays inside Section 1 (Pillars) / Section 2 (Scope).

## Mobile-first is a priority, not a checklist item

This is a mobile-first product (Pillar 6). Treat the phone-width experience as the primary
design target, not a responsive-shrink pass done after the desktop layout is built:

- When building any new page or component, design and test the ~375px-wide layout first,
  then adapt up to desktop — not the other way around.
- Prefer patterns already established for this (bottom sheets/drawers for filters, a
  toggle between map/list instead of showing both at once, single-column stacked forms)
  over squeezing a desktop layout down with breakpoints alone.
- Every UI change gets checked at 375px width (see `docs/build-plan.md` Section 6, Issue
  11) before it's considered done — no horizontal scroll, no overlapping elements, tap
  targets stay usable. Do this as part of implementing the issue, not as a separate
  deferred pass.
- If a design decision trades off mobile simplicity for desktop polish, default to the
  mobile-friendly choice and flag the tradeoff rather than silently optimizing for desktop.

## Standing workflow — do this without being asked

1. Check `gh issue list --state all` to see what's open/closed. Work the lowest-numbered open issue next (issues have dependencies, so don't skip ahead).
2. Re-read Section 1 (Pillars) and Section 2 (Scope) of `docs/build-plan.md` before starting the issue — they're the guardrail against scope drift.
3. Branch: `issue-N-short-slug`.
4. Implement the issue.
5. Run the verification steps listed for that issue in Section 6 (typecheck, lint, the relevant `verify:*` script, manual checks where noted).
6. Only if verification passes: merge to main, then `gh issue close N --comment "<summary of what was verified>"`.
7. Move to the next issue and repeat — don't stop to ask "should I continue?" between issues.
8. **Do stop and ask** (or comment on the issue explaining the blocker) when: an issue is genuinely ambiguous, it conflicts with Section 1/2, it requires a decision only Santi can make (e.g. naming a new external service, picking a paid tier), or it needs a credential/account Claude doesn't have access to.
9. Never add features, libraries, or pages outside Section 2's "in scope" list without flagging it first — that's scope drift.
10. If something out-of-scope for the issue/branch currently being worked comes up — a bug noticed in passing, an infra gap, a follow-up idea — do not pull it into the current branch. Document it with `gh issue create` (title + description, same format as the build-plan issues) and keep working the current issue. Exception: a fix that's a hard blocker for the current issue's acceptance criteria (e.g. the deploy pipeline being broken while verifying a deploy-dependent issue) can be handled inline, but still gets noted (a comment on the relevant issue, as with the Vercel/GitHub connection fix on #1).

## Verification scripts

Real-database verification scripts live in `scripts/verify-*.mjs` (run via `npm run verify:*`, reading `.env.local`). Prefer these over trusting a code read — they exercise the actual Supabase RLS-scoped queries. When an issue's acceptance criteria implies a new flow, add a verify script following the existing pattern (create test user via service role, act as anon-scoped user, assert, clean up).

## Conventions already established in this repo

- Server actions in `src/app/actions/*.ts` (`'use server'`), one file per feature area.
- Route pages fetch server-side and pass data into a `'use client'` component named `<feature>-client.tsx` under `src/components/<feature>/`.
- Auth/session checks: `supabase.auth.getUser()` server-side; redirect or return `{ success: false, error }` rather than throwing, for actions called from client event handlers.
- RLS does the authorization work — queries are written unscoped (e.g. `select * from list_items`) and rely on the policies in `supabase/migrations/` to restrict to the signed-in owner. Don't add redundant `.eq('user_id', ...)` filters that duplicate what RLS already enforces.
- shadcn/ui components under `src/components/ui/`.
