# CR Outdoor Places

A mobile-first, PWA-installable website to find outdoor places to go in Costa Rica — national parks, municipal parks, private reserves, beaches, mountains, urban green space, botanical gardens. Browse by map or list, filter on practical criteria, save places to a personal list, and mark them visited.

Built with Next.js, Tailwind CSS + shadcn/ui, Supabase (Postgres + Auth), and Leaflet.

## Product Pillars (do not violate)

1. **Place-first, not route-tracking.** This app helps people find a place to go. It does not record GPS routes, track live location, or do turn-by-turn navigation. Deep-link to Google/Waze for actual directions.
2. **Broad scope, not hiker-exclusive.** National parks, municipal parks, private reserves, beaches, mountains, urban green space, botanical gardens — anywhere you can walk and be outside. Not an AllTrails clone.
3. **Practical, filterable info.** The core value is filtering on: category, difficulty, terrain, pet-friendly, cost, distance (meters), duration (time), hours.
4. **Personal utility.** Users can save a place to a list and mark it as visited. This is a personal tool, not just a directory.
5. **Community-editable, low-friction — designed for later, not fully built now.** The prototype needs a place for suggestions to land, not a full moderation/consensus system.
6. **Mobile-first website**, PWA-installable. Not a native app.
7. **Reusable, standard components.** Use established libraries and services (Supabase, shadcn/ui, etc.) instead of building auth, a backend, or UI primitives from scratch.

## Prototype (v0) Scope

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

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Backend/DB/Auth/Storage | Supabase (Postgres + Auth + Storage) |
| Map | Leaflet.js + OpenStreetMap tiles |
| Forms/validation | react-hook-form + zod |
| Data fetching | TanStack Query |
| Hosting | Vercel |

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project (or use an existing one), then copy `.env.local.example` to `.env.local` and fill in the values from Project Settings → API:

   ```bash
   cp .env.local.example .env.local
   ```

3. Link the Supabase CLI to your project and run migrations:

   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

   This creates the `places`, `lists`, `list_items`, and `place_suggestions` tables with RLS policies (see `supabase/migrations/`). Magic-link email auth is enabled by default in Supabase Auth — no extra setup needed.

4. Seed the `places` table with the starting set of Costa Rican outdoor places:

   ```bash
   npm run seed
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Verifying against the real database

`scripts/verify-*.mjs` and `verify-zod-schemas.ts` exercise the app's actual Supabase queries (including RLS) using throwaway test users, rather than mocks. Run them after schema or server-action changes:

```bash
npm run verify:supabase          # connection + basic query sanity
npm run verify:list-items        # save/mark-visited flow
npm run verify:my-list           # My List toggle/remove flow
npm run verify:place-suggestions # suggest-a-place / suggest-an-edit flow
npm run verify:zod               # zod schema validation
```

### Deployment

The project deploys to Vercel automatically on every push to `main` (connected via Vercel's GitHub integration — Project Settings → Git). Vercel needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set for Production/Preview/Development under Project Settings → Environment Variables, matching your `.env.local`.
