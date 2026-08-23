import { createFileRoute } from '@tanstack/react-router';
import { MODEL_CATALOG } from '@/lib/chat/provider.server';

async function checkModel(model: typeof MODEL_CATALOG[number]) {
  const key = model.provider === 'nvidia' ? process.env.NVIDIA_API_KEY : model.provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY;
  if (!model.enabled || !key) return { ...model, status: 'Offline' as const, reason: 'Provider is not configured' };
  try {
    const endpoint = model.provider === 'anthropic'
      ? `https://api.anthropic.com/v1/models/${encodeURIComponent(model.providerModelId)}`
      : `${model.provider === 'nvidia' ? 'https://integrate.api.nvidia.com/v1' : 'https://api.openai.com/v1'}/models/${encodeURIComponent(model.providerModelId)}`;
    const headers: Record<string, string> = model.provider === 'anthropic'
      ? { 'x-api-key': key, 'anthropic-version': '2023-06-01' }
      : { Authorization: `Bearer ${key}` };
    const response = await fetch(endpoint, { headers, signal: AbortSignal.timeout(5000) });
    return { ...model, status: response.ok ? 'Online' as const : 'Error' as const, reason: response.ok ? undefined : `Provider returned ${response.status}` };
  } catch {
    return { ...model, status: 'Error' as const, reason: 'Provider health check failed' };
  }
}

export const Route = createFileRoute('/api/models')({
  server: {
    handlers: {
      GET: async () => {
        const models = await Promise.all(MODEL_CATALOG.map(checkModel));
        return new Response(JSON.stringify({ models }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
      },
    },
  },
});
