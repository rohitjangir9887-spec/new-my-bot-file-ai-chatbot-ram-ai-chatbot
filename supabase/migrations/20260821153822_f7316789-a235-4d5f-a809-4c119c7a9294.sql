-- Fix 0011 & 0028 & 0029 for has_role (already handled SECURITY DEFINER and search_path, but will explicitly revoke execute from public and anon)
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM public;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;

-- Fix 0011 & 0028 & 0029 for handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Fix 0011 for handle_updated_at (Security invoker is fine, but adding search_path for safety)
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- Fix 0008 RLS Enabled No Policy for user_roles
-- Admin can view all roles, users can view their own roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own role" ON public.user_roles
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
