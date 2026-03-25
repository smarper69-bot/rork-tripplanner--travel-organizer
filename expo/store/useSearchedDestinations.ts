import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { DiscoverDestination } from '@/mocks/destinations';

export const useSearchedDestinations = create(
  combine(
    {
      destinations: {} as Record<string, DiscoverDestination>,
    },
    (set, get) => ({
      addDestination: (dest: DiscoverDestination) => {
        console.log('[SearchedDest] Caching destination:', dest.city, 'id:', dest.id);
        set((state) => ({
          destinations: { ...state.destinations, [dest.id]: dest },
        }));
      },
      getDestination: (id: string) => {
        return get().destinations[id];
      },
    })
  )
);
