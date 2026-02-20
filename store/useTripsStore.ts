import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '@/types/trip';

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

interface TripsState {
  trips: Trip[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  createTrip: (draft: TripDraft) => string;
  updateTrip: (tripId: string, patch: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;
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

const persist = async (trips: Trip[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    console.log('[TripsStore] Persisted', trips.length, 'trips');
  } catch (e) {
    console.error('[TripsStore] Failed to persist trips:', e);
  }
};

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Trip[];
        console.log('[TripsStore] Hydrated', parsed.length, 'trips');
        set({ trips: parsed, isHydrated: true });
      } else {
        console.log('[TripsStore] No stored trips found');
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
    persist(updated);
    console.log('[TripsStore] Created trip:', id, draft.title);
    return id;
  },

  updateTrip: (tripId: string, patch: Partial<Trip>) => {
    const updated = get().trips.map((t) =>
      t.id === tripId ? { ...t, ...patch } : t
    );
    set({ trips: updated });
    persist(updated);
    console.log('[TripsStore] Updated trip:', tripId);
  },

  deleteTrip: (tripId: string) => {
    const updated = get().trips.filter((t) => t.id !== tripId);
    set({ trips: updated });
    persist(updated);
    console.log('[TripsStore] Deleted trip:', tripId);
  },
}));
