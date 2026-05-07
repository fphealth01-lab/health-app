-- Conversation threads
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now()
);

CREATE INDEX idx_chat_conversations_user ON public.chat_conversations(user_id, last_message_at DESC);

-- Individual messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  model text,
  input_tokens int,
  output_tokens int,
  estimated_cost_usd numeric(10, 6),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id, created_at);
CREATE INDEX idx_chat_messages_user ON public.chat_messages(user_id, created_at DESC);

-- Daily message count for rate limiting
CREATE TABLE public.chat_daily_usage (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  message_count int DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own conversations" ON public.chat_conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own messages" ON public.chat_messages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own usage" ON public.chat_daily_usage
  FOR SELECT USING (auth.uid() = user_id);
