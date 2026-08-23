import { supabaseAdmin } from '@/integrations/supabase/client.server';

export type Plan = 'free' | 'pro' | 'ultra';
export type UsageKind = 'message' | 'image' | 'tool' | 'file';

export const PLAN_LIMITS: Record<Plan, { messages: number; images: number; tools: number; files: number }> = {
  free: { messages: 25, images: 3, tools: 10, files: 10 },
  pro: { messages: 500, images: 100, tools: 500, files: 100 },
  ultra: { messages: 5000, images: 1000, tools: 5000, files: 1000 },
};

const db = supabaseAdmin as any;

export async function getUserPlan(userId: string): Promise<Plan> {
  const { data, error } = await db.from('profiles').select('plan, subscription_status').eq('id', userId).maybeSingle();
  if (error) throw new Error('Subscription service unavailable');
  if (data?.subscription_status === 'active' && (data?.plan === 'pro' || data?.plan === 'ultra')) return data.plan;
  return 'free';
}

export async function consumeUsage(userId: string, kind: UsageKind, modelId?: string) {
  const { data, error } = await db.rpc('consume_usage_atomic', {
    _user_id: userId,
    _kind: kind,
    _model_id: modelId || null,
  });
  if (error) throw new Error('Usage service unavailable');
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Usage service unavailable');
  return {
    allowed: Boolean(row.allowed),
    plan: row.plan as Plan,
    limit: Number(row.limit_value),
    used: Number(row.used),
  };
}
