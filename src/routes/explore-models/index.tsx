import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Search, Sparkles, Zap, Brain, 
  Palette, Code, Info, Check, Globe, 
  Cpu, Activity, Filter, Clock
} from 'lucide-react';
import { chatModels, aiModes } from '@/lib/chat/ai-provider.functions';
import { useChatStore } from '@/lib/chat/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const Route = createFileRoute('/explore-models/')({
  component: ExploreModelsPage,
});

function ExploreModelsPage() {
  const navigate = useNavigate();
  const { selectedModelId, setSelectedModelId } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState<string | null>(null);

  const providers = Array.from(new Set(chatModels.map(m => m.provider)));

  const filteredModels = chatModels.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = !filterProvider || m.provider === filterProvider;
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0a0a0f] text-foreground overflow-hidden selection:bg-primary/30 pb-safe">
      <header className="h-16 flex items-center px-4 sm:px-6 z-20 sticky top-0 bg-background/30 backdrop-blur-xl border-b border-white/5 shrink-0">
        <button 
          onClick={() => navigate({ to: '/' })} 
          className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-all active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col ml-2">
          <h1 className="text-lg font-bold tracking-tight">Explore Models</h1>
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Select Intelligence Engine</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8 animate-rise-in">
          {/* Hero Section */}
          <div className="glass-strong p-8 sm:p-12 rounded-[3rem] border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-primary/30 transition-colors duration-700" />
            <div className="relative z-10 space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                <Cpu className="w-3.5 h-3.5" /> Hardware Accelerated
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                World-class intelligence, tailored for you.
              </h2>
              <p className="text-muted-foreground/60 leading-relaxed text-sm sm:text-base">
                Choose between lightning-fast responses or deep reasoning capabilities. Switch engines anytime based on your requirements.
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <button 
                onClick={() => setFilterProvider(null)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all shrink-0",
                  !filterProvider 
                    ? "bg-primary/20 border-primary/30 text-primary" 
                    : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                All
              </button>
              {providers.map(p => (
                <button 
                  key={p}
                  onClick={() => setFilterProvider(p)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all shrink-0",
                    filterProvider === p
                      ? "bg-primary/20 border-primary/30 text-primary" 
                      : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredModels.map((model) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={model.id}
                  onClick={() => {
                    setSelectedModelId(model.id);
                    toast.success(`Switched to ${model.name}`);
                  }}
                  className={cn(
                    "relative flex flex-col p-6 rounded-[2.5rem] border transition-all cursor-pointer group active:scale-[0.98]",
                    selectedModelId === model.id
                      ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5"
                      : "bg-white/5 border-white/5 hover:bg-white/[0.08]"
                  )}
                >
                  {selectedModelId === model.id && (
                    <div className="absolute top-6 right-6 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 shrink-0 transition-transform group-hover:scale-110",
                      selectedModelId === model.id ? "bg-primary/20" : "bg-white/5"
                    )}>
                      {model.icon === 'zap' ? <Zap className="w-6 h-6 text-amber-400" /> : <Sparkles className="w-6 h-6 text-primary" />}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-base tracking-tight">{model.name}</h3>
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{model.provider}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {model.modes.map(modeId => {
                        const mode = aiModes.find(m => m.id === modeId);
                        return (
                          <div key={modeId} className="px-2.5 py-1 rounded-lg bg-white/5 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
                            {mode?.icon === 'brain' && <Brain className="w-3 h-3" />}
                            {mode?.icon === 'zap' && <Zap className="w-3 h-3" />}
                            {mode?.icon === 'palette' && <Palette className="w-3 h-3" />}
                            {mode?.icon === 'code' && <Code className="w-3 h-3" />}
                            {mode?.icon === 'sparkles' && <Sparkles className="w-3 h-3" />}
                            {mode?.name}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">Active</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground/30">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">128k ctx</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredModels.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center text-muted-foreground/10">
                <Filter className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold">No models match filters</h3>
                <p className="text-sm text-muted-foreground/60">Try clearing your filters or search query.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
