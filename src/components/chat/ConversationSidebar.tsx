import { 
  MessageSquare, Plus, Search, Pin, Settings, User, 
  MoreVertical, X, Zap, LayoutGrid, Library, 
  Image as ImageIcon, PenTool, Globe, FileText, 
  LogOut, Archive, Edit2, Trash2, Check, Clock, ChevronRight,
  MoreHorizontal, Sparkles, Folder, Smartphone, Shield, CreditCard, Brain, Building, Mail, Phone
} from "lucide-react";

import { useChatStore } from "@/lib/chat/store";
import { useNavigate } from "@tanstack/react-router";
import { Conversation } from "@/lib/chat/types";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SidebarItem(props: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean | undefined; 
  onClick?: (() => void) | undefined;
  actions?: React.ReactNode;
  className?: string;
  indicator?: React.ReactNode;
  "data-qa"?: string;
}) {
  const { icon, label, active, onClick, actions, className, indicator } = props;


  return (
    <div 
      data-qa={props["data-qa"]}
      onClick={(e) => {

        if (onClick) {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 text-[14px] rounded-xl cursor-pointer transition-all group relative min-h-[44px]",
        active 
          ? "bg-white/10 text-foreground" 
          : "text-muted-foreground hover:text-foreground hover:bg-white/5",
        className
      )}
    >
      <div className={cn(
        "transition-all shrink-0",
        active ? "opacity-100 scale-105" : "opacity-60 group-hover:opacity-100"
      )}>
        {icon}
      </div>
      <span className="truncate flex-1 font-medium">{label}</span>
      {indicator && (
        <div className="shrink-0">
          {indicator}
        </div>
      )}
      {actions && (
        <div className="flex items-center gap-1 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export function SidebarGroup({ label, children, count }: { label: string; children: React.ReactNode; count?: number }) {
  return (
    <div className="py-2">
      <div className="px-3 py-1.5 flex items-center justify-between">
        <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/40">{label}</div>
        {count !== undefined && count > 0 && (
          <div className="text-[10px] font-bold text-muted-foreground/30 px-1.5 py-0.5 rounded-full bg-white/5">{count}</div>
        )}
      </div>
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}

export function ConversationRow({ 
  conversation,
  active,
  onClick
}: { 
  conversation: Conversation;
  active?: boolean;
  onClick: () => void;
}) {
  const { togglePin, toggleArchive, deleteConversation, renameConversation } = useChatStore();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const handleRename = async () => {
    if (newTitle.trim() && newTitle !== conversation.title) {
      await renameConversation(conversation.id, newTitle);
      toast.success("Conversation renamed");
    }
    setIsRenaming(false);
  };

  if (isRenaming) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 bg-white/10 rounded-xl">
        <input 
          ref={inputRef}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') setIsRenaming(false);
          }}
          className="flex-1 bg-transparent border-none text-[14px] p-0 focus:ring-0 text-foreground"
        />
        <div className="flex items-center gap-1">
          <button onClick={handleRename} className="p-1 hover:bg-white/10 rounded-md text-emerald-400">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => setIsRenaming(false)} className="p-1 hover:bg-white/10 rounded-md text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarItem
      icon={conversation.isPinned ? <Pin className="w-4 h-4 text-primary" /> : <MessageSquare className="w-4 h-4" />}
      label={conversation.title}
      active={active}
      onClick={onClick}
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-1.5 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground/60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 glass-strong border-white/10 p-1.5 rounded-2xl shadow-2xl z-50">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }} className="rounded-xl gap-2.5 px-3 py-2 text-xs cursor-pointer">
              <Edit2 className="w-3.5 h-3.5 opacity-60" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); togglePin(conversation.id); }} className="rounded-xl gap-2.5 px-3 py-2 text-xs cursor-pointer">
              <Pin className={cn("w-3.5 h-3.5 opacity-60", conversation.isPinned && "text-primary opacity-100")} />
              {conversation.isPinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleArchive(conversation.id); }} className="rounded-xl gap-2.5 px-3 py-2 text-xs cursor-pointer">
              <Archive className="w-3.5 h-3.5 opacity-60" />
              {conversation.isArchived ? "Restore" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5 my-1" />
            <DropdownMenuItem 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (confirm("Are you sure you want to delete this conversation?")) {
                  deleteConversation(conversation.id);
                  toast.success("Conversation deleted");
                }
              }} 
              className="rounded-xl gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-400 hover:bg-red-400/10 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    />
  );
}

export function ConversationSidebar({ onClose, onOpenSettings, isMobile }: { onClose: () => void; onOpenSettings?: () => void; isMobile?: boolean }) {
  const navigate = useNavigate();
  const { 
    conversations, 
    activeConversationId, 
    createConversation, 
    setActiveConversation, 
    searchQuery, 
    setSearchQuery,
    isLoading 
  } = useChatStore();
  
  const [user, setUser] = useState<any>(null);
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleNewChat = () => {
    createConversation();
    onClose();
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to sign out");
    }
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const pinnedConversations = filteredConversations.filter(c => c.isPinned && !c.isArchived);
  const recentConversations = filteredConversations.filter(c => !c.isPinned && !c.isArchived);
  const archivedConversations = filteredConversations.filter(c => c.isArchived);

  return (
    <div className={cn("flex flex-col h-full relative overflow-hidden bg-sidebar", isMobile && "pb-safe")}>
      {/* Header */}
      <div className="px-5 py-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl glass-strong border-white/10 flex items-center justify-center relative group cursor-pointer" onClick={() => { setActiveConversation(null); onClose(); }}>
            <Zap className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-foreground">Ramaibot</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40 leading-none">Pro Assistant</span>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-muted-foreground/60 active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close menu">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Chat & Search */}
      <div className="px-4 space-y-3 mb-2 shrink-0">
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center justify-between p-3 glass rounded-2xl text-[14px] font-semibold hover:bg-white/10 transition-all border-white/5 group shadow-sm min-h-[48px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:rotate-90 transition-transform duration-500">
              <Plus className="w-4 h-4" />
            </div>
            New Chat
          </div>
          <Edit2 className="w-3.5 h-3.5 text-muted-foreground/30" />
        </button>

        <div className="relative group">
          <Search className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
            searchQuery ? "text-primary" : "text-muted-foreground/40 group-focus-within:text-primary"
          )} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 min-h-[44px]"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground/60" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
        <SidebarGroup label="AI Tools">
          <SidebarItem 
            icon={<ImageIcon className="w-4 h-4 text-amber-400" />} 
            label="Create Image" 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-tool', { detail: 'image' }));
              onClose();
            }}
          />
          <SidebarItem icon={<PenTool className="w-4 h-4 text-sky-400" />} label="Write / Edit" />
          <SidebarItem 
            icon={<Globe className="w-4 h-4 text-emerald-400" />} 
            label="Web Search" 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-tool', { detail: 'search' }));
              onClose();
            }}
          />
          <SidebarItem 
            icon={<FileText className="w-4 h-4 text-rose-400" />} 
            label="Analyze Files" 
            onClick={() => {
              navigate({ to: '/analyze-files' });
              onClose();
            }}
          />
        </SidebarGroup>

        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3 text-muted-foreground/20 animate-pulse">
              <Clock className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Loading History</span>
            </div>
          ) : filteredConversations.length === 0 && searchQuery ? (
            <div className="px-4 py-12 flex flex-col items-center justify-center gap-4 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-muted-foreground/10">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-xs text-muted-foreground/60">No conversations found</p>
            </div>
          ) : (
            <>
              {pinnedConversations.length > 0 && (
                <SidebarGroup label="Pinned" count={pinnedConversations.length}>
                  {pinnedConversations.map((c) => (
                    <ConversationRow 
                      key={c.id}
                      conversation={c}
                      active={activeConversationId === c.id}
                      onClick={() => { setActiveConversation(c.id); onClose(); }}
                    />
                  ))}
                </SidebarGroup>
              )}

              {recentConversations.length > 0 && (
                <SidebarGroup label="Recent">
                  {recentConversations.map((c) => (
                    <ConversationRow 
                      key={c.id}
                      conversation={c}
                      active={activeConversationId === c.id}
                      onClick={() => { setActiveConversation(c.id); onClose(); }}
                    />
                  ))}
                </SidebarGroup>
              )}

              {archivedConversations.length > 0 && (
                <div className="py-2">
                  <button 
                    onClick={() => setShowArchive(!showArchive)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/40 hover:text-foreground hover:bg-white/5 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Archive className="w-3.5 h-3.5" />
                      Archive
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded-full bg-white/5">{archivedConversations.length}</span>
                      <ChevronRight className={cn("w-3 h-3 transition-transform", showArchive && "rotate-90")} />
                    </div>
                  </button>
                  {showArchive && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-1 space-y-0.5 overflow-hidden px-1"
                    >
                      {archivedConversations.map((c) => (
                        <ConversationRow 
                          key={c.id}
                          conversation={c}
                          active={activeConversationId === c.id}
                          onClick={() => { setActiveConversation(c.id); onClose(); }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </>
          )}
        </AnimatePresence>

        <SidebarGroup label="Resources">
          <SidebarItem 
            icon={<Folder className="w-4 h-4" />} 
            label="Projects" 
            onClick={() => {
              navigate({ to: '/projects' });
              onClose();
            }}
          />
          <SidebarItem 
            icon={<LayoutGrid className="w-4 h-4" />} 
            label="Explore Models" 
            onClick={() => {
              navigate({ to: '/explore-models' });
              onClose();
            }}
          />
          <SidebarItem 
            icon={<Settings className="w-4 h-4" />} 
            label="Settings" 
            onClick={() => {
              if (onOpenSettings) {
                onOpenSettings();
              } else {
                navigate({ to: '/', search: { settings: true } });
              }
              onClose();
            }} 
            data-qa="sidebar-settings-btn" 
          />
        </SidebarGroup>
      </nav>

      {/* Footer / Profile */}
      <div className="px-3 py-4 border-t border-white/5 shrink-0 bg-sidebar/50 backdrop-blur-md">
        <DropdownMenu modal={false}>

          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/5 transition-all group relative active:scale-[0.98] min-h-[56px]" aria-label="Account menu">
              <Avatar className="w-9 h-9 border border-white/10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  {user?.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-sm font-semibold truncate w-full text-foreground/90">{user?.email?.split('@')[0] || "Guest"}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Pro Plan</span>
                  <Sparkles className="w-2.5 h-2.5 text-primary" />
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" sideOffset={12} data-qa="account-dropdown" className="w-64 glass-strong border-white/10 p-2 rounded-2xl shadow-2xl z-[1000]">
            <div className="px-3 py-3 mb-1">
              <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest mb-1">Account</p>
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-white/5 my-1" />
            <DropdownMenuItem 
              onClick={onOpenSettings} 
              data-qa="open-settings"
              className="rounded-xl gap-3 px-3 py-2.5 text-sm cursor-pointer"
            >
              <Settings className="w-4 h-4 opacity-60" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuItem className="rounded-xl gap-3 px-3 py-2.5 text-sm cursor-pointer">
              <User className="w-4 h-4 opacity-60" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5 my-1" />
            <DropdownMenuItem onClick={handleSignOut} className="rounded-xl gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-400 hover:bg-red-400/10 cursor-pointer">
              <LogOut className="w-4 h-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
