-- Affiliate outbound click tracking (service-role inserts from /go/* route)
create table if not exists public.affiliate_clicks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  supplement_id   uuid references public.supplements(id) on delete set null,
  brand_id        uuid references public.supplement_brands(id) on delete set null,
  region          text,
  affiliate_url   text not null,
  user_agent      text,
  referrer        text,
  country_code    text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_affiliate_clicks_supplement
  on public.affiliate_clicks(supplement_id);

create index if not exists idx_affiliate_clicks_created
  on public.affiliate_clicks(created_at desc);

alter table public.affiliate_clicks enable row level security;

-- No policies: anon/authenticated cannot read or write; service role bypasses RLS.

comment on table public.affiliate_clicks is 'Outbound supplement affiliate redirects for analytics.';
