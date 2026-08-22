# Ramaibot Permanent Google Login Fix

Address Google OAuth configuration issues, implement mandatory account selection, and enhance the mobile authentication experience.

## Technical Details

- **Auth Strategy**: Supabase OAuth with PKCE and `prompt: 'select_account'` to force Google's account chooser.
- **Frontend Enhancements**:
  - Update `AuthGuard.tsx` to include `prompt=select_account` in OAuth params.
  - Implement visual loading states ("Connecting to Google...") on the sign-in button.
  - Standardize error handling for missing backend configuration.
  - Refine the welcome experience for new vs. returning users.
- **Navigation & Routing**:
  - Verify `/auth/callback` handles session restoration correctly.
  - Ensure mobile stability by using standard `redirectTo` flows.
- **Backend Audit**:
  - Clearly identify and report the missing **Google Client Secret** if it remains unconfigured.
  - Provide instructions for the user to add the secret via the Backend view.

## Execution Steps

1. **Update Project Identifier**: Rewrite the hidden QA/Status card in `src/routes/index.tsx` with the verbatim command and current status.
2. **Refine AuthGuard**: 
   - Inject `prompt: 'select_account'` into `supabase.auth.signInWithOAuth`.
   - Add button `disabled` state and loading label during authentication.
   - Improve toast error messages for configuration failures.
3. **Verify Auth Flow**: 
   - Check `src/routes/auth.callback.tsx` for proper redirection.
   - Test mobile-specific viewports (320px-430px) for layout stability during auth.
4. **Final Status Reporting**: Present the final PASS/FAIL report as specified.
