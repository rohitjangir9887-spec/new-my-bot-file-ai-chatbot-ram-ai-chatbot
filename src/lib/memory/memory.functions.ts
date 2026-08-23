import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { clearMemories, deleteMemory, listMemories, saveMemory } from './memory.server';

async function currentUserId() {
  const request = getRequest();
  const authHeader = request?.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) throw new Error('UNAUTHORIZED');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
  if (error || !user) throw new Error('UNAUTHORIZED');
  return user.id;
}

export const getMemories = createServerFn({ method: 'GET' }).handler(async () => listMemories(await currentUserId()));
export const createMemory = createServerFn({ method: 'POST' }).validator((data: unknown) => z.object({ content: z.string().min(1).max(8000) }).parse(data)).handler(async ({ data }) => saveMemory(await currentUserId(), data.content));
export const removeMemory = createServerFn({ method: 'POST' }).validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data)).handler(async ({ data }) => { await deleteMemory(await currentUserId(), data.id); return { success: true }; });
export const removeAllMemories = createServerFn({ method: 'POST' }).handler(async () => { await clearMemories(await currentUserId()); return { success: true }; });
