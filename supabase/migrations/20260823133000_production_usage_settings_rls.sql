-- Production audit hardening: server-side quota reservation, persisted settings, and complete ownership policies.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS web_search_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS safe_search BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS personalization_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS memory_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS response_tone TEXT NOT NULL DEFAULT 'professional',
  ADD COLUMN IF NOT EXISTS response_length TEXT NOT NULL DEFAULT 'normal';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_response_tone_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_response_tone_check CHECK (response_tone IN ('professional', 'casual', 'creative'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_response_length_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_response_length_check CHECK (response_length IN ('short', 'normal', 'detailed'));
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Atomic 24-hour quota reservation for messages/images/tools and atomic stored-file quota checks.
CREATE OR REPLACE FUNCTION public.consume_usage_atomic(
  _user_id UUID,
  _kind TEXT,
  _model_id TEXT DEFAULT NULL
)
RETURNS TABLE(allowed BOOLEAN, plan TEXT, limit_value INTEGER, used INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_plan TEXT;
  max_limit INTEGER;
  current_count INTEGER;
  lock_key BIGINT;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  IF _kind NOT IN ('message', 'image', 'tool', 'file') THEN
    RAISE EXCEPTION 'INVALID_USAGE_KIND';
  END IF;

  SELECT CASE
    WHEN subscription_status = 'active' AND plan IN ('pro', 'ultra') THEN plan
    ELSE 'free'
  END
  INTO current_plan
  FROM public.profiles
  WHERE id = _user_id;

  current_plan := COALESCE(current_plan, 'free');
  max_limit := CASE current_plan
    WHEN 'ultra' THEN CASE _kind WHEN 'message' THEN 5000 WHEN 'image' THEN 1000 WHEN 'tool' THEN 5000 ELSE 1000 END
    WHEN 'pro' THEN CASE _kind WHEN 'message' THEN 500 WHEN 'image' THEN 100 WHEN 'tool' THEN 500 ELSE 100 END
    ELSE CASE _kind WHEN 'message' THEN 25 WHEN 'image' THEN 3 WHEN 'tool' THEN 10 ELSE 10 END
  END;

  lock_key := hashtextextended(_user_id::TEXT || ':' || _kind, 0);
  PERFORM pg_advisory_xact_lock(lock_key);

  IF _kind = 'file' THEN
    SELECT COUNT(*)::INTEGER INTO current_count
    FROM public.user_files
    WHERE user_id = _user_id;
  ELSE
    SELECT COUNT(*)::INTEGER INTO current_count
    FROM public.usage_events
    WHERE user_id = _user_id
      AND kind = _kind
      AND created_at >= NOW() - INTERVAL '24 hours';
  END IF;

  IF current_count >= max_limit THEN
    RETURN QUERY SELECT FALSE, current_plan, max_limit, current_count;
    RETURN;
  END IF;

  IF _kind <> 'file' THEN
    INSERT INTO public.usage_events(user_id, kind, model_id)
    VALUES (_user_id, _kind, NULLIF(_model_id, ''));
    current_count := current_count + 1;
  ELSE
    current_count := current_count + 1;
  END IF;

  RETURN QUERY SELECT TRUE, current_plan, max_limit, current_count;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_usage_atomic(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_usage_atomic(UUID, TEXT, TEXT) TO service_role;

-- Memory CRUD is exposed through authenticated server routes using service_role; keep direct client access read-only.
DROP POLICY IF EXISTS "Users can view their own memories" ON public.user_memories;
CREATE POLICY "Users can view their own memories" ON public.user_memories
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can insert their own memories" ON public.user_memories;
CREATE POLICY "Users can insert their own memories" ON public.user_memories
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update their own memories" ON public.user_memories;
CREATE POLICY "Users can update their own memories" ON public.user_memories
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can delete their own memories" ON public.user_memories;
CREATE POLICY "Users can delete their own memories" ON public.user_memories
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- Explicit message ownership policies for all CRUD operations.
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = (select auth.uid())));
DROP POLICY IF EXISTS "Users can insert user messages into their conversations" ON public.messages;
CREATE POLICY "Users can insert user messages into their conversations" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (role = 'user' AND public.can_insert_user_message(conversation_id) AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = (select auth.uid())));
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
CREATE POLICY "Users can update messages in their conversations" ON public.messages
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = (select auth.uid())));
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON public.messages;
CREATE POLICY "Users can delete messages in their conversations" ON public.messages
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = (select auth.uid())));

CREATE INDEX IF NOT EXISTS messages_conversation_created_idx ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS conversations_user_updated_idx ON public.conversations(user_id, updated_at DESC);
