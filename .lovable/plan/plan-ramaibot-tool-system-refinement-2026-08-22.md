# Plan: Ramaibot Tool System Refinement

Refactor the tool and action system to improve reliability, accessibility, and visual hierarchy. Replace the existing mode selector with a dedicated Tool Bar that provides consistent access to AI generation, search, calculation, and utility tools across all chat states.

## 1. Tool Bar & Interaction Fix
- **Refactor `ChatComposer.tsx`**: Replace the mode selector with a new 3-button Tool Bar (AI, Tools, Code).
- **Accessibility & UX**:
  - Minimum 44px touch targets.
  - Standardized pressed, hover, and focus states.
  - Correct `z-index` and `pointer-events` to fix the clickability bug.
  - Proper ARIA labels for all interactive elements.

## 2. Tool Categorization
- **AI / Create**: Includes "Create Image". Available in both empty and active chats.
- **Tools**: Includes "Web Search", "Calculator", "Voice", "File Upload", and "Camera".
- **Code**: Hidden or disabled until specific coding tools are implemented.

## 3. Tool Action Integration
- **Menus**: Use standardized `BottomSheet` for mobile and `Popover` for desktop.
- **States**: Implement consistent "Running", "Completed", "Failed", and "Disabled" states for tool executions.
- **Image Generation**:
  - Direct access to `ImageGenForm` from the AI menu.
  - Standardized prompt, aspect ratio, and generation workflow.
  - Persistence and regeneration support in the conversation view.

## 4. Chat State Management
- **Tool Availability**: Ensure tools remain available after the first message.
- **Streaming Guard**: Disable conflicting actions and show "Stop Generation" during active AI responses.
- **Onboarding/Empty State**: Maintain quick action cards as shortcuts that prepare the composer.

## 5. Mobile & Production Hardening
- **Responsive Audit**: Verify layout stability on 320px–430px viewports.
- **Safe Areas**: Ensure no keyboard overlap or broken safe-area padding.
- **Performance**: Optimize Framer Motion animations and glass effects.
- **Final Checks**: Run `tsgo` and `bun run build:dev` to ensure stability.

## Technical Details
- **Stack**: React 19, Framer Motion, Tailwind CSS v4, Lucide React icons.
- **State**: Zustand (`useChatStore`) for managing tool executions and chat status.
- **Components**: `ChatComposer`, `ToolGrid`, `ImageGenForm`, `BottomSheet`, `Popover`.
