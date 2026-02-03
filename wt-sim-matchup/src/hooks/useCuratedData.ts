/**
 * Hook for accessing curated aircraft data
 * Provides O(1) lookup by aircraft identifier
 */

import { useMemo } from 'react';
import curatedDataRaw from '../data/curated-aircraft.json';
import type { CuratedAircraftData } from '../types/curated';

const curatedData = curatedDataRaw as CuratedAircraftData[];

// Build lookup map once at module level
const curatedMap = new Map<string, CuratedAircraftData>();
for (const entry of curatedData) {
  curatedMap.set(entry.identifier, entry);
}

export function useCuratedData() {
  const getCuratedData = useMemo(
    () => (identifier: string): CuratedAircraftData | undefined => {
      return curatedMap.get(identifier);
    },
    []
  );

  return { getCuratedData, curatedMap };
}
