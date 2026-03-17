import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = 'tripla_preferences_v1';
const PROFILE_KEY = 'tripla_profile_v1';

export type CurrencyOption = 'USD' | 'GBP' | 'EUR';
export type AppearanceOption = 'Light' | 'Dark' | 'System';

export interface ProfileData {
  name: string;
  email: string;
}

async function persistPrefs(prefs: Record<string, unknown>) {
  try {
    const existing = await AsyncStorage.getItem(PREFS_KEY);
    const current = existing ? JSON.parse(existing) : {};
    const updated = { ...current, ...prefs };
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[PreferencesStore] Failed to persist:', e);
  }
}

export const usePreferencesStore = create(
  combine(
    {
      notifications: false,
      locationEnabled: false,
      offlineMode: false,
      currency: 'USD' as CurrencyOption,
      appearance: 'Light' as AppearanceOption,
      profile: { name: '', email: '' } as ProfileData,
      isLoading: true,
    },
    (set) => ({
      hydrate: async () => {
        try {
          const [prefsRaw, profileRaw] = await Promise.all([
            AsyncStorage.getItem(PREFS_KEY),
            AsyncStorage.getItem(PROFILE_KEY),
          ]);
          const prefs = prefsRaw ? JSON.parse(prefsRaw) : {};
          const profile = profileRaw ? JSON.parse(profileRaw) : null;
          console.log('[PreferencesStore] Hydrated:', prefs, 'profile:', profile);
          set({
            notifications: prefs.notifications ?? false,
            locationEnabled: prefs.locationEnabled ?? false,
            offlineMode: prefs.offlineMode ?? false,
            currency: prefs.currency ?? 'USD',
            appearance: prefs.appearance ?? 'Light',
            profile: profile ?? { name: '', email: '' },
            isLoading: false,
          });
        } catch (e) {
          console.error('[PreferencesStore] Failed to hydrate:', e);
          set({ isLoading: false });
        }
      },

      setNotifications: async (value: boolean) => {
        set({ notifications: value });
        await persistPrefs({ notifications: value });
        console.log('[PreferencesStore] Notifications set:', value);
      },

      setLocationEnabled: async (value: boolean) => {
        set({ locationEnabled: value });
        await persistPrefs({ locationEnabled: value });
        console.log('[PreferencesStore] Location enabled set:', value);
      },

      setOfflineMode: async (value: boolean) => {
        set({ offlineMode: value });
        await persistPrefs({ offlineMode: value });
        console.log('[PreferencesStore] Offline mode set:', value);
      },

      setCurrency: async (value: CurrencyOption) => {
        set({ currency: value });
        await persistPrefs({ currency: value });
        console.log('[PreferencesStore] Currency set:', value);
      },

      setAppearance: async (value: AppearanceOption) => {
        set({ appearance: value });
        await persistPrefs({ appearance: value });
        console.log('[PreferencesStore] Appearance set:', value);
      },

      setProfile: async (data: ProfileData) => {
        set({ profile: data });
        try {
          await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data));
          console.log('[PreferencesStore] Profile saved:', data);
        } catch (e) {
          console.error('[PreferencesStore] Failed to persist profile:', e);
        }
      },
    }),
  ),
);
