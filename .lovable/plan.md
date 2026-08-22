# Ramaibot Startup, Auth & Navigation Stability Fix

Eliminate startup glitches, flash-of-unstyled-content, and navigation loops for a premium production feel.

## Technical Details

- **Startup Sequence**:
  - Unify `AuthGuard` loading state with a stable shell.
  - Remove redundant `SplashScreen` delay; trigger exit on session resolution.
  - Implement a `isHydrated` check to prevent hydration mismatches from persisted Zustand stores.
- **Auth & Sessions**:
  - Single source of truth for auth state in `AuthGuard` using `supabase.auth.onAuthStateChange`.
  - Prevent "Welcome Back" flashes by tracking the `SIGNED_IN` event specifically, and persisting the "dismissed" state for the session duration.
- **Hydration & SSR**:
  - Wrap browser-only layout logic in hydration-safe initializers.
  - Use `Suspense` boundaries with stable skeleton loaders for lazy-loaded views (Settings, Projects, etc.).
- **Mobile Stability**:
  - Standardize safe-area handling (`pb-safe`) and viewport-relative units (`dvh`).
  - Fix composer jumping by using stable positioning and avoiding layout shifts during keyboard events.

## Execution Steps

1. **Refactor AuthGuard**:
   - Merge `loading` and `session` resolution.
   - Prevent rendering children until hydration is verified.
   - Refine `showWelcome` logic to trigger only on explicit login events, not route changes.
2. **Update Index Route**:
   - Add the verbatim instruction block to the hidden QA card.
   - Standardize `Suspense` fallbacks to match the app shell (no white flashes).
3. **Audit Components**:
   - Fix hydration errors in `ChatComposer` and `ConversationSidebar`.
   - Ensure `SplashScreen` exit is tied to app readiness.
4. **Final Stability QA**: 
   - Verify zero layout shifts (CLS) on mobile and desktop.
   - Report final PASS/FAIL status.
