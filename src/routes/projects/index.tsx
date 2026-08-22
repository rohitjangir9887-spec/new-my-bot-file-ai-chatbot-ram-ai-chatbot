import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Plus, Search, Folder, Clock, 
  MessageSquare, MoreVertical, Trash2, Edit2, 
  Archive, Star, Filter, ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useChatStore } from '@/lib/chat/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/projects/')({
  component: ProjectsPage,
});

function ProjectsPage() {
  const navigate = useNavigate();
  const { conversations, initialize, deleteConversation, togglePin } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await initialize();
      setIsLoading(false);
    };
    load();
  }, [initialize]);

  const filteredConversations = conversations.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter(c => c.isPinned);
  const recentConversations = filteredConversations.filter(c => !c.isPinned && !c.isArchived);

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
          <h1 className="text-lg font-bold tracking-tight">Projects</h1>
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Workspaces & Conversations</span>
        </div>
        <button 
          onClick={() => navigate({ to: '/' })}
          className="ml-auto p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">New Project</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8 animate-rise-in">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects & conversations..."
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
            />
          </div>

          {/* Empty State */}
          {!isLoading && filteredConversations.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-24 h-24 rounded-[2rem] glass-strong flex items-center justify-center text-primary/20">
                <Folder className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold">No projects yet</h3>
                <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">
                  Start your first conversation with Ramaibot to create a project workspace.
                </p>
              </div>
              <button 
                onClick={() => navigate({ to: '/' })}
                className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                Launch New AI Project
              </button>
            </div>
          )}

          {/* Pinned Section */}
          {pinnedConversations.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Pinned Workspaces</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pinnedConversations.map(c => (
                  <ProjectCard key={c.id} conversation={c} navigate={navigate} deleteFn={deleteConversation} togglePinFn={togglePin} />
                ))}
              </div>
            </section>
          )}

          {/* Recent Section */}
          {recentConversations.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground/40" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Recent Activity</h2>
              </div>
              <div className="space-y-3">
                {recentConversations.map(c => (
                  <ProjectListItem key={c.id} conversation={c} navigate={navigate} deleteFn={deleteConversation} togglePinFn={togglePin} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function ProjectCard({ conversation, navigate, deleteFn, togglePinFn }: any) {
  return (
    <motion.div 
      layout
      onClick={() => navigate({ to: '/', search: { conversationId: conversation.id } })}
      className="group glass-strong p-6 rounded-[2.5rem] border border-white/10 hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if(confirm("Delete this workspace?")) deleteFn(conversation.id);
          }}
          className="p-2 hover:bg-rose-500/10 rounded-xl text-rose-500/60 hover:text-rose-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
        <MessageSquare className="w-6 h-6" />
      </div>

      <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{conversation.title || 'Untitled Workspace'}</h3>
      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-auto">
        <span>{new Date(conversation.updatedAt).toLocaleDateString()}</span>
        <div className="w-1 h-1 rounded-full bg-white/10" />
        <span className="text-primary/60">Pinned</span>
      </div>
    </motion.div>
  );
}

function ProjectListItem({ conversation, navigate, deleteFn, togglePinFn }: any) {
  const lastMessage = conversation.messages?.[conversation.messages.length - 1]?.content || 'No messages';

  return (
    <motion.div 
      layout
      onClick={() => navigate({ to: '/', search: { conversationId: conversation.id } })}
      className="group flex items-center gap-4 p-4 glass hover:bg-white/5 rounded-[2rem] border border-white/5 transition-all press cursor-pointer"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors">
        <Folder className="w-6 h-6" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm truncate">{conversation.title || 'Untitled Workspace'}</h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
            {new Date(conversation.updatedAt).toLocaleDateString()}
          </span>
          <div className="w-1 h-1 rounded-full bg-white/5" />
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest truncate">
            {lastMessage}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            togglePinFn(conversation.id);
            toast.success(conversation.isPinned ? "Unpinned from top" : "Pinned to top");
          }}
          className={cn(
            "p-2 hover:bg-white/10 rounded-xl transition-colors",
            conversation.isPinned ? "text-amber-400" : "text-muted-foreground hover:text-amber-400"
          )}
        >
          <Star className={cn("w-4 h-4", conversation.isPinned && "fill-amber-400")} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if(confirm("Delete this workspace?")) deleteFn(conversation.id);
          }}
          className="p-2 hover:bg-rose-500/10 rounded-xl text-rose-500/60 hover:text-rose-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
