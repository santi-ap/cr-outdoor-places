# CLAUDE.md

Guidance for Claude Code working in this repo. Read this before starting any work here.

## What this project is

CR Outdoor Places — a mobile-first, PWA-installable site to find outdoor places to go in Costa Rica. Full context, product pillars, scope, tech stack, data model, seed data, and the full GitHub issue list live in **[docs/build-plan.md](docs/build-plan.md)** — read it before doing anything else. The pillars and scope are also duplicated in README.md for anyone browsing the repo.

Master prompt intent (from the build plan): work the GitHub issues in `docs/build-plan.md` Section 6 **one at a time, in order**, without waiting for check-ins, as long as each issue is unambiguous and stays inside Section 1 (Pillars) / Section 2 (Scope).

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

## Verification scripts

Real-database verification scripts live in `scripts/verify-*.mjs` (run via `npm run verify:*`, reading `.env.local`). Prefer these over trusting a code read — they exercise the actual Supabase RLS-scoped queries. When an issue's acceptance criteria implies a new flow, add a verify script following the existing pattern (create test user via service role, act as anon-scoped user, assert, clean up).

## Conventions already established in this repo

- Server actions in `src/app/actions/*.ts` (`'use server'`), one file per feature area.
- Route pages fetch server-side and pass data into a `'use client'` component named `<feature>-client.tsx` under `src/components/<feature>/`.
- Auth/session checks: `supabase.auth.getUser()` server-side; redirect or return `{ success: false, error }` rather than throwing, for actions called from client event handlers.
- RLS does the authorization work — queries are written unscoped (e.g. `select * from list_items`) and rely on the policies in `supabase/migrations/` to restrict to the signed-in owner. Don't add redundant `.eq('user_id', ...)` filters that duplicate what RLS already enforces.
- shadcn/ui components under `src/components/ui/`.
