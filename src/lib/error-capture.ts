let lastCapturedError: { error: unknown; at: number } | undefined;
const TTL_MS = 5_000;

function record(error: unknown) { lastCapturedError = { error, at: Date.now() }; }

export function describeError(error: unknown): string {
  if (error instanceof Error) {
    const status = (error as any).status ?? (error as any).statusCode;
    return `Ramaibot server error${typeof status === 'number' ? ` (status ${status})` : ''}: ${error.message.slice(0, 500)}`;
  }
  return 'Ramaibot server error';
}

const originalConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  for (const arg of args) if (arg instanceof Error) record(arg);
  originalConsoleError('Ramaibot server error');
};

if (typeof globalThis.addEventListener === 'function') {
  globalThis.addEventListener('error', event => record((event as ErrorEvent).error ?? event));
  globalThis.addEventListener('unhandledrejection', event => record((event as PromiseRejectionEvent).reason));
}

export function consumeLastCapturedError(): unknown {
  if (!lastCapturedError) return undefined;
  if (Date.now() - lastCapturedError.at > TTL_MS) { lastCapturedError = undefined; return undefined; }
  const { error } = lastCapturedError; lastCapturedError = undefined; return error;
}
