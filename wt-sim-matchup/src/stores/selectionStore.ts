/**
 * Selection store - manages user's aircraft selection and comparison list
 * Uses Zustand for state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Aircraft, Nation } from '../types/aircraft';

export type AppMode = 'encyclopedia' | 'briefing';

interface SelectionState {
  // Current selections
  selectedNation: Nation | null;
  selectedAircraft: Aircraft | null;
  comparisonAircraft: Aircraft[];
  currentMode: AppMode;

  // Actions
  setSelectedNation: (nation: Nation | null) => void;
  setSelectedAircraft: (aircraft: Aircraft | null) => void;
  setCurrentMode: (mode: AppMode) => void;
  addToComparison: (aircraft: Aircraft) => void;
  removeFromComparison: (identifier: string) => void;
  clearComparison: () => void;
  isInComparison: (identifier: string) => boolean;
  reset: () => void;
}

const MAX_COMPARISON = 4; // Maximum aircraft to compare at once

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedNation: null,
      selectedAircraft: null,
      comparisonAircraft: [],
      currentMode: 'briefing',

      // Set selected nation
      setSelectedNation: (nation) => {
        set({ selectedNation: nation });
      },

      // Set selected aircraft
      setSelectedAircraft: (aircraft) => {
        set({ selectedAircraft: aircraft });
      },

      // Set app mode
      setCurrentMode: (mode) => {
        set({ currentMode: mode });
      },

      // Add aircraft to comparison (max 4)
      addToComparison: (aircraft) => {
        const { comparisonAircraft, isInComparison } = get();

        // Don't add if already in comparison
        if (isInComparison(aircraft.identifier)) {
          return;
        }

        // Don't add if at max capacity
        if (comparisonAircraft.length >= MAX_COMPARISON) {
          return;
        }

        set({
          comparisonAircraft: [...comparisonAircraft, aircraft],
        });
      },

      // Remove aircraft from comparison
      removeFromComparison: (identifier) => {
        set((state) => ({
          comparisonAircraft: state.comparisonAircraft.filter(
            (a) => a.identifier !== identifier
          ),
        }));
      },

      // Clear all comparison aircraft
      clearComparison: () => {
        set({ comparisonAircraft: [] });
      },

      // Check if aircraft is in comparison
      isInComparison: (identifier) => {
        return get().comparisonAircraft.some((a) => a.identifier === identifier);
      },

      // Reset all selections
      reset: () => {
        set({
          selectedNation: null,
          selectedAircraft: null,
          comparisonAircraft: [],
        });
      },
    }),
    {
      name: 'wt-selection-storage', // localStorage key
      partialize: (state) => ({
        // Only persist comparison aircraft and selected nation
        // Don't persist selectedAircraft (fresh selection each session)
        selectedNation: state.selectedNation,
        comparisonAircraft: state.comparisonAircraft,
        currentMode: state.currentMode,
      }),
    }
  )
);
