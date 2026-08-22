import { FileText, X, AlertCircle, File, ImageIcon, ExternalLink, Download } from "lucide-react";
import { Attachment } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove?: () => void;
  className?: string;
}

export function AttachmentPreview({ attachment, onRemove, className }: AttachmentPreviewProps) {
  const isImage = attachment.type === 'image';
  const isPdf = attachment.type === 'pdf';
  const isUploading = attachment.status === 'uploading';
  const isFailed = attachment.status === 'failed';

  return (
    <div className={cn(
      "relative glass rounded-xl border-white/10 overflow-hidden group",
      isImage ? "w-24 h-24" : "w-48 h-16 flex items-center p-3 gap-3",
      className
    )}>
      {isImage ? (
        <img 
          src={attachment.url} 
          alt={attachment.name} 
          className={cn(
            "w-full h-full object-cover transition-transform group-hover:scale-105",
            isUploading && "opacity-50 blur-[2px]"
          )}
        />
      ) : (
        <>
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            isPdf ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
          )}>
            {isPdf ? <FileText className="w-5 h-5" /> : <File className="w-5 h-5" />}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-semibold truncate text-foreground/90">{attachment.name}</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
              {(attachment.size / 1024).toFixed(1)} KB
            </span>
          </div>
        </>
      )}

      {/* States */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {isFailed && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
      )}

      {/* Actions */}
      {onRemove && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 p-1 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
          aria-label={`Remove ${attachment.name}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export function AttachmentCard({ attachment }: { attachment: Attachment }) {
  const isImage = attachment.type === 'image';
  
  if (isImage) {
    return (
      <div className="my-3 first:mt-0 last:mb-0">
        <div className="glass rounded-2xl sm:rounded-3xl border-white/10 overflow-hidden relative group max-w-sm">
          <img 
            src={attachment.url} 
            alt={attachment.name} 
            className="w-full h-auto object-contain max-h-[400px]"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
            <a 
              href={attachment.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors press"
              aria-label="View large image"
            >
              <ExternalLink className="w-5 h-5 text-white" />
            </a>
            <a 
              href={attachment.url} 
              download={attachment.name}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors press"
              aria-label="Download image"
            >
              <Download className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-3 first:mt-0 last:mb-0">
      <div className="glass-strong rounded-2xl border-white/10 p-4 flex items-center gap-4 max-w-md group hover:bg-white/5 transition-colors cursor-pointer relative">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          attachment.type === 'pdf' ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
        )}>
          {attachment.type === 'pdf' ? <FileText className="w-6 h-6" /> : <File className="w-6 h-6" />}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-semibold truncate text-foreground/90">{attachment.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
              {(attachment.size / 1024).toFixed(1)} KB
            </span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
              {attachment.type.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <a 
              href={attachment.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="View document"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
            <a 
              href={attachment.url} 
              download={attachment.name}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Download document"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
            </a>
        </div>
      </div>
    </div>
  );
}
