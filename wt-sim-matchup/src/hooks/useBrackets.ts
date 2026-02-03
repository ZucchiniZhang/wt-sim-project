/**
 * useBrackets hook - load bracket configuration with rotation-aware cycle selection
 */

import { useState, useEffect, useMemo } from 'react';
import { findApplicableBrackets } from '../lib/matchup-logic';
import { getCycleInfo, type CycleInfo } from '../lib/rotation';
import type { SimBracket, BracketData } from '../types/aircraft';

/**
 * Load bracket configuration from local data
 */
async function loadBracketData(): Promise<BracketData> {
  try {
    const module = await import('../data/brackets.json');
    return module.default as BracketData;
  } catch (error) {
    console.error('Failed to load bracket data:', error);
    throw new Error('Bracket data not found');
  }
}

/**
 * Hook to work with BR brackets
 * Automatically loads bracket data and determines current rotation cycle
 */
export function useBrackets() {
  const [bracketData, setBracketData] = useState<BracketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bracket data on mount
  useEffect(() => {
    loadBracketData()
      .then((data) => {
        setBracketData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load bracket data:', err);
        setError(err.message || 'Failed to load bracket data');
        setIsLoading(false);
      });
  }, []);

  // Calculate current rotation cycle
  const cycleInfo = useMemo<CycleInfo | null>(() => {
    if (!bracketData) return null;
    return getCycleInfo(bracketData.cycles, bracketData.rotation);
  }, [bracketData]);

  // Current cycle's brackets
  const brackets = useMemo(() => {
    return cycleInfo?.brackets ?? [];
  }, [cycleInfo]);

  const teamPresets = useMemo(() => {
    return bracketData?.teams.presets || [];
  }, [bracketData]);

  const defaultTeam = useMemo(() => {
    return bracketData?.teams.default || null;
  }, [bracketData]);

  /**
   * Find brackets that a specific BR fits into (within current rotation)
   */
  const getBracketsForBR = useMemo(() => {
    return (br: number): SimBracket[] => {
      return findApplicableBrackets(br, brackets);
    };
  }, [brackets]);

  /**
   * Get a specific bracket by ID (within current rotation)
   */
  const getBracketById = useMemo(() => {
    return (id: string): SimBracket | null => {
      return brackets.find((b) => b.id === id) || null;
    };
  }, [brackets]);

  /**
   * Get team preset by ID
   */
  const getPresetById = useMemo(() => {
    return (id: string) => {
      if (id === 'default') return defaultTeam;
      return teamPresets.find((p) => p.id === id) || defaultTeam;
    };
  }, [teamPresets, defaultTeam]);

  /**
   * Get brackets for a specific cycle letter (A/B/C/D)
   */
  const getBracketsForCycle = useMemo(() => {
    return (cycleLetter: string): SimBracket[] => {
      const cycle = bracketData?.cycles.find(c => c.id === cycleLetter);
      return cycle?.brackets ?? [];
    };
  }, [bracketData]);

  return {
    brackets,
    cycleInfo,
    bracketData,
    teamPresets,
    defaultTeam,
    getBracketsForBR,
    getBracketById,
    getPresetById,
    getBracketsForCycle,
    isLoading,
    error,
  };
}
