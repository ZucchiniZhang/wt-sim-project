/**
 * Lightweight hash-based router
 * Supports: #/ (home), #/aircraft/:id, #/matchup, #/briefing/:myId/vs/:enemyId, #/compare
 */

import { useSyncExternalStore, useCallback } from 'react';

// Route definitions
export type Route =
  | { page: 'home' }
  | { page: 'aircraft'; id: string }
  | { page: 'matchup' }
  | { page: 'briefing'; myId: string; enemyId: string }
  | { page: 'compare' }
  | { page: 'mission-planner' };

function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/';
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { page: 'home' };
  }

  switch (segments[0]) {
    case 'aircraft':
      if (segments[1]) {
        return { page: 'aircraft', id: decodeURIComponent(segments[1]) };
      }
      return { page: 'home' };

    case 'matchup':
      return { page: 'matchup' };

    case 'briefing':
      if (segments[1] && segments[2] === 'vs' && segments[3]) {
        return {
          page: 'briefing',
          myId: decodeURIComponent(segments[1]),
          enemyId: decodeURIComponent(segments[3]),
        };
      }
      return { page: 'home' };

    case 'compare':
      return { page: 'compare' };

    case 'mission-planner':
      return { page: 'mission-planner' };

    default:
      return { page: 'home' };
  }
}

// Store for the current route
let currentRoute: Route = parseHash(window.location.hash);
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function handleHashChange() {
  currentRoute = parseHash(window.location.hash);
  notifyListeners();
}

// Listen to hash changes
window.addEventListener('hashchange', handleHashChange);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Route {
  return currentRoute;
}

/** Navigate to a new route */
export function navigate(path: string) {
  window.location.hash = path;
}

/** Build a hash path for an aircraft detail page */
export function aircraftPath(id: string): string {
  return `#/aircraft/${encodeURIComponent(id)}`;
}

/** Build a hash path for a briefing page */
export function briefingPath(myId: string, enemyId: string): string {
  return `#/briefing/${encodeURIComponent(myId)}/vs/${encodeURIComponent(enemyId)}`;
}

/** Build a hash path for the mission planner page */
export function missionPlannerPath(): string {
  return '#/mission-planner';
}

/** Hook to get current route and navigation function */
export function useRoute() {
  const route = useSyncExternalStore(subscribe, getSnapshot);

  const nav = useCallback((path: string) => {
    navigate(path);
  }, []);

  return { route, navigate: nav };
}
