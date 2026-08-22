# Phase 1: Authentication & Secure Persistence

Implementing secure user authentication and database persistence using Lovable Cloud (Supabase). This replaces the temporary local storage system with a production-ready infrastructure.

## User Review Required

> [!IMPORTANT]
> This phase connects the application to a real backend. You will need to sign up to use the application once the changes are applied.

- **Authentication**: Enable Email/Password and Google Sign-in.
- **Data Migration**: Move chat history from `localStorage` to the database after login (optional/best-effort).
- **Security**: All data will be protected by Row Level Security (RLS).

## Technical Details

### Database Schema
- `profiles`: User information (email, name, role, custom instructions).
- `conversations`: Metadata for chat threads (title, pinning, timestamps).
- `messages`: Individual chat entries (role, content, metadata).
- `user_roles`: RBAC for potential future moderator/admin features.

### Components
- `src/components/auth/AuthGuard.tsx`: Protects routes and handles session state.
- `src/components/auth/AuthUI.tsx`: Glassmorphism-styled login/signup forms.
- `src/lib/chat/store.ts`: Refactored to sync with Supabase tables instead of `localStorage`.
- `src/integrations/supabase/auth-attacher.ts`: Registered in `src/start.ts` for secure server function calls.

### Workflow
1. **Migrations**: Execute SQL to create tables and RLS policies (Completed).
2. **Auth UI**: Create premium styled authentication screens.
3. **State Management**: Refactor Zustand store to handle async database operations.
4. **Route Protection**: Wrap the main application in an `AuthGuard`.
