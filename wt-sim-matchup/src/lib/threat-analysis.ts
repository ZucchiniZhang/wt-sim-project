/**
 * Threat analysis engine for War Thunder Sim Battle matchups
 * Calculates threat level of each enemy aircraft relative to the player's aircraft
 */

import type { Aircraft, ThreatLevel, ThreatAssessment } from '../types/aircraft';
import type { CuratedAircraftData } from '../types/curated';

/**
 * Detailed tactical briefing for a specific matchup
 */
export interface DetailedBriefing {
  engagementApproach: string;
  avoidActions: string[];
  energyGuidance: string;
  altitudeAdvice: string;
  specificTips: string[];
}

// Scoring weights (total = 100)
const WEIGHT_BR = 30;
const WEIGHT_SPEED = 25;
const WEIGHT_TURN = 20;
const WEIGHT_ARMAMENT = 15;
const WEIGHT_REPAIR = 10;

// Threat level thresholds (out of 100)
const CRITICAL_THRESHOLD = 70;
const HIGH_THRESHOLD = 50;
const MODERATE_THRESHOLD = 30;

/**
 * Parse caliber string to a numeric mm value for comparison
 */
function parseCaliberMm(caliber: string): number {
  const num = parseFloat(caliber);
  if (isNaN(num)) return 0;
  // If looks like inches (< 2), convert to mm
  if (num > 0 && num < 2) return num * 25.4;
  return num;
}

/**
 * Calculate a normalized armament score based on weapons summary
 * Higher = more lethal
 */
function getArmamentScore(aircraft: Aircraft): number {
  const weapons = aircraft.weapons_summary;
  if (!weapons || weapons.length === 0) return 0;

  let score = 0;
  for (const w of weapons) {
    const caliberMm = parseCaliberMm(w.caliber);
    // Score: caliber * count, with diminishing returns for very large calibers
    const caliberFactor = caliberMm <= 15 ? caliberMm * 0.5
      : caliberMm <= 30 ? caliberMm * 1.0
      : caliberMm * 1.5;
    score += caliberFactor * w.count;
  }
  return score;
}

/**
 * Assess the threat level of an enemy aircraft relative to the player's aircraft
 */
export function assessThreat(
  player: Aircraft,
  enemy: Aircraft
): ThreatAssessment {
  let totalScore = 0;
  const advantages: string[] = [];
  const disadvantages: string[] = [];

  // 1. BR advantage (0-30 points)
  const brDelta = enemy.simulator_br - player.simulator_br;
  if (brDelta > 0) {
    // Enemy has higher BR = more dangerous
    const brScore = Math.min(brDelta / 1.0, 1) * WEIGHT_BR;
    totalScore += brScore;
    advantages.push(`+${brDelta.toFixed(1)} BR`);
  } else if (brDelta < 0) {
    disadvantages.push(`${brDelta.toFixed(1)} BR`);
  }

  // 2. Speed advantage (0-25 points)
  if (player.max_speed != null && enemy.max_speed != null) {
    const speedDelta = enemy.max_speed - player.max_speed;
    if (speedDelta > 0) {
      const speedScore = Math.min(speedDelta / 100, 1) * WEIGHT_SPEED;
      totalScore += speedScore;
      advantages.push(`+${Math.round(speedDelta)} km/h`);
    } else if (speedDelta < -10) {
      disadvantages.push(`${Math.round(speedDelta)} km/h`);
    }
  }

  // 3. Turn advantage (0-20 points) - lower turn_time = better
  if (player.turn_time != null && enemy.turn_time != null) {
    const turnDelta = player.turn_time - enemy.turn_time; // positive = enemy turns tighter
    if (turnDelta > 0) {
      const turnScore = Math.min(turnDelta / 8, 1) * WEIGHT_TURN;
      totalScore += turnScore;
      advantages.push(`-${turnDelta.toFixed(1)}s turn`);
    } else if (turnDelta < -1) {
      disadvantages.push(`+${Math.abs(turnDelta).toFixed(1)}s turn`);
    }
  }

  // 4. Armament lethality (0-15 points)
  const playerArmament = getArmamentScore(player);
  const enemyArmament = getArmamentScore(enemy);
  if (playerArmament > 0 && enemyArmament > 0) {
    const armDelta = enemyArmament - playerArmament;
    if (armDelta > 0) {
      const armScore = Math.min(armDelta / playerArmament, 1) * WEIGHT_ARMAMENT;
      totalScore += armScore;
      advantages.push('Heavier armament');
    } else if (armDelta < 0) {
      disadvantages.push('Lighter armament');
    }
  }

  // 5. Repair cost proxy (0-10 points) - higher repair = likely better aircraft
  if (enemy.repair_cost_simulator != null) {
    // Normalize: top-tier sim repair costs can be 20000+
    const repairScore = Math.min(enemy.repair_cost_simulator / 15000, 1) * WEIGHT_REPAIR;
    totalScore += repairScore;
  }

  // Determine threat level
  let threatLevel: ThreatLevel;
  if (totalScore >= CRITICAL_THRESHOLD) {
    threatLevel = 'critical';
  } else if (totalScore >= HIGH_THRESHOLD) {
    threatLevel = 'high';
  } else if (totalScore >= MODERATE_THRESHOLD) {
    threatLevel = 'moderate';
  } else {
    threatLevel = 'low';
  }

  // Generate tactical advice
  const tacticalAdvice = generateTacticalAdvice(player, enemy, advantages, disadvantages);

  return {
    threatLevel,
    score: Math.round(totalScore),
    advantages,
    disadvantages,
    tacticalAdvice,
  };
}

function generateTacticalAdvice(
  player: Aircraft,
  enemy: Aircraft,
  advantages: string[],
  disadvantages: string[]
): string {
  const enemyFaster = player.max_speed != null && enemy.max_speed != null
    && enemy.max_speed > player.max_speed + 20;
  const enemySlower = player.max_speed != null && enemy.max_speed != null
    && player.max_speed > enemy.max_speed + 20;
  const enemyBetterTurn = player.turn_time != null && enemy.turn_time != null
    && enemy.turn_time < player.turn_time - 2;
  const enemyWorseTurn = player.turn_time != null && enemy.turn_time != null
    && player.turn_time < enemy.turn_time - 2;
  const isBomber = enemy.vehicle_type === 'bomber';
  const isAttacker = enemy.vehicle_type === 'assault';
  const higherBR = enemy.simulator_br > player.simulator_br + 0.3;

  if (isBomber) {
    return 'Fragile but well-armed. Attack from blind spots. Avoid tail gunner arcs.';
  }

  if (isAttacker) {
    return 'Ground attacker. Usually slow but well-armed. Engage from above with energy advantage.';
  }

  if (enemyFaster && enemyWorseTurn) {
    return 'BnZ fighter. Avoid sustained turns against it. Force energy traps and head-ons.';
  }

  if (enemySlower && enemyBetterTurn) {
    return 'Turn fighter. Maintain speed advantage. Boom and zoom only, never commit to a turnfight.';
  }

  if (enemyFaster && enemyBetterTurn) {
    return 'Superior in speed and turn. Engage cautiously with altitude advantage or avoid.';
  }

  if (enemySlower && enemyWorseTurn) {
    return 'Inferior in speed and agility. Engage confidently but watch for defensive weapons.';
  }

  if (higherBR) {
    return 'Higher BR variant. Fight cautiously, exploit any singular weakness.';
  }

  if (advantages.length === 0 && disadvantages.length > 0) {
    return 'You hold the advantage. Press the attack but stay aware of team support.';
  }

  return 'Comparable aircraft. Pilot skill and situational awareness will decide the outcome.';
}

/**
 * Assess threats for all enemy aircraft at once
 */
export function assessAllThreats(
  player: Aircraft,
  enemies: Aircraft[]
): Map<string, ThreatAssessment> {
  const results = new Map<string, ThreatAssessment>();
  for (const enemy of enemies) {
    results.set(enemy.identifier, assessThreat(player, enemy));
  }
  return results;
}

/**
 * Get the top N most threatening enemies sorted by score
 */
export function getTopThreats(
  player: Aircraft,
  enemies: Aircraft[],
  count = 5
): { aircraft: Aircraft; assessment: ThreatAssessment }[] {
  const assessed = enemies.map(enemy => ({
    aircraft: enemy,
    assessment: assessThreat(player, enemy),
  }));

  assessed.sort((a, b) => b.assessment.score - a.assessment.score);

  return assessed.slice(0, count);
}

/**
 * Get threat level color class for Tailwind styling
 */
export function getThreatColor(level: ThreatLevel): string {
  switch (level) {
    case 'critical': return 'text-red-400';
    case 'high': return 'text-orange-400';
    case 'moderate': return 'text-yellow-400';
    case 'low': return 'text-green-400';
  }
}

export function getThreatBgColor(level: ThreatLevel): string {
  switch (level) {
    case 'critical': return 'bg-red-500/20 border-red-500/40';
    case 'high': return 'bg-orange-500/20 border-orange-500/40';
    case 'moderate': return 'bg-yellow-500/20 border-yellow-500/40';
    case 'low': return 'bg-green-500/20 border-green-500/40';
  }
}

export function getThreatLabel(level: ThreatLevel): string {
  return level.toUpperCase();
}

/**
 * Infer a fighting style from raw aircraft stats when no curated data is available.
 * Uses speed and turn time heuristics.
 */
function inferFightingStyle(aircraft: Aircraft): string {
  const speed = aircraft.max_speed ?? 0;
  const turnTime = aircraft.turn_time ?? 0;

  if (aircraft.vehicle_type === 'bomber') return 'bomber';
  if (aircraft.vehicle_type === 'assault') return 'ground_attacker';

  // Fast with poor turn => BnZ
  if (speed > 550 && turnTime > 22) return 'boom_and_zoom';
  // Slow with good turn => turn fighter
  if (speed < 500 && turnTime > 0 && turnTime < 20) return 'turn_fighter';
  // Fast with decent turn => energy fighter
  if (speed > 500 && turnTime > 0 && turnTime < 22) return 'energy_fighter';
  // Moderate stats => multirole
  return 'multirole';
}

/**
 * Generate a detailed tactical briefing for a specific player-vs-enemy matchup.
 * Uses curated data when available, otherwise infers from raw aircraft stats.
 */
export function generateDetailedBriefing(
  player: Aircraft,
  enemy: Aircraft,
  playerCurated?: CuratedAircraftData,
  enemyCurated?: CuratedAircraftData
): DetailedBriefing {
  const playerStyle = playerCurated?.fighting_style ?? inferFightingStyle(player);
  const enemyStyle = enemyCurated?.fighting_style ?? inferFightingStyle(enemy);

  // --- engagementApproach ---
  const engagementApproach = buildEngagementApproach(playerStyle, enemyStyle);

  // --- avoidActions ---
  const avoidActions = buildAvoidActions(player, enemy, playerStyle, enemyStyle);

  // --- energyGuidance ---
  const energyGuidance = buildEnergyGuidance(player, enemy, playerCurated, enemyCurated);

  // --- altitudeAdvice ---
  const altitudeAdvice = buildAltitudeAdvice(player, playerCurated, enemyCurated);

  // --- specificTips ---
  const specificTips = buildSpecificTips(player, enemy, playerCurated, enemyCurated, enemyStyle);

  return {
    engagementApproach,
    avoidActions,
    energyGuidance,
    altitudeAdvice,
    specificTips,
  };
}

function buildEngagementApproach(playerStyle: string, enemyStyle: string): string {
  // Player is BnZ-type
  if (playerStyle === 'boom_and_zoom' || playerStyle === 'interceptor') {
    if (enemyStyle === 'turn_fighter') {
      return 'Maintain altitude advantage. Dive on target from above, fire in short bursts, extend and climb. Do not engage in sustained turns.';
    }
    if (enemyStyle === 'energy_fighter') {
      return 'Secure altitude advantage before engaging. Make fast passes and avoid getting drawn into vertical scissors.';
    }
    return 'Use your speed. Dive, strike, and extend. Avoid slow-speed engagements.';
  }

  // Player is turn fighter
  if (playerStyle === 'turn_fighter') {
    if (enemyStyle === 'boom_and_zoom' || enemyStyle === 'interceptor') {
      return 'Force the engagement at low altitude. If enemy dives, turn hard and force an overshoot. Maintain speed above stall.';
    }
    if (enemyStyle === 'energy_fighter') {
      return 'Drag the fight low and slow. Force horizontal turning engagements where your turn rate dominates.';
    }
    return 'Leverage your turn rate. Engage in sustained maneuvers and bleed the enemy of energy.';
  }

  // Player is energy fighter
  if (playerStyle === 'energy_fighter') {
    if (enemyStyle === 'turn_fighter') {
      return 'Control the engagement through vertical maneuvers. Maintain energy advantage. Use climbing spirals to drain enemy energy.';
    }
    if (enemyStyle === 'boom_and_zoom') {
      return 'Match energy tactics. Use vertical loops and high yo-yos. The pilot who manages energy better will win.';
    }
    return 'Control the engagement through vertical maneuvers. Maintain energy advantage. Use climbing spirals to drain enemy energy.';
  }

  // Player is heavy fighter
  if (playerStyle === 'heavy_fighter') {
    if (enemyStyle === 'turn_fighter') {
      return 'Do not turn fight. Use your firepower in head-ons and high-speed slashing attacks.';
    }
    return 'Use your heavy armament to make decisive passes. Avoid prolonged dogfights.';
  }

  // Player is ground attacker facing a fighter
  if (playerStyle === 'ground_attacker') {
    return 'You are at a disadvantage in air combat. Stay low, use defensive flying, and rely on teammates for cover.';
  }

  // Player is bomber
  if (playerStyle === 'bomber') {
    return 'Avoid direct engagement. Use defensive gunners and altitude to survive. Call for fighter escort.';
  }

  // Fallback
  return 'Engage with caution. Identify the enemy\'s weakness and exploit it.';
}

function buildAvoidActions(
  player: Aircraft,
  enemy: Aircraft,
  playerStyle: string,
  enemyStyle: string
): string[] {
  const actions: string[] = [];

  const playerSpeed = player.max_speed ?? 0;
  const enemySpeed = enemy.max_speed ?? 0;
  const playerTurn = player.turn_time ?? 0;
  const enemyTurn = enemy.turn_time ?? 0;
  const playerArmament = getArmamentScore(player);
  const enemyArmament = getArmamentScore(enemy);

  // If enemy is faster
  if (enemySpeed > playerSpeed + 20) {
    actions.push('Do not chase in a straight line');
  }

  // If enemy turns better (lower turn time is better)
  if (enemyTurn > 0 && playerTurn > 0 && enemyTurn < playerTurn - 2) {
    actions.push('Avoid sustained horizontal turns');
  }

  // If enemy has heavier armament
  if (enemyArmament > playerArmament * 1.3 && enemyArmament > 0) {
    actions.push('Avoid head-on engagements');
  }

  // If enemy has higher BR
  if (enemy.simulator_br > player.simulator_br + 0.3) {
    actions.push('Do not engage without energy advantage');
  }

  // Style-specific advice
  if (playerStyle === 'boom_and_zoom' && enemyStyle === 'turn_fighter') {
    actions.push('Never follow a turn fighter into a horizontal circle');
  }

  if (playerStyle === 'turn_fighter' && (enemyStyle === 'boom_and_zoom' || enemyStyle === 'interceptor')) {
    actions.push('Do not try to follow a diving enemy');
  }

  // If enemy is a bomber with defensive guns
  if (enemy.vehicle_type === 'bomber') {
    actions.push('Avoid sitting on the tail — attack from deflection angles');
  }

  // Ensure we return 2-4 items
  if (actions.length === 0) {
    actions.push('Do not engage recklessly without assessing the situation');
    actions.push('Avoid losing energy in unnecessary maneuvers');
  }
  if (actions.length === 1) {
    actions.push('Avoid losing energy in unnecessary maneuvers');
  }

  return actions.slice(0, 4);
}

function buildEnergyGuidance(
  player: Aircraft,
  enemy: Aircraft,
  playerCurated?: CuratedAircraftData,
  enemyCurated?: CuratedAircraftData
): string {
  const playerRetention = playerCurated?.energy_retention;
  const enemyRetention = enemyCurated?.energy_retention;

  // Use curated energy retention data if available
  if (playerRetention && enemyRetention) {
    const retentionRank: Record<string, number> = { excellent: 4, good: 3, average: 2, poor: 1 };
    const playerRank = retentionRank[playerRetention] ?? 2;
    const enemyRank = retentionRank[enemyRetention] ?? 2;

    if (playerRank > enemyRank) {
      return 'You have superior energy retention; use vertical maneuvers to drain the enemy.';
    }
    if (playerRank < enemyRank) {
      return 'Enemy has better energy retention; avoid prolonged engagements and fight on your terms.';
    }
    return 'Energy retention is comparable; the pilot who manages speed and altitude better will have the edge.';
  }

  // Fallback: compare raw stats
  const playerSpeed = player.max_speed ?? 0;
  const enemySpeed = enemy.max_speed ?? 0;
  const playerClimb = player.climb_rate ?? 0;
  const enemyClimb = enemy.climb_rate ?? 0;

  if (playerSpeed > enemySpeed + 30 && playerClimb > enemyClimb) {
    return 'You have superior energy retention; use vertical maneuvers to drain the enemy.';
  }
  if (enemySpeed > playerSpeed + 30 && enemyClimb > playerClimb) {
    return 'Enemy has better energy characteristics; avoid prolonged engagements and disengage early if needed.';
  }
  if (playerClimb > enemyClimb + 3) {
    return 'Your climb rate gives you an energy advantage; use altitude to control engagements.';
  }
  if (enemyClimb > playerClimb + 3) {
    return 'Enemy climbs better; avoid letting them gain altitude advantage over you.';
  }

  return 'Energy characteristics are similar; maintain awareness of your speed state throughout the fight.';
}

function buildAltitudeAdvice(
  player: Aircraft,
  playerCurated?: CuratedAircraftData,
  enemyCurated?: CuratedAircraftData
): string {
  // Prefer player's curated optimal altitude range
  if (playerCurated?.optimal_altitude_range) {
    const [low, high] = playerCurated.optimal_altitude_range;
    return `Fight between ${low.toLocaleString()}-${high.toLocaleString()}m for best performance.`;
  }

  // Use enemy curated data to avoid their optimal range
  if (enemyCurated?.optimal_altitude_range) {
    const [enemyLow, enemyHigh] = enemyCurated.optimal_altitude_range;
    if (enemyHigh > 5000) {
      return `Enemy performs best at ${enemyLow.toLocaleString()}-${enemyHigh.toLocaleString()}m. Consider fighting below ${enemyLow.toLocaleString()}m to negate their advantage.`;
    }
    return `Enemy performs best at ${enemyLow.toLocaleString()}-${enemyHigh.toLocaleString()}m. Consider fighting above ${enemyHigh.toLocaleString()}m if your aircraft allows.`;
  }

  // Fallback using raw data
  const optAlt = player.optimal_altitude ?? player.aerodynamics?.optimal_altitude;
  if (optAlt != null && optAlt > 0) {
    const low = Math.max(0, optAlt - 1500);
    const high = optAlt + 1500;
    return `Stay between ${low.toLocaleString()}-${high.toLocaleString()}m where this aircraft performs best.`;
  }

  const maxAlt = player.max_altitude;
  if (maxAlt != null && maxAlt > 0) {
    const ceiling = Math.round(maxAlt * 0.7);
    return `Stay below ${ceiling.toLocaleString()}m where this aircraft performs best.`;
  }

  return 'Maintain moderate altitude to preserve options for both attack and escape.';
}

function buildSpecificTips(
  player: Aircraft,
  enemy: Aircraft,
  playerCurated?: CuratedAircraftData,
  enemyCurated?: CuratedAircraftData,
  enemyStyle?: string
): string[] {
  const tips: string[] = [];

  // 1. Check for specific vs_tips for this enemy
  if (playerCurated?.vs_tips) {
    const vsTip = playerCurated.vs_tips[enemy.identifier];
    if (vsTip) {
      tips.push(vsTip);
    }
  }

  // 2. Matchup-dynamic tips
  const playerSpeed = player.max_speed ?? 0;
  const enemySpeed = enemy.max_speed ?? 0;
  const playerTurn = player.turn_time ?? 0;
  const enemyTurn = enemy.turn_time ?? 0;

  if (enemySpeed > playerSpeed + 40) {
    tips.push(`The ${enemy.localized_name ?? enemy.identifier} is significantly faster. Bait them into maneuvers to bleed their speed.`);
  } else if (playerSpeed > enemySpeed + 40) {
    tips.push(`You are significantly faster. Use hit-and-run tactics and disengage at will.`);
  }

  if (enemyTurn > 0 && playerTurn > 0 && playerTurn < enemyTurn - 3) {
    tips.push(`You out-turn this aircraft by a wide margin. If they commit to a dogfight, you have the advantage.`);
  } else if (enemyTurn > 0 && playerTurn > 0 && enemyTurn < playerTurn - 3) {
    tips.push(`This aircraft out-turns you significantly. Never enter a sustained turning engagement.`);
  }

  if (enemy.vehicle_type === 'bomber') {
    tips.push('Attack from below or the sides to minimize exposure to defensive gunners.');
  }

  if (enemyStyle === 'interceptor') {
    tips.push('Interceptors often have great climb and speed but poor sustained turn. Force a dogfight if possible.');
  }

  // 3. Include relevant tips from curated player data
  if (playerCurated?.tips) {
    for (const tip of playerCurated.tips) {
      // Include tips that reference combat or the enemy style/type
      const tipLower = tip.toLowerCase();
      const relevantKeywords = ['combat', 'engage', 'fight', 'energy', 'altitude', 'speed', 'turn', 'dive', 'climb'];
      const isRelevant = relevantKeywords.some(kw => tipLower.includes(kw));
      if (isRelevant && tips.length < 4) {
        tips.push(tip);
      }
    }
  }

  // 4. Include enemy weakness info from curated data
  if (enemyCurated?.weaknesses && enemyCurated.weaknesses.length > 0) {
    const weakness = enemyCurated.weaknesses[0];
    if (tips.length < 4) {
      tips.push(`Known enemy weakness: ${weakness}`);
    }
  }

  // Ensure we have at least 2 tips
  if (tips.length === 0) {
    tips.push('Observe the enemy\'s behavior before committing to an attack.');
    tips.push('Maintain situational awareness — check for other enemies before engaging.');
  } else if (tips.length === 1) {
    tips.push('Maintain situational awareness — check for other enemies before engaging.');
  }

  return tips.slice(0, 4);
}
