-- ============================================================================
-- AI protocol generation log
-- ----------------------------------------------------------------------------
-- One row per Anthropic call (and per cache hit / fallback). Used for cost
-- monitoring (admin dashboard), debugging bad protocols, and lookup-by-hash
-- caching: if a row exists with status='success' for (user_id, hash) within
-- the last 30 days, we re-use the existing protocol instead of re-billing.
--
-- Inserts are server-side only (service_role bypasses RLS). Users may SELECT
-- their own rows so we can show them their own generation history later.
-- ============================================================================

create table if not exists public.ai_protocol_logs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade,
  protocol_id         uuid references public.protocols(id) on delete set null,
  tier                text not null check (tier in ('free', 'premium')),
  model               text not null,
  input_tokens        int  not null default 0,
  output_tokens       int  not null default 0,
  estimated_cost_usd  numeric(10, 6) not null default 0,
  cache_hit           boolean not null default false,
  duration_ms         int,
  status              text not null check (status in ('success', 'error', 'fallback')),
  error_message       text,
  quiz_answers_hash   text,
  created_at          timestamptz not null default now()
);

create index if not exists ai_protocol_logs_user_id_idx
  on public.ai_protocol_logs(user_id);

create index if not exists ai_protocol_logs_quiz_hash_idx
  on public.ai_protocol_logs(user_id, quiz_answers_hash, status, created_at desc);

alter table public.ai_protocol_logs enable row level security;

drop policy if exists "ai_protocol_logs_select_own" on public.ai_protocol_logs;

create policy "ai_protocol_logs_select_own"
  on public.ai_protocol_logs for select
  using (auth.uid() = user_id);

-- Intentionally no INSERT/UPDATE/DELETE policy: only the service_role client
-- (used in our server-side AI generator) may write to this table.

comment on table public.ai_protocol_logs
  is 'Cost-tracking + cache lookup table for AI protocol generations. Server-only inserts.';
comment on column public.ai_protocol_logs.quiz_answers_hash
  is 'SHA-256 of the canonicalized profile inputs used for the generation. Used as cache key.';
comment on column public.ai_protocol_logs.cache_hit
  is 'true when this generation was served from a prior log without re-calling the model.';
