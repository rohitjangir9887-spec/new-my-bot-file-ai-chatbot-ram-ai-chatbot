# Ramaibot — Permanent Google Login & Account Chooser Fix

This plan details the implementation of a robust, production-grade Google OAuth flow for Ramaibot, ensuring permanent functionality across mobile and desktop devices, proper account selection, and a premium user experience.

## Objectives
- Audit and identify missing backend configurations (Google Client Secret).
- Implement mandatory Google account selection via `prompt=select_account`.
- Enhance login UX with loading states, animations, and professional error handling.
- Refine the "Welcome back" experience for returning users vs onboarding for new users.
- Verify end-to-end functionality across all viewports.

## Proposed Changes

### 1. Backend Configuration Audit
- **Action:** Verify the exact status of the Google Client Secret in the backend.
- **Reporting:** If the secret is missing, explicitly report: "Google Client Secret must be added to the Supabase Google provider configuration."
- **Verification:** Confirm that Site URL and Redirect URIs match the production environment (`https://cheerful-hi-circle.lovable.app`).

### 2. Frontend Authentication Refinement (`src/components/auth/AuthGuard.tsx`)
- **Google Sign-in Logic:**
    - Update `supabase.auth.signInWithOAuth` options to include `queryParams: { prompt: 'select_account' }` (ensuring it's consistently applied).
    - Implement a "Connecting to Google…" loading state when the button is clicked.
    - Disable the button during the connection phase to prevent duplicate requests.
- **UX Enhancements:**
    - Replace raw Supabase errors with user-friendly messages (e.g., "Google sign-in couldn't be completed. Please try again.").
    - Add a subtle premium loading animation to the Google button.
- **Welcome Experience:**
    - Differentiate between `SIGNED_IN` and `SIGNED_UP` events.
    - Show "Welcome to Ramaibot" for first-time users and "Welcome Back" for returning users.
    - Ensure smooth transitions into the chat interface without extra login steps.

### 3. Callback Optimization (`src/routes/auth.callback.tsx`)
- **Stability:** Ensure PKCE code exchange is handled correctly.
- **Session Restoration:** Verify that the session is restored and the user profile is correctly initialized before redirecting to the main application.
- **Error Handling:** Add a fallback redirect to the login screen with a descriptive toast if the callback fails.

### 4. Quality Assurance (QA)
- **Viewport Testing:** Audit 320px to 430px ranges to ensure zero horizontal overflow and proper mobile rendering.
- **Flow Verification:** Test multi-account login, logout/login cycles, and session persistence after browser refreshes.

## Technical Details
- **OAuth Parameter:** `prompt=select_account` ensures the Google account chooser always appears.
- **Auth Store:** Use `useChatStore` to ensure conversation history is correctly synced upon login.
- **Supabase Client:** Strictly use the public client for all frontend auth operations.

## Security & Compliance
- **No Hardcoded Secrets:** No OAuth secrets, service-role keys, or private credentials will be added to the frontend code.
- **Secure Redirects:** Use the production origin for all redirect URIs to prevent open redirect vulnerabilities.
