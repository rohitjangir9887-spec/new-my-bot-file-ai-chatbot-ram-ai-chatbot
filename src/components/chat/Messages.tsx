import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Copy, Check, RotateCcw, MoreHorizontal, Edit2, AlertCircle, 
  Calculator, Search, Loader2, Info, Volume2, VolumeX, Image as ImageIcon
} from 'lucide-react';
import { Message, ToolCall, MessageMetadata } from '@/lib/chat/types';
import { cn } from '@/lib/utils';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useSettingsStore } from '@/lib/settings/store';

import { AttachmentCard } from './AttachmentUI';
import { GeneratedImage } from './GeneratedImage';
import { RamaibotOrb } from '../common/RamaibotOrb';


import 'katex/dist/katex.min.css';

function ToolCallDisplay({ toolCall }: { toolCall: ToolCall }) {
  const isExecuting = ['preparing', 'searching', 'processing', 'waiting_consent'].includes(toolCall.status);
  
  const getIcon = () => {
    if (isExecuting) return <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />;
    if (toolCall.status === 'error') return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
    if (toolCall.status === 'completed') return <Check className="w-3.5 h-3.5 text-emerald-400" />;
    if (toolCall.type === 'calculator') return <Calculator className="w-3.5 h-3.5 text-emerald-400" />;
    if (toolCall.type === 'web_search') return <Search className="w-3.5 h-3.5 text-blue-400" />;
    if (toolCall.type === 'generate_image' as any) return <ImageIcon className="w-3.5 h-3.5 text-violet-400" />;
    return <Info className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const getStatusText = () => {
    switch (toolCall.status) {
      case 'preparing': return 'Preparing tool...';
      case 'waiting_consent': return 'Awaiting consent...';
      case 'searching': return 'Searching the web...';
      case 'processing': 
        return toolCall.type === 'calculator' ? 'Calculating...' : 
               toolCall.type === ('generate_image' as any) ? 'Generating image...' : 
               'Processing...';
      case 'completed': 
        if (toolCall.type === 'calculator') return `Calculated: ${toolCall.args.expression}`;
        if (toolCall.type === 'web_search') return `Searched: ${toolCall.args.query}`;
        if (toolCall.type === ('generate_image' as any)) return `Generated image: ${toolCall.args.prompt.slice(0, 20)}...`;
        return 'Completed';
      case 'error': return 'Failed to execute tool';
      default: return toolCall.status;
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass bg-white/5 border border-white/10 my-2 animate-in fade-in slide-in-from-left-2">
      {getIcon()}
      <span className="text-[11px] font-medium text-foreground/70">{getStatusText()}</span>
      {toolCall.status === 'completed' && toolCall.type === 'calculator' && toolCall.result && (
        <span className="text-[11px] font-bold text-primary ml-1">= {toolCall.result.result}</span>
      )}
    </div>
  );
}

export const AssistantMessage = React.memo(({ 
  message, 
  isLast,
  onRegenerate,
  onRetry 
}: { 
  message: Message; 
  isLast?: boolean;
  onRegenerate?: () => void;
  onRetry?: () => void;
}) => {

  const [copied, setCopied] = useState(false);
  const { speak, stop, isPlaying, currentText } = useSpeechSynthesis();
  const { voiceEnabled, autoPlayResponses } = useSettingsStore();
  
  const isStreaming = message.metadata?.status === 'streaming';
  const isError = message.metadata?.status === 'error';

  const isCurrentSpeaking = isPlaying && currentText === message.content;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVoice = () => {
    if (isCurrentSpeaking) {
      stop();
    } else {
      speak(message.content);
    }
  };


  return (
    <div className="flex flex-col gap-3 group w-full">
      <div className="flex items-center gap-2 px-1 animate-in fade-in slide-in-from-left-2 duration-500">
        <RamaibotOrb 
          size="xs" 
          state={isStreaming ? 'thinking' : 'idle'}
          className={cn(isStreaming ? "bg-primary/20" : "glass bg-white/5")} 
        />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60">Ramaibot</span>
        {message.metadata?.model && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md glass bg-white/5 text-muted-foreground/40 border-white/5">
            {message.metadata.model.toUpperCase()}
          </span>
        )}
      </div>
      
      <div className={cn(
        "glass-strong rounded-2xl lg:rounded-3xl p-4 lg:p-6 border-white/10 text-foreground/90 leading-relaxed shadow-xl relative overflow-hidden max-w-[95%] sm:max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100",
        isError && "border-red-500/20 bg-red-500/5"
      )}>
        <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-transparent prose-pre:p-0 prose-code:text-primary prose-a:text-primary prose-p:my-4 prose-p:leading-relaxed">
          <ReactMarkdown

            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="relative group/code my-4 rounded-xl overflow-hidden border border-white/10 bg-zinc-950/50">
                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        {match[1]}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                        }}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                      >
                        <Copy className="w-3 h-3 text-muted-foreground/60" />
                      </button>
                    </div>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        padding: '1.25rem',
                        background: 'transparent',
                        fontSize: '0.8rem',
                        lineHeight: '1.5',
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className={cn("bg-white/5 px-1.5 py-0.5 rounded-md text-primary font-mono text-[0.9em]", className)} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content + (isStreaming ? ' ●' : '')}


          </ReactMarkdown>
        </div>

        {message.metadata?.toolCalls && message.metadata.toolCalls.length > 0 && (
          <div className="flex flex-col gap-1 mt-2 mb-2">
            {message.metadata.toolCalls.map(tc => (
              <ToolCallDisplay key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            {message.attachments.map((att) => (
              att.type === 'image' && att.name?.startsWith('Generated:') ? (
                <GeneratedImage key={att.id} attachment={att} className="my-2" />
              ) : (
                <AttachmentCard key={att.id} attachment={att} />
              )
            ))}
          </div>
        )}


        {!isStreaming && (
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center gap-2 sm:gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={copyToClipboard}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2 group/btn"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground group-hover/btn:text-foreground transition-colors" />}
              <span className="hidden xs:inline text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover/btn:text-foreground/80 transition-colors">Copy</span>
            </button>
            
            {voiceEnabled && (
              <button 
                onClick={handleToggleVoice}
                className={cn(
                  "p-2 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2 group/btn",
                  isCurrentSpeaking && "text-primary"
                )}
                title={isCurrentSpeaking ? "Stop Speaking" : "Speak"}
              >
                {isCurrentSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-muted-foreground group-hover/btn:text-foreground transition-colors" />}
                <span className="hidden xs:inline text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover/btn:text-foreground/80 transition-colors">
                  {isCurrentSpeaking ? "Stop" : "Speak"}
                </span>
              </button>
            )}

            <button 
              onClick={onRegenerate}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2 group/btn"
              title="Regenerate"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
              <span className="hidden xs:inline text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover/btn:text-foreground/80 transition-colors">Regenerate</span>
            </button>
            {isError && (
              <button 
                onClick={onRetry}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2 text-red-400 group/btn" 
                title="Retry"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="hidden xs:inline text-[10px] font-bold uppercase tracking-widest group-hover/btn:text-red-300">Retry</span>
              </button>
            )}
            <button className="p-2 hover:bg-white/5 rounded-xl transition-colors ml-auto group/btn" aria-label="More message actions">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
            </button>
          </div>


        )}
      </div>
    </div>
  );
});


export function UserMessage({ 
  message, 
  onEdit 
}: { 
  message: Message; 
  onEdit?: (content: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleSave = () => {
    if (onEdit) onEdit(editContent);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-end gap-2 group">
      <div className="flex items-center gap-2 px-1 animate-in fade-in slide-in-from-right-2 duration-300">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60">You</span>
      </div>
      <div className="bg-primary/20 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-5 border border-primary/20 text-foreground/90 shadow-xl max-w-[90%] sm:max-w-[80%] relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        {isEditing ? (
          <div className="flex flex-col gap-2 min-w-[200px]">
            <textarea 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="bg-zinc-900/50 border-white/10 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[80px] w-full"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="text-[10px] font-bold uppercase px-2 py-1 hover:bg-white/5 rounded">Cancel</button>
              <button onClick={handleSave} className="text-[10px] font-bold uppercase px-2 py-1 bg-primary rounded text-primary-foreground">Save</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {message.attachments && message.attachments.length > 0 && (
               <div className="flex flex-wrap gap-2">
                 {message.attachments.map(att => (
                   <AttachmentCard key={att.id} attachment={att} />
                 ))}
               </div>
            )}
            <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        )}

        
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"
          >
            <Edit2 className="w-4 h-4 text-muted-foreground/40" />
          </button>
        )}
      </div>
    </div>
  );
}
