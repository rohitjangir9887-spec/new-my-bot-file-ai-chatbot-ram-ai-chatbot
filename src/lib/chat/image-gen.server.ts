import { getRequest } from '@tanstack/react-start/server';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { consumeUsage } from '@/lib/usage/limits.server';

export async function generateImageServer(
  prompt: string,
  aspectRatio: '1:1' | '16:9' | '9:16' = '1:1',
  conversationId?: string,
) {
  const request = getRequest();
  if (!request) throw new Error('IMAGE_GENERATION_UNAVAILABLE');

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) throw new Error('UNAUTHORIZED');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
  if (authError || !user) throw new Error('UNAUTHORIZED');

  if (conversationId) {
    const { data: conversation } = await supabaseAdmin.from('conversations').select('user_id').eq('id', conversationId).maybeSingle();
    if (!conversation || conversation.user_id !== user.id) throw new Error('FORBIDDEN');
  }

  const usage = await consumeUsage(user.id, 'image');
  if (!usage.allowed) throw new Error('IMAGE_LIMIT_REACHED');

  const apiKey = process.env.LOVABLE_AI_API_KEY?.trim();
  if (!apiKey) throw new Error('IMAGE_GENERATION_NOT_CONFIGURED');
  if (!prompt.trim() || prompt.length > 4000) throw new Error('INVALID_IMAGE_PROMPT');

  try {
    const aiResponse = await fetch('https://api.lovable.ai/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        prompt: prompt.trim(),
        model: process.env.LOVABLE_IMAGE_MODEL?.trim() || 'dall-e-3',
        n: 1,
        size: aspectRatio === '1:1' ? '1024x1024' : aspectRatio === '16:9' ? '1792x1024' : '1024x1792',
        response_format: 'b64_json',
      }),
      signal: AbortSignal.timeout(90_000),
    });

    if (!aiResponse.ok) throw new Error('IMAGE_PROVIDER_FAILED');
    const result: any = await aiResponse.json().catch(() => null);
    const b64Data = result?.data?.[0]?.b64_json;
    if (!b64Data) throw new Error('IMAGE_PROVIDER_EMPTY');

    const buffer = Buffer.from(b64Data, 'base64');
    const storagePath = `generated/${user.id}/${crypto.randomUUID()}.png`;
    const { error: uploadError } = await supabaseAdmin.storage.from('user-files').upload(storagePath, buffer, {
      contentType: 'image/png', cacheControl: '3600', upsert: false,
    });
    if (uploadError) throw new Error('IMAGE_STORAGE_FAILED');

    const { data: fileRecord, error: dbError } = await supabaseAdmin.from('user_files').insert({
      user_id: user.id,
      filename: `Generated image - ${prompt.trim().slice(0, 80)}`,
      storage_path: storagePath,
      mime_type: 'image/png',
      size_bytes: buffer.length,
    }).select().single();
    if (dbError) {
      await supabaseAdmin.storage.from('user-files').remove([storagePath]);
      throw new Error('IMAGE_STORAGE_FAILED');
    }

    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage.from('user-files').createSignedUrl(storagePath, 3600);
    if (signedUrlError || !signedUrlData?.signedUrl) throw new Error('IMAGE_URL_FAILED');

    return {
      success: true,
      url: signedUrlData.signedUrl,
      storagePath,
      fileId: fileRecord.id,
      sizeBytes: buffer.length,
      mimeType: 'image/png',
      prompt: prompt.trim(),
    };
  } catch (error: any) {
    const safeCodes = new Set(['IMAGE_GENERATION_NOT_CONFIGURED', 'IMAGE_LIMIT_REACHED', 'IMAGE_PROVIDER_FAILED', 'IMAGE_PROVIDER_EMPTY', 'IMAGE_STORAGE_FAILED', 'IMAGE_URL_FAILED', 'INVALID_IMAGE_PROMPT']);
    throw new Error(safeCodes.has(error?.message) ? error.message : 'IMAGE_GENERATION_FAILED');
  }
}
