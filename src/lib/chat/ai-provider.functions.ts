import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getRequest } from '@tanstack/react-start/server';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

// Client-safe metadata only. Secrets and provider configuration stay server-side.
export const chatModels = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', icon: 'zap', modes: ['auto', 'creative', 'coding'] },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', icon: 'zap', modes: ['auto', 'fast'] },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', icon: 'sparkles', modes: ['auto', 'reasoning', 'coding'] },
  { id: 'nvidia-nim', name: 'NVIDIA NIM', provider: 'nvidia', icon: 'brain', modes: ['auto', 'coding', 'reasoning'] },
] as const;

export const aiModes = [
  { id: 'auto', name: 'Auto', desc: 'Balanced intelligence', icon: 'sparkles' },
  { id: 'fast', name: 'Fast', desc: 'Lightning quick responses', icon: 'zap' },
  { id: 'reasoning', name: 'Reasoning', desc: 'Deep logical analysis', icon: 'brain' },
  { id: 'creative', name: 'Creative', desc: 'Inspired & expressive', icon: 'palette' },
  { id: 'coding', name: 'Coding', desc: 'Optimized for syntax', icon: 'code' },
];

async function validateOwnership(conversationId: string) {
  const request = getRequest();
  const authHeader = request?.headers.get('Authorization');
  if (!authHeader) throw new Error('Unauthorized');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
  if (error || !user) throw new Error('Unauthorized');
  const { data: conversation } = await supabaseAdmin.from('conversations').select('user_id').eq('id', conversationId).single();
  if (!conversation || conversation.user_id !== user.id) throw new Error('Forbidden');
  return user;
}

export const generateAssistantResponse = createServerFn({ method: 'POST' })
  .validator((data: unknown) => z.object({ conversationId: z.string().uuid(), modelId: z.string(), messages: z.array(z.object({ role: z.enum(['user', 'assistant', 'system']), content: z.string() })) }).parse(data))
  .handler(async ({ data }) => {
    await validateOwnership(data.conversationId);
    return { success: false, text: '', error: 'Chat generation is handled by the streaming API.' };
  });

export const streamChatResponse = generateAssistantResponse;
