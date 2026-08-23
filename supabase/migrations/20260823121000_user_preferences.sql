ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS personalization_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS response_tone TEXT NOT NULL DEFAULT 'professional',
  ADD COLUMN IF NOT EXISTS response_length TEXT NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS web_search_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS memory_enabled BOOLEAN NOT NULL DEFAULT TRUE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_response_tone_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_response_tone_check CHECK (response_tone IN ('professional', 'casual', 'creative'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_response_length_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_response_length_check CHECK (response_length IN ('short', 'normal', 'detailed'));
  END IF;
END $$;

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (email, full_name, avatar_url, custom_instructions, personalization_enabled, response_tone, response_length, web_search_enabled, memory_enabled) ON public.profiles TO authenticated;
