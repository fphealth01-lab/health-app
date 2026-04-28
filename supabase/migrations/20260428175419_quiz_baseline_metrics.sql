-- Baseline self-report scores captured during onboarding (Q5–Q7).
-- 1–10 scale; null = user hasn't completed the quiz yet.
alter table public.profiles
  add column if not exists baseline_energy        int check (baseline_energy        between 1 and 10),
  add column if not exists baseline_sleep_quality int check (baseline_sleep_quality between 1 and 10),
  add column if not exists baseline_stress        int check (baseline_stress        between 1 and 10);

comment on column public.profiles.baseline_energy        is 'Onboarding Q5 — self-rated daily energy (1=exhausted, 10=high).';
comment on column public.profiles.baseline_sleep_quality is 'Onboarding Q6 — self-rated sleep quality (1=poor, 10=excellent).';
comment on column public.profiles.baseline_stress        is 'Onboarding Q7 — self-rated stress (1=relaxed, 10=overwhelmed).';
