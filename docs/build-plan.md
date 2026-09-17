# CR Outdoor Places — Prototype Build Plan

**Purpose of this document:** hand this directly to Claude Code as the master prompt. It should create the GitHub repo and issues from Section 6, then work through them one at a time — branch, implement, verify against acceptance criteria, close, move to the next.

---

## 0. Instructions for Claude Code

1. Read Section 1 (Pillars) and Section 2 (Scope) before doing anything else. Re-read them before starting each issue — they are the guardrail against scope drift.
2. Create a new GitHub repo (ask the user for the name/visibility if not specified) and initialize it.
3. Create every issue in Section 6 using `gh issue create`, in order, with the full title + description as written.
4. Work issues **one at a time, in order** (they have dependencies). For each:
   - Create a branch: `issue-N-short-slug`
   - Implement the issue
   - Run the verification steps listed for that issue
   - Only if verification passes: merge to main, close the issue with `gh issue close N --comment "<summary of what was verified>"`
   - If something in the issue is ambiguous or conflicts with Section 1/2, **stop and comment on the issue explaining the blocker** rather than guessing and drifting scope.
5. Do not add features, libraries, or pages that aren't in Section 2's "in scope" list without flagging it first.

---

## 1. Product Pillars (do not violate)

1. **Place-first, not route-tracking.** This app helps people find a place to go. It does not record GPS routes, track live location, or do turn-by-turn navigation. Deep-link to Google/Waze for actual directions.
2. **Broad scope, not hiker-exclusive.** National parks, municipal parks, private reserves, beaches, mountains, urban green space, botanical gardens — anywhere you can walk and be outside. Not an AllTrails clone.
3. **Practical, filterable info.** The core value is filtering on: category, difficulty, terrain, pet-friendly, cost, distance (meters), duration (time), hours.
4. **Personal utility.** Users can save a place to a list and mark it as visited. This is a personal tool, not just a directory.
5. **Community-editable, low-friction — designed for later, not fully built now.** The prototype needs a place for suggestions to land, not a full moderation/consensus system.
6. **Mobile-first website**, PWA-installable. Not a native app.
7. **Reusable, standard components.** Use established libraries and services (Supabase, shadcn/ui, etc.) instead of building auth, a backend, or UI primitives from scratch.

---

## 2. Prototype (v0) Scope

**In scope:**
- Browse places via map + list view, with filters
- Place detail page showing all structured fields
- Email-based account (magic link) + personal "My List" — save places, mark visited
- A simple "suggest a place" / "suggest an edit" form that writes to a pending table (no voting/consensus UI yet)
- Seed data: ~12–15 real Costa Rican outdoor places, spanning categories and regions

**Explicitly out of scope for v0** — flag it if you find yourself building any of this:
- Automated scraping/ingestion pipeline (OSM, SINAC, etc.) — seed data is curated by hand this round
- Voting/consensus engine for conflicting community edits
- Star ratings, comment threads, review moderation
- Payments, sponsorships, affiliate links
- Native app, offline maps, GPS route recording
- Anything beyond a basic es/en toggle for language

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14+ (App Router), TypeScript | Standard, huge ecosystem, one deploy target for web+API |
| UI | Tailwind CSS + shadcn/ui | Pre-built accessible components — don't hand-roll buttons/modals/forms |
| Backend/DB/Auth/Storage | Supabase (Postgres + Auth + Storage) | Auth, database, and file storage in one reusable service instead of custom-built |
| Map | Leaflet.js + OpenStreetMap tiles | Zero-cost, zero-setup, huge plugin ecosystem — swap for MapLibre/Protomaps later only if a real need shows up |
| Forms/validation | react-hook-form + zod | Standard pairing, avoids hand-written validation logic |
| Data fetching | TanStack Query | Standard caching layer, avoids ad-hoc `useEffect` fetch logic |
| Hosting | Vercel | Zero-config deploy from the Next.js repo, free tier is enough for a prototype |

Auth note: magic-link email auth via Supabase is barely more setup than skipping auth, and "My List" needs *something* to persist across sessions/devices — worth doing properly from the start rather than a localStorage-only stopgap.

---

## 4. Data Model

```sql
-- places
id            uuid primary key
name          text not null
description   text
category      text not null  -- 'national_park' | 'municipal_park' | 'private_reserve' | 'beach' | 'mountain' | 'trail' | 'other'
province      text
canton        text
lat           double precision not null
lng           double precision not null
difficulty    text            -- 'easy' | 'moderate' | 'hard' | null
terrain       text            -- 'paved' | 'dirt' | 'rocky' | 'mixed' | null
distance_m    integer         -- meters, null if not applicable
duration_min  integer         -- minutes, null if not applicable
cost_type     text not null default 'unknown'  -- 'free' | 'paid' | 'unknown'
cost_amount   text            -- free-text for prototype, e.g. "₡2000" or "$15"
pet_friendly  text not null default 'unknown'  -- 'yes' | 'no' | 'unknown'
hours_text    text            -- free-text for prototype, e.g. "8am–4pm daily"
source        text not null default 'seed'     -- 'seed' | 'community'
confidence    text not null default 'unverified' -- 'unverified' | 'verified'
created_at    timestamptz default now()
updated_at    timestamptz default now()

-- lists
id            uuid primary key
user_id       uuid references auth.users not null
name          text not null default 'My List'
created_at    timestamptz default now()

-- list_items
id            uuid primary key
list_id       uuid references lists not null
place_id      uuid references places not null
status        text not null default 'saved'  -- 'saved' | 'visited'
visited_at    timestamptz
created_at    timestamptz default now()

-- place_suggestions
id            uuid primary key
place_id      uuid references places  -- null if suggesting a brand-new place
suggested_by  uuid references auth.users
changes       jsonb not null   -- field: proposed value pairs, or full new-place payload
status        text not null default 'pending'  -- 'pending' | 'approved' | 'rejected'
created_at    timestamptz default now()
```

Row-level security: `places` readable by everyone, writable only via `place_suggestions`. `lists`/`list_items` readable/writable only by their owning `user_id`. `place_suggestions` insertable by any authenticated user, readable/updatable only by the place owner role (i.e., you, for now — no admin UI needed, direct table edits in Supabase are fine for v0).

---

## 5. Seed Data (starting set)

Verified via search: **Parque Metropolitano La Sabana** — 72 hectares, free, open year-round, coordinates 9.9356, -84.1042.

The rest below are well-documented, real, existing places, but I have not individually verified current hours/prices for each — mark them `confidence: unverified` on insert, and make "verify hours/cost for each seed place" part of Issue #4's acceptance criteria rather than trusting these numbers blind.

| Name | Category | Region | Notes |
|---|---|---|---|
| Parque Metropolitano La Sabana | municipal_park | San José | Free, flat, urban, verified above |
| Parque del Este | municipal_park | San José (Sabanilla) | University-adjacent, popular for walking/running |
| Parque Recreativo Ojo de Agua | private_reserve | Alajuela (San Antonio de Belén) | Paid entry, pools + walking areas |
| Jardín Botánico Lankester | private_reserve | Cartago | Paid entry, orchid garden, easy flat trails |
| Volcán Poás National Park | national_park | Alajuela | Paid entry, requires advance online reservation |
| Volcán Irazú National Park | national_park | Cartago | Paid entry, high elevation, easy terrain near crater |
| Catarata La Paz (Peace Waterfall Gardens) | private_reserve | Alajuela (Vara Blanca) | Paid entry, moderate terrain, waterfalls |
| Manuel Antonio National Park | national_park | Puntarenas | Paid entry, beach + trail combo, requires reservation |
| Parque Nacional Braulio Carrillo | national_park | Heredia/San José/Limón | Free–low cost, cloud forest, moderate–hard trails |
| Reserva Biológica Bosque Nuboso Monteverde | private_reserve | Puntarenas | Paid entry, cloud forest, moderate terrain |
| Bosque del Niño (Recreo Verde) | municipal_park | Heredia | Local, free/low cost, easy walking |
| Cahuita National Park | national_park | Limón | Beach + jungle trail, donation-based entry |

Claude Code: build the seed script to insert these with your best current knowledge for coordinates/difficulty/distance, flag `confidence: unverified`, and note in the seed script's comments that a follow-up pass should confirm current hours and entrance fees before this goes in front of real users.

---

## 6. GitHub Issues

### Issue 1: Repo scaffolding
**Description:** Initialize a Next.js 14 (App Router, TypeScript) project. Install and configure Tailwind CSS and shadcn/ui. Set up ESLint + Prettier. Add a README containing the Pillars (Section 1) and Scope (Section 2) from this document verbatim, so future work stays anchored to them. Connect the repo to Vercel for auto-deploy on push to main.
**Acceptance criteria:** `npm run dev` runs a working blank Next.js app with Tailwind styles applying and one shadcn/ui component (e.g. Button) rendering correctly. README contains pillars/scope. Vercel deploy succeeds and produces a live URL.
**Verify:** run build, run dev server, load the page, confirm the deployed Vercel URL loads.

### Issue 2: Supabase setup + schema
**Description:** Create a Supabase project. Configure environment variables for local dev and Vercel. Write and run a migration creating the four tables from Section 4 with the specified RLS policies. Enable magic-link email auth.
**Acceptance criteria:** All four tables exist with correct columns/types. RLS policies match Section 4. A test insert/select against `places` succeeds from the app using the Supabase client.
**Verify:** query each table from a script or the Supabase SQL editor; confirm RLS blocks an unauthenticated write to `lists`.

### Issue 3: Data types and validation
**Description:** Generate TypeScript types from the Supabase schema. Write zod schemas matching each table for use in forms and API validation.
**Acceptance criteria:** Types compile with no `any`. Zod schemas reject invalid enum values (e.g. `difficulty: "extreme"`).
**Verify:** `npm run build` type-checks cleanly; a unit test (or quick script) confirms a zod schema rejects a bad enum value and accepts a valid payload.

### Issue 4: Seed script + seed data
**Description:** Write a seed script that inserts the places listed in Section 5 into the `places` table, with `source: 'seed'` and `confidence: 'unverified'`. Confirm current hours, entrance fee, and coordinates for each place via a quick web check before finalizing the seed file, and update `confidence: 'verified'` for any you confirm.
**Acceptance criteria:** Running the seed script populates the `places` table with all 12 places, no duplicates, valid lat/lng for each.
**Verify:** query `select count(*) from places` returns 12; spot-check 3 places' coordinates against a map.

### Issue 5: Places API layer
**Description:** Build server actions or route handlers for: list places with filter params (category, difficulty, pet_friendly, cost_type, max distance), get a single place by id, and create a row in `place_suggestions`.
**Acceptance criteria:** Each endpoint/action returns correctly typed data and respects filters (e.g. filtering by `pet_friendly: 'yes'` excludes places marked `'no'` or `'unknown'`).
**Verify:** call each with a few different filter combinations and confirm the returned set matches what's expected against the seeded data.

### Issue 6: Map + list browse view (home page)
**Description:** Build the home page: a Leaflet map showing pins for all places, a list view toggle (map/list), and a filter panel (category, difficulty, pet-friendly, cost, distance range). Mobile-first layout — filters collapse into a bottom sheet or drawer on small screens, map/list share the viewport sensibly.
**Acceptance criteria:** All 12 seeded places show as pins. Applying a filter updates both the map pins and the list. Layout is usable at a 375px viewport width without horizontal scroll.
**Verify:** manually test at mobile and desktop widths; apply each filter type and confirm results update.

### Issue 7: Place detail page
**Description:** Build a detail page per place showing all structured fields (category, difficulty, terrain, distance, duration, cost, pet policy, hours), a "Save to my list" button, a "Mark as visited" button (only if already saved), and a "Suggest an edit" link.
**Acceptance criteria:** All fields render correctly for a seeded place; save/mark-visited buttons only work for a logged-in user and show a sign-in prompt otherwise.
**Verify:** load a place page logged out (buttons prompt sign-in) and logged in (buttons work and persist to the database).

### Issue 8: Auth flow
**Description:** Implement magic-link sign-in/sign-out using Supabase Auth. Add a minimal account state indicator in the header (signed in / signed out).
**Acceptance criteria:** A user can request a magic link, click it, land signed in, and sign out again.
**Verify:** run the full flow with a real test email address.

### Issue 9: My List page
**Description:** Build a page showing the signed-in user's saved places, split into "Saved" and "Visited" sections. Allow toggling status and removing an item from the list.
**Acceptance criteria:** Saved/visited state persists across page reloads and matches what's in the `list_items` table.
**Verify:** save a place, mark it visited, reload the page, confirm state is preserved; remove it and confirm it disappears.

### Issue 10: Suggest a place / suggest an edit form
**Description:** Build a simple form reachable from the detail page ("suggest an edit") and from the home page ("suggest a new place"). On submit, write a row to `place_suggestions` with the proposed changes as JSON. Show a confirmation message — no approval workflow needed yet.
**Acceptance criteria:** Submitting either form creates a correctly-shaped row in `place_suggestions`.
**Verify:** submit both form types and confirm the resulting rows in the database match what was entered.

### Issue 11: Mobile-first polish + PWA manifest
**Description:** Do a pass across every page at common mobile breakpoints (375px, 414px) fixing any layout issues. Add a PWA manifest and icons so the site is installable on a phone home screen.
**Acceptance criteria:** No horizontal scrolling or overlapping elements at 375px on any page. Site is installable (manifest validates, icons present).
**Verify:** test each page at 375px width; run a Lighthouse PWA audit.

### Issue 12: Deploy + end-to-end smoke test
**Description:** Confirm the production Vercel deployment has correct environment variables and works end to end. Update the README with setup instructions for a new developer (env vars needed, how to run migrations/seed locally).
**Acceptance criteria:** On the live URL: browse places, filter, view a detail page, sign in, save a place, mark it visited, submit a suggestion — all work without errors.
**Verify:** manually run through that full flow on the deployed URL.

---

## 7. Notes for Santi

- The seed list intentionally skips the hardest data-quality problem (dedup, canonicalization) since 12 hand-picked places have no duplicates by construction. That problem returns the moment you turn on the OSM/SINAC ingestion pipeline — which is explicitly out of scope here.
- The `place_suggestions` table with no moderation UI means for now you'll be looking at pending rows directly in the Supabase dashboard. That's fine at this scale and is a deliberate "don't build the consensus engine yet" choice from your original scope.
- If Claude Code proposes adding route tracking, ratings, or payments at any point, that's scope drift — point it back at Section 1.
