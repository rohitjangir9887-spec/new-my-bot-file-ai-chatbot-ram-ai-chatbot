import { supabaseAdmin } from '@/integrations/supabase/client.server';

export type Plan = 'free' | 'pro' | 'ultra';

export const PLAN_LIMITS: Record<Plan, { messages: number; images: number; tools: number; files: number }> = {
  free: { messages: 25, images: 3, tools: 10, files: 10 },
  pro: { messages: 500, images: 100, tools: 500, files: 100 },
  ultra: { messages: 5000, images: 1000, tools: 5000, files: 1000 },
};

const db = supabaseAdmin as any;

export async function getUserPlan(userId: string): Promise<Plan> {
  const { data } = await db.from('profiles').select('plan, subscription_status').eq('id', userId).maybeSingle();
  if (data?.subscription_status === 'active' && (data?.plan === 'pro' || data?.plan === 'ultra')) return data.plan;
  return 'free';
}

export async function consumeUsage(userId: string, kind: 'message' | 'image' | 'tool' | 'file', modelId?: string) {
  const plan = await getUserPlan(userId);
  const limit = PLAN_LIMITS[plan][kind === 'message' ? 'messages' : `${kind}s` as 'images' | 'tools' | 'files'];
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await db
    .from('usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('kind', kind)
    .gte('created_at', since);
  if (countError) throw new Error('Usage service unavailable');
  if ((count || 0) >= limit) return { allowed: false, plan, limit, used: count || 0 };
  const { error: insertError } = await db.from('usage_events').insert({ user_id: userId, kind, model_id: modelId || null });
  if (insertError) throw new Error('Usage service unavailable');
  return { allowed: true, plan, limit, used: (count || 0) + 1 };
}
