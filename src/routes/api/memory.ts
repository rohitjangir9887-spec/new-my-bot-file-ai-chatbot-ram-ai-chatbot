import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { z } from 'zod';
import { clearMemories, deleteMemory, listMemories, saveMemory } from '@/lib/memory/memory.server';

async function userFromRequest(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
  return user || null;
}

export const Route = createFileRoute('/api/memory')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await userFromRequest(request);
        if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        return new Response(JSON.stringify({ memories: await listMemories(user.id) }), { headers: { 'Content-Type': 'application/json' } });
      },
      POST: async ({ request }) => {
        const user = await userFromRequest(request);
        if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        try {
          const body = z.object({ content: z.string().min(1).max(8000) }).parse(await request.json());
          return new Response(JSON.stringify({ memory: await saveMemory(user.id, body.content) }), { headers: { 'Content-Type': 'application/json' } });
        } catch {
          return new Response(JSON.stringify({ error: 'Memory could not be saved.' }), { status: 400 });
        }
      },
      DELETE: async ({ request }) => {
        const user = await userFromRequest(request);
        if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        try {
          const body = z.object({ id: z.string().uuid(), all: z.boolean().optional() }).parse(await request.json());
          if (body.all) await clearMemories(user.id); else await deleteMemory(user.id, body.id);
          return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
        } catch {
          return new Response(JSON.stringify({ error: 'Memory could not be deleted.' }), { status: 400 });
        }
      },
    },
  },
});
