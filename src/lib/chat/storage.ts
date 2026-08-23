import { supabase } from '@/integrations/supabase/client';

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOC_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];

export interface UploadResult { url: string; path: string; id: string; }

export async function uploadFile(file: File, userId: string, onProgress?: (progress: number) => void): Promise<UploadResult> {
  if (file.size > MAX_FILE_SIZE) throw new Error('File too large (max 10MB)');
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isDoc = ALLOWED_DOC_TYPES.includes(file.type);
  if (!isImage && !isDoc) throw new Error('Unsupported file type');
  if (!userId) throw new Error('Authentication required');

  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;
  onProgress?.(10);

  // Reserve the user's stored-file slot before uploading. The RLS function serializes concurrent reservations.
  const { data: fileData, error: reservationError } = await supabase.from('user_files').insert({
    user_id: userId,
    storage_path: filePath,
    filename: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    metadata: { status: 'uploading' },
  }).select().single();
  if (reservationError || !fileData) throw new Error('File limit reached or file could not be reserved');

  try {
    onProgress?.(20);
    const { data, error } = await supabase.storage.from('user-files').upload(filePath, file, { cacheControl: '3600', upsert: false });
    if (error) throw new Error('File upload failed');
    onProgress?.(70);

    const { error: finalizeError } = await supabase.from('user_files').update({ metadata: { status: 'ready' } }).eq('id', fileData.id).eq('user_id', userId);
    if (finalizeError) throw new Error('File could not be finalized');

    const { data: urlData, error: urlError } = await supabase.storage.from('user-files').createSignedUrl(data.path, 3600);
    if (urlError) throw new Error('File URL could not be created');
    onProgress?.(100);
    return { url: urlData.signedUrl, path: data.path, id: fileData.id };
  } catch (error) {
    await supabase.from('user_files').delete().eq('id', fileData.id).eq('user_id', userId);
    await supabase.storage.from('user-files').remove([filePath]);
    throw error instanceof Error ? error : new Error('File upload failed');
  }
}

export async function getFileSignedUrl(path: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Authentication required');
  const { data, error } = await supabase.storage.from('user-files').createSignedUrl(path, 3600);
  if (error) throw new Error('File URL could not be created');
  return data.signedUrl;
}

export async function deleteFile(path: string, fileId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Authentication required');
  const { error: dbError } = await supabase.from('user_files').delete().eq('id', fileId).eq('user_id', session.user.id);
  if (dbError) throw new Error('File could not be deleted');
  const { error: storageError } = await supabase.storage.from('user-files').remove([path]);
  if (storageError) throw new Error('File could not be deleted');
}
