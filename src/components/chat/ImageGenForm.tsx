import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useChatStore } from '@/lib/chat/store';
import { supabase } from '@/integrations/supabase/client';
import { MessageMetadata } from '@/lib/chat/types';

interface ImageGenFormProps { onClose: () => void; onSuccess?: (imageUrl: string, storagePath: string, prompt: string) => void; }

export function ImageGenForm({ onClose, onSuccess }: ImageGenFormProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const { activeConversationId, addAssistantMessage, updateAssistantMessage, finalizeAssistantMessage, removeMessage } = useChatStore();

  const handleGenerate = async () => {
    if (!prompt.trim() || !activeConversationId || isGenerating) return;
    setIsGenerating(true);
    const tempMsgId = await addAssistantMessage('', 'image-generator');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error();
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ prompt: prompt.trim(), aspectRatio, conversationId: activeConversationId }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.url || !result?.messageId) throw new Error();
      const metadata: MessageMetadata = { messageId: result.messageId, model: result.model || 'image-generator', imagePrompt: prompt.trim(), status: 'completed', attachments: [result.attachment] };
      await finalizeAssistantMessage(tempMsgId, `I've generated this image based on your request: "${prompt.trim()}"`, metadata);
      toast.success('Image generated successfully!');
      onSuccess?.(result.url, result.storagePath, prompt.trim());
      onClose();
    } catch {
      await removeMessage(tempMsgId);
      updateAssistantMessage(tempMsgId, '');
      toast.error('Image generation is currently unavailable.');
    } finally { setIsGenerating(false); }
  };

  return (
    <div className="p-1 flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <Label htmlFor="prompt" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Describe the image</Label>
        <Textarea id="prompt" placeholder="A futuristic library with floating books and soft neon lighting..." value={prompt} onChange={e => setPrompt(e.target.value)} className="glass-strong border-white/5 bg-white/5 focus-visible:ring-primary/20 min-h-[100px] rounded-2xl p-4 text-sm resize-none" disabled={isGenerating} />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Aspect Ratio</Label>
        <div className="flex gap-2">{(['1:1', '16:9', '9:16'] as const).map(ratio => <button key={ratio} onClick={() => setAspectRatio(ratio)} disabled={isGenerating} className={`flex-1 py-3 rounded-xl glass border-white/5 text-xs font-bold transition-all press ${aspectRatio === ratio ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[0.98]' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}>{ratio}</button>)}</div>
      </div>
      <div className="flex gap-3 mt-2">
        <Button variant="ghost" onClick={onClose} disabled={isGenerating} className="flex-1 py-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] glass bg-white/5 hover:bg-white/10">Cancel</Button>
        <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim() || !activeConversationId} className="flex-1 py-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20">
          {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Image</>}
        </Button>
      </div>
    </div>
  );
}
