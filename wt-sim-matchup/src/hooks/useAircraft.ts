/**
 * useAircraft hook - load and filter aircraft data
 * Provides fuzzy search with Fuse.js and memoized filtering
 * Integrates with filter store and selection store
 */

import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { loadLocalAircraftData } from '../lib/api';
import { useFilterStore } from '../stores/filterStore';
import { useSelectionStore } from '../stores/selectionStore';
import type { Aircraft } from '../types/aircraft';

const FUSE_OPTIONS = {
  keys: [
    { name: 'identifier', weight: 0.7 },
    { name: 'localized_name', weight: 0.3 },
  ],
  threshold: 0.4, // Lower = more strict matching
  includeScore: true,
};

/**
 * Load and filter aircraft data with fuzzy search support
 * Automatically integrates with filter store
 *
 * @returns Filtered aircraft array and metadata
 */
export function useAircraft() {
  // State for all aircraft data
  const [allAircraft, setAllAircraft] = useState<Aircraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get filter state
  const { brRange, aircraftTypes, showPremiums, searchQuery } = useFilterStore();
  const { selectedNation } = useSelectionStore();

  // Load aircraft data on mount
  useEffect(() => {
    loadLocalAircraftData()
      .then((data) => {
        setAllAircraft(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load aircraft data:', err);
        setError(err.message || 'Failed to load aircraft data');
        setIsLoading(false);
      });
  }, []);

  // Create Fuse instance for fuzzy search (memoized)
  const fuse = useMemo(() => {
    return new Fuse(allAircraft, FUSE_OPTIONS);
  }, [allAircraft]);

  // Filter aircraft based on all criteria
  const filteredAircraft = useMemo(() => {
    let results = allAircraft;

    // Apply nation filter
    if (selectedNation) {
      results = results.filter((aircraft) => aircraft.country === selectedNation);
    }

    // Apply BR range filter
    if (brRange) {
      results = results.filter(
        (aircraft) =>
          aircraft.simulator_br >= brRange[0] && aircraft.simulator_br <= brRange[1]
      );
    }

    // Apply type filter
    if (aircraftTypes && aircraftTypes.length > 0) {
      results = results.filter((aircraft) =>
        aircraftTypes.includes(aircraft.vehicle_type)
      );
    }

    // Apply premium filter
    if (!showPremiums) {
      results = results.filter((aircraft) => !aircraft.is_premium);
    }

    // Apply search query (fuzzy search)
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      const matchedIds = new Set(searchResults.map((result) => result.item.identifier));

      results = results.filter((aircraft) => matchedIds.has(aircraft.identifier));
    }

    return results;
  }, [allAircraft, selectedNation, brRange, aircraftTypes, showPremiums, searchQuery, fuse]);

  return {
    aircraft: filteredAircraft,
    allAircraft, // Export all aircraft for matchup calculations
    isLoading,
    error,
    filteredCount: filteredAircraft.length,
    totalCount: allAircraft.length,
  };
}
