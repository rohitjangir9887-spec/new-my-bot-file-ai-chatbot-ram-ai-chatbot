# Ramaibot: Production Implementation Roadmap

This roadmap outlines the phased development for Ramaibot, a premium, production-ready AI assistant. The goal is to build a highly functional, secure, and visually stunning application while maintaining its unique glassmorphism identity.

---

## Design & Experience Foundation (Cross-Phase)
*These principles apply to all UI work in every phase.*
- **Visuals**: Frosted glass, 40px+ backdrop blurs, translucent surfaces, and subtle white-to-transparent borders.
- **Interactions**: iOS-inspired spring animations, page transitions, and keyboard-aware composer.
- **Identity**: The 3D Ramaibot identity orb as the central UI anchor.
- **Mobile**: Safe-area support, native-feel bottom sheets, and slide-in drawers.

---

## Phase 1: Authentication & Secure Persistence
**Goal**: Transition from local storage to a secure, user-bound cloud infrastructure.

- **UI Changes**: Add Login/Signup screens, User profile dropdown in sidebar.
- **Components**: `AuthGuard`, `LoginForm`, `SignupForm`, `UserProfile`.
- **Backend Work**: Enable Lovable Cloud (Supabase Auth).
- **Database Work**: Tables for `profiles` and `conversations`.
- **Security**: Implement RLS (Row Level Security) so users only see their own chats.
- **Mobile**: Ensure auth forms are responsive and handle mobile password managers.
- **Testing**: Verify signup, login, session persistence, and unauthorized access prevention.
- **Dependencies**: `@supabase/supabase-js`.
- **Do NOT Change**: The core chat layout or glassmorphism styling.

## Phase 2: Intelligence & Streaming
**Goal**: Replace mock AI with production-grade streaming responses and rich formatting.

- **UI Changes**: Add streaming text effects, "Stop Generation" button, and status indicators.
- **Components**: Upgraded `MessageList` for streaming, `MarkdownRenderer` with LaTeX/Mermaid support.
- **Backend Work**: Integrate Lovable AI Gateway for OpenAI/Anthropic. Implement server-side streaming functions.
- **Database Work**: `messages` table with role, content, and timestamp.
- **Security**: Server-side API key protection (no keys in client). Token-based rate limiting.
- **Mobile**: Optimize streaming performance to prevent UI jank on lower-end devices.
- **Testing**: Verify streaming, Markdown rendering (LaTeX/Mermaid), and "Stop" functionality.
- **Dependencies**: `react-markdown`, `remark-math`, `rehype-katex`, `mermaid`.
- **Do NOT Change**: Authentication logic or sidebar structure.

## Phase 3: Conversation Management & Search
**Goal**: Robust organization tools for long-term use.

- **UI Changes**: Add search bar to sidebar, "Pinned" section, and "Archive" view.
- **Components**: `SearchBar`, `PinnedChats`, `ArchiveModal`, `ConversationActions` (Rename/Delete).
- **Backend Work**: Server functions for archiving, pinning, and full-text search.
- **Database Work**: Add `is_pinned`, `is_archived`, and `search_vector` to `conversations`.
- **Security**: Verify ownership before any edit/delete/archive action.
- **Mobile**: Swipe-to-action (archive/delete) on conversation list if possible.
- **Testing**: Verify search accuracy, pinning persistence, and archive retrieval.
- **Do NOT Change**: AI streaming or message rendering.

## Phase 4: Multimodal Inputs & File Analysis
**Goal**: Support for vision, document analysis, and image generation.

- **UI Changes**: Add attachment menu (Paperclip), file preview cards, and image generation UI.
- **Components**: `FileUpload`, `ImagePreview`, `PDFViewer`, `ImageGenGallery`.
- **Backend Work**: Supabase Storage integration for file uploads. Vision API orchestration.
- **Database Work**: `files` table linked to `messages`.
- **Security**: File type/size validation. Scan for malicious content. Secure URL signing.
- **Mobile**: Camera integration and gallery access.
- **Testing**: Verify PDF text extraction, image understanding, and DALL-E generation.
- **Dependencies**: `lucide-react` (new icons), `vaul` (bottom sheets).

## Phase 5: Personalization & Memory
**Goal**: Long-term memory and project-specific AI behavior.

- **UI Changes**: "Memory" toggle in settings, "Projects" workspace selector, "Custom Instructions" editor.
- **Components**: `ProjectWorkspace`, `MemoryManager`, `InstructionEditor`, `PersonalizationSettings`.
- **Backend Work**: Vector database (pgvector) for long-term memory retrieval. Context injection logic.
- **Database Work**: `projects` table, `memories` (vector) table, `custom_instructions` in `profiles`.
- **Security**: Option to "Clear Memory" or "Disable Memory" for privacy compliance.
- **Mobile**: Compact project switcher.
- **Testing**: Verify context retrieval from previous chats and instruction adherence.

## Phase 6: Tools & External Integrations
**Goal**: Real-time web search, calculator, and tool consent UI.

- **UI Changes**: Tool execution status bars, consent modals for external tools.
- **Components**: `ToolStatus`, `ConsentModal`, `WebSearchPreview`.
- **Backend Work**: Search API integration (Tavily/Bing). Function calling orchestration.
- **Security**: Strict sandboxing for code execution. "Human-in-the-loop" consent for all tools.
- **Mobile**: Optimized tool output formatting for small screens.
- **Testing**: Verify tool accuracy and permission gate effectiveness.

## Phase 7: Polish, Performance & Production QA
**Goal**: Final optimization and security hardening.

- **Work**: 
  - Accessibility (A11y) audit.
  - Performance profiling (Lighthouse, Core Web Vitals).
  - Production security audit.
  - Notification system (Subscription/Usage alerts).
  - Offline mode (read-only cached chats).
- **Testing**: Full regression testing across iPhone SE to 4K Desktop.
- **Final QA**: Load testing and edge case handling (e.g., massive messages).
