import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'tripla_onboarded_v1';
const USER_NAME_KEY = 'tripla_user_name_v1';
const USER_EMAIL_KEY = 'tripla_user_email_v1';
const AUTH_METHOD_KEY = 'tripla_auth_method_v1';
const LOCATION_ENABLED_KEY = 'tripla_location_enabled_v1';
const NOTIFICATIONS_ENABLED_KEY = 'tripla_notifications_enabled_v1';

export type AuthMethod = 'email' | 'apple' | 'google' | 'guest' | '';

export const useOnboardingStore = create(
  combine(
    {
      hasOnboarded: false,
      isLoading: true,
      userName: '',
      userEmail: '',
      authMethod: '' as AuthMethod,
      locationEnabled: false,
      notificationsEnabled: false,
    },
    (set) => ({
      hydrate: async () => {
        try {
          const [onboarded, name, email, authMethod, locationEnabled, notificationsEnabled] = await Promise.all([
            AsyncStorage.getItem(ONBOARDING_KEY),
            AsyncStorage.getItem(USER_NAME_KEY),
            AsyncStorage.getItem(USER_EMAIL_KEY),
            AsyncStorage.getItem(AUTH_METHOD_KEY),
            AsyncStorage.getItem(LOCATION_ENABLED_KEY),
            AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY),
          ]);
          console.log('[OnboardingStore] Hydrated, hasOnboarded:', onboarded === 'true', 'name:', name, 'email:', email, 'authMethod:', authMethod);
          set({
            hasOnboarded: onboarded === 'true',
            userName: name ?? '',
            userEmail: email ?? '',
            authMethod: (authMethod as AuthMethod) || '',
            locationEnabled: locationEnabled === 'true',
            notificationsEnabled: notificationsEnabled === 'true',
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

      setUserEmail: async (email: string) => {
        try {
          await AsyncStorage.setItem(USER_EMAIL_KEY, email);
          set({ userEmail: email });
          console.log('[OnboardingStore] User email set:', email);
        } catch (e) {
          console.error('[OnboardingStore] Failed to persist user email:', e);
        }
      },

      setAuthMethod: async (method: AuthMethod) => {
        try {
          await AsyncStorage.setItem(AUTH_METHOD_KEY, method);
          set({ authMethod: method });
          console.log('[OnboardingStore] Auth method set:', method);
        } catch (e) {
          console.error('[OnboardingStore] Failed to persist auth method:', e);
        }
      },

      setLocationEnabled: async (enabled: boolean) => {
        try {
          await AsyncStorage.setItem(LOCATION_ENABLED_KEY, enabled ? 'true' : 'false');
          set({ locationEnabled: enabled });
          console.log('[OnboardingStore] Location enabled set:', enabled);
        } catch (e) {
          console.error('[OnboardingStore] Failed to persist location enabled:', e);
        }
      },

      setNotificationsEnabled: async (enabled: boolean) => {
        try {
          await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
          set({ notificationsEnabled: enabled });
          console.log('[OnboardingStore] Notifications enabled set:', enabled);
        } catch (e) {
          console.error('[OnboardingStore] Failed to persist notifications enabled:', e);
        }
      },

      resetOnboarding: async () => {
        try {
          await AsyncStorage.multiRemove([
            ONBOARDING_KEY,
            USER_NAME_KEY,
            USER_EMAIL_KEY,
            AUTH_METHOD_KEY,
            LOCATION_ENABLED_KEY,
            NOTIFICATIONS_ENABLED_KEY,
          ]);
          set({
            hasOnboarded: false,
            userName: '',
            userEmail: '',
            authMethod: '' as AuthMethod,
            locationEnabled: false,
            notificationsEnabled: false,
          });
          console.log('[OnboardingStore] Onboarding reset');
        } catch (e) {
          console.error('[OnboardingStore] Failed to reset onboarding:', e);
        }
      },
    }),
  ),
);
