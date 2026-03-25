import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'tripla_onboarded_v1';
const USER_NAME_KEY = 'tripla_user_name_v1';
const USER_EMAIL_KEY = 'tripla_user_email_v1';
const AUTH_METHOD_KEY = 'tripla_auth_method_v1';
const LOCATION_ENABLED_KEY = 'tripla_location_enabled_v1';
const NOTIFICATIONS_ENABLED_KEY = 'tripla_notifications_enabled_v1';
const USAGE_PURPOSES_KEY = 'tripla_usage_purposes_v1';
const TRIP_TYPES_KEY = 'tripla_trip_types_v1';
const TRAVEL_COMPANION_KEY = 'tripla_travel_companion_v1';

export type AuthMethod = 'email' | 'apple' | 'google' | 'guest' | '';

export type UsagePurpose =
  | 'planning_trip'
  | 'finding_destinations'
  | 'building_itineraries'
  | 'planning_with_friends'
  | 'tracking_memories';

export type TripType =
  | 'beach'
  | 'city'
  | 'nature'
  | 'food'
  | 'culture'
  | 'adventure'
  | 'luxury'
  | 'budget';

export type TravelCompanion = 'solo' | 'partner' | 'friends' | 'family' | '';

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
      usagePurposes: [] as UsagePurpose[],
      tripTypes: [] as TripType[],
      travelCompanion: '' as TravelCompanion,
    },
    (set) => ({
      hydrate: async () => {
        try {
          const [onboarded, name, email, authMethod, locationEnabled, notificationsEnabled, usagePurposes, tripTypes, travelCompanion] = await Promise.all([
            AsyncStorage.getItem(ONBOARDING_KEY),
            AsyncStorage.getItem(USER_NAME_KEY),
            AsyncStorage.getItem(USER_EMAIL_KEY),
            AsyncStorage.getItem(AUTH_METHOD_KEY),
            AsyncStorage.getItem(LOCATION_ENABLED_KEY),
            AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY),
            AsyncStorage.getItem(USAGE_PURPOSES_KEY),
            AsyncStorage.getItem(TRIP_TYPES_KEY),
            AsyncStorage.getItem(TRAVEL_COMPANION_KEY),
          ]);
          console.log('[OnboardingStore] Hydrated, hasOnboarded:', onboarded === 'true', 'name:', name, 'email:', email);
          set({
            hasOnboarded: onboarded === 'true',
            userName: name ?? '',
            userEmail: email ?? '',
            authMethod: (authMethod as AuthMethod) || '',
            locationEnabled: locationEnabled === 'true',
            notificationsEnabled: notificationsEnabled === 'true',
            usagePurposes: usagePurposes ? JSON.parse(usagePurposes) : [],
            tripTypes: tripTypes ? JSON.parse(tripTypes) : [],
            travelCompanion: (travelCompanion as TravelCompanion) || '',
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

      setUsagePurposes: async (purposes: UsagePurpose[]) => {
        try {
          await AsyncStorage.setItem(USAGE_PURPOSES_KEY, JSON.stringify(purposes));
          set({ usagePurposes: purposes });
          console.log('[OnboardingStore] Usage purposes set:', purposes);
        } catch (e) {
          console.error('[OnboardingStore] Failed to persist usage purposes:', e);
        }
      },

      setTripTypes: async (types: TripType[]) => {
        try {
          await AsyncStorage.setItem(TRIP_TYPES_KEY, JSON.stringify(types));
          set({ tripTypes: types });
          console.log('[OnboardingStore] Trip types set:', types);
        } catch (e) {
          console.error('[OnboardingStore] Failed to persist trip types:', e);
        }
      },

      setTravelCompanion: async (companion: TravelCompanion) => {
        try {
          await AsyncStorage.setItem(TRAVEL_COMPANION_KEY, companion);
          set({ travelCompanion: companion });
          console.log('[OnboardingStore] Travel companion set:', companion);
        } catch (e) {
          console.error('[OnboardingStore] Failed to persist travel companion:', e);
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
            USAGE_PURPOSES_KEY,
            TRIP_TYPES_KEY,
            TRAVEL_COMPANION_KEY,
          ]);
          set({
            hasOnboarded: false,
            userName: '',
            userEmail: '',
            authMethod: '' as AuthMethod,
            locationEnabled: false,
            notificationsEnabled: false,
            usagePurposes: [],
            tripTypes: [],
            travelCompanion: '' as TravelCompanion,
          });
          console.log('[OnboardingStore] Onboarding reset');
        } catch (e) {
          console.error('[OnboardingStore] Failed to reset onboarding:', e);
        }
      },
    }),
  ),
);
