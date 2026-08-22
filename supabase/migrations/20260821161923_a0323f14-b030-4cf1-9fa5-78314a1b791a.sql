-- 1. Extend Messages Table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 2. Create user_files table
CREATE TABLE IF NOT EXISTS public.user_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    storage_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_files TO authenticated;
GRANT ALL ON public.user_files TO service_role;

ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own files" ON public.user_files
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 3. Storage Bucket Policies (Assuming bucket name 'user-files')
DO $$
BEGIN
    -- Only attempt if storage schema exists
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        
        -- Insert policy
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload files' AND tablename = 'objects' AND schemaname = 'storage') THEN
            CREATE POLICY "Authenticated users can upload files" ON storage.objects
                FOR INSERT TO authenticated WITH CHECK (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);
        END IF;

        -- Select policy
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own files' AND tablename = 'objects' AND schemaname = 'storage') THEN
            CREATE POLICY "Users can view their own files" ON storage.objects
                FOR SELECT TO authenticated USING (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);
        END IF;

        -- Delete policy
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own files' AND tablename = 'objects' AND schemaname = 'storage') THEN
            CREATE POLICY "Users can delete their own files" ON storage.objects
                FOR DELETE TO authenticated USING (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);
        END IF;
    END IF;
END $$;