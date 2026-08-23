import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Attachment, ChatState, Conversation, Message, MessageMetadata, ToolCall } from './types';
import { supabase } from '@/integrations/supabase/client';
import { uploadFile } from './storage';

interface ChatActions {
  initialize: () => Promise<void>;
  createConversation: () => Promise<void>;
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  addAssistantMessage: (content: string, modelId?: string) => Promise<string>;
  updateAssistantMessage: (messageId: string, content: string) => void;
  finalizeAssistantMessage: (messageId: string, content: string, metadata?: MessageMetadata) => Promise<string>;
  removeLastUserMessage: () => Promise<void>;
  removeMessage: (messageId: string) => Promise<void>;
  regenerateLastMessage: () => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  deleteConversation: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedModelId: (id: string) => void;
  setSelectedModeId: (id: string) => void;
  setAbortController: (controller: AbortController | null) => void;
  uploadAttachment: (file: File) => Promise<Attachment>;
  updateMessageMetadata: (messageId: string, metadata: Partial<MessageMetadata>) => void;
  addToolCall: (messageId: string, toolCall: ToolCall) => void;
  updateToolCallStatus: (messageId: string, toolCallId: string, status: ToolCall['status'], result?: any, error?: string) => void;
  setOffline: (isOffline: boolean) => void;
  clearAllConversations: () => Promise<void>;
  exportData: () => Promise<void>;
}

export type ChatStoreState = ChatState & ChatActions & {
  selectedModelId: string;
  selectedModeId: string;
  abortController: AbortController | null;
  isOffline: boolean;
};

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isLoading: false,
      isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
      error: null,
      searchQuery: '',
      selectedModelId: 'gpt-4o',
      selectedModeId: 'auto',
      abortController: null,

      setSelectedModelId: (id) => set({ selectedModelId: id }),
      setSelectedModeId: (id) => set({ selectedModeId: id }),
      setAbortController: (controller) => set({ abortController: controller }),

      initialize: async () => {
        const fetchConversations = async (retryCount = 0): Promise<void> => {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          set({ isLoading: true });
          try {
            const { data: convs, error: convsError } = await supabase
              .from('conversations').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false });
            if (convsError) throw convsError;
            const conversations: Conversation[] = await Promise.all((convs || []).map(async (c) => {
              const { data: msgs } = await supabase.from('messages').select('*').eq('conversation_id', c.id).order('created_at', { ascending: true });
              return {
                id: c.id, title: c.title, isPinned: c.is_pinned, isArchived: c.is_archived,
                createdAt: new Date(c.created_at).getTime(), updatedAt: new Date(c.updated_at).getTime(),
                messages: (msgs || []).map(m => ({
                  id: m.id, role: m.role as any, content: m.content, timestamp: new Date(m.created_at).getTime(),
                  metadata: (m.metadata as any) || undefined, attachments: (m.attachments as any) || undefined,
                })),
              };
            }));
            set({ conversations, isLoading: false, error: null });
          } catch (error: any) {
            console.error(`Initialize error (attempt ${retryCount + 1}):`, error);
            if (retryCount < 2 && !get().isOffline) setTimeout(() => fetchConversations(retryCount + 1), 1000 * (retryCount + 1));
            else set({ error: 'Ramaibot could not load your conversations.', isLoading: false });
          }
        };
        await fetchConversations();
      },

      createConversation: async () => set({ activeConversationId: null, error: null }),

      sendMessage: async (content, attachments = []) => {
        const { activeConversationId } = get();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const normalizedContent = content.trim() || (attachments.length ? 'Attached file' : '');
        if (!normalizedContent) return;
        let conversationId = activeConversationId;
        if (!conversationId) {
          const autoTitle = normalizedContent.length > 30 ? `${normalizedContent.slice(0, 30)}...` : normalizedContent;
          const { data, error } = await supabase.from('conversations').insert({ user_id: session.user.id, title: autoTitle }).select().single();
          if (error) { set({ error: 'Ramaibot could not create the conversation.' }); return; }
          conversationId = data.id;
          const newConversation: Conversation = {
            id: data.id, title: data.title, messages: [], createdAt: new Date(data.created_at).getTime(), updatedAt: new Date(data.updated_at).getTime(), isPinned: data.is_pinned, isArchived: data.is_archived,
          };
          set(state => ({ conversations: [newConversation, ...state.conversations], activeConversationId: data.id }));
        }
        const { data, error } = await supabase.from('messages').insert({ conversation_id: conversationId, role: 'user', content: normalizedContent, attachments: attachments as any }).select().single();
        if (error) { set({ error: 'Ramaibot could not save your message.' }); return; }
        const newMessage: Message = { id: data.id, role: 'user', content: data.content, timestamp: new Date(data.created_at).getTime(), attachments: (data.attachments as any) || undefined };
        set(state => ({ conversations: state.conversations.map(c => c.id === conversationId ? { ...c, messages: [...c.messages, newMessage], updatedAt: Date.now() } : c) }));
      },

      addAssistantMessage: async (content, modelId) => {
        const { activeConversationId } = get();
        if (!activeConversationId) return '';
        const tempId = crypto.randomUUID();
        const newMessage: Message = { id: tempId, role: 'assistant', content, timestamp: Date.now(), metadata: { model: modelId, status: 'streaming' } };
        set(state => ({ conversations: state.conversations.map(c => c.id === activeConversationId ? { ...c, messages: [...c.messages, newMessage], updatedAt: Date.now() } : c) }));
        return tempId;
      },

      updateAssistantMessage: (messageId, content) => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;
        set(state => ({ conversations: state.conversations.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.map(m => m.id === messageId ? { ...m, content } : m) } : c) }));
      },

      finalizeAssistantMessage: async (messageId, content, metadata = {}) => {
        const { activeConversationId } = get();
        if (!activeConversationId || !content.trim() || metadata.status !== 'completed') return '';
        const finalMsgId = metadata.messageId || messageId;
        set(state => ({
          conversations: state.conversations.map(c => c.id === activeConversationId ? {
            ...c,
            messages: c.messages.map(m => m.id === messageId ? {
              ...m,
              id: finalMsgId,
              content: content.trim(),
              timestamp: Date.now(),
              metadata,
              attachments: metadata.attachments || m.attachments,
            } : m),
            updatedAt: Date.now(),
          } : c),
        }));
        return finalMsgId;
      },

      removeLastUserMessage: async () => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;
        const conv = get().conversations.find(c => c.id === activeConversationId);
        const lastMessage = conv?.messages[conv.messages.length - 1];
        if (lastMessage && lastMessage.role === 'user') await supabase.from('messages').delete().eq('id', lastMessage.id);
        set(state => ({ conversations: state.conversations.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.slice(0, -1), updatedAt: Date.now() } : c) }));
      },

      removeMessage: async (messageId) => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;
        const message = get().conversations.find(c => c.id === activeConversationId)?.messages.find(m => m.id === messageId);
        if (message && message.id.length > 30) await supabase.from('messages').delete().eq('id', message.id);
        set(state => ({ conversations: state.conversations.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.filter(m => m.id !== messageId), updatedAt: Date.now() } : c) }));
      },

      regenerateLastMessage: async () => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;
        const conv = get().conversations.find(c => c.id === activeConversationId);
        const lastMessage = conv?.messages[conv.messages.length - 1];
        if (lastMessage?.role === 'assistant') await get().removeMessage(lastMessage.id);
      },

      setActiveConversation: id => set({ activeConversationId: id, error: null }),
      setLoading: isLoading => set({ isLoading }),
      setError: error => set({ error }),

      deleteConversation: async id => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { error } = await supabase.from('conversations').delete().eq('id', id).eq('user_id', session.user.id);
        if (error) { set({ error: 'Ramaibot could not delete the conversation.' }); return; }
        set(state => ({ conversations: state.conversations.filter(c => c.id !== id), activeConversationId: state.activeConversationId === id ? null : state.activeConversationId }));
      },

      togglePin: async id => {
        const conv = get().conversations.find(c => c.id === id); if (!conv) return;
        const newPinned = !conv.isPinned;
        const { error } = await supabase.from('conversations').update({ is_pinned: newPinned }).eq('id', id);
        if (error) return;
        set(state => ({ conversations: state.conversations.map(c => c.id === id ? { ...c, isPinned: newPinned } : c) }));
      },

      toggleArchive: async id => {
        const conv = get().conversations.find(c => c.id === id); if (!conv) return;
        const newArchived = !conv.isArchived;
        const { error } = await supabase.from('conversations').update({ is_archived: newArchived }).eq('id', id);
        if (error) return;
        set(state => ({ conversations: state.conversations.map(c => c.id === id ? { ...c, isArchived: newArchived } : c), activeConversationId: state.activeConversationId === id ? null : state.activeConversationId }));
      },

      renameConversation: async (id, title) => {
        if (!title.trim()) return;
        const normalized = title.trim();
        const { error } = await supabase.from('conversations').update({ title: normalized }).eq('id', id);
        if (error) return;
        set(state => ({ conversations: state.conversations.map(c => c.id === id ? { ...c, title: normalized, updatedAt: Date.now() } : c) }));
      },

      setSearchQuery: searchQuery => set({ searchQuery }),

      uploadAttachment: async file => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Authentication required to upload files');
        const tempId = crypto.randomUUID();
        const type = file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'document';
        const attachment: Attachment = { id: tempId, name: file.name, type: type as any, mimeType: file.type, size: file.size, url: URL.createObjectURL(file), status: 'uploading' };
        try {
          const result = await uploadFile(file, session.user.id);
          URL.revokeObjectURL(attachment.url);
          return { ...attachment, url: result.url, storagePath: result.path, status: 'ready' };
        } catch {
          URL.revokeObjectURL(attachment.url);
          return { ...attachment, status: 'failed', error: 'File upload failed.' };
        }
      },

      updateMessageMetadata: (messageId, metadata) => {
        const { activeConversationId } = get(); if (!activeConversationId) return;
        set(state => ({ conversations: state.conversations.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.map(m => m.id === messageId ? { ...m, metadata: { ...m.metadata, ...metadata } } : m) } : c) }));
      },

      addToolCall: (messageId, toolCall) => {
        const { activeConversationId } = get(); if (!activeConversationId) return;
        set(state => ({ conversations: state.conversations.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.map(m => m.id === messageId ? { ...m, metadata: { ...(m.metadata || {}), toolCalls: [...(m.metadata?.toolCalls || []), toolCall] } } : m) } : c) }));
      },

      updateToolCallStatus: (messageId, toolCallId, status, result, error) => {
        const { activeConversationId } = get(); if (!activeConversationId) return;
        set(state => ({ conversations: state.conversations.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.map(m => m.id === messageId ? { ...m, metadata: { ...(m.metadata || {}), toolCalls: (m.metadata?.toolCalls || []).map(tc => tc.id === toolCallId ? { ...tc, status, result, error } : tc) } } : m) } : c) }));
      },

      setOffline: isOffline => set({ isOffline }),

      clearAllConversations: async () => {
        const { data: { session } } = await supabase.auth.getSession(); if (!session) return;
        const { error } = await supabase.from('conversations').delete().eq('user_id', session.user.id);
        if (error) { set({ error: 'Ramaibot could not clear your conversations.' }); return; }
        set({ conversations: [], activeConversationId: null });
      },

      exportData: async () => {
        const data = JSON.stringify(get().conversations, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `ramaibot-export-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url);
      },
    }),
    { name: 'ramaibot-storage', partialize: state => ({ selectedModelId: state.selectedModelId, selectedModeId: state.selectedModeId }) },
  ),
);
