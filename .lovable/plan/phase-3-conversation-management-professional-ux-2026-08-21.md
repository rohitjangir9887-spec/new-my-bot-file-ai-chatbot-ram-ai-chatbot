# Phase 3: Conversation Management & Professional UX

Implement a reliable conversation manager for Ramaibot, including pinning, archiving, automatic titling, and enhanced search.

## User Review Required

> [!IMPORTANT]
> - **Automatic Titling**: Conversations will be automatically titled based on the first user message. You can also rename them manually.
> - **Search**: The new search feature will index both conversation titles and message contents.
> - **Archive**: Conversations can be archived to declutter the sidebar without permanent deletion.

## Proposed Changes

### 1. Database & Schema
- No new tables are required as the existing `conversations` table already includes `is_pinned` and `is_archived`.
- Ensure `updated_at` triggers correctly bubble up when new messages are added to maintain "Recent" sorting.

### 2. Conversation Store (`src/lib/chat/store.ts`)
- **New Actions**: `toggleArchive`, `searchConversations`, `clearSearch`.
- **Refinement**:
    - `initialize`: Filter out archived conversations from the default list.
    - `sendMessage`: Implement automatic titling for new conversations using a short summary of the first message.
    - `createConversation`: Ensure a "New Chat" state exists locally without creating a database row until the first message is sent.

### 3. Sidebar Upgrade (`src/components/chat/ConversationSidebar.tsx`)
- **Sections**: Pinned, Recent (Active), and a link to the Archived view.
- **Search**: Add a debounced search input that queries both titles and message content.
- **Action Menu**: Create a reusable iOS-style glass menu for Rename, Pin/Unpin, Archive/Restore, and Delete.
- **Empty States**: Premium glassmorphism states for "No Results", "No Chats", and "Loading".

### 4. New Features & UI
- **Rename**: Inline editing or a compact glass modal for renaming conversations.
- **Archive View**: A dedicated view (or slide-over sheet) to manage archived chats.
- **Mobile UX**: 
    - Full-width search experience on mobile.
    - Responsive action menus and confirmation dialogs.
    - Graceful title truncation and touch-friendly targets.

### 5. AI & Streaming (Preservation)
- Ensure switching conversations correctly aborts any active streaming and resets the `AbortController`.
- Verify `Regenerate`, `Retry`, and `Edit` continue to work seamlessly across different conversations.

## Technical Details

- **Zustand Persistence**: Keep the `ramaibot-storage` for local settings but rely on Supabase for the primary conversation state.
- **Search Logic**: Use Supabase's `ilike` or text search for efficient filtering on the backend.
- **Animations**: Use `framer-motion` for sidebar transitions, search focus, and menu appearances.
- **Security**: All Supabase queries will use the authenticated user's session to respect RLS.

## Verification Plan

- [ ] **Automated Tests**: Use Playwright to verify the flow: New Chat -> Send Message -> Title Auto-generated -> Pin -> Rename -> Archive -> Restore -> Search -> Delete.
- [ ] **Mobile Audit**: Verify layout and keyboard behavior on iPhone SE (320px) through iPhone 14 Pro Max (430px).
- [ ] **Build Check**: Ensure zero TypeScript errors and a successful production build.
