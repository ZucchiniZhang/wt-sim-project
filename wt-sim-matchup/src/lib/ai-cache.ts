/**
 * IndexedDB-based caching layer for AI-generated content
 * Provides persistent storage for tactical guides and matchup playbooks
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { TacticalGuide, MatchupPlaybook } from '../types/curated';

const DB_NAME = 'wt-sim-ai-cache';
const DB_VERSION = 1;
const TACTICAL_GUIDES_STORE = 'tactical-guides';
const MATCHUP_PLAYBOOKS_STORE = 'matchup-playbooks';

let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * Initialize IndexedDB connection
 */
async function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create tactical guides store
        if (!db.objectStoreNames.contains(TACTICAL_GUIDES_STORE)) {
          db.createObjectStore(TACTICAL_GUIDES_STORE);
        }
        // Create matchup playbooks store
        if (!db.objectStoreNames.contains(MATCHUP_PLAYBOOKS_STORE)) {
          db.createObjectStore(MATCHUP_PLAYBOOKS_STORE);
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Cache key generation
 */
function getTacticalGuideCacheKey(aircraftId: string, version: string): string {
  return `${aircraftId}@${version}`;
}

function getMatchupPlaybookCacheKey(
  playerId: string,
  enemyId: string,
  version: string
): string {
  return `${playerId}_vs_${enemyId}@${version}`;
}

/**
 * Tactical Guide Cache Operations
 */
export async function getTacticalGuide(
  aircraftId: string,
  version: string
): Promise<TacticalGuide | null> {
  try {
    const db = await getDB();
    const key = getTacticalGuideCacheKey(aircraftId, version);
    const guide = await db.get(TACTICAL_GUIDES_STORE, key);
    return guide || null;
  } catch (error) {
    console.error('Error fetching tactical guide from cache:', error);
    return null;
  }
}

export async function setTacticalGuide(guide: TacticalGuide): Promise<void> {
  try {
    const db = await getDB();
    const key = getTacticalGuideCacheKey(guide.identifier, guide.generation_version);
    await db.put(TACTICAL_GUIDES_STORE, guide, key);
  } catch (error) {
    console.error('Error saving tactical guide to cache:', error);
    throw error;
  }
}

/**
 * Matchup Playbook Cache Operations
 */
export async function getMatchupPlaybook(
  playerId: string,
  enemyId: string,
  version: string
): Promise<MatchupPlaybook | null> {
  try {
    const db = await getDB();
    const key = getMatchupPlaybookCacheKey(playerId, enemyId, version);
    const playbook = await db.get(MATCHUP_PLAYBOOKS_STORE, key);
    return playbook || null;
  } catch (error) {
    console.error('Error fetching matchup playbook from cache:', error);
    return null;
  }
}

export async function setMatchupPlaybook(playbook: MatchupPlaybook): Promise<void> {
  try {
    const db = await getDB();
    const key = getMatchupPlaybookCacheKey(
      playbook.player_id,
      playbook.enemy_id,
      playbook.generation_version
    );
    await db.put(MATCHUP_PLAYBOOKS_STORE, playbook, key);
  } catch (error) {
    console.error('Error saving matchup playbook to cache:', error);
    throw error;
  }
}

/**
 * Cache invalidation utilities
 */
export async function clearAllTacticalGuides(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(TACTICAL_GUIDES_STORE);
  } catch (error) {
    console.error('Error clearing tactical guides cache:', error);
    throw error;
  }
}

export async function clearAllMatchupPlaybooks(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(MATCHUP_PLAYBOOKS_STORE);
  } catch (error) {
    console.error('Error clearing matchup playbooks cache:', error);
    throw error;
  }
}

export async function clearAllAICache(): Promise<void> {
  await Promise.all([clearAllTacticalGuides(), clearAllMatchupPlaybooks()]);
}

/**
 * Cache statistics
 */
export async function getCacheStats(): Promise<{
  tacticalGuides: number;
  matchupPlaybooks: number;
}> {
  try {
    const db = await getDB();
    const [guides, playbooks] = await Promise.all([
      db.count(TACTICAL_GUIDES_STORE),
      db.count(MATCHUP_PLAYBOOKS_STORE),
    ]);
    return {
      tacticalGuides: guides,
      matchupPlaybooks: playbooks,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { tacticalGuides: 0, matchupPlaybooks: 0 };
  }
}
