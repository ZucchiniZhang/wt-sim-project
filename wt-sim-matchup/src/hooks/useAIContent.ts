/**
 * React hooks for AI-generated content
 * Handles loading states, caching, and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import type { TacticalGuide, MatchupPlaybook } from '../types/curated';
import type { Aircraft } from '../types/aircraft';
import {
  generateTacticalGuide,
  generateMatchupPlaybook,
  isAIEnabled,
  getCacheVersion,
} from '../lib/ai-service';
import {
  getTacticalGuide,
  setTacticalGuide,
  getMatchupPlaybook,
  setMatchupPlaybook,
} from '../lib/ai-cache';

interface AIContentState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  generating: boolean;
}

/**
 * Hook for tactical guide generation and caching
 */
export function useTacticalGuide(aircraft: Aircraft | null) {
  const [state, setState] = useState<AIContentState<TacticalGuide>>({
    data: null,
    loading: true,
    error: null,
    generating: false,
  });

  // Load from cache on mount
  useEffect(() => {
    if (!aircraft) {
      setState({ data: null, loading: false, error: null, generating: false });
      return;
    }

    const aircraftId = aircraft.identifier;
    let cancelled = false;

    async function loadFromCache() {
      try {
        const cached = await getTacticalGuide(
          aircraftId,
          getCacheVersion()
        );

        if (!cancelled) {
          setState({
            data: cached,
            loading: false,
            error: null,
            generating: false,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: 'Failed to load cached guide',
            generating: false,
          });
        }
      }
    }

    loadFromCache();

    return () => {
      cancelled = true;
    };
  }, [aircraft]);

  // Generate new guide
  const generate = useCallback(async () => {
    if (!aircraft) {
      setState(prev => ({
        ...prev,
        error: 'No aircraft selected',
      }));
      return;
    }

    if (!isAIEnabled()) {
      setState(prev => ({
        ...prev,
        error: 'AI generation is not enabled. Set VITE_AI_ENABLE_GENERATION=true and ensure Ollama is running.',
      }));
      return;
    }

    const currentAircraft = aircraft;
    setState(prev => ({ ...prev, generating: true, error: null }));

    try {
      const guide = await generateTacticalGuide(currentAircraft);
      await setTacticalGuide(guide);

      setState({
        data: guide,
        loading: false,
        error: null,
        generating: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate guide';
      setState(prev => ({
        ...prev,
        generating: false,
        error: errorMessage,
      }));
    }
  }, [aircraft]);

  return {
    guide: state.data,
    loading: state.loading,
    error: state.error,
    generating: state.generating,
    generate,
    aiEnabled: isAIEnabled(),
  };
}

/**
 * Hook for matchup playbook generation and caching
 */
export function useMatchupPlaybook(
  playerAircraft: Aircraft | null,
  enemyAircraft: Aircraft | null
) {
  const [state, setState] = useState<AIContentState<MatchupPlaybook>>({
    data: null,
    loading: true,
    error: null,
    generating: false,
  });

  // Load from cache on mount
  useEffect(() => {
    if (!playerAircraft || !enemyAircraft) {
      setState({ data: null, loading: false, error: null, generating: false });
      return;
    }

    const playerId = playerAircraft.identifier;
    const enemyId = enemyAircraft.identifier;
    let cancelled = false;

    async function loadFromCache() {
      try {
        const cached = await getMatchupPlaybook(
          playerId,
          enemyId,
          getCacheVersion()
        );

        if (!cancelled) {
          setState({
            data: cached,
            loading: false,
            error: null,
            generating: false,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: 'Failed to load cached playbook',
            generating: false,
          });
        }
      }
    }

    loadFromCache();

    return () => {
      cancelled = true;
    };
  }, [playerAircraft, enemyAircraft]);

  // Generate new playbook
  const generate = useCallback(async () => {
    if (!playerAircraft || !enemyAircraft) {
      setState(prev => ({
        ...prev,
        error: 'Missing aircraft selection',
      }));
      return;
    }

    if (!isAIEnabled()) {
      setState(prev => ({
        ...prev,
        error: 'AI generation is not enabled. Set VITE_AI_ENABLE_GENERATION=true and ensure Ollama is running.',
      }));
      return;
    }

    const currentPlayer = playerAircraft;
    const currentEnemy = enemyAircraft;
    setState(prev => ({ ...prev, generating: true, error: null }));

    try {
      const playbook = await generateMatchupPlaybook(currentPlayer, currentEnemy);
      await setMatchupPlaybook(playbook);

      setState({
        data: playbook,
        loading: false,
        error: null,
        generating: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate playbook';
      setState(prev => ({
        ...prev,
        generating: false,
        error: errorMessage,
      }));
    }
  }, [playerAircraft, enemyAircraft]);

  return {
    playbook: state.data,
    loading: state.loading,
    error: state.error,
    generating: state.generating,
    generate,
    aiEnabled: isAIEnabled(),
  };
}
