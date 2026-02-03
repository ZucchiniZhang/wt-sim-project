/**
 * Team configuration store - manages Sim battle team assignments
 * Uses Zustand for state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TeamConfig, Nation } from '../types/aircraft';

interface TeamConfigState {
  // Active team configuration
  activePresetId: string;
  customTeamA: Nation[];
  customTeamB: Nation[];

  // Whether user has manually overridden the auto-preset
  userOverride: boolean;

  // Available presets (loaded from brackets.json)
  availablePresets: TeamConfig[];

  // Actions
  setActivePreset: (presetId: string) => void;
  setCustomTeamA: (nations: Nation[]) => void;
  setCustomTeamB: (nations: Nation[]) => void;
  addNationToTeamA: (nation: Nation) => void;
  addNationToTeamB: (nation: Nation) => void;
  removeNationFromTeamA: (nation: Nation) => void;
  removeNationFromTeamB: (nation: Nation) => void;
  loadPresets: (presets: TeamConfig[]) => void;
  getActiveConfig: () => TeamConfig;
  resetToDefault: () => void;
  autoSelectPreset: (bracketId: string, bracketMinBR?: number) => void;
  clearUserOverride: () => void;
}

// Default team configuration (Allies vs Axis)
const DEFAULT_TEAM_A: Nation[] = ['usa', 'britain', 'ussr', 'france', 'china', 'israel'];
const DEFAULT_TEAM_B: Nation[] = ['germany', 'japan', 'italy', 'sweden'];

export const useTeamConfigStore = create<TeamConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      activePresetId: 'default',
      customTeamA: DEFAULT_TEAM_A,
      customTeamB: DEFAULT_TEAM_B,
      userOverride: false,
      availablePresets: [],

      // Set active preset by ID (user-initiated = override)
      setActivePreset: (presetId) => {
        const { availablePresets } = get();

        if (presetId === 'custom') {
          set({ activePresetId: 'custom', userOverride: true });
          return;
        }

        const preset = availablePresets.find((p) => p.id === presetId);

        if (preset) {
          set({
            activePresetId: presetId,
            customTeamA: preset.team_a,
            customTeamB: preset.team_b,
            userOverride: true,
          });
        }
      },

      // Set custom team A nations
      setCustomTeamA: (nations) => {
        set({
          customTeamA: nations,
          activePresetId: 'custom',
        });
      },

      // Set custom team B nations
      setCustomTeamB: (nations) => {
        set({
          customTeamB: nations,
          activePresetId: 'custom',
        });
      },

      // Add nation to team A
      addNationToTeamA: (nation) => {
        const { customTeamA, customTeamB } = get();

        // Remove from team B if present
        const newTeamB = customTeamB.filter((n) => n !== nation);

        // Add to team A if not already present
        if (!customTeamA.includes(nation)) {
          set({
            customTeamA: [...customTeamA, nation],
            customTeamB: newTeamB,
            activePresetId: 'custom',
          });
        }
      },

      // Add nation to team B
      addNationToTeamB: (nation) => {
        const { customTeamA, customTeamB } = get();

        // Remove from team A if present
        const newTeamA = customTeamA.filter((n) => n !== nation);

        // Add to team B if not already present
        if (!customTeamB.includes(nation)) {
          set({
            customTeamA: newTeamA,
            customTeamB: [...customTeamB, nation],
            activePresetId: 'custom',
          });
        }
      },

      // Remove nation from team A
      removeNationFromTeamA: (nation) => {
        set((state) => ({
          customTeamA: state.customTeamA.filter((n) => n !== nation),
          activePresetId: 'custom',
        }));
      },

      // Remove nation from team B
      removeNationFromTeamB: (nation) => {
        set((state) => ({
          customTeamB: state.customTeamB.filter((n) => n !== nation),
          activePresetId: 'custom',
        }));
      },

      // Load available presets from data
      loadPresets: (presets) => {
        set({ availablePresets: presets });
      },

      // Get the currently active team configuration
      getActiveConfig: (): TeamConfig => {
        const { activePresetId, availablePresets, customTeamA, customTeamB } = get();

        if (activePresetId === 'custom') {
          return {
            id: 'custom',
            name: 'Custom Configuration',
            team_a: customTeamA,
            team_b: customTeamB,
          };
        }

        const preset = availablePresets.find((p) => p.id === activePresetId);

        if (preset) {
          return preset;
        }

        // Fallback to default
        return {
          id: 'default',
          name: 'Default (Allies vs Axis)',
          team_a: DEFAULT_TEAM_A,
          team_b: DEFAULT_TEAM_B,
        };
      },

      // Reset to default configuration
      resetToDefault: () => {
        set({
          activePresetId: 'default',
          customTeamA: DEFAULT_TEAM_A,
          customTeamB: DEFAULT_TEAM_B,
          userOverride: false,
        });
      },

      // Auto-select team preset based on bracket BR range
      // BR < 6.0 → ww2_classic (props era)
      // BR 6.0-9.0 → cold_war (early jets / Cold War)
      // BR > 9.0 → nato_vs_warsaw (modern era)
      autoSelectPreset: (bracketId: string, bracketMinBR?: number) => {
        const { userOverride, availablePresets } = get();
        if (userOverride) return;

        let targetPresetId: string;

        if (bracketMinBR !== undefined) {
          // Use BR-based selection (rotation-aware)
          if (bracketMinBR < 6.0) {
            targetPresetId = 'ww2_classic';
          } else if (bracketMinBR < 9.0) {
            targetPresetId = 'cold_war';
          } else {
            targetPresetId = 'nato_vs_warsaw';
          }
        } else {
          // Fallback to bracket number parsing
          const bracketNum = parseInt(bracketId.replace('ec', ''), 10);
          if (bracketNum <= 5) {
            targetPresetId = 'ww2_classic';
          } else if (bracketNum <= 7) {
            targetPresetId = 'cold_war';
          } else {
            targetPresetId = 'nato_vs_warsaw';
          }
        }

        const preset = availablePresets.find((p) => p.id === targetPresetId);
        if (preset) {
          set({
            activePresetId: targetPresetId,
            customTeamA: preset.team_a,
            customTeamB: preset.team_b,
          });
        }
      },

      // Clear user override (e.g., when changing aircraft/bracket)
      clearUserOverride: () => {
        set({ userOverride: false });
      },
    }),
    {
      name: 'wt-team-config-storage', // localStorage key
    }
  )
);
