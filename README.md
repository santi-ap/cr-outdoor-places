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

```bash
npm install
npm run dev
```

Setup instructions for environment variables, migrations, and seeding will be added as the corresponding issues land (Supabase setup, seed script).

## Getting Started (Next.js default)

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
