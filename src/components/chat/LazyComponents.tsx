import React, { Suspense, lazy } from 'react';

// Lazy load components that are not immediately visible or are heavy
export const PDFViewer = lazy(() => import('./AttachmentUI').then(m => ({ default: m.AttachmentCard }))); // Temporary fallback to card
export const VoiceUI = lazy(() => import('../voice/VoiceUI').then(m => ({ default: m.VoiceUI })));
export const SettingsView = lazy(() => import('../settings/SettingsView').then(m => ({ default: m.SettingsView })));
export const AttachmentPreview = lazy(() => import('./AttachmentUI').then(m => ({ default: m.AttachmentPreview })));


// A helper for handling lazy components with a premium loader
export function withRamaibotSuspense<P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode = null
) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  };
}
