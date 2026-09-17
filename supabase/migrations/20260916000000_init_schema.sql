-- CR Outdoor Places — initial schema
-- See docs/build-plan Section 4 for the data model this implements.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- places
-- ---------------------------------------------------------------------------
create table places (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  category      text not null
    check (category in ('national_park', 'municipal_park', 'private_reserve', 'beach', 'mountain', 'trail', 'other')),
  province      text,
  canton        text,
  lat           double precision not null,
  lng           double precision not null,
  difficulty    text
    check (difficulty in ('easy', 'moderate', 'hard')),
  terrain       text
    check (terrain in ('paved', 'dirt', 'rocky', 'mixed')),
  distance_m    integer,
  duration_min  integer,
  cost_type     text not null default 'unknown'
    check (cost_type in ('free', 'paid', 'unknown')),
  cost_amount   text,
  pet_friendly  text not null default 'unknown'
    check (pet_friendly in ('yes', 'no', 'unknown')),
  hours_text    text,
  source        text not null default 'seed'
    check (source in ('seed', 'community')),
  confidence    text not null default 'unverified'
    check (confidence in ('unverified', 'verified')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index places_category_idx on places (category);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger places_set_updated_at
  before update on places
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- lists
-- ---------------------------------------------------------------------------
create table lists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null default 'My List',
  created_at timestamptz not null default now()
);

create index lists_user_id_idx on lists (user_id);

-- ---------------------------------------------------------------------------
-- list_items
-- ---------------------------------------------------------------------------
create table list_items (
  id         uuid primary key default gen_random_uuid(),
  list_id    uuid not null references lists (id) on delete cascade,
  place_id   uuid not null references places (id) on delete cascade,
  status     text not null default 'saved'
    check (status in ('saved', 'visited')),
  visited_at timestamptz,
  created_at timestamptz not null default now()
);

create index list_items_list_id_idx on list_items (list_id);
create index list_items_place_id_idx on list_items (place_id);

-- ---------------------------------------------------------------------------
-- place_suggestions
-- ---------------------------------------------------------------------------
create table place_suggestions (
  id           uuid primary key default gen_random_uuid(),
  place_id     uuid references places (id) on delete set null,
  suggested_by uuid references auth.users (id) on delete set null,
  changes      jsonb not null,
  status       text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at   timestamptz not null default now()
);

create index place_suggestions_place_id_idx on place_suggestions (place_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

-- places: readable by everyone, writable only via place_suggestions (no
-- insert/update/delete policy for anon/authenticated — direct edits happen
-- via the service role / Supabase dashboard for v0).
alter table places enable row level security;

create policy "places_select_all"
  on places for select
  using (true);

-- lists: owner-only.
alter table lists enable row level security;

create policy "lists_select_own"
  on lists for select
  using (auth.uid() = user_id);

create policy "lists_insert_own"
  on lists for insert
  with check (auth.uid() = user_id);

create policy "lists_update_own"
  on lists for update
  using (auth.uid() = user_id);

create policy "lists_delete_own"
  on lists for delete
  using (auth.uid() = user_id);

-- list_items: owner-only, via the parent list's user_id.
alter table list_items enable row level security;

create policy "list_items_select_own"
  on list_items for select
  using (exists (
    select 1 from lists
    where lists.id = list_items.list_id
      and lists.user_id = auth.uid()
  ));

create policy "list_items_insert_own"
  on list_items for insert
  with check (exists (
    select 1 from lists
    where lists.id = list_items.list_id
      and lists.user_id = auth.uid()
  ));

create policy "list_items_update_own"
  on list_items for update
  using (exists (
    select 1 from lists
    where lists.id = list_items.list_id
      and lists.user_id = auth.uid()
  ));

create policy "list_items_delete_own"
  on list_items for delete
  using (exists (
    select 1 from lists
    where lists.id = list_items.list_id
      and lists.user_id = auth.uid()
  ));

-- place_suggestions: any authenticated user can submit a suggestion; only
-- the service role (i.e. direct Supabase dashboard access, for v0 — no
-- admin UI) can read or update them. No select/update policy is defined
-- for anon/authenticated on purpose.
alter table place_suggestions enable row level security;

create policy "place_suggestions_insert_authenticated"
  on place_suggestions for insert
  to authenticated
  with check (auth.uid() = suggested_by);
