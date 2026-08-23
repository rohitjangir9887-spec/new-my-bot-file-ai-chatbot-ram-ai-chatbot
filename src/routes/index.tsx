import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, Suspense, lazy } from 'react';
import { Menu, Plus, AlertCircle, X, WifiOff, Loader2, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/lib/chat/store';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { MessageList } from '@/components/chat/MessageList';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { Attachment, MessageMetadata } from '@/lib/chat/types';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { chatModels } from '@/lib/chat/ai-provider.functions';
import { useSettingsStore } from '@/lib/settings/store';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const SettingsView = lazy(() => import('@/components/settings/SettingsView').then(m => ({ default: m.SettingsView })));
const OnboardingOverlay = lazy(() => import('@/components/onboarding/OnboardingOverlay').then(m => ({ default: m.OnboardingOverlay })));
const SplashScreen = lazy(() => import('@/components/common/SplashScreen').then(m => ({ default: m.SplashScreen })));

export const Route = createFileRoute('/')({
  component: () => <AuthGuard><ErrorBoundary><Suspense fallback={<div className="flex h-[100dvh] w-full items-center justify-center bg-[#0a0a0f]"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}><RamaibotApp /></Suspense></ErrorBoundary></AuthGuard>,
});

function RamaibotApp() {
  const search = Route.useSearch() as any;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(!!search.settings);
  const [modelStatuses, setModelStatuses] = useState<Record<string, 'Online' | 'Offline' | 'Checking' | 'Error'>>({});
  const { theme, accentColor, autoPlayResponses } = useSettingsStore();
  const { speak } = useSpeechSynthesis();
  const {
    activeConversationId, createConversation, sendMessage, addAssistantMessage, updateAssistantMessage, finalizeAssistantMessage,
    isLoading, setLoading, error, setError, regenerateLastMessage, removeMessage, initialize, selectedModelId, abortController,
    setAbortController, isOffline, setOffline, setSelectedModelId,
  } = useChatStore();

  useEffect(() => {
    initialize();
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, [initialize, setOffline]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') root.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    else root.classList.add(theme);
    root.setAttribute('data-accent', accentColor);
  }, [theme, accentColor]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/models', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('status')))
      .then(data => { if (!cancelled) setModelStatuses(Object.fromEntries((data.models || []).map((m: any) => [m.id, m.status]))); })
      .catch(() => { if (!cancelled) setModelStatuses({}); });
    return () => { cancelled = true; };
  }, [selectedModelId]);

  const handleStopGeneration = () => {
    abortController?.abort();
    setAbortController(null);
    setLoading(false);
  };

  const generateForConversation = async (conversationId: string, modelId: string) => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    setAbortController(controller);
    let tempMessageId = '';
    let fullContent = '';
    let responseMeta: MessageMetadata = { model: modelId, status: 'streaming' };
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('AUTH');
      const current = useChatStore.getState().conversations.find(c => c.id === conversationId);
      const messages = (current?.messages || []).slice(-20).map(m => ({ role: m.role, content: m.content, attachments: m.attachments }));
      tempMessageId = await addAssistantMessage('', modelId);
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ conversationId, modelId, messages }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const error = new Error(payload?.error || 'Ramaibot couldn\'t generate a response.');
        (error as any).status = response.status;
        throw error;
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Ramaibot couldn\'t generate a response.');
      const decoder = new TextDecoder();
      let buffer = '';
      const processEvent = (event: string) => {
        const line = event.split('\n').find(l => l.startsWith('data: '));
        if (!line) return;
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const json = JSON.parse(data);
          if (json.meta) responseMeta = { ...responseMeta, ...json.meta, status: 'completed' };
          const delta = json.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta) {
            fullContent += delta;
            updateAssistantMessage(tempMessageId, fullContent);
          }
        } catch { /* malformed provider event: ignore safely */ }
      };
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\n\n/);
        buffer = events.pop() || '';
        for (const event of events) processEvent(event);
      }
      buffer += decoder.decode();
      if (buffer.trim()) processEvent(buffer);
      if (!fullContent.trim()) throw new Error('Ramaibot couldn\'t generate a response.');
      responseMeta.status = 'completed';
      responseMeta.model = responseMeta.model || modelId;
      await finalizeAssistantMessage(tempMessageId, fullContent, responseMeta);
      if (autoPlayResponses) speak(fullContent);
      return true;
    } catch (err: any) {
      if (tempMessageId) await removeMessage(tempMessageId);
      if (err?.name !== 'AbortError') setError('Ramaibot couldn\'t generate a response.');
      return false;
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const handleSendMessage = async (text: string, attachments: Attachment[] = []) => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    if (isOffline) { setError('Ramaibot couldn\'t generate a response.'); return; }
    setError(null);
    await sendMessage(text, attachments);
    const conversationId = useChatStore.getState().activeConversationId;
    if (!conversationId) { setError('Ramaibot couldn\'t generate a response.'); return; }
    await generateForConversation(conversationId, selectedModelId);
  };

  const retry = async () => {
    const conversationId = useChatStore.getState().activeConversationId;
    if (conversationId) await generateForConversation(conversationId, selectedModelId);
  };

  const switchModel = async () => {
    const ordered = chatModels.map(m => m.id);
    const start = ordered.indexOf(selectedModelId);
    const candidates = ordered.slice(start + 1).concat(ordered.slice(0, start + 1));
    const next = candidates.find(id => modelStatuses[id] === 'Online') || candidates[0];
    if (!next) return;
    setSelectedModelId(next);
    const conversationId = useChatStore.getState().activeConversationId;
    if (conversationId) await generateForConversation(conversationId, next);
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#0a0a0f] selection:bg-primary/30 selection:text-white relative pb-safe">
      <Suspense fallback={null}><SplashScreen /></Suspense>
      <Suspense fallback={null}><OnboardingOverlay /></Suspense>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[140px] animate-mesh rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-accent/10 blur-[140px] animate-mesh delay-1000 rounded-full mix-blend-screen" />
        <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-violet-500/5 blur-[120px] animate-mesh delay-500 rounded-full" />
      </div>
      <aside className={`${sidebarOpen ? 'w-[280px]' : 'w-0'} hidden lg:flex flex-col z-30 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] relative border-r border-white/5 bg-background/20 backdrop-blur-2xl`}>
        <ConversationSidebar onClose={() => setSidebarOpen(false)} onOpenSettings={() => setIsSettingsOpen(true)} />
      </aside>
      <AnimatePresence>
        {mobileMenuOpen && <div className="fixed inset-0 z-50 lg:hidden"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} /><motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute top-0 left-0 h-full w-[90vw] glass-strong border-r border-white/5 shadow-2xl z-50 overflow-hidden"><ConversationSidebar onClose={() => setMobileMenuOpen(false)} onOpenSettings={() => setIsSettingsOpen(true)} isMobile /></motion.aside></div>}
      </AnimatePresence>
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        <header className="h-14 flex items-center justify-between px-3 sm:px-4 z-20 sticky top-0 bg-background/30 backdrop-blur-xl border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-1 rounded-xl hover:bg-white/5 transition-colors lg:hidden" aria-label="Open menu"><Menu className="w-5 h-5 text-muted-foreground" /></button>
            {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="hidden lg:flex p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors" aria-label="Open sidebar"><Menu className="w-5 h-5 text-muted-foreground" /></button>}
            <div className="flex flex-col" onClick={() => setIsSettingsOpen(true)} style={{ cursor: 'pointer' }}><div className="flex items-center gap-1.5"><span className="font-bold text-sm tracking-tight text-foreground">Ramaibot</span><div className="w-1 h-1 rounded-full bg-emerald-500 ml-0.5" /></div><span className="text-[8px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40 leading-none">Intelligence</span></div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center glass px-2 py-1 rounded-lg border-white/5 bg-white/5 h-8" title={modelStatuses[selectedModelId] || 'Checking'}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${modelStatuses[selectedModelId] === 'Online' ? 'bg-emerald-400' : modelStatuses[selectedModelId] === 'Error' ? 'bg-red-400' : modelStatuses[selectedModelId] === 'Offline' ? 'bg-zinc-500' : 'bg-amber-400 animate-pulse'}`} />
              <select value={selectedModelId} onChange={e => setSelectedModelId(e.target.value)} className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-none focus:ring-0 cursor-pointer py-0 pr-6" aria-label="Select AI model">
                {chatModels.map(m => <option key={m.id} value={m.id} className="bg-zinc-900">{m.name}</option>)}
              </select>
            </div>
            <button onClick={() => createConversation()} className="p-2 rounded-xl hover:bg-white/5 transition-colors" title="New Chat" aria-label="New Chat"><Plus className="w-5 h-5 text-muted-foreground" /></button>
          </div>
        </header>
        {isOffline && <div className="mx-6 mt-4 p-4 glass-strong border-amber-500/20 bg-amber-500/5 rounded-2xl flex items-center gap-3 text-amber-400 text-sm"><WifiOff className="w-5 h-5 flex-shrink-0" /><div className="flex-1">Working in offline mode. Previous conversations are read-only.</div></div>}
        {error && <div className="mx-6 mt-4 p-4 glass-strong border-red-500/20 bg-red-500/5 rounded-2xl flex items-center gap-3 text-red-400 text-sm" role="alert"><AlertCircle className="w-5 h-5 flex-shrink-0" /><div className="flex-1">Ramaibot couldn&apos;t generate a response.</div><button onClick={retry} className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-1.5 text-xs" aria-label="Retry response"><RefreshCw className="w-3.5 h-3.5" />Retry</button><button onClick={switchModel} className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-1.5 text-xs" aria-label="Switch model"><ArrowRightLeft className="w-3.5 h-3.5" />Switch Model</button><button onClick={() => setError(null)} className="p-1 hover:bg-white/5 rounded-lg" aria-label="Dismiss error"><X className="w-4 h-4" /></button></div>}
        <div className="flex-1 overflow-hidden relative">
          <MessageList onSendMessage={handleSendMessage} onRegenerate={async () => { const current = useChatStore.getState().conversations.find(c => c.id === activeConversationId); if (!current?.messages.length) return; const last = current.messages[current.messages.length - 1]; if (last.role === 'assistant') { await regenerateLastMessage(); const updated = useChatStore.getState().conversations.find(c => c.id === activeConversationId); const user = updated?.messages[updated.messages.length - 1]; if (user?.role === 'user') await generateForConversation(activeConversationId!, selectedModelId); } }} onEditMessage={async (id, content) => { const current = useChatStore.getState().conversations.find(c => c.id === activeConversationId); if (!current) return; const index = current.messages.findIndex(m => m.id === id); if (index === -1) return; for (const m of current.messages.slice(index)) await removeMessage(m.id); await sendMessage(content); const conversationId = useChatStore.getState().activeConversationId; if (conversationId) await generateForConversation(conversationId, selectedModelId); }} />
        </div>
        <ChatComposer onSend={handleSendMessage} />
        <AnimatePresence>{isSettingsOpen && <Suspense fallback={null}><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100]"><SettingsView onClose={() => setIsSettingsOpen(false)} /></motion.div></Suspense>}</AnimatePresence>
      </main>
    </div>
  );
}
