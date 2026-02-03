/**
 * useMatchups hook - calculate matchups for selected aircraft
 * Memoizes expensive matchup calculations, integrates threat analysis
 */

import { useMemo, useEffect } from 'react';
import { calculateMatchups, getMatchupStats } from '../lib/matchup-logic';
import { assessAllThreats, getTopThreats } from '../lib/threat-analysis';
import { useTeamConfigStore } from '../stores/teamConfigStore';
import type { Aircraft, SimBracket, TeamConfig, MatchupResult, ThreatAssessment } from '../types/aircraft';

interface UseMatchupsOptions {
  selectedAircraft: Aircraft | null;
  allAircraft: Aircraft[];
  brackets: SimBracket[];
  teamConfig: TeamConfig;
}

/**
 * Calculate and memoize matchup results for the selected aircraft
 */
export function useMatchups(options: UseMatchupsOptions) {
  const { selectedAircraft, allAircraft, brackets, teamConfig } = options;
  const { autoSelectPreset, clearUserOverride } = useTeamConfigStore();

  // Calculate matchups (memoized)
  const matchupResult = useMemo<MatchupResult | null>(() => {
    if (!selectedAircraft) {
      return null;
    }

    // Don't calculate until brackets are loaded (prevents errors during initial load)
    if (brackets.length === 0) {
      return null;
    }

    try {
      const result = calculateMatchups(selectedAircraft, allAircraft, brackets, teamConfig);
      // Attach active preset name to result
      result.activePresetName = teamConfig.name;
      return result;
    } catch (error) {
      console.error('Error calculating matchups:', error);
      return null;
    }
  }, [selectedAircraft, allAircraft, brackets, teamConfig]);

  // Auto-select team preset based on bracket (using BR range for rotation-aware selection)
  useEffect(() => {
    if (matchupResult?.bracket) {
      autoSelectPreset(matchupResult.bracket.id, matchupResult.bracket.min_br);
    }
  }, [matchupResult?.bracket?.id, matchupResult?.bracket?.min_br, autoSelectPreset]);

  // Clear user override when aircraft changes
  useEffect(() => {
    clearUserOverride();
  }, [selectedAircraft?.identifier, clearUserOverride]);

  // Calculate statistics (memoized)
  const stats = useMemo(() => {
    if (!matchupResult) {
      return null;
    }

    return getMatchupStats(matchupResult);
  }, [matchupResult]);

  // Calculate threat assessments for all enemies (memoized)
  const threatMap = useMemo<Map<string, ThreatAssessment>>(() => {
    if (!matchupResult || !selectedAircraft) {
      return new Map();
    }

    return assessAllThreats(selectedAircraft, matchupResult.enemyAircraft);
  }, [matchupResult, selectedAircraft]);

  // Get top 5 threats (memoized)
  const topThreats = useMemo(() => {
    if (!matchupResult || !selectedAircraft) {
      return [];
    }

    return getTopThreats(selectedAircraft, matchupResult.enemyAircraft, 5);
  }, [matchupResult, selectedAircraft]);

  return {
    matchup: matchupResult,
    stats,
    threatMap,
    topThreats,
    isLoading: false,
    error: null,
  };
}
