import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_KEY = 'tripnest_subscription_v1';

export type PlanType = 'free' | 'premium';

export interface SubscriptionState {
  plan: PlanType;
  isLoading: boolean;
}

const FREE_TRIP_LIMIT = 3;
const DEMO_TRIP_ID = '__demo_paris__';

export const PLAN_FEATURES = {
  free: {
    label: 'Free',
    features: [
      'Up to 3 trips',
      'Basic trip planning',
      'Basic itinerary editing',
      'Destination explore',
      'Basic globe stats',
      'Save memories locally',
      'Basic trip sharing',
    ],
  },
  premium: {
    label: 'Premium',
    tagline: 'Plan together, use AI, and unlock unlimited trips',
    features: [
      'Unlimited trips',
      'AI itinerary generation',
      'AI travel suggestions',
      'Collaborative editing & shared trip planning',
      'Offline trip access',
      'Advanced globe & travel history',
      'Smart hotel & activity suggestions',
    ],
  },
};

export { FREE_TRIP_LIMIT, DEMO_TRIP_ID };

export const useSubscriptionStore = create(
  combine(
    {
      plan: 'free' as PlanType,
      isLoading: true,
    },
    (set, get) => ({
      hydrate: async () => {
        try {
          const raw = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            set({ plan: parsed.plan ?? 'free', isLoading: false });
          } else {
            set({ isLoading: false });
          }
          console.log('[SubscriptionStore] Hydrated, plan:', get().plan);
        } catch (e) {
          console.error('[SubscriptionStore] Failed to hydrate:', e);
          set({ isLoading: false });
        }
      },

      setPlan: async (plan: PlanType) => {
        set({ plan });
        try {
          await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify({ plan }));
          console.log('[SubscriptionStore] Plan set:', plan);
        } catch (e) {
          console.error('[SubscriptionStore] Failed to persist:', e);
        }
      },

      isPremium: () => get().plan === 'premium',

      canCreateTrip: (currentTripCount: number) => {
        if (get().plan === 'premium') return true;
        return currentTripCount < FREE_TRIP_LIMIT;
      },

      getRemainingTrips: (currentTripCount: number) => {
        if (get().plan === 'premium') return Infinity;
        return Math.max(0, FREE_TRIP_LIMIT - currentTripCount);
      },
    }),
  ),
);
