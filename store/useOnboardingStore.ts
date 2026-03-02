import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'tripla_onboarded_v1';
const USER_NAME_KEY = 'tripla_user_name_v1';

interface OnboardingState {
  hasOnboarded: boolean;
  isLoading: boolean;
  userName: string;
  hydrate: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasOnboarded: false,
  isLoading: true,
  userName: '',

  hydrate: async () => {
    try {
      const [onboarded, name] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        AsyncStorage.getItem(USER_NAME_KEY),
      ]);
      console.log('[OnboardingStore] Hydrated, hasOnboarded:', onboarded === 'true');
      set({
        hasOnboarded: onboarded === 'true',
        userName: name ?? '',
        isLoading: false,
      });
    } catch (e) {
      console.error('[OnboardingStore] Failed to hydrate:', e);
      set({ isLoading: false });
    }
  },

  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      set({ hasOnboarded: true });
      console.log('[OnboardingStore] Onboarding completed');
    } catch (e) {
      console.error('[OnboardingStore] Failed to persist onboarding:', e);
    }
  },

  setUserName: async (name: string) => {
    try {
      await AsyncStorage.setItem(USER_NAME_KEY, name);
      set({ userName: name });
      console.log('[OnboardingStore] User name set:', name);
    } catch (e) {
      console.error('[OnboardingStore] Failed to persist user name:', e);
    }
  },

  resetOnboarding: async () => {
    try {
      await AsyncStorage.multiRemove([ONBOARDING_KEY, USER_NAME_KEY]);
      set({ hasOnboarded: false, userName: '' });
      console.log('[OnboardingStore] Onboarding reset');
    } catch (e) {
      console.error('[OnboardingStore] Failed to reset onboarding:', e);
    }
  },
}));
