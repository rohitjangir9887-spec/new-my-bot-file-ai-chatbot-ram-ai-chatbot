import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { PLAN_LIMITS, getUserPlan, type Plan } from '@/lib/usage/limits.server';

export const Route = createFileRoute('/api/usage')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
        if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

        const plan = await getUserPlan(user.id);
        const limits = PLAN_LIMITS[plan];
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const [messages, images, tools, files] = await Promise.all([
          supabaseAdmin.from('usage_events').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('kind', 'message').gte('created_at', since),
          supabaseAdmin.from('usage_events').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('kind', 'image').gte('created_at', since),
          supabaseAdmin.from('usage_events').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('kind', 'tool').gte('created_at', since),
          supabaseAdmin.from('user_files').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        ]);
        if ([messages, images, tools, files].some(result => result.error)) return new Response(JSON.stringify({ error: 'Usage information is currently unavailable.' }), { status: 503, headers: { 'Content-Type': 'application/json' } });

        const used = { messages: messages.count || 0, images: images.count || 0, tools: tools.count || 0, files: files.count || 0 };
        return new Response(JSON.stringify({ plan: plan as Plan, limits, used }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
      },
    },
  },
});
