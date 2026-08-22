import React from "react";

export function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title?: string; 
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="relative w-full max-w-lg glass-strong rounded-t-[32px] sm:rounded-[32px] border-t border-x sm:border border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-500 ease-out overflow-hidden max-h-[90dvh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1.5 rounded-full bg-white/10" />
        </div>
        
        {title && (
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground"
              aria-label="Close"
            >
              <div className="w-5 h-5 flex items-center justify-center">✕</div>
            </button>
          </div>
        )}
        
        <div className="overflow-y-auto custom-scrollbar p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
