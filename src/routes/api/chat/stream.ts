import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { z } from 'zod';
import { callModel, getFallbackModels, getModel } from '@/lib/chat/provider.server';
import { safeCalculator } from '@/lib/security/safeCalculator';

const requestSchema = z.object({
  conversationId: z.string().uuid(),
  modelId: z.string().min(1),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    attachments: z.array(z.any()).optional(),
  })).min(1),
});

const tools = [
  { type: 'function', function: { name: 'calculator', description: 'Evaluate a mathematical expression safely.', parameters: { type: 'object', properties: { expression: { type: 'string' } }, required: ['expression'] } } },
  { type: 'function', function: { name: 'web_search', description: 'Search the live web for current information. Use only when current information is needed.', parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } } },
];

function publicError(status: number) {
  if ([401, 403, 404, 408, 429, 500, 502, 503, 504].includes(status)) return 'Ramaibot couldn\'t generate a response.';
  return 'Ramaibot couldn\'t generate a response.';
}

async function runWebSearch(query: string) {
  const key = process.env.TAVILY_API_KEY?.trim();
  if (!key) return { error: 'Live web search is currently unavailable.' };
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: key, query, search_depth: 'basic', max_results: 5 }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return { error: 'Live web search is currently unavailable.' };
  const body: any = await response.json().catch(() => null);
  return { results: Array.isArray(body?.results) ? body.results.map((r: any) => ({ title: r.title, url: r.url, content: r.content })) : [] };
}

async function executeTool(name: string, args: any) {
  if (name === 'calculator') {
    try { return { result: safeCalculator(String(args?.expression || '')) }; }
    catch { return { error: 'The calculator could not evaluate that expression.' }; }
  }
  if (name === 'web_search') return runWebSearch(String(args?.query || ''));
  return { error: 'Tool unavailable.' };
}

export const Route = createFileRoute('/api/chat/stream')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authHeader = request.headers.get('Authorization');
          if (!authHeader?.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Ramaibot couldn\'t generate a response.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
          const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
          if (authError || !user) return new Response(JSON.stringify({ error: 'Ramaibot couldn\'t generate a response.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

          const body = requestSchema.parse(await request.json());
          const { data: conversation } = await supabaseAdmin.from('conversations').select('user_id').eq('id', body.conversationId).single();
          if (!conversation) return new Response(JSON.stringify({ error: 'Ramaibot couldn\'t generate a response.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
          if (conversation.user_id !== user.id) return new Response(JSON.stringify({ error: 'Ramaibot couldn\'t generate a response.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });

          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
          const { count } = await supabaseAdmin.from('messages').select('id', { count: 'exact', head: true }).eq('role', 'user').gte('created_at', oneHourAgo).in('conversation_id', [body.conversationId]);
          if ((count || 0) >= 50) return new Response(JSON.stringify({ error: 'Ramaibot couldn\'t generate a response.' }), { status: 429, headers: { 'Content-Type': 'application/json' } });

          const selected = getModel(body.modelId);
          if (!selected) return new Response(JSON.stringify({ error: 'Ramaibot couldn\'t generate a response.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

          const candidates = getFallbackModels(selected.id);
          let lastStatus = 503;
          let result: any = null;
          let usedModel = selected;

          for (const candidate of candidates) {
            if (!candidate.enabled) continue;
            try {
              let messages: any[] = body.messages.map(m => ({ role: m.role, content: m.content }));
              for (let round = 0; round < 3; round++) {
                result = await callModel(candidate, messages, tools, request.signal);
                if (!result.toolCalls?.length) break;
                messages.push({ role: 'assistant', content: result.content || '', tool_calls: result.toolCalls });
                for (const call of result.toolCalls) {
                  let args: any = {};
                  try { args = JSON.parse(call.function?.arguments || '{}'); } catch { args = {}; }
                  const toolResult = await executeTool(call.function?.name || '', args);
                  messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(toolResult) });
                }
              }
              if (result?.content?.trim()) { usedModel = candidate; break; }
              lastStatus = 502;
            } catch (error: any) {
              lastStatus = Number(error?.status) || 503;
            }
          }

          if (!result?.content?.trim()) {
            return new Response(JSON.stringify({ error: 'All available models are currently unavailable.' }), { status: lastStatus, headers: { 'Content-Type': 'application/json' } });
          }

          const content = result.content.trim();
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              const chunkSize = 80;
              for (let i = 0; i < content.length; i += chunkSize) {
                const piece = content.slice(i, i + chunkSize);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: piece } }] })}\n\n`));
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ meta: { model: usedModel.id, provider: usedModel.provider, usage: result.usage } })}\n\n`));
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            },
          });
          return new Response(stream, { headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Ramaibot-Model': usedModel.id, 'X-Ramaibot-Provider': usedModel.provider } });
        } catch (error: any) {
          console.error('Chat request failed', { status: error?.status, code: error?.code });
          const status = error?.name === 'ZodError' ? 400 : 500;
          return new Response(JSON.stringify({ error: publicError(status) }), { status, headers: { 'Content-Type': 'application/json' } });
        }
      },
    },
  },
});
