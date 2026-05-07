-- Weekly meal plans
CREATE TABLE public.meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start_date date NOT NULL,
  goal text,
  dietary_preference text,
  ai_reasoning text,
  ai_model text,
  ai_generated_at timestamptz,
  shopping_list jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, week_start_date)
);

CREATE INDEX idx_meal_plans_user ON public.meal_plans(user_id, week_start_date DESC);

-- Individual meals within a plan
CREATE TABLE public.meal_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id uuid REFERENCES public.meal_plans(id) ON DELETE CASCADE NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack_am', 'snack_pm')),
  name text NOT NULL,
  description text,
  ingredients jsonb DEFAULT '[]',
  prep_time_minutes int,
  calories int,
  protein_g int,
  carbs_g int,
  fat_g int,
  reasoning text,
  display_order int,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_meal_plan_items_plan ON public.meal_plan_items(meal_plan_id, day_of_week, display_order);

-- Track regenerations for rate limiting (4/week for premium)
CREATE TABLE public.meal_plan_regenerations (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start date NOT NULL DEFAULT date_trunc('week', CURRENT_DATE),
  count int DEFAULT 0,
  PRIMARY KEY (user_id, week_start)
);

-- Add type column to ai_protocol_logs for differentiating meal plan vs protocol logs
ALTER TABLE public.ai_protocol_logs
  ADD COLUMN IF NOT EXISTS log_type text NOT NULL DEFAULT 'protocol';

CREATE INDEX IF NOT EXISTS idx_ai_protocol_logs_type ON public.ai_protocol_logs(log_type);

-- RLS
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_regenerations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own meal plans" ON public.meal_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own meal items" ON public.meal_plan_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users see own regen counts" ON public.meal_plan_regenerations
  FOR SELECT USING (auth.uid() = user_id);
