/**
 * Core matchup calculation logic for War Thunder Sim Battles
 * Determines which enemies a player will face based on their aircraft and bracket
 */

import type { Aircraft, SimBracket, TeamConfig, MatchupResult, Nation } from '../types/aircraft';

/**
 * Find all BR brackets that the aircraft fits into
 * An aircraft can fit in multiple overlapping brackets
 *
 * @example
 * // P-51D-30 at BR 4.0 fits in:
 * // - EC3 (3.0-4.3)
 * // - EC4 (4.0-5.3)
 */
export function findApplicableBrackets(
  aircraftBR: number,
  allBrackets: SimBracket[]
): SimBracket[] {
  return allBrackets.filter(
    bracket => aircraftBR >= bracket.min_br && aircraftBR <= bracket.max_br
  );
}

/**
 * Determine which team (A or B) the player's nation is on
 *
 * @param nation - Player's aircraft nation
 * @param teamConfig - Team configuration (default or custom preset)
 * @returns 'A' or 'B' based on team assignment
 */
export function determineTeam(nation: Nation, teamConfig: TeamConfig): 'A' | 'B' {
  if (teamConfig.team_a.includes(nation)) {
    return 'A';
  }
  if (teamConfig.team_b.includes(nation)) {
    return 'B';
  }

  // Fallback: default to team A if nation not found in either team
  return 'A';
}

/**
 * Get all enemy nations for the player
 *
 * @param playerTeam - Which team the player is on ('A' or 'B')
 * @param teamConfig - Team configuration
 * @returns Array of enemy nations
 */
export function getEnemyNations(playerTeam: 'A' | 'B', teamConfig: TeamConfig): Nation[] {
  return playerTeam === 'A' ? teamConfig.team_b : teamConfig.team_a;
}

/**
 * Get all ally nations for the player (excluding their own nation)
 *
 * @param playerNation - Player's nation
 * @param playerTeam - Which team the player is on
 * @param teamConfig - Team configuration
 * @returns Array of ally nations (not including player's nation)
 */
export function getAllyNations(
  playerNation: Nation,
  playerTeam: 'A' | 'B',
  teamConfig: TeamConfig
): Nation[] {
  const teamNations = playerTeam === 'A' ? teamConfig.team_a : teamConfig.team_b;
  return teamNations.filter(nation => nation !== playerNation);
}

/**
 * Filter all aircraft to only enemies within the specified bracket
 *
 * @param allAircraft - Complete aircraft database
 * @param enemyNations - List of enemy nations
 * @param bracket - BR bracket to filter by
 * @returns Filtered list of enemy aircraft
 */
export function getEnemyAircraft(
  allAircraft: Aircraft[],
  enemyNations: Nation[],
  bracket: SimBracket
): Aircraft[] {
  return allAircraft.filter(
    aircraft =>
      enemyNations.includes(aircraft.country) &&
      aircraft.simulator_br >= bracket.min_br &&
      aircraft.simulator_br <= bracket.max_br
  );
}

/**
 * Get ally aircraft within the specified bracket
 *
 * @param allAircraft - Complete aircraft database
 * @param allyNations - List of ally nations (excluding player's nation)
 * @param bracket - BR bracket to filter by
 * @returns Filtered list of ally aircraft
 */
export function getAllyAircraft(
  allAircraft: Aircraft[],
  allyNations: Nation[],
  bracket: SimBracket
): Aircraft[] {
  return allAircraft.filter(
    aircraft =>
      allyNations.includes(aircraft.country) &&
      aircraft.simulator_br >= bracket.min_br &&
      aircraft.simulator_br <= bracket.max_br
  );
}

/**
 * Sort aircraft by BR proximity to selected aircraft
 * Closest BR first, then alphabetically by identifier
 *
 * @param aircraft - List of aircraft to sort
 * @param targetBR - BR to sort by proximity to
 * @returns Sorted aircraft array
 */
export function sortByBRProximity(aircraft: Aircraft[], targetBR: number): Aircraft[] {
  return [...aircraft].sort((a, b) => {
    const distA = Math.abs(a.simulator_br - targetBR);
    const distB = Math.abs(b.simulator_br - targetBR);

    // Sort by distance first
    if (distA !== distB) {
      return distA - distB;
    }

    // If same distance, sort alphabetically
    return a.identifier.localeCompare(b.identifier);
  });
}

/**
 * Main matchup calculation function
 * Combines all logic to determine what enemies the player will face
 *
 * @param selectedAircraft - Player's selected aircraft
 * @param allAircraft - Complete aircraft database
 * @param allBrackets - All available BR brackets
 * @param teamConfig - Team configuration (default or preset)
 * @returns Complete matchup result including bracket, teams, and enemy aircraft
 *
 * @example
 * const result = calculateMatchups(p51d, allAircraft, brackets, defaultTeams);
 * console.log(result.bracket.name); // "EC4 - Late War"
 * console.log(result.enemyNations); // ["germany", "japan", "italy"]
 * console.log(result.enemyAircraft.length); // 32 aircraft
 */
export function calculateMatchups(
  selectedAircraft: Aircraft,
  allAircraft: Aircraft[],
  allBrackets: SimBracket[],
  teamConfig: TeamConfig
): MatchupResult {
  // 1. Find applicable brackets for this aircraft
  const applicableBrackets = findApplicableBrackets(
    selectedAircraft.simulator_br,
    allBrackets
  );

  // Use the first (lowest) bracket if multiple match
  // This matches WT's behavior - it'll put you in the lowest bracket you fit in
  const bracket = applicableBrackets[0];

  if (!bracket) {
    const bracketsInfo = allBrackets.length === 0
      ? ' (No brackets loaded - data may still be loading)'
      : ` (Available brackets: ${allBrackets.map(b => `${b.id}: ${b.min_br}-${b.max_br}`).join(', ')})`;

    throw new Error(
      `No bracket found for aircraft with BR ${selectedAircraft.simulator_br}${bracketsInfo}`
    );
  }

  // 2. Determine player's team
  const playerTeam = determineTeam(selectedAircraft.country, teamConfig);

  // 3. Get enemy and ally nations
  const enemyNations = getEnemyNations(playerTeam, teamConfig);
  const allyNations = getAllyNations(
    selectedAircraft.country,
    playerTeam,
    teamConfig
  );

  // 4. Filter aircraft to enemies in this bracket
  const enemyAircraft = getEnemyAircraft(allAircraft, enemyNations, bracket);

  // 5. Sort enemies by BR proximity (closest threats first)
  const sortedEnemies = sortByBRProximity(enemyAircraft, selectedAircraft.simulator_br);

  // 6. Get ally aircraft (optional, for future features)
  const allyAircraft = getAllyAircraft(allAircraft, allyNations, bracket);

  return {
    selectedAircraft,
    bracket,
    playerTeam,
    enemyNations,
    enemyAircraft: sortedEnemies,
    allyNations,
    allyAircraft,
  };
}

/**
 * Group aircraft by nation for display purposes
 *
 * @param aircraft - List of aircraft to group
 * @returns Map of nation to aircraft array
 */
export function groupByNation(aircraft: Aircraft[]): Map<Nation, Aircraft[]> {
  const groups = new Map<Nation, Aircraft[]>();

  for (const plane of aircraft) {
    const nation = plane.country;
    if (!groups.has(nation)) {
      groups.set(nation, []);
    }
    groups.get(nation)!.push(plane);
  }

  return groups;
}

/**
 * Get statistics about a matchup result
 * Useful for displaying summary information
 */
export function getMatchupStats(result: MatchupResult) {
  const enemyByNation = groupByNation(result.enemyAircraft);

  return {
    totalEnemies: result.enemyAircraft.length,
    enemyNationCount: result.enemyNations.length,
    enemiesByNation: Object.fromEntries(
      Array.from(enemyByNation.entries()).map(([nation, aircraft]) => [
        nation,
        aircraft.length,
      ])
    ),
    brRange: {
      min: result.bracket.min_br,
      max: result.bracket.max_br,
    },
  };
}
