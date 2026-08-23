-- Serialize client-side quota checks so concurrent inserts cannot bypass plan limits.
CREATE OR REPLACE FUNCTION public.can_insert_user_message(_conversation_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE owner_id UUID; user_plan TEXT; max_messages INTEGER; recent_count INTEGER;
BEGIN
  SELECT user_id INTO owner_id FROM public.conversations WHERE id = _conversation_id;
  IF owner_id IS NULL OR owner_id <> auth.uid() THEN RETURN FALSE; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::TEXT || ':messages', 0));
  SELECT CASE WHEN subscription_status = 'active' AND plan IN ('pro', 'ultra') THEN plan ELSE 'free' END INTO user_plan FROM public.profiles WHERE id = auth.uid();
  max_messages := CASE user_plan WHEN 'ultra' THEN 5000 WHEN 'pro' THEN 500 ELSE 25 END;
  SELECT COUNT(*) INTO recent_count FROM public.messages WHERE conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()) AND role = 'user' AND created_at >= NOW() - INTERVAL '24 hours';
  RETURN recent_count < max_messages;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_insert_user_file()
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE user_plan TEXT; max_files INTEGER; current_files INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::TEXT || ':files', 0));
  SELECT CASE WHEN subscription_status = 'active' AND plan IN ('pro', 'ultra') THEN plan ELSE 'free' END INTO user_plan FROM public.profiles WHERE id = auth.uid();
  max_files := CASE user_plan WHEN 'ultra' THEN 1000 WHEN 'pro' THEN 100 ELSE 10 END;
  SELECT COUNT(*) INTO current_files FROM public.user_files WHERE user_id = auth.uid();
  RETURN current_files < max_files;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.can_insert_user_message(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.can_insert_user_message(UUID) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.can_insert_user_file() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.can_insert_user_file() TO authenticated, service_role;
