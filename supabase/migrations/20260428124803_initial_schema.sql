-- ============================================================================
-- Longevity Platform — Initial Schema
-- ============================================================================
-- Tables: profiles, supplements, supplement_brands, protocols, protocol_items,
--         tracking_entries, daily_checkins, subscriptions
-- Plus:   RLS policies, auto-profile-on-signup trigger, updated_at triggers.
-- All user-data tables have RLS enabled. Public catalog tables (supplements,
-- supplement_brands) allow read-only access to everyone.
-- ============================================================================

-- Required for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. profiles
-- ----------------------------------------------------------------------------
-- One row per auth user, created automatically on signup via trigger below.
-- ============================================================================
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text unique not null,
  full_name             text,
  avatar_url            text,
  age                   int,
  sex                   text check (sex in ('male', 'female', 'other')),
  weight_kg             numeric,
  height_cm             numeric,
  activity_level        text check (activity_level in ('sedentary','light','moderate','active','very_active')),
  primary_goal          text check (primary_goal in ('testosterone','sleep','skin','energy','focus','longevity')),
  secondary_goals       text[] not null default array[]::text[],
  dietary_preference    text check (dietary_preference in ('omnivore','vegetarian','vegan','keto','pescatarian','carnivore')),
  allergies             text[] not null default array[]::text[],
  medical_conditions    text[] not null default array[]::text[],
  medications           text[] not null default array[]::text[],
  current_supplements   text[] not null default array[]::text[],
  onboarding_completed  boolean not null default false,
  country_code          text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on table public.profiles is 'User profile and onboarding answers. One row per auth user.';
comment on column public.profiles.country_code is 'ISO 3166-1 alpha-2 country code, used for affiliate geo-routing.';

-- ============================================================================
-- 2. supplements (master catalog)
-- ============================================================================
create table if not exists public.supplements (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  name                text not null,
  category            text not null,
  short_description   text not null,
  long_description    text,
  benefits            text[] not null default array[]::text[],
  goals_targeted      text[] not null default array[]::text[],
  dosing_low_mg       numeric,
  dosing_high_mg      numeric,
  dosing_unit         text not null default 'mg',
  timing              text not null check (timing in ('morning','evening','with_food','empty_stomach','before_bed','flexible','split_dose')),
  interactions        text[] not null default array[]::text[],
  contraindications   text[] not null default array[]::text[],
  citations           jsonb not null default '[]'::jsonb,
  created_at          timestamptz not null default now()
);

create index if not exists supplements_slug_idx     on public.supplements(slug);
create index if not exists supplements_category_idx on public.supplements(category);
create index if not exists supplements_goals_idx    on public.supplements using gin (goals_targeted);

comment on column public.supplements.citations is 'jsonb array of {title, url, journal, year}.';

-- ============================================================================
-- 3. supplement_brands (region-specific affiliate links)
-- ============================================================================
create table if not exists public.supplement_brands (
  id              uuid primary key default gen_random_uuid(),
  supplement_id   uuid not null references public.supplements(id) on delete cascade,
  brand_name      text not null,
  product_name    text not null,
  region          text not null check (region in ('us','eu','uk','ro','global')),
  affiliate_url   text not null,
  price_usd       numeric,
  is_recommended  boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists supplement_brands_supplement_idx on public.supplement_brands(supplement_id);
create index if not exists supplement_brands_region_idx     on public.supplement_brands(region);

-- ============================================================================
-- 4. protocols
-- ============================================================================
create table if not exists public.protocols (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  goal            text not null,
  name            text not null default 'My Protocol',
  is_personalized boolean not null default false,
  ai_reasoning    text,
  generated_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists protocols_user_idx on public.protocols(user_id);

-- ============================================================================
-- 5. protocol_items (supplements within a protocol)
-- ============================================================================
create table if not exists public.protocol_items (
  id            uuid primary key default gen_random_uuid(),
  protocol_id   uuid not null references public.protocols(id) on delete cascade,
  supplement_id uuid not null references public.supplements(id) on delete restrict,
  dose_mg       numeric not null,
  dose_unit     text not null default 'mg',
  timing        text not null,
  frequency     text not null default 'daily' check (frequency in ('daily','twice_daily','as_needed')),
  ai_reasoning  text,
  order_index   int  not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists protocol_items_protocol_idx   on public.protocol_items(protocol_id);
create index if not exists protocol_items_supplement_idx on public.protocol_items(supplement_id);

-- ============================================================================
-- 6. tracking_entries (daily logged dose)
-- ============================================================================
create table if not exists public.tracking_entries (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  protocol_item_id   uuid not null references public.protocol_items(id) on delete cascade,
  date               date not null,
  taken              boolean not null default false,
  taken_at           timestamptz,
  notes              text,
  created_at         timestamptz not null default now(),
  unique (user_id, protocol_item_id, date)
);

create index if not exists tracking_entries_user_date_idx on public.tracking_entries(user_id, date);

-- ============================================================================
-- 7. daily_checkins (mood/energy/sleep self-report)
-- ============================================================================
create table if not exists public.daily_checkins (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  date           date not null,
  energy_level   int  not null check (energy_level   between 1 and 10),
  mood           int  not null check (mood           between 1 and 10),
  sleep_quality  int  not null check (sleep_quality  between 1 and 10),
  sleep_hours    numeric,
  stress_level   int  not null check (stress_level   between 1 and 10),
  notes          text,
  created_at     timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists daily_checkins_user_date_idx on public.daily_checkins(user_id, date);

-- ============================================================================
-- 8. subscriptions (Stripe state mirror — written by webhooks, read by user)
-- ============================================================================
create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid unique not null references auth.users(id) on delete cascade,
  stripe_customer_id       text unique,
  stripe_subscription_id   text unique,
  status                   text not null default 'free' check (status in ('free','trialing','active','past_due','canceled')),
  price_id                 text,
  current_period_end       timestamptz,
  trial_end                timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions(user_id);

-- ============================================================================
-- updated_at helper + triggers
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at      on public.profiles;
drop trigger if exists protocols_set_updated_at     on public.protocols;
drop trigger if exists subscriptions_set_updated_at on public.subscriptions;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger protocols_set_updated_at
  before update on public.protocols
  for each row execute function public.set_updated_at();

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Auto-create profile + free subscription row on auth signup
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER so the trigger can write to public.profiles regardless of
-- the (anon) caller's row-level permissions. `search_path = public, auth` is
-- pinned to prevent search-path injection attacks. Errors are raised so a
-- failed insert blocks the signup (better than orphaned auth.users rows).
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, status)
  values (new.id, 'free')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- ----------------------------------------------------------------------------
-- Health data is sensitive. Every user-data table is RLS-protected. Public
-- catalog tables (supplements, supplement_brands) get a read-everyone policy.
-- ============================================================================

-- profiles ------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own"  on public.profiles;
drop policy if exists "profiles_insert_own"  on public.profiles;
drop policy if exists "profiles_update_own"  on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- INSERT covers the (rare) case where the trigger didn't create a row and
-- the client wants to upsert during onboarding.
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- supplements (public read) -------------------------------------------------
alter table public.supplements enable row level security;

drop policy if exists "supplements_select_all" on public.supplements;
create policy "supplements_select_all"
  on public.supplements for select
  to authenticated, anon
  using (true);

-- supplement_brands (public read) -------------------------------------------
alter table public.supplement_brands enable row level security;

drop policy if exists "supplement_brands_select_all" on public.supplement_brands;
create policy "supplement_brands_select_all"
  on public.supplement_brands for select
  to authenticated, anon
  using (true);

-- protocols -----------------------------------------------------------------
alter table public.protocols enable row level security;

drop policy if exists "protocols_select_own" on public.protocols;
drop policy if exists "protocols_insert_own" on public.protocols;
drop policy if exists "protocols_update_own" on public.protocols;
drop policy if exists "protocols_delete_own" on public.protocols;

create policy "protocols_select_own"
  on public.protocols for select
  using (auth.uid() = user_id);

create policy "protocols_insert_own"
  on public.protocols for insert
  with check (auth.uid() = user_id);

create policy "protocols_update_own"
  on public.protocols for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "protocols_delete_own"
  on public.protocols for delete
  using (auth.uid() = user_id);

-- protocol_items (parent-protocol must belong to user) -----------------------
alter table public.protocol_items enable row level security;

drop policy if exists "protocol_items_select_own" on public.protocol_items;
drop policy if exists "protocol_items_insert_own" on public.protocol_items;
drop policy if exists "protocol_items_update_own" on public.protocol_items;
drop policy if exists "protocol_items_delete_own" on public.protocol_items;

create policy "protocol_items_select_own"
  on public.protocol_items for select
  using (
    exists (
      select 1 from public.protocols p
      where p.id = protocol_items.protocol_id and p.user_id = auth.uid()
    )
  );

create policy "protocol_items_insert_own"
  on public.protocol_items for insert
  with check (
    exists (
      select 1 from public.protocols p
      where p.id = protocol_items.protocol_id and p.user_id = auth.uid()
    )
  );

create policy "protocol_items_update_own"
  on public.protocol_items for update
  using (
    exists (
      select 1 from public.protocols p
      where p.id = protocol_items.protocol_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.protocols p
      where p.id = protocol_items.protocol_id and p.user_id = auth.uid()
    )
  );

create policy "protocol_items_delete_own"
  on public.protocol_items for delete
  using (
    exists (
      select 1 from public.protocols p
      where p.id = protocol_items.protocol_id and p.user_id = auth.uid()
    )
  );

-- tracking_entries ----------------------------------------------------------
alter table public.tracking_entries enable row level security;

drop policy if exists "tracking_entries_select_own" on public.tracking_entries;
drop policy if exists "tracking_entries_insert_own" on public.tracking_entries;
drop policy if exists "tracking_entries_update_own" on public.tracking_entries;
drop policy if exists "tracking_entries_delete_own" on public.tracking_entries;

create policy "tracking_entries_select_own"
  on public.tracking_entries for select
  using (auth.uid() = user_id);

create policy "tracking_entries_insert_own"
  on public.tracking_entries for insert
  with check (auth.uid() = user_id);

create policy "tracking_entries_update_own"
  on public.tracking_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tracking_entries_delete_own"
  on public.tracking_entries for delete
  using (auth.uid() = user_id);

-- daily_checkins ------------------------------------------------------------
alter table public.daily_checkins enable row level security;

drop policy if exists "daily_checkins_select_own" on public.daily_checkins;
drop policy if exists "daily_checkins_insert_own" on public.daily_checkins;
drop policy if exists "daily_checkins_update_own" on public.daily_checkins;
drop policy if exists "daily_checkins_delete_own" on public.daily_checkins;

create policy "daily_checkins_select_own"
  on public.daily_checkins for select
  using (auth.uid() = user_id);

create policy "daily_checkins_insert_own"
  on public.daily_checkins for insert
  with check (auth.uid() = user_id);

create policy "daily_checkins_update_own"
  on public.daily_checkins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_checkins_delete_own"
  on public.daily_checkins for delete
  using (auth.uid() = user_id);

-- subscriptions (read-own; INSERT/UPDATE only via service_role from webhooks)
alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);
-- No INSERT/UPDATE/DELETE policies for users — service_role bypasses RLS.
