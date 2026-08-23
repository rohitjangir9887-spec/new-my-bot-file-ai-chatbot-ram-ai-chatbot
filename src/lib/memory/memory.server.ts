import { supabaseAdmin } from '@/integrations/supabase/client.server';

const db = supabaseAdmin as any;

async function embed(text: string) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error('MEMORY_EMBEDDINGS_NOT_CONFIGURED');
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: process.env.MEMORY_EMBEDDING_MODEL?.trim() || 'text-embedding-3-small', input: text.slice(0, 8000) }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('MEMORY_EMBEDDING_FAILED');
  const body: any = await response.json().catch(() => null);
  const embedding = body?.data?.[0]?.embedding;
  if (!Array.isArray(embedding) || embedding.length !== 1536) throw new Error('MEMORY_EMBEDDING_INVALID');
  return embedding;
}

export async function saveMemory(userId: string, content: string, metadata: Record<string, unknown> = {}) {
  const normalized = content.trim();
  if (!normalized || normalized.length > 8000) throw new Error('INVALID_MEMORY');
  const embedding = await embed(normalized);
  const { data, error } = await db.from('user_memories').insert({ user_id: userId, content: normalized, embedding, metadata }).select('id, content, metadata, created_at').single();
  if (error) throw new Error('MEMORY_SAVE_FAILED');
  return data;
}

export async function listMemories(userId: string) {
  const { data, error } = await db.from('user_memories').select('id, content, metadata, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(100);
  if (error) throw new Error('MEMORY_LOAD_FAILED');
  return data || [];
}

export async function deleteMemory(userId: string, id: string) {
  const { error } = await db.from('user_memories').delete().eq('id', id).eq('user_id', userId);
  if (error) throw new Error('MEMORY_DELETE_FAILED');
}

export async function clearMemories(userId: string) {
  const { error } = await db.from('user_memories').delete().eq('user_id', userId);
  if (error) throw new Error('MEMORY_CLEAR_FAILED');
}

export async function retrieveMemories(userId: string, query: string) {
  if (!query.trim() || !process.env.OPENAI_API_KEY?.trim()) return [];
  try {
    const embedding = await embed(query);
    const { data, error } = await db.rpc('match_user_memories', { query_embedding: embedding, match_threshold: 0.72, match_count: 5, target_user_id: userId });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}
