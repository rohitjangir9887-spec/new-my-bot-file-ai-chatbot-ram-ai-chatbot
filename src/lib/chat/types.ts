export type MessageRole = 'user' | 'assistant' | 'system';

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document';
  mimeType: string;
  size: number;
  url: string;
  storagePath?: string;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  error?: string;
}

export interface ToolCall {
  id: string;
  type: 'calculator' | 'web_search' | 'image_generation';
  status: 'preparing' | 'waiting_consent' | 'searching' | 'processing' | 'completed' | 'error';
  args: any;
  result?: any;
  error?: string;
  consentRequired?: boolean;
}

export interface MessageMetadata {
  messageId?: string;
  model?: string | null | undefined;
  status?: 'thinking' | 'streaming' | 'completed' | 'error' | null | undefined;
  usage?: { prompt_tokens: number; completion_tokens: number } | null | undefined;
  error?: string | null | undefined;
  imagePrompt?: string;
  toolCalls?: ToolCall[];
  attachments?: Attachment[];
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  metadata?: MessageMetadata;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}
