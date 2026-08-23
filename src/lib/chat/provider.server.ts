export type ProviderName = 'openai' | 'anthropic' | 'nvidia' | 'lovable';
export type ModelDefinition = { id: string; providerModelId: string; name: string; provider: ProviderName; capabilities: string[]; plan: 'free' | 'pro' | 'business'; enabled: boolean };
const env = (name: string) => process.env[name]?.trim() || '';
export const MODEL_CATALOG: ModelDefinition[] = [
  { id: 'gpt-4o', providerModelId: 'gpt-4o', name: 'GPT-4o', provider: 'openai', capabilities: ['chat', 'vision', 'tools'], plan: 'free', enabled: !!env('OPENAI_API_KEY') },
  { id: 'gpt-4o-mini', providerModelId: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', capabilities: ['chat', 'vision', 'tools'], plan: 'free', enabled: !!env('OPENAI_API_KEY') },
  { id: 'claude-3-5-sonnet', providerModelId: env('ANTHROPIC_MODEL_ID') || 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', capabilities: ['chat', 'vision', 'tools'], plan: 'pro', enabled: !!env('ANTHROPIC_API_KEY') },
  { id: 'nvidia-nim', providerModelId: env('NVIDIA_MODEL_ID'), name: 'NVIDIA NIM', provider: 'nvidia', capabilities: ['chat', 'tools'], plan: 'pro', enabled: !!env('NVIDIA_API_KEY') && !!env('NVIDIA_MODEL_ID') },
];
export const publicModelCatalog = MODEL_CATALOG.map(({ id, providerModelId, name, provider, capabilities, plan, enabled }) => ({ id, providerModelId, name, provider, capabilities, plan, enabled }));
export function getModel(id: string) { return MODEL_CATALOG.find(model => model.id === id); }
export function getFallbackModels(selectedId: string) { const selected = getModel(selectedId); if (!selected) return MODEL_CATALOG.filter(m => m.enabled); return [selected, ...MODEL_CATALOG.filter(m => m.enabled && m.id !== selected.id && m.capabilities.includes('chat'))]; }
function endpointFor(model: ModelDefinition) { if (model.provider === 'nvidia') return 'https://integrate.api.nvidia.com/v1/chat/completions'; if (model.provider === 'lovable') return 'https://api.lovable.ai/v1/chat/completions'; return 'https://api.openai.com/v1/chat/completions'; }
function keyFor(model: ModelDefinition) { if (model.provider === 'nvidia') return env('NVIDIA_API_KEY'); if (model.provider === 'lovable') return env('LOVABLE_AI_API_KEY'); return env('OPENAI_API_KEY'); }

async function callOpenAICompatible(model: ModelDefinition, messages: any[], tools: any[], signal?: AbortSignal) {
  const key = keyFor(model); if (!key) throw Object.assign(new Error('Provider unavailable'), { code: 'PROVIDER_UNAVAILABLE', status: 503 });
  const response = await fetch(endpointFor(model), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: model.providerModelId, messages, tools, tool_choice: tools.length ? 'auto' : 'none', stream: false }), signal });
  const text = await response.text(); let body: any = null; try { body = text ? JSON.parse(text) : null; } catch { body = null; }
  if (!response.ok) throw Object.assign(new Error('Provider request failed'), { status: response.status, providerBody: body });
  const choice = body?.choices?.[0];
  return { content: typeof choice?.message?.content === 'string' ? choice.message.content : '', toolCalls: Array.isArray(choice?.message?.tool_calls) ? choice.message.tool_calls : [], usage: body?.usage ? { prompt_tokens: body.usage.prompt_tokens || 0, completion_tokens: body.usage.completion_tokens || 0 } : undefined };
}

async function callAnthropic(model: ModelDefinition, messages: any[], tools: any[], signal?: AbortSignal) {
  const key = env('ANTHROPIC_API_KEY'); if (!key) throw Object.assign(new Error('Provider unavailable'), { code: 'PROVIDER_UNAVAILABLE', status: 503 });
  const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
  const input: any[] = [];
  for (const message of messages.filter(m => m.role !== 'system')) {
    if (message.role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) {
      const blocks: any[] = [];
      if (message.content) blocks.push({ type: 'text', text: message.content });
      for (const call of message.tool_calls) blocks.push({ type: 'tool_use', id: call.id, name: call.function.name, input: JSON.parse(call.function.arguments || '{}') });
      input.push({ role: 'assistant', content: blocks });
    } else if (message.role === 'tool') {
      input.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: message.tool_call_id, content: message.content }] });
    } else {
      input.push({ role: message.role === 'assistant' ? 'assistant' : 'user', content: message.content });
    }
  }
  const response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: model.providerModelId, max_tokens: 4096, system: system || undefined, messages: input, tools: tools.length ? tools.map(t => ({ name: t.function.name, description: t.function.description, input_schema: t.function.parameters })) : undefined }), signal });
  const body: any = await response.json().catch(() => null); if (!response.ok) throw Object.assign(new Error('Provider request failed'), { status: response.status, providerBody: body });
  const blocks = Array.isArray(body?.content) ? body.content : [];
  return { content: blocks.filter((b: any) => b.type === 'text').map((b: any) => b.text).join(''), toolCalls: blocks.filter((b: any) => b.type === 'tool_use').map((b: any) => ({ id: b.id, type: 'function', function: { name: b.name, arguments: JSON.stringify(b.input || {}) } })), usage: body?.usage ? { prompt_tokens: body.usage.input_tokens || 0, completion_tokens: body.usage.output_tokens || 0 } : undefined };
}

export async function callModel(model: ModelDefinition, messages: any[], tools: any[], signal?: AbortSignal) { return model.provider === 'anthropic' ? callAnthropic(model, messages, tools, signal) : callOpenAICompatible(model, messages, tools, signal); }
