RAMAIBOT SETTINGS — PREMIUM MOBILE REDESIGN

&nbsp;

Redesign the existing Ramaibot Settings experience based on the uploaded visual references.

&nbsp;

IMPORTANT:

Use the existing project, routes, state, authentication, database and settings functionality.

Do NOT create fake settings or duplicate settings.

Do NOT change backend behavior unless required to make an existing setting work.

This is primarily a UI/UX and interaction redesign.

&nbsp;

GOAL:

The Settings screen must feel like a professionally designed premium AI application, not an AI-generated template or generic dashboard.

&nbsp;

1. SETTINGS ENTRY

&nbsp;

When the user taps "Settings" from the Ramaibot sidebar:

&nbsp;

- close the sidebar smoothly

- open the Settings screen immediately

- use a clean mobile-first full-screen layout

- provide a clear back button

- preserve scroll position where appropriate

- prevent background scrolling while Settings is active

&nbsp;

Use a smooth native-feeling page transition.

&nbsp;

2. SETTINGS HOME

&nbsp;

Create a premium settings home inspired by the provided references.

&nbsp;

Top:

- compact back button

- "Settings" title

- optional subtle account/avatar area

&nbsp;

Then organize settings into clean sections.

&nbsp;

Primary sections:

&nbsp;

ACCOUNT

- Profile

- Workspace

- Subscription / Plan

- Email

- Phone number

&nbsp;

PERSONALIZATION

- Personalization

- Memory

- Custom Instructions

- Projects

&nbsp;

PREFERENCES

- Appearance

- Accent Color

- Language

- Notifications

- Voice

&nbsp;

PRIVACY & SECURITY

- Safety

- Security & Login

- Data Controls

- Storage

- Trusted Contact

- Parental Controls

&nbsp;

TOOLS & SYSTEM

- Plugins / Integrations

- Remote Control

- Usage

- About

- Report a Bug

&nbsp;

Only show items whose functionality exists in the current application.

Do not expose unfinished features as functional controls.

&nbsp;

3. VISUAL DESIGN

&nbsp;

Use a premium dark mobile interface:

&nbsp;

- near-black background

- subtle charcoal/graphite surfaces

- very restrained glass effect

- thin low-contrast borders

- soft shadows

- excellent text hierarchy

- white primary text

- muted secondary text

- Ramaibot purple/blue accent

&nbsp;

Avoid:

- excessive neon

- excessive gradients

- giant cards

- excessive rounded containers

- decorative effects

- unnecessary 3D elements

- oversized icons

&nbsp;

The design should feel closer to a polished native AI application than a web template.

&nbsp;

4. SETTINGS ROWS

&nbsp;

Each setting row should have:

&nbsp;

- 24px class icon

- primary title

- optional secondary value

- optional description

- right chevron for navigation

- minimum 48px touch target

&nbsp;

Rows should have subtle press feedback.

&nbsp;

Do not make every row look like a huge isolated card.

&nbsp;

Group related rows into visually coherent sections with comfortable spacing.

&nbsp;

5. PROFILE

&nbsp;

Create a premium profile header:

&nbsp;

- avatar

- user name

- email

- current Ramaibot plan

- edit profile action

&nbsp;

Keep personal information dynamically loaded from the authenticated user.

&nbsp;

Do not hardcode example emails or names.

&nbsp;

6. SUB-PAGES

&nbsp;

Every major setting must open its own proper sub-page/sheet.

&nbsp;

Examples:

&nbsp;

Appearance

→ System / Light / Dark

&nbsp;

Accent Color

→ available Ramaibot accent colors

&nbsp;

Notifications

→ notification preferences

&nbsp;

Voice

→ voice settings and voice behavior

&nbsp;

Personalization

→ personality / response preferences

&nbsp;

Memory

→ memory status, view/manage/clear memory

&nbsp;

Security & Login

→ authentication/security controls

&nbsp;

Data Controls

→ data/privacy controls

&nbsp;

Storage

→ storage usage and file management

&nbsp;

About

→ Ramaibot version and product information

&nbsp;

Report Bug

→ functional bug-report flow

&nbsp;

Use the same design language across all sub-pages.

&nbsp;

7. MOBILE UX

&nbsp;

Optimize specifically for:

&nbsp;

320px

360px

375px

390px

414px

430px

&nbsp;

Requirements:

&nbsp;

- no horizontal overflow

- no clipped text

- no overlapping controls

- safe-area top/bottom support

- comfortable touch targets

- keyboard-aware forms

- smooth scrolling

- bottom navigation/browser UI must not cover content

&nbsp;

8. ANIMATIONS

&nbsp;

Use subtle professional animations:

&nbsp;

- settings page slide/fade

- row press feedback

- chevron transitions

- modal/bottom-sheet spring animation

- subtle selection animation

&nbsp;

Respect prefers-reduced-motion.

&nbsp;

Do NOT use continuous distracting animations.

&nbsp;

9. INTERACTION FIXES

&nbsp;

Audit the existing Settings navigation and fix:

&nbsp;

- Settings button not opening

- incorrect z-index

- invisible overlays

- pointer-events problems

- backdrop blocking taps

- broken back navigation

- accidental background interaction

- scroll locking issues

&nbsp;

Every visible setting that appears enabled must actually respond correctly.

&nbsp;

10. DESKTOP

&nbsp;

On desktop, do not simply stretch the mobile UI.

&nbsp;

Use:

&nbsp;

- centered settings workspace

- wider content area

- optional left settings navigation

- comfortable max-width

- responsive two-column layout where appropriate

&nbsp;

Mobile remains the primary design target.

&nbsp;

11. DATA & SECURITY

&nbsp;

Do not expose sensitive account data unnecessarily.

&nbsp;

Use authenticated user data.

&nbsp;

Do not hardcode credentials, API keys, emails, phone numbers or private information.

&nbsp;

Preserve all existing Supabase/RLS/security behavior.

&nbsp;

12. QUALITY BAR

&nbsp;

The final result must look like a real premium AI product designed by a professional product/UI team.

&nbsp;

It should NOT look like:

- Lovable default UI

- generic SaaS dashboard

- AI-generated concept art

- excessive glassmorphism

- copied ChatGPT UI

&nbsp;

Keep Ramaibot's own identity.

&nbsp;

13. QA

&nbsp;

After implementation test:

&nbsp;

- open Settings from sidebar

- navigate into every available setting

- back navigation

- scrolling

- forms

- toggles

- selectors

- bottom sheets

- keyboard behavior

- authentication state

- mobile safe areas

- 320–430px responsiveness

- desktop responsiveness

&nbsp;

Verify no regression in chat, sidebar, authentication, tools or AI functionality.

&nbsp;

Run TypeScript/build checks.

&nbsp;

Report:

&nbsp;

PASS

FIXED

INCOMPLETE

CONFIGURATION REQUIRED

&nbsp;

Do not add internal QA instructions, prompts or audit text to the user-facing UI.