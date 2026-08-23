import { createFileRoute } from '@tanstack/react-router';
import { callModel, MODEL_CATALOG } from '@/lib/chat/provider.server';

const cache = new Map<string, { expires: number; value: { status: 'Online' | 'Offline' | 'Error'; reason?: string } }>();

async function checkModel(model: typeof MODEL_CATALOG[number]) {
  if (!model.enabled || !model.providerModelId) {
    return { ...model, status: 'Offline' as const, reason: 'Provider is not configured' };
  }

  const cached = cache.get(model.id);
  if (cached && cached.expires > Date.now()) return { ...model, ...cached.value };

  try {
    // A minimal real generation request is the health check. A model is Online only if inference succeeds.
    const result = await callModel(model, [{ role: 'user', content: 'Reply with OK.' }], [], AbortSignal.timeout(12000));
    if (!result.content.trim()) throw new Error('Empty provider response');
    const value = { status: 'Online' as const };
    cache.set(model.id, { expires: Date.now() + 30_000, value });
    return { ...model, ...value };
  } catch (error: any) {
    const status = Number(error?.status);
    const reason = [401, 403].includes(status) ? 'Provider authentication failed' : status === 404 ? 'Model is not available' : status === 429 ? 'Provider rate limit reached' : 'Provider health check failed';
    const value = { status: 'Error' as const, reason };
    cache.set(model.id, { expires: Date.now() + 15_000, value });
    return { ...model, ...value };
  }
}

export const Route = createFileRoute('/api/models')({
  server: {
    handlers: {
      GET: async () => {
        const models = await Promise.all(MODEL_CATALOG.map(checkModel));
        return new Response(JSON.stringify({ models }), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
      },
    },
  },
});
