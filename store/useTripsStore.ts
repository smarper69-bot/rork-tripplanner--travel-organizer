import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Trip, StoredItineraryItem, StoredStay, StoredMemory } from '@/types/trip';
import { DEMO_TRIP_ID, demoTrip } from '@/mocks/demoTrip';

function getBaseUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://tripnest.app';
}

const STORAGE_KEY = 'tripla_data_v1';
const DEMO_DISMISSED_KEY = 'tripnest_demo_dismissed_v1';

interface TripDraft {
  title: string;
  destinationCity: string;
  destinationCountry: string;
  startDate?: string;
  endDate?: string;
  coverImage?: string;
  totalBudget?: number;
}

interface PersistedData {
  trips: Trip[];
  itineraryItems: StoredItineraryItem[];
  stays: StoredStay[];
  memories: StoredMemory[];
}

export function isUserTrip(trip: Trip): boolean {
  return trip.id !== DEMO_TRIP_ID;
}

export function getUserTripCount(trips: Trip[]): number {
  return trips.filter(isUserTrip).length;
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

const ICON_OPTIONS: { icon: Trip['icon']; color: string }[] = [
  { icon: 'landmark', color: '#2D3436' },
  { icon: 'palm-tree', color: '#1B4332' },
  { icon: 'mountain', color: '#3D405B' },
  { icon: 'sun', color: '#5F4B32' },
  { icon: 'cherry-blossom', color: '#4A3043' },
  { icon: 'cathedral', color: '#4A4A4A' },
  { icon: 'trees', color: '#2A4A2A' },
  { icon: 'snowflake', color: '#3A5A6A' },
  { icon: 'tent', color: '#5A4A3A' },
];

const pickIcon = (index: number) => {
  return ICON_OPTIONS[index % ICON_OPTIONS.length];
};

const computeStatus = (startDate?: string, endDate?: string): Trip['status'] => {
  if (!startDate || !endDate) return 'planning';
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now > end) return 'completed';
  if (now >= start && now <= end) return 'ongoing';
  return 'upcoming';
};

const persistData = async (data: PersistedData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('[TripsStore] Persisted', data.trips.length, 'trips');
  } catch (e) {
    console.error('[TripsStore] Failed to persist:', e);
  }
};

export const useTripsStore = create(
  combine(
    {
      trips: [] as Trip[],
      itineraryItems: [] as StoredItineraryItem[],
      stays: [] as StoredStay[],
      memories: [] as StoredMemory[],
      isHydrated: false,
    },
    (set, get) => {
      const toData = (): PersistedData => ({
        trips: get().trips.filter(t => t.id !== DEMO_TRIP_ID),
        itineraryItems: get().itineraryItems,
        stays: get().stays,
        memories: get().memories,
      });

      return {
        hydrate: async () => {
          try {
            const [raw, demoDismissed] = await Promise.all([
              AsyncStorage.getItem(STORAGE_KEY),
              AsyncStorage.getItem(DEMO_DISMISSED_KEY),
            ]);
            let trips: Trip[] = [];
            let itineraryItems: StoredItineraryItem[] = [];
            let stays: StoredStay[] = [];
            let memories: StoredMemory[] = [];

            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                trips = parsed as Trip[];
              } else {
                const data = parsed as PersistedData;
                trips = data.trips ?? [];
                itineraryItems = data.itineraryItems ?? [];
                stays = data.stays ?? [];
                memories = data.memories ?? [];
              }
            }

            trips = trips.filter(t => t.id !== DEMO_TRIP_ID);

            if (demoDismissed !== 'true') {
              trips = [...trips, demoTrip];
              console.log('[TripsStore] Injected demo trip');
            }

            set({ trips, itineraryItems, stays, memories, isHydrated: true });
          } catch (e) {
            console.error('[TripsStore] Failed to hydrate:', e);
            set({ isHydrated: true });
          }
        },

        dismissDemoTrip: async () => {
          const trips = get().trips.filter(t => t.id !== DEMO_TRIP_ID);
          set({ trips });
          try {
            await AsyncStorage.setItem(DEMO_DISMISSED_KEY, 'true');
            console.log('[TripsStore] Demo trip dismissed');
          } catch (e) {
            console.error('[TripsStore] Failed to persist demo dismissal:', e);
          }
          void persistData({ ...toData(), trips });
        },

        createTrip: (draft: TripDraft) => {
          const id = generateId();
          const iconPick = pickIcon(get().trips.length);
          const now = new Date().toISOString();
          const status = computeStatus(draft.startDate, draft.endDate);

          const newTrip: Trip = {
            id,
            name: draft.title,
            destination: draft.destinationCity,
            country: draft.destinationCountry || '',
            icon: iconPick.icon,
            iconColor: iconPick.color,
            startDate: draft.startDate || now,
            endDate: draft.endDate || now,
            status,
            collaborators: [
              {
                id: 'self',
                name: 'You',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
                role: 'owner',
              },
            ],
            totalBudget: draft.totalBudget || 0,
            spentBudget: 0,
            currency: 'USD',
            itinerary: [],
            packingList: [],
            isOfflineAvailable: false,
            ownerId: 'self',
            ownerName: 'You',
          };

          const trips = [newTrip, ...get().trips];
          set({ trips });
          void persistData({ ...toData(), trips });
          console.log('[TripsStore] Created trip:', id, draft.title);
          return id;
        },

        updateTrip: (tripId: string, patch: Partial<Trip>) => {
          const trips = get().trips.map((t) => (t.id === tripId ? { ...t, ...patch } : t));
          set({ trips });
          void persistData({ ...toData(), trips });
          console.log('[TripsStore] Updated trip:', tripId);
        },

        deleteTrip: (tripId: string) => {
          const s = get();
          const trips = s.trips.filter((t) => t.id !== tripId);
          const itineraryItems = s.itineraryItems.filter((i) => i.tripId !== tripId);
          const stays = s.stays.filter((st) => st.tripId !== tripId);
          const memories = s.memories.filter((m) => m.tripId !== tripId);
          set({ trips, itineraryItems, stays, memories });
          void persistData({ trips, itineraryItems, stays, memories });
          console.log('[TripsStore] Deleted trip:', tripId);
        },

        addItineraryItem: (tripId: string, draft: Omit<StoredItineraryItem, 'id' | 'tripId'>) => {
          const item: StoredItineraryItem = { id: generateId(), tripId, ...draft };
          const itineraryItems = [...get().itineraryItems, item];
          set({ itineraryItems });
          void persistData({ ...toData(), itineraryItems });
          console.log('[TripsStore] Added itinerary item:', item.id);
        },

        updateItineraryItem: (itemId: string, patch: Partial<StoredItineraryItem>) => {
          const itineraryItems = get().itineraryItems.map((i) => (i.id === itemId ? { ...i, ...patch } : i));
          set({ itineraryItems });
          void persistData({ ...toData(), itineraryItems });
        },

        deleteItineraryItem: (itemId: string) => {
          const itineraryItems = get().itineraryItems.filter((i) => i.id !== itemId);
          set({ itineraryItems });
          void persistData({ ...toData(), itineraryItems });
        },

        addStay: (tripId: string, draft: Omit<StoredStay, 'id' | 'tripId'>) => {
          const stay: StoredStay = { id: generateId(), tripId, ...draft };
          const stays = [...get().stays, stay];
          set({ stays });
          void persistData({ ...toData(), stays });
          console.log('[TripsStore] Added stay:', stay.id);
        },

        deleteStay: (stayId: string) => {
          const stays = get().stays.filter((s) => s.id !== stayId);
          set({ stays });
          void persistData({ ...toData(), stays });
        },

        addMemory: (tripId: string, draft: Omit<StoredMemory, 'id' | 'tripId' | 'createdAt'>) => {
          const memory: StoredMemory = { id: generateId(), tripId, ...draft, createdAt: new Date().toISOString() };
          const memories = [...get().memories, memory];
          set({ memories });
          void persistData({ ...toData(), memories });
        },

        deleteMemory: (memoryId: string) => {
          const memories = get().memories.filter((m) => m.id !== memoryId);
          set({ memories });
          void persistData({ ...toData(), memories });
        },

        generateInviteLink: (tripId: string) => {
          const trip = get().trips.find((t) => t.id === tripId);
          if (!trip) return '';
          const baseUrl = getBaseUrl();
          const correctLink = `${baseUrl}/join/${tripId}`;
          if (trip.inviteId && trip.inviteLink && trip.inviteLink === correctLink) {
            console.log('[TripsStore] Reusing existing invite link:', trip.inviteLink);
            return trip.inviteLink;
          }
          const inviteId = trip.inviteId || generateId();
          const inviteLink = correctLink;
          const trips = get().trips.map((t) =>
            t.id === tripId ? { ...t, inviteId, inviteLink, ownerId: t.ownerId || 'self', ownerName: t.ownerName || 'You' } : t
          );
          set({ trips });
          void persistData({ ...toData(), trips });
          console.log('[TripsStore] Generated invite link:', inviteLink, 'for trip:', tripId);
          return inviteLink;
        },

        getTripByInviteId: (inviteId: string) => {
          return get().trips.find((t) => t.inviteId === inviteId);
        },

        joinTrip: (inviteId: string, userName: string, userAvatar?: string) => {
          const trip = get().trips.find((t) => t.inviteId === inviteId);
          if (!trip) {
            console.log('[TripsStore] No trip found for inviteId:', inviteId);
            return null;
          }
          const alreadyMember = trip.collaborators.some((c) => c.name === userName && c.name !== 'You');
          if (alreadyMember) {
            console.log('[TripsStore] User already a collaborator:', userName);
            return trip.id;
          }
          const newCollab = {
            id: generateId(),
            name: userName,
            avatar: userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
            role: 'editor' as const,
          };
          const trips = get().trips.map((t) =>
            t.id === trip.id ? { ...t, collaborators: [...t.collaborators, newCollab] } : t
          );
          set({ trips });
          void persistData({ ...toData(), trips });
          console.log('[TripsStore] User joined trip:', trip.id, 'as:', userName);
          return trip.id;
        },

        addCollaborator: (tripId: string, name: string, role: 'editor' | 'viewer', avatar?: string) => {
          const trip = get().trips.find((t) => t.id === tripId);
          if (!trip) return;
          const newCollab = {
            id: generateId(),
            name,
            avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
            role,
          };
          const trips = get().trips.map((t) =>
            t.id === tripId ? { ...t, collaborators: [...t.collaborators, newCollab] } : t
          );
          set({ trips });
          void persistData({ ...toData(), trips });
          console.log('[TripsStore] Added collaborator:', name, 'to trip:', tripId);
        },

        joinTripById: (tripId: string, userName: string, userAvatar?: string) => {
          const trip = get().trips.find((t) => t.id === tripId);
          if (!trip) {
            console.log('[TripsStore] No trip found for tripId:', tripId);
            return null;
          }
          const alreadyMember = trip.collaborators.some((c) => c.name === userName && c.name !== 'You');
          if (alreadyMember) {
            console.log('[TripsStore] User already a collaborator:', userName);
            return trip.id;
          }
          const newCollab = {
            id: generateId(),
            name: userName,
            avatar: userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
            role: 'editor' as const,
          };
          const trips = get().trips.map((t) =>
            t.id === trip.id ? { ...t, collaborators: [...t.collaborators, newCollab] } : t
          );
          set({ trips });
          void persistData({ ...toData(), trips });
          console.log('[TripsStore] User joined trip by ID:', trip.id, 'as:', userName);
          return trip.id;
        },

        removeCollaborator: (tripId: string, collaboratorId: string) => {
          const trip = get().trips.find((t) => t.id === tripId);
          if (!trip) return;
          const trips = get().trips.map((t) =>
            t.id === tripId ? { ...t, collaborators: t.collaborators.filter((c) => c.id !== collaboratorId) } : t
          );
          set({ trips });
          void persistData({ ...toData(), trips });
          console.log('[TripsStore] Removed collaborator:', collaboratorId, 'from trip:', tripId);
        },
      };
    }
  )
);
