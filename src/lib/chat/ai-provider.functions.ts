// Client-safe model and mode metadata. Provider secrets and API calls live in server-only modules.
export const chatModels = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', icon: 'zap', modes: ['auto', 'creative', 'coding'] },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', icon: 'zap', modes: ['auto', 'fast'] },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', icon: 'sparkles', modes: ['auto', 'reasoning', 'coding'] },
  { id: 'nvidia-nim', name: 'NVIDIA NIM', provider: 'nvidia', icon: 'brain', modes: ['auto', 'coding', 'reasoning'] },
] as const;

export const aiModes = [
  { id: 'auto', name: 'Auto', desc: 'Balanced intelligence', icon: 'sparkles' },
  { id: 'fast', name: 'Fast', desc: 'Lightning quick responses', icon: 'zap' },
  { id: 'reasoning', name: 'Reasoning', desc: 'Deep logical analysis', icon: 'brain' },
  { id: 'creative', name: 'Creative', desc: 'Inspired & expressive', icon: 'palette' },
  { id: 'coding', name: 'Coding', desc: 'Optimized for syntax', icon: 'code' },
];
