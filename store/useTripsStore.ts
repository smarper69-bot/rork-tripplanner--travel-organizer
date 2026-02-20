import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, StoredItineraryItem, StoredStay, StoredMemory } from '@/types/trip';

const STORAGE_KEY = 'tripla_data_v1';

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

interface TripsState {
  trips: Trip[];
  itineraryItems: StoredItineraryItem[];
  stays: StoredStay[];
  memories: StoredMemory[];
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  createTrip: (draft: TripDraft) => string;
  updateTrip: (tripId: string, patch: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;

  addItineraryItem: (tripId: string, draft: Omit<StoredItineraryItem, 'id' | 'tripId'>) => void;
  updateItineraryItem: (itemId: string, patch: Partial<StoredItineraryItem>) => void;
  deleteItineraryItem: (itemId: string) => void;

  addStay: (tripId: string, draft: Omit<StoredStay, 'id' | 'tripId'>) => void;
  deleteStay: (stayId: string) => void;

  addMemory: (tripId: string, draft: Omit<StoredMemory, 'id' | 'tripId' | 'createdAt'>) => void;
  deleteMemory: (memoryId: string) => void;
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

const persist = async (state: PersistedData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log('[TripsStore] Persisted', state.trips.length, 'trips,', state.itineraryItems.length, 'itinerary items,', state.stays.length, 'stays,', state.memories.length, 'memories');
  } catch (e) {
    console.error('[TripsStore] Failed to persist:', e);
  }
};

const getPersistedData = (state: TripsState): PersistedData => ({
  trips: state.trips,
  itineraryItems: state.itineraryItems,
  stays: state.stays,
  memories: state.memories,
});

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: [],
  itineraryItems: [],
  stays: [],
  memories: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          console.log('[TripsStore] Hydrated legacy format:', parsed.length, 'trips');
          set({ trips: parsed as Trip[], itineraryItems: [], stays: [], memories: [], isHydrated: true });
        } else {
          const data = parsed as PersistedData;
          console.log('[TripsStore] Hydrated', data.trips?.length ?? 0, 'trips,', data.itineraryItems?.length ?? 0, 'itinerary items,', data.stays?.length ?? 0, 'stays,', data.memories?.length ?? 0, 'memories');
          set({
            trips: data.trips ?? [],
            itineraryItems: data.itineraryItems ?? [],
            stays: data.stays ?? [],
            memories: data.memories ?? [],
            isHydrated: true,
          });
        }
      } else {
        console.log('[TripsStore] No stored data found');
        set({ isHydrated: true });
      }
    } catch (e) {
      console.error('[TripsStore] Failed to hydrate:', e);
      set({ isHydrated: true });
    }
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
    };

    const updated = [newTrip, ...get().trips];
    set({ trips: updated });
    persist(getPersistedData({ ...get(), trips: updated }));
    console.log('[TripsStore] Created trip:', id, draft.title);
    return id;
  },

  updateTrip: (tripId: string, patch: Partial<Trip>) => {
    const updated = get().trips.map((t) =>
      t.id === tripId ? { ...t, ...patch } : t
    );
    set({ trips: updated });
    persist(getPersistedData({ ...get(), trips: updated }));
    console.log('[TripsStore] Updated trip:', tripId);
  },

  deleteTrip: (tripId: string) => {
    const state = get();
    const trips = state.trips.filter((t) => t.id !== tripId);
    const itineraryItems = state.itineraryItems.filter((i) => i.tripId !== tripId);
    const stays = state.stays.filter((s) => s.tripId !== tripId);
    const memories = state.memories.filter((m) => m.tripId !== tripId);
    set({ trips, itineraryItems, stays, memories });
    persist({ trips, itineraryItems, stays, memories });
    console.log('[TripsStore] Deleted trip:', tripId);
  },

  addItineraryItem: (tripId, draft) => {
    const item: StoredItineraryItem = {
      id: generateId(),
      tripId,
      ...draft,
    };
    const updated = [...get().itineraryItems, item];
    set({ itineraryItems: updated });
    persist(getPersistedData({ ...get(), itineraryItems: updated }));
    console.log('[TripsStore] Added itinerary item:', item.id, 'to trip:', tripId);
  },

  updateItineraryItem: (itemId, patch) => {
    const updated = get().itineraryItems.map((i) =>
      i.id === itemId ? { ...i, ...patch } : i
    );
    set({ itineraryItems: updated });
    persist(getPersistedData({ ...get(), itineraryItems: updated }));
    console.log('[TripsStore] Updated itinerary item:', itemId);
  },

  deleteItineraryItem: (itemId) => {
    const updated = get().itineraryItems.filter((i) => i.id !== itemId);
    set({ itineraryItems: updated });
    persist(getPersistedData({ ...get(), itineraryItems: updated }));
    console.log('[TripsStore] Deleted itinerary item:', itemId);
  },

  addStay: (tripId, draft) => {
    const stay: StoredStay = {
      id: generateId(),
      tripId,
      ...draft,
    };
    const updated = [...get().stays, stay];
    set({ stays: updated });
    persist(getPersistedData({ ...get(), stays: updated }));
    console.log('[TripsStore] Added stay:', stay.id, 'to trip:', tripId);
  },

  deleteStay: (stayId) => {
    const updated = get().stays.filter((s) => s.id !== stayId);
    set({ stays: updated });
    persist(getPersistedData({ ...get(), stays: updated }));
    console.log('[TripsStore] Deleted stay:', stayId);
  },

  addMemory: (tripId, draft) => {
    const memory: StoredMemory = {
      id: generateId(),
      tripId,
      ...draft,
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().memories, memory];
    set({ memories: updated });
    persist(getPersistedData({ ...get(), memories: updated }));
    console.log('[TripsStore] Added memory:', memory.id, 'to trip:', tripId);
  },

  deleteMemory: (memoryId) => {
    const updated = get().memories.filter((m) => m.id !== memoryId);
    set({ memories: updated });
    persist(getPersistedData({ ...get(), memories: updated }));
    console.log('[TripsStore] Deleted memory:', memoryId);
  },
}));
