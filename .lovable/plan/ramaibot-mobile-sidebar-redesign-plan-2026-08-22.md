# Ramaibot Mobile Sidebar Redesign Plan

Redesign the mobile sidebar into a production-grade, iOS-inspired navigation drawer while preserving all existing functionality and fixing interaction issues.

## User Review Required

> [!IMPORTANT]
> - The sidebar width will be increased to ~90vw on mobile for better usability.
> - A new "AI Tools" section will be added to the sidebar for quick access to features like Image Generation and Web Search.
> - Conversation actions (Pin, Rename, Delete) will be moved into a clean overflow menu per row.

## Proposed Changes

### 1. Styling & Tokens (`src/styles.css`)
- Update sidebar color tokens for a "near-black" iOS aesthetic.
- Refine frosted glass and backdrop blur effects for the mobile drawer.
- Add smooth spring animation utility for the drawer slide.

### 2. Sidebar Component (`src/components/chat/ConversationSidebar.tsx`)
- Implement a professional header with logo, status indicator, and close button.
- Create a cleaner "New Chat" and "Search" section.
- Add "AI Tools" navigation group (Create Image, Write/Edit, Web Search, Analyze Files).
- Group conversations into "Pinned" and "Recent" with compact rows.
- Implement an overflow menu for conversation actions (Rename, Pin, Archive, Delete).
- Add a "Resources" section (Projects, Explore Models, Settings).
- Add a bottom "Profile & Plan" section with user information.

### 3. App Shell & Mobile Drawer (`src/routes/index.tsx`)
- Refactor the mobile sidebar container to be a full-height drawer (88-94vw width).
- Implement a backdrop that closes the drawer on tap.
- Fix `z-index` and `pointer-events` to ensure reliable interaction.
- Ensure safe-area support for modern mobile devices.

### 4. Logic & Interactivity
- Link sidebar "AI Tools" to the existing tool actions in the `ChatComposer`.
- Fix event propagation issues in the conversation list.
- Ensure search correctly filters across titles and message content.

## Technical Details
- Using `framer-motion` for smooth spring animations.
- Utilizing `shadcn/ui` components (`DropdownMenu`, `Avatar`) for consistent UI.
- Applying `oklch` color functions for the near-black sidebar background.
- Verifying mobile responsiveness via Playwright (320px-430px).
