import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'system' | 'light' | 'dark';
export type AccentColor = 'blue' | 'violet' | 'rose' | 'emerald' | 'amber';
export type ResponseTone = 'professional' | 'casual' | 'creative';
export type ResponseLength = 'short' | 'normal' | 'detailed';

interface SettingsState {
  theme: Theme; accentColor: AccentColor; voiceEnabled: boolean; autoPlayResponses: boolean; speechSpeed: number; selectedVoice: string | null;
  notificationsEnabled: boolean; taskCompletionNotifications: boolean; accountNotifications: boolean; productUpdates: boolean; securityAlerts: boolean;
  memoryEnabled: boolean; personalizationEnabled: boolean; customInstructions: string; language: string; hasCompletedOnboarding: boolean; webSearchEnabled: boolean; safeSearch: boolean; responseTone: ResponseTone; responseLength: ResponseLength;
  setTheme: (theme: Theme) => void; setAccentColor: (color: AccentColor) => void; setVoiceEnabled: (enabled: boolean) => void; setAutoPlayResponses: (enabled: boolean) => void; setSpeechSpeed: (speed: number) => void; setSelectedVoice: (voice: string | null) => void;
  setNotificationsEnabled: (enabled: boolean) => void; setTaskCompletionNotifications: (enabled: boolean) => void; setAccountNotifications: (enabled: boolean) => void; setProductUpdates: (enabled: boolean) => void; setSecurityAlerts: (enabled: boolean) => void;
  setMemoryEnabled: (enabled: boolean) => void; setPersonalizationEnabled: (enabled: boolean) => void; setCustomInstructions: (instructions: string) => void; setLanguage: (lang: string) => void; setHasCompletedOnboarding: (completed: boolean) => void; setWebSearchEnabled: (enabled: boolean) => void; setSafeSearch: (enabled: boolean) => void; setResponseTone: (tone: ResponseTone) => void; setResponseLength: (length: ResponseLength) => void;
}

export const useSettingsStore = create<SettingsState>()(persist((set) => ({
  theme: 'system', accentColor: 'blue', voiceEnabled: true, autoPlayResponses: false, speechSpeed: 1, selectedVoice: null,
  notificationsEnabled: true, taskCompletionNotifications: true, accountNotifications: true, productUpdates: false, securityAlerts: true,
  memoryEnabled: true, personalizationEnabled: true, customInstructions: '', language: 'English (US)', hasCompletedOnboarding: false, webSearchEnabled: true, safeSearch: true, responseTone: 'professional', responseLength: 'normal',
  setTheme: theme => set({ theme }), setAccentColor: accentColor => set({ accentColor }), setVoiceEnabled: voiceEnabled => set({ voiceEnabled }), setAutoPlayResponses: autoPlayResponses => set({ autoPlayResponses }), setSpeechSpeed: speechSpeed => set({ speechSpeed }), setSelectedVoice: selectedVoice => set({ selectedVoice }),
  setNotificationsEnabled: notificationsEnabled => set({ notificationsEnabled }), setTaskCompletionNotifications: taskCompletionNotifications => set({ taskCompletionNotifications }), setAccountNotifications: accountNotifications => set({ accountNotifications }), setProductUpdates: productUpdates => set({ productUpdates }), setSecurityAlerts: securityAlerts => set({ securityAlerts }),
  setMemoryEnabled: memoryEnabled => set({ memoryEnabled }), setPersonalizationEnabled: personalizationEnabled => set({ personalizationEnabled }), setCustomInstructions: customInstructions => set({ customInstructions }), setLanguage: language => set({ language }), setHasCompletedOnboarding: hasCompletedOnboarding => set({ hasCompletedOnboarding }), setWebSearchEnabled: webSearchEnabled => set({ webSearchEnabled }), setSafeSearch: safeSearch => set({ safeSearch }), setResponseTone: responseTone => set({ responseTone }), setResponseLength: responseLength => set({ responseLength }),
}), { name: 'ramaibot-settings' }));
