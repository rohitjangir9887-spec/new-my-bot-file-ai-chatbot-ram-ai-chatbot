import { create } from 'zustand';

interface UsageState {
  requestsToday: number;
  lastReset: string;
  increment: () => void;
  reset: () => void;
}

export const useUsageStore = create<UsageState>((set) => ({
  requestsToday: 0,
  lastReset: new Date().toISOString(),
  increment: () => set((state) => ({ requestsToday: state.requestsToday + 1 })),
  reset: () => set({ requestsToday: 0, lastReset: new Date().toISOString() }),
}));
