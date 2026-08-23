import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { getUserPlan } from '@/lib/usage/limits.server';

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

export const Route = createFileRoute('/api/subscription')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return response({ error: 'Unauthorized' }, 401);
        const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
        if (!user) return response({ error: 'Unauthorized' }, 401);
        const plan = await getUserPlan(user.id);
        const { data: profile } = await supabaseAdmin.from('profiles').select('subscription_status').eq('id', user.id).maybeSingle();
        return response({ plan, subscriptionStatus: profile?.subscription_status === 'active' ? 'active' : 'inactive', billingConfigured: Boolean(process.env.BILLING_PROVIDER && process.env.BILLING_SECRET) });
      },
      POST: async ({ request }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return response({ error: 'Unauthorized' }, 401);
        const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
        if (!user) return response({ error: 'Unauthorized' }, 401);
        return response({ error: 'Subscription upgrades are not configured for this deployment.' }, 503);
      },
    },
  },
});
