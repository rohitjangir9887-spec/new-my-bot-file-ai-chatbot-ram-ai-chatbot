import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { generateImage } from '@/lib/chat/image-gen.functions';
import { useChatStore } from '@/lib/chat/store';
import { supabase } from '@/integrations/supabase/client';

interface ImageGenFormProps {
  onClose: () => void;
  onSuccess?: (imageUrl: string, storagePath: string, prompt: string) => void;
}

export function ImageGenForm({ onClose, onSuccess }: ImageGenFormProps) {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const { activeConversationId, addAssistantMessage, updateAssistantMessage, finalizeAssistantMessage } = useChatStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for the image");
      return;
    }

    setIsGenerating(true);
    let tempMsgId = "";
    
    try {
      // Add a placeholder message in chat
      tempMsgId = await addAssistantMessage(`Generating an image for: "${prompt}"...`, 'dall-e-3');
      
      const result = await generateImage({
        data: {
          prompt,
          aspectRatio,
          conversationId: activeConversationId || undefined
        }
      });

      if (result.success && result.url) {
        // Finalize the message with the attachment metadata
        await finalizeAssistantMessage(tempMsgId, `I've generated this image based on your request: "${prompt}"`, {
          model: 'dall-e-3',
          imagePrompt: prompt
        });

        // We update the store with the real attachment
        const attachment = {
          id: crypto.randomUUID(),
          name: `Generated: ${prompt.slice(0, 20)}`,
          type: 'image' as const,
          mimeType: 'image/webp',
          size: 0,
          url: result.url,
          storagePath: result.storagePath,
          status: 'ready' as const
        };

        // Update the message in DB with attachments
        await supabase
          .from('messages')
          .update({
            attachments: [attachment] as any
          })
          .filter('metadata->>imagePrompt', 'eq', prompt)
          .eq('conversation_id', activeConversationId!);

        // Sync local state
        useChatStore.getState().initialize();

        toast.success("Image generated successfully!");
        onSuccess?.(result.url, result.storagePath!, prompt);
        onClose();
      }
    } catch (error: any) {
      console.error("Image Gen Error:", error);
      if (error.message === "IMAGE_GENERATION_NOT_CONFIGURED") {
        toast.error("Image generation is not configured. Please add LOVABLE_AI_API_KEY.");
      } else {
        toast.error(error.message || "Failed to generate image");
      }
      
      if (tempMsgId) {
        updateAssistantMessage(tempMsgId, `Failed to generate image: ${error.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-1 flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <Label htmlFor="prompt" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
          Describe the image
        </Label>
        <Textarea
          id="prompt"
          placeholder="A futuristic library with floating books and soft neon lighting..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="glass-strong border-white/5 bg-white/5 focus-visible:ring-primary/20 min-h-[100px] rounded-2xl p-4 text-sm resize-none"
          disabled={isGenerating}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
          Aspect Ratio
        </Label>
        <div className="flex gap-2">
          {(['1:1', '16:9', '9:16'] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              disabled={isGenerating}
              className={`flex-1 py-3 rounded-xl glass border-white/5 text-xs font-bold transition-all press ${
                aspectRatio === ratio 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[0.98]" 
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isGenerating}
          className="flex-1 py-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] glass bg-white/5 hover:bg-white/10"
        >
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="flex-1 py-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Image
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
