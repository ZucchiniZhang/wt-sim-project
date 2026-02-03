/**
 * Filter store - manages aircraft filtering state
 * Uses Zustand for state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VehicleType } from '../types/aircraft';

interface FilterState {
  // Filter values
  brRange: [number, number];
  aircraftTypes: VehicleType[];
  showPremiums: boolean;
  searchQuery: string;

  // Actions
  setBRRange: (range: [number, number]) => void;
  setAircraftTypes: (types: VehicleType[]) => void;
  toggleAircraftType: (type: VehicleType) => void;
  setShowPremiums: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

// Default filter values
const DEFAULT_BR_RANGE: [number, number] = [1.0, 14.3];
const DEFAULT_AIRCRAFT_TYPES: VehicleType[] = [
  'fighter',
  'bomber',
  'assault',
];

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Initial state
      brRange: DEFAULT_BR_RANGE,
      aircraftTypes: DEFAULT_AIRCRAFT_TYPES,
      showPremiums: true,
      searchQuery: '',

      // Set BR range (ensures min <= max)
      setBRRange: (range) => {
        set({ brRange: [Math.min(range[0], range[1]), Math.max(range[0], range[1])] });
      },

      // Set aircraft types
      setAircraftTypes: (types) => {
        set({ aircraftTypes: types });
      },

      // Toggle a single aircraft type on/off
      toggleAircraftType: (type) => {
        const { aircraftTypes } = get();

        if (aircraftTypes.includes(type)) {
          // Remove type
          set({
            aircraftTypes: aircraftTypes.filter((t) => t !== type),
          });
        } else {
          // Add type
          set({
            aircraftTypes: [...aircraftTypes, type],
          });
        }
      },

      // Toggle premium visibility
      setShowPremiums: (show) => {
        set({ showPremiums: show });
      },

      // Set search query
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      // Reset all filters to defaults
      resetFilters: () => {
        set({
          brRange: DEFAULT_BR_RANGE,
          aircraftTypes: DEFAULT_AIRCRAFT_TYPES,
          showPremiums: true,
          searchQuery: '',
        });
      },
    }),
    {
      name: 'wt-filter-storage-v2', // localStorage key (bumped to clear stale data)
    }
  )
);
