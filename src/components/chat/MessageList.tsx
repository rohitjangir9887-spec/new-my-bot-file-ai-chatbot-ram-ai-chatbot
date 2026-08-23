import React, { useRef, useEffect } from 'react';
import { Zap, Brain, FileText, Globe, Code } from 'lucide-react';
import { useChatStore } from '@/lib/chat/store';
import { AssistantMessage, UserMessage } from './Messages';
import { RamaibotOrb } from '../common/RamaibotOrb';

interface MessageListProps {
  onSendMessage: (content: string) => void;
  onRegenerate: () => Promise<void>;
  onEditMessage: (id: string, content: string) => void;
}

export function MessageList({ onSendMessage, onRegenerate, onEditMessage }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { conversations, activeConversationId, isLoading } = useChatStore();
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [activeConversation?.messages?.length, isLoading]);

  const suggestions = [
    { title: 'Summarize text', action: 'Summarize this for me:', icon: <FileText className="w-4 h-4" />, desc: 'Concise analysis' },
    { title: 'Explain concepts', action: 'Explain this simply:', icon: <Brain className="w-4 h-4" />, desc: 'Clear simple answers' },
    { title: 'Rewrite content', action: 'Rewrite this to be more professional:', icon: <Zap className="w-4 h-4" />, desc: 'Polish & refine' },
    { title: 'Translate message', action: 'Translate this to English:', icon: <Globe className="w-4 h-4" />, desc: 'Global reach' },
    { title: 'Brainstorm ideas', action: "Let's brainstorm some ideas for:", icon: <Zap className="w-4 h-4" />, desc: 'Creative concepts' },
    { title: 'Help me code', action: 'Help me with this code:', icon: <Code className="w-4 h-4" />, desc: 'Syntax & debugging' },
  ];

  // Failed/empty assistant messages are intentionally not rendered.
  const visibleMessages = (activeConversation?.messages || []).filter(m => m.role === 'user' || (m.role === 'assistant' && m.content.trim() && m.metadata?.status !== 'error'));
  const isEmpty = !activeConversation || visibleMessages.length === 0;

  return <div ref={scrollRef} className="h-full overflow-y-auto px-4 sm:px-6 pt-6 pb-2 scroll-smooth custom-scrollbar relative">
    {isEmpty ? <div className="min-h-full flex flex-col items-center justify-center p-6 sm:p-8 pt-10 sm:pt-20 lg:pt-32">
      <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center animate-rise-in py-6 lg:py-8">
        <div className="relative mb-6 sm:mb-8 group"><div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 opacity-60" /><RamaibotOrb size="md" state="idle" className="sm:w-20 sm:h-20" /></div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight text-foreground">Hello, I'm Ramaibot</h1>
        <p className="text-sm sm:text-base text-muted-foreground/70 mb-8 sm:mb-10 leading-relaxed max-w-md mx-auto">Professional AI assistant for productivity and creative exploration.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-lg lg:max-w-none">{suggestions.map(s => <button key={s.title} onClick={() => onSendMessage(s.action)} className="group glass p-4 sm:p-5 rounded-2xl text-left hover:bg-white/5 press border-white/5 flex flex-col gap-3 transition-all hover:border-white/10 shadow-sm relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" /><div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-105 transition-transform relative z-10 border border-white/5">{s.icon}</div><div className="flex flex-col"><span className="font-semibold text-sm sm:text-base">{s.title}</span><span className="text-[10px] text-muted-foreground/60 font-medium tracking-wide">{s.desc}</span></div></button>)}</div>
      </div><div className="h-32 sm:h-40 lg:h-48 w-full flex-shrink-0" />
    </div> : <div className="max-w-3xl mx-auto space-y-8 pb-10">{visibleMessages.map((m, idx) => m.role === 'assistant' ? <AssistantMessage key={m.id} message={m} isLast={idx === visibleMessages.length - 1} onRegenerate={onRegenerate} /> : <UserMessage key={m.id} message={m} onEdit={content => onEditMessage(m.id, content)} />)}{isLoading && <div className="flex justify-start animate-rise-in"><div className="glass p-4 rounded-[24px] border-white/10 flex items-center gap-3"><RamaibotOrb size="xs" state="thinking" /><div className="flex gap-1"><div className="w-1 h-1 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" /><div className="w-1 h-1 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" /><div className="w-1 h-1 rounded-full bg-primary/60 animate-bounce" /></div></div></div>}</div>}
  </div>;
}
