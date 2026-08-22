# Ramaibot UX & Navigation Overhaul Plan

This plan implements missing pages, refines navigation (Settings, Projects, Models, Files), and fixes the email verification flow with a premium iOS-inspired experience.

## Missing Pages
- **Analyze Files**: Premium File Intelligence page with upload, PDF/Image/Doc support, recent files, and metadata display using existing secure storage architecture.
- **Explore Models**: Professional model browser showing configured AI models (GPT-4o, Claude 3.5, etc.) with capability summaries and selection.
- **Projects**: Dedicated Projects workspace with creation, management (rename/archive/delete), and polished empty states.

## Navigation System
- **Direct Access**: Sidebar items will open their destination pages directly without nested menus.
- **Settings UX**: Overhaul Settings to behave like a native iOS app with smooth slide transitions and a clear navigation stack.
- **Back Navigation**: Implement proper back button support and browser history integration for all sub-pages.

## Authentication Flow
- **Email Verification UX**: Dedicated "Check your email" screen with Gmail deep-link, resend cooldown, and error handling.
- **Unverified Access**: Friendly redirect to verification screen if an unverified user tries to sign in.
- **Transition States**: Premium "Welcome back" (existing) and "Welcome to Ramaibot" (new) animations for verified sessions.

## Technical Details
- **Routing**: Update `src/routes/__root.tsx` and add new routes in `src/routes/` for direct navigation.
- **State Management**: Use Zustand store (`src/lib/chat/store.ts`) for project and model state.
- **Animation**: Utilize `framer-motion` for premium page transitions and bottom sheets.
- **UI Architecture**: Standardize glassmorphism tokens in `src/styles.css` for consistent branding.

