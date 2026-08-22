import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const chatModels = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', icon: 'zap', modes: ['auto', 'creative', 'coding'] },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', icon: 'sparkles', modes: ['auto', 'reasoning', 'coding'] },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', icon: 'zap', modes: ['auto', 'fast'] },
];

export const aiModes = [
  { id: 'auto', name: 'Auto', desc: 'Balanced intelligence', icon: 'sparkles' },
  { id: 'fast', name: 'Fast', desc: 'Lightning quick responses', icon: 'zap' },
  { id: 'reasoning', name: 'Reasoning', desc: 'Deep logical analysis', icon: 'brain' },
  { id: 'creative', name: 'Creative', desc: 'Inspired & expressive', icon: 'palette' },
  { id: 'coding', name: 'Coding', desc: 'Optimized for syntax', icon: 'code' },
];


/**
 * Validates the conversation ownership and returns the user object.
 */
async function validateOwnership(conversationId: string) {
  const request = getRequest();
  if (!request) throw new Error("No request context");

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    throw new Error("Unauthorized: Missing auth header");
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
  if (authError || !user) {
    throw new Error("Unauthorized: Invalid session");
  }

  const { data: conversation, error: convError } = await supabaseAdmin
    .from('conversations')
    .select('user_id')
    .eq('id', conversationId)
    .single();

  if (convError || !conversation || conversation.user_id !== user.id) {
    throw new Error("Forbidden: You do not own this conversation");
  }

  return user;
}

export const generateAssistantResponse = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({
    conversationId: z.string().uuid(),
    modelId: z.string().default('gpt-4o'),
    messages: z.array(z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string()
    }))
  }).parse(data))
  .handler(async ({ data }) => {
    await validateOwnership(data.conversationId);
    
    // This server function acts as the fallback or non-streaming handler.
    // Real implementation would return the full completing text if stream=false
    return { 
      success: true, 
      text: "Please use the streaming endpoint for real-time responses.",
      usage: { prompt_tokens: 0, completion_tokens: 0 }
    };
  });

// Compatibility export
export const streamChatResponse = generateAssistantResponse;
