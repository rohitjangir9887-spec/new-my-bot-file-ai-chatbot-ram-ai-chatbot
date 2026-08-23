-- Production hardening: ownership, plans, usage, memories, and message integrity.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_plan_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'pro', 'ultra'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('message', 'image', 'tool', 'file')),
  model_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS usage_events_user_created_idx ON public.usage_events(user_id, created_at DESC);
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.usage_events TO authenticated;
GRANT ALL ON public.usage_events TO service_role;
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_events;
CREATE POLICY "Users can view their own usage" ON public.usage_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS public.user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(btrim(content)) > 0),
  embedding VECTOR(1536),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS user_memories_user_idx ON public.user_memories(user_id, created_at DESC);
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_memories TO authenticated;
GRANT ALL ON public.user_memories TO service_role;
DROP POLICY IF EXISTS "Users can manage their own memories" ON public.user_memories;
CREATE POLICY "Users can manage their own memories" ON public.user_memories
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_role_check') THEN
    ALTER TABLE public.messages ADD CONSTRAINT messages_role_check CHECK (role IN ('user', 'assistant', 'system'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_content_nonempty') THEN
    ALTER TABLE public.messages ADD CONSTRAINT messages_content_nonempty CHECK (char_length(btrim(content)) > 0);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.can_insert_user_message(_conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id UUID;
  user_plan TEXT;
  max_messages INTEGER;
  recent_count INTEGER;
BEGIN
  SELECT user_id INTO owner_id FROM public.conversations WHERE id = _conversation_id;
  IF owner_id IS NULL OR owner_id <> auth.uid() THEN RETURN FALSE; END IF;
  SELECT plan INTO user_plan FROM public.profiles WHERE id = auth.uid();
  max_messages := CASE user_plan WHEN 'ultra' THEN 5000 WHEN 'pro' THEN 500 ELSE 25 END;
  SELECT COUNT(*) INTO recent_count FROM public.messages
    WHERE conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid())
      AND role = 'user' AND created_at >= NOW() - INTERVAL '24 hours';
  RETURN recent_count < max_messages;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.can_insert_user_message(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.can_insert_user_message(UUID) TO authenticated, service_role;

DROP POLICY IF EXISTS "Users can insert messages into their conversations" ON public.messages;
CREATE POLICY "Users can insert user messages into their conversations" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    role = 'user'
    AND public.can_insert_user_message(conversation_id)
    AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
CREATE POLICY "Users can update messages in their conversations" ON public.messages
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON public.messages;
CREATE POLICY "Users can delete messages in their conversations" ON public.messages
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', false)
ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP TRIGGER IF EXISTS on_memory_updated ON public.user_memories;
CREATE TRIGGER on_memory_updated
  BEFORE UPDATE ON public.user_memories
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
