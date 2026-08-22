import { useState, useRef, useEffect } from "react";
import { 
  Paperclip, Mic, SendHorizontal, StopCircle, Image as ImageIcon, 
  PenTool, Globe, FileText, Camera, Sparkles, Zap, Brain, Palette, Code, ChevronUp
} from "lucide-react";
import { useChatStore } from "@/lib/chat/store";
import { BottomSheet } from "../common/BottomSheet";
import { VoiceUI } from "../voice/VoiceUI";
import { Attachment } from "@/lib/chat/types";
import { AttachmentPreview } from "./AttachmentUI";
import { toast } from "sonner";
import { chatModels, aiModes } from "@/lib/chat/ai-provider.functions";
import { cn } from "@/lib/utils";
import { ImageGenForm } from "./ImageGenForm";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";


export function ChatComposer({ onSend }: { onSend: (text: string, attachments?: Attachment[]) => void }) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { 
    isLoading, abortController, uploadAttachment, 
    selectedModelId, setSelectedModelId, 
    selectedModeId, setSelectedModeId 
  } = useChatStore();
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isImageGenOpen, setIsImageGenOpen] = useState(false);
  const isMobile = useIsMobile();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpenTool = (e: any) => {
      handleToolAction(e.detail);
    };
    window.addEventListener('open-tool', handleOpenTool);
    return () => window.removeEventListener('open-tool', handleOpenTool);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (isLoading && abortController) {
      abortController.abort();
      return;
    }
    
    const hasAttachments = attachments.length > 0;
    const hasContent = input.trim().length > 0;

    if ((!hasContent && !hasAttachments) || isLoading) return;

    // Check if all attachments are ready
    const isUploading = attachments.some(a => a.status === 'uploading');
    if (isUploading) {
      toast.error("Please wait for files to finish uploading");
      return;
    }

    onSend(input, attachments);
    setInput("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        // Optimistically add to local state
        const tempAttachment: Attachment = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'document',
          mimeType: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          status: 'uploading'
        };
        
        setAttachments(prev => [...prev, tempAttachment]);
        
        const uploaded = await uploadAttachment(file);
        
        setAttachments(prev => prev.map(a => 
          a.name === file.name && a.status === 'uploading' ? uploaded : a
        ));
      } catch (error: any) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
        setAttachments(prev => prev.filter(a => a.name !== file.name));
      }
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleToolAction = (action: string) => {
    setIsToolMenuOpen(false);
    
    switch (action) {
      case 'image':
        setTimeout(() => setIsImageGenOpen(true), 100);
        break;
      case 'file':
        fileInputRef.current?.click();
        break;
      case 'photo':
      case 'camera':
        fileInputRef.current?.setAttribute('capture', 'environment');
        fileInputRef.current?.click();
        break;
      case 'search':
        setInput(prev => prev + (prev ? " " : "") + "/search ");
        textareaRef.current?.focus();
        break;
      case 'calculator':
        setInput(prev => prev + (prev ? " " : "") + "/calc ");
        textareaRef.current?.focus();
        break;
      case 'voice':
        setIsVoiceOpen(true);
        break;
    }
  };

  const ToolGrid = ({ onAction }: { onAction: (action: string) => void }) => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-1">AI / Create</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Create image", icon: <ImageIcon className="w-5 h-5" />, desc: "DALL-E 3", color: "text-amber-400", action: "image" },
          ].map((tool) => (
            <button 
              key={tool.label}
              onClick={() => onAction(tool.action)}
              className="flex flex-col items-start p-4 glass rounded-2xl border-white/5 hover:bg-white/10 transition-all text-left group min-h-[100px]"
              aria-label={tool.label}
            >
              <div className={`p-2.5 rounded-xl bg-white/5 mb-3 group-hover:scale-110 transition-transform ${tool.color}`}>
                {tool.icon}
              </div>
              <span className="text-sm font-semibold mb-1">{tool.label}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">{tool.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Tools & Utilities</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Web Search", icon: <Globe className="w-5 h-5" />, desc: "Live Search", color: "text-sky-400", action: "search" },
            { label: "Calculator", icon: <PenTool className="w-5 h-5" />, desc: "Math Tool", color: "text-emerald-400", action: "calculator" },
            { label: "Voice", icon: <Mic className="w-5 h-5" />, desc: "Speak", color: "text-violet-400", action: "voice" },
            { label: "Attach", icon: <FileText className="w-5 h-5" />, desc: "Files/PDF", color: "text-blue-400", action: "file" },
            { label: "Camera", icon: <Camera className="w-5 h-5" />, desc: "Photo", color: "text-rose-400", action: "camera" },
          ].map((tool) => (
            <button 
              key={tool.label}
              onClick={() => onAction(tool.action)}
              className="flex flex-col items-start p-4 glass rounded-2xl border-white/5 hover:bg-white/10 transition-all text-left group min-h-[100px]"
              aria-label={tool.label}
            >
              <div className={`p-2.5 rounded-xl bg-white/5 mb-3 group-hover:scale-110 transition-transform ${tool.color}`}>
                {tool.icon}
              </div>
              <span className="text-sm font-semibold mb-1">{tool.label}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">{tool.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 bg-gradient-to-t from-background via-background/80 to-transparent pb-safe flex-shrink-0 relative z-30">
      <div className="max-w-3xl mx-auto relative group">
        
        {/* New Tool Bar - Floating above composer */}
        <div className="flex justify-center mb-4">
          <div className="glass rounded-full p-1 flex gap-1 border-white/5 shadow-lg relative z-40">
            {[
              { id: 'ai', name: 'Create', icon: Sparkles, color: 'text-amber-400' },
              { id: 'tools', name: 'Tools', icon: PenTool, color: 'text-sky-400' },
              { id: 'code', name: 'Code', icon: Code, color: 'text-emerald-400', disabled: true }
            ].map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    if (category.disabled) return;
                    if (category.id === 'ai') setIsToolMenuOpen(true);
                    if (category.id === 'tools') setIsToolMenuOpen(true);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  disabled={category.disabled || isLoading}
                  className={cn(
                    "px-4 py-2 rounded-full flex items-center gap-2 transition-all text-[11px] font-bold uppercase tracking-wider press min-h-[44px]",
                    "text-muted-foreground/60 hover:text-foreground hover:bg-white/5",
                    category.disabled && "opacity-30 cursor-not-allowed"
                  )}
                  aria-label={`Open ${category.name} tools`}
                >
                  <Icon className={cn("w-4 h-4", category.color)} />
                  <span className="hidden xs:inline">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 px-2 animate-in fade-in slide-in-from-bottom-2">
            {attachments.map((att) => (
              <AttachmentPreview 
                key={att.id} 
                attachment={att} 
                onRemove={() => removeAttachment(att.id)}
              />
            ))}
          </div>
        )}

        <div className="absolute -inset-0.5 bg-primary/5 rounded-[20px] blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
        
        <div className="relative glass rounded-[18px] lg:rounded-[22px] p-1.5 lg:p-2 flex items-end gap-1.5 lg:gap-2 border-white/5 shadow-xl focus-within:border-primary/20 transition-all duration-300 z-50">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple
            accept="image/*,application/pdf,text/plain,text/markdown"
            aria-hidden="true"
          />
          
          {isMobile ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsToolMenuOpen(true);
              }}
              disabled={isLoading}
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-colors disabled:opacity-30 press"
              title="Tools"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          ) : (
            <Popover open={isToolMenuOpen} onOpenChange={setIsToolMenuOpen}>
              <PopoverTrigger asChild>
                <button 
                  disabled={isLoading}
                  className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-colors disabled:opacity-30 press"
                  title="Tools"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 glass-strong border-white/10 p-4 rounded-2xl mb-2" align="start" side="top" sideOffset={12}>
                <ToolGrid 
                  onAction={(action) => {
                    handleToolAction(action);
                    setIsToolMenuOpen(false);
                  }} 
                />
              </PopoverContent>
            </Popover>
          )}
          
          <div className="flex-1 flex flex-col">
            <textarea 
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? "Ramaibot is thinking..." : "Message Ramaibot..."} 
              className="w-full bg-transparent border-none focus:ring-0 resize-none py-2 px-1 text-[14px] sm:text-[15px] max-h-40 min-h-[36px] lg:min-h-[44px] scrollbar-hide"
              rows={1}
              disabled={isLoading}
              title="Message composer"
              aria-label="Message composer"
            />
          </div>
          
          <button 
            onClick={() => setIsVoiceOpen(true)}
            disabled={isLoading}
            className="hidden sm:flex p-3 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-colors disabled:opacity-30 press"
            title="Voice"
            aria-label="Open voice interface"
          >
            <Mic className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleSend}
            disabled={(!input.trim() && attachments.length === 0) && !isLoading}
            className={cn(
              "p-2.5 rounded-[14px] press shadow-md transition-all",
              isLoading 
                ? "bg-zinc-800 text-white" 
                : "bg-primary text-primary-foreground shadow-primary/10 hover:brightness-105",
              "disabled:opacity-50 disabled:scale-100"
            )}
            aria-label={isLoading ? "Stop generating" : "Send message"}
          >
            {isLoading ? <StopCircle className="w-5 h-5" /> : <SendHorizontal className="w-5 h-5" />}
          </button>
        </div>
      </div>


      <BottomSheet 
        isOpen={isToolMenuOpen && isMobile && !isImageGenOpen} 
        onClose={() => setIsToolMenuOpen(false)}
        title="AI Tools & Actions"
      >
        <ToolGrid 
          onAction={(action) => {
            handleToolAction(action);
          }} 
        />
      </BottomSheet>

      <BottomSheet
        isOpen={isImageGenOpen}
        onClose={() => setIsImageGenOpen(false)}
        title="Generate Image"
      >
        <ImageGenForm onClose={() => setIsImageGenOpen(false)} />
      </BottomSheet>

      <VoiceUI 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)} 
        onTranscriptionComplete={(text) => {
          setInput(prev => prev + (prev ? " " : "") + text);
        }}
      />


    </div>
  );
}
