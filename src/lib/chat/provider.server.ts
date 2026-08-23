export type ProviderName = 'openai' | 'anthropic' | 'nvidia';
export type ModelPlan = 'free' | 'pro' | 'ultra';
export type ModelCapability = 'chat' | 'vision' | 'tools';

export type ModelDefinition = {
  id: string;
  providerModelId: string;
  name: string;
  provider: ProviderName;
  capabilities: ModelCapability[];
  plan: ModelPlan;
  enabled: boolean;
};

const env = (name: string) => process.env[name]?.trim() || '';
const NVIDIA_BASE_URL = env('NVIDIA_API_BASE_URL') || 'https://integrate.api.nvidia.com/v1';

function parseJsonObject(value: string): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const blocked = new Set(['model', 'messages', 'stream', 'tools', 'tool_choice']);
    return Object.fromEntries(Object.entries(parsed).filter(([key]) => !blocked.has(key)));
  } catch {
    return {};
  }
}

const nvidiaToolsEnabled = env('NVIDIA_MODEL_SUPPORTS_TOOLS').toLowerCase() === 'true';
const nvidiaCapabilities: ModelCapability[] = ['chat', ...(nvidiaToolsEnabled ? (['tools'] as const) : [])];

export const MODEL_CATALOG: ModelDefinition[] = [
  { id: 'gpt-4o', providerModelId: 'gpt-4o', name: 'GPT-4o', provider: 'openai', capabilities: ['chat', 'vision', 'tools'], plan: 'free', enabled: !!env('OPENAI_API_KEY') },
  { id: 'gpt-4o-mini', providerModelId: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', capabilities: ['chat', 'vision', 'tools'], plan: 'free', enabled: !!env('OPENAI_API_KEY') },
  { id: 'claude-3-5-sonnet', providerModelId: env('ANTHROPIC_MODEL_ID'), name: 'Claude', provider: 'anthropic', capabilities: ['chat', 'vision', 'tools'], plan: 'pro', enabled: !!env('ANTHROPIC_API_KEY') && !!env('ANTHROPIC_MODEL_ID') },
  { id: 'nvidia-nim', providerModelId: env('NVIDIA_MODEL_ID'), name: 'NVIDIA NIM', provider: 'nvidia', capabilities: nvidiaCapabilities, plan: 'pro', enabled: !!env('NVIDIA_API_KEY') && !!env('NVIDIA_MODEL_ID') },
];

const duplicateModelIds = MODEL_CATALOG.filter((model, index, all) => all.findIndex(candidate => candidate.id === model.id) !== index).map(model => model.id);
if (duplicateModelIds.length) throw new Error(`Duplicate model IDs configured: ${[...new Set(duplicateModelIds)].join(', ')}`);

export const publicModelCatalog = MODEL_CATALOG.map(({ id, providerModelId, name, provider, capabilities, plan, enabled }) => ({ id, providerModelId, name, provider, capabilities, plan, enabled }));

export function getModel(id: string) { return MODEL_CATALOG.find(model => model.id === id); }

export function getFallbackModels(selectedId: string) {
  const selected = getModel(selectedId);
  const enabled = MODEL_CATALOG.filter(model => model.enabled && model.capabilities.includes('chat'));
  const ordered = selected?.enabled ? [selected, ...enabled.filter(model => model.id !== selected.id)] : enabled;
  return [...new Map(ordered.map(model => [model.id, model])).values()];
}

function endpointFor(model: ModelDefinition) {
  if (model.provider === 'nvidia') return `${NVIDIA_BASE_URL.replace(/\/$/, '')}/chat/completions`;
  if (model.provider === 'anthropic') return 'https://api.anthropic.com/v1/messages';
  return 'https://api.openai.com/v1/chat/completions';
}

function keyFor(model: ModelDefinition) {
  if (model.provider === 'nvidia') return env('NVIDIA_API_KEY');
  if (model.provider === 'anthropic') return env('ANTHROPIC_API_KEY');
  return env('OPENAI_API_KEY');
}

function timeoutSignal(signal?: AbortSignal, timeoutMs = 45_000) {
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

function extractText(content: unknown) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.filter((part: any) => part?.type === 'text' && typeof part.text === 'string').map((part: any) => part.text).join('');
}

function normalizeToolCalls(message: any) {
  if (Array.isArray(message?.tool_calls)) return message.tool_calls.filter((call: any) => call?.id && call?.function?.name);
  if (message?.function_call?.name) return [{ id: `legacy-${crypto.randomUUID()}`, type: 'function', function: { name: message.function_call.name, arguments: typeof message.function_call.arguments === 'string' ? message.function_call.arguments : JSON.stringify(message.function_call.arguments || {}) } }];
  return [];
}

async function callOpenAICompatible(model: ModelDefinition, messages: any[], tools: any[], signal?: AbortSignal) {
  const key = keyFor(model);
  if (!key || !model.providerModelId) throw Object.assign(new Error('Provider unavailable'), { code: 'PROVIDER_UNAVAILABLE', status: 503 });
  const configuredOptions = model.provider === 'nvidia' ? parseJsonObject(env('NVIDIA_REQUEST_OPTIONS_JSON')) : {};
  const nvidiaMaxTokens = model.provider === 'nvidia' && env('NVIDIA_MAX_TOKENS') ? Number(env('NVIDIA_MAX_TOKENS')) : 4096;
  const requestBody: Record<string, unknown> = { model: model.providerModelId, messages, stream: false, max_tokens: Number.isFinite(nvidiaMaxTokens) && nvidiaMaxTokens > 0 ? nvidiaMaxTokens : 4096, ...configuredOptions };
  if (tools.length && model.capabilities.includes('tools')) { requestBody.tools = tools; requestBody.tool_choice = 'auto'; }

  const response = await fetch(endpointFor(model), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(requestBody), signal: timeoutSignal(signal) });
  const text = await response.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = null; }
  if (!response.ok) throw Object.assign(new Error('Provider request failed'), { code: 'PROVIDER_REQUEST_FAILED', status: response.status });
  const message = body?.choices?.[0]?.message;
  return { content: extractText(message?.content), toolCalls: normalizeToolCalls(message), reasoningContent: typeof message?.reasoning_content === 'string' ? message.reasoning_content : '', usage: body?.usage ? { prompt_tokens: Number(body.usage.prompt_tokens || 0), completion_tokens: Number(body.usage.completion_tokens || 0) } : undefined };
}

async function callAnthropic(model: ModelDefinition, messages: any[], tools: any[], signal?: AbortSignal) {
  const key = env('ANTHROPIC_API_KEY');
  if (!key || !model.providerModelId) throw Object.assign(new Error('Provider unavailable'), { code: 'PROVIDER_UNAVAILABLE', status: 503 });
  const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
  const input: any[] = [];
  for (const message of messages.filter(m => m.role !== 'system')) {
    if (message.role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) {
      const blocks: any[] = [];
      if (message.content) blocks.push({ type: 'text', text: message.content });
      for (const call of message.tool_calls) { let inputValue: any = {}; try { inputValue = JSON.parse(call.function?.arguments || '{}'); } catch { inputValue = {}; } blocks.push({ type: 'tool_use', id: call.id, name: call.function.name, input: inputValue }); }
      input.push({ role: 'assistant', content: blocks });
    } else if (message.role === 'tool') input.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: message.tool_call_id, content: message.content }] });
    else input.push({ role: message.role === 'assistant' ? 'assistant' : 'user', content: message.content });
  }
  const response = await fetch(endpointFor(model), { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: model.providerModelId, max_tokens: 4096, system: system || undefined, messages: input, tools: tools.length && model.capabilities.includes('tools') ? tools.map(t => ({ name: t.function.name, description: t.function.description, input_schema: t.function.parameters })) : undefined }), signal: timeoutSignal(signal) });
  const body: any = await response.json().catch(() => null);
  if (!response.ok) throw Object.assign(new Error('Provider request failed'), { code: 'PROVIDER_REQUEST_FAILED', status: response.status });
  const blocks = Array.isArray(body?.content) ? body.content : [];
  return { content: blocks.filter((block: any) => block.type === 'text').map((block: any) => block.text).join(''), toolCalls: blocks.filter((block: any) => block.type === 'tool_use' && block.id && block.name).map((block: any) => ({ id: block.id, type: 'function', function: { name: block.name, arguments: JSON.stringify(block.input || {}) } })), reasoningContent: '', usage: body?.usage ? { prompt_tokens: Number(body.usage.input_tokens || 0), completion_tokens: Number(body.usage.output_tokens || 0) } : undefined };
}

export async function callModel(model: ModelDefinition, messages: any[], tools: any[], signal?: AbortSignal) {
  return model.provider === 'anthropic' ? callAnthropic(model, messages, tools, signal) : callOpenAICompatible(model, messages, tools, signal);
}
