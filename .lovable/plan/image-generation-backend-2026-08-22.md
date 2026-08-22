Implement the approved Phase 14 plan for Ramaibot.

&nbsp;

First inspect the existing project and available Lovable AI Gateway capabilities.

&nbsp;

IMPORTANT:

Do not rebuild the application.

Preserve all Phase 1–13 functionality.

Do not expose API keys.

Do not create fake image-generation results.

Do not display development prompts, QA reports, system instructions, or internal implementation text.

&nbsp;

## IMAGE GENERATION BACKEND

&nbsp;

Create a secure server-side image generation architecture.

&nbsp;

Use the project's supported Lovable AI Gateway image-generation capability.

&nbsp;

Do not hardcode or assume an unsupported provider/model.

If image generation is not configured, return a clear configuration error instead of a fake result.

&nbsp;

Keep provider credentials server-side.

&nbsp;

Validate all requests with Zod.

&nbsp;

Verify authentication and conversation ownership before generation.

&nbsp;

## STORAGE

&nbsp;

After successful generation:

&nbsp;

- store the generated image securely

- associate it with the authenticated user

- associate it with the conversation/message

- respect existing Supabase RLS

- use signed/private access where appropriate

&nbsp;

Do not expose another user's generated files.

&nbsp;

## TOOL REGISTRY

&nbsp;

Add a real `generate_image` tool to the existing server-side tool architecture.

&nbsp;

Supported tools should remain:

&nbsp;

- Create Image

- Web Search

- Calculator

- Voice

- Attach Files

&nbsp;

Do not duplicate existing tool implementations.

&nbsp;

## CHAT COMPOSER

&nbsp;

Refine the existing tool menu.

&nbsp;

Mobile:

Use a native-feeling bottom sheet.

&nbsp;

Desktop:

Use a compact popover.

&nbsp;

Keep it simple and professional.

&nbsp;

Create Image should open:

&nbsp;

- prompt

- aspect ratio where supported

- Generate

- Cancel

&nbsp;

Do not automatically send unrelated chat messages.

&nbsp;

## TOOL STATES

&nbsp;

Standardize tool states:

&nbsp;

Ready

Running

Completed

Failed

Cancelled

&nbsp;

Show subtle animations only.

&nbsp;

Never expose technical provider errors.

&nbsp;

## GENERATED IMAGE UI

&nbsp;

Create a reusable generated-image message component.

&nbsp;

Support:

&nbsp;

- responsive preview

- loading state

- fullscreen preview

- regenerate

- save/download where supported

- error state

&nbsp;

Keep images inside the conversation history.

&nbsp;

Do not create a separate unnecessary gallery application.

&nbsp;

## MESSAGE PERSISTENCE

&nbsp;

Store generated-image attachment metadata with the existing message architecture.

&nbsp;

Preserve existing messages and attachment formats.

&nbsp;

Do not break old conversations.

&nbsp;

## ZUSTAND

&nbsp;

Update the existing chat store only where necessary to represent:

&nbsp;

- tool state

- image generation state

- generated attachment

&nbsp;

Avoid unnecessary global state.

&nbsp;

## SECURITY

&nbsp;

Verify:

&nbsp;

- authentication

- conversation ownership

- RLS

- private storage

- signed URLs

- Zod validation

- server-only secrets

- safe error handling

- rate limiting where supported

&nbsp;

Never trust user IDs supplied by the client.

&nbsp;

## MOBILE

&nbsp;

Test:

&nbsp;

320px

360px

375px

390px

414px

430px

&nbsp;

Verify:

&nbsp;

- tool bottom sheet

- keyboard behavior

- image generation form

- generated image preview

- fullscreen image view

- composer

- safe areas

- no horizontal overflow

&nbsp;

## PERFORMANCE

&nbsp;

Use:

&nbsp;

- progressive image loading

- appropriate image sizing

- lazy fullscreen preview

- stable message rendering

&nbsp;

Do not load unnecessary high-resolution images immediately.

&nbsp;

## REGRESSION

&nbsp;

Verify:

&nbsp;

- authentication

- conversations

- streaming

- Stop

- Retry

- Regenerate

- Markdown

- KaTeX

- code blocks

- file uploads

- vision

- voice

- projects

- memory

- personalization

- Web Search

- Calculator

- settings

- PWA

&nbsp;

## INTERNAL CONTENT CLEANUP

&nbsp;

Search the source tree and remove any internal:

&nbsp;

- QA reports

- system instructions

- development prompts

- Lovable instructions

- test cards

- implementation text

&nbsp;

Do not merely hide these with CSS.

&nbsp;

## FINAL VERIFICATION

&nbsp;

Run:

&nbsp;

- TypeScript check

- production build

- end-to-end image generation test when configured

- tool-state test

- storage/RLS test

- mobile viewport test

- desktop test

&nbsp;

If a required external configuration is missing, report it clearly rather than pretending the feature works.

&nbsp;

Report:

&nbsp;

1. Implemented

2. Fixed

3. Configuration required

4. Incomplete/deferred

5. Security verification

6. Mobile QA

7. Build status