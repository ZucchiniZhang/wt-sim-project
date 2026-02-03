/**
 * Generate curated aircraft data template
 * Auto-generates reasonable defaults for all fighters based on their stats
 * Run with: npx tsx scripts/generate-curated-template.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Aircraft {
  identifier: string;
  country: string;
  vehicle_type: string;
  max_speed?: number;
  max_speed_at_altitude?: number;
  climb_rate?: number;
  turn_time?: number;
  max_altitude?: number;
  mass?: number;
  simulator_br: number;
}

type FightingStyle =
  | 'boom_and_zoom'
  | 'energy_fighter'
  | 'turn_fighter'
  | 'interceptor'
  | 'multirole'
  | 'ground_attacker'
  | 'heavy_fighter'
  | 'bomber';

type EnergyRetention = 'excellent' | 'good' | 'average' | 'poor';

interface CuratedData {
  identifier: string;
  optimal_climb_ias: number;
  optimal_altitude_range: [number, number];
  energy_retention: EnergyRetention;
  fighting_style: FightingStyle;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  vs_tips: Record<string, string>;
  climb_profile: { altitude: number; ias: number; time_to_alt?: number }[];
  speed_at_altitude?: { altitude: number; speed: number }[];
  role_description?: string;
}

// Load aircraft data
const aircraftPath = path.resolve(__dirname, '../src/data/aircraft.json');
const allAircraft: Aircraft[] = JSON.parse(fs.readFileSync(aircraftPath, 'utf-8'));

// Filter to fighters and assault aircraft
const fighters = allAircraft.filter(
  (a) => a.vehicle_type === 'fighter' || a.vehicle_type === 'assault'
);

// Compute bracket stats for relative comparison
function getBracketAircraft(br: number): Aircraft[] {
  return fighters.filter(
    (a) => Math.abs(a.simulator_br - br) <= 1.0
  );
}

function getPercentile(values: number[], value: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = sorted.findIndex((v) => v >= value);
  return idx === -1 ? 100 : (idx / sorted.length) * 100;
}

function determineFightingStyle(a: Aircraft, bracket: Aircraft[]): FightingStyle {
  if (a.vehicle_type === 'assault') return 'ground_attacker';

  const speeds = bracket.map((b) => b.max_speed || 0).filter(Boolean);
  const turns = bracket.map((b) => b.turn_time || 999).filter(Boolean);
  const climbs = bracket.map((b) => b.climb_rate || 0).filter(Boolean);

  const speedPct = speeds.length > 0 ? getPercentile(speeds, a.max_speed || 0) : 50;
  const climbPct = climbs.length > 0 ? getPercentile(climbs, a.climb_rate || 0) : 50;
  // Lower turn time = better, so invert
  const turnPct = turns.length > 0 ? 100 - getPercentile(turns, a.turn_time || 999) : 50;

  const mass = a.mass || 3000;

  // Heavy fighters
  if (mass > 7000) return 'heavy_fighter';

  // High speed + good climb = BnZ
  if (speedPct > 70 && climbPct > 60 && turnPct < 40) return 'boom_and_zoom';

  // Good turn + average speed = turn fighter
  if (turnPct > 65 && speedPct < 60) return 'turn_fighter';

  // Very high climb + speed = interceptor
  if (climbPct > 80 && speedPct > 65) return 'interceptor';

  // Balanced = energy fighter
  if (speedPct > 50 && climbPct > 50) return 'energy_fighter';

  // Default
  return 'multirole';
}

function determineEnergyRetention(a: Aircraft, bracket: Aircraft[]): EnergyRetention {
  const speeds = bracket.map((b) => b.max_speed || 0).filter(Boolean);
  const climbs = bracket.map((b) => b.climb_rate || 0).filter(Boolean);

  const speedPct = speeds.length > 0 ? getPercentile(speeds, a.max_speed || 0) : 50;
  const climbPct = climbs.length > 0 ? getPercentile(climbs, a.climb_rate || 0) : 50;

  const combined = (speedPct + climbPct) / 2;

  if (combined > 75) return 'excellent';
  if (combined > 55) return 'good';
  if (combined > 35) return 'average';
  return 'poor';
}

function generateStrengths(a: Aircraft, bracket: Aircraft[]): string[] {
  const strengths: string[] = [];
  const speeds = bracket.map((b) => b.max_speed || 0).filter(Boolean);
  const turns = bracket.map((b) => b.turn_time || 999).filter(Boolean);
  const climbs = bracket.map((b) => b.climb_rate || 0).filter(Boolean);

  const speedPct = speeds.length > 0 ? getPercentile(speeds, a.max_speed || 0) : 50;
  const climbPct = climbs.length > 0 ? getPercentile(climbs, a.climb_rate || 0) : 50;
  const turnPct = turns.length > 0 ? 100 - getPercentile(turns, a.turn_time || 999) : 50;

  if (speedPct > 70) strengths.push('High top speed for its BR');
  if (climbPct > 70) strengths.push('Strong climb rate');
  if (turnPct > 70) strengths.push('Excellent turn performance');
  if (speedPct > 60 && climbPct > 60) strengths.push('Good energy retention');
  if (a.max_altitude && a.max_altitude > 10000) strengths.push('Good high-altitude performance');

  if (strengths.length === 0) strengths.push('Well-rounded performance');

  return strengths.slice(0, 4);
}

function generateWeaknesses(a: Aircraft, bracket: Aircraft[]): string[] {
  const weaknesses: string[] = [];
  const speeds = bracket.map((b) => b.max_speed || 0).filter(Boolean);
  const turns = bracket.map((b) => b.turn_time || 999).filter(Boolean);
  const climbs = bracket.map((b) => b.climb_rate || 0).filter(Boolean);

  const speedPct = speeds.length > 0 ? getPercentile(speeds, a.max_speed || 0) : 50;
  const climbPct = climbs.length > 0 ? getPercentile(climbs, a.climb_rate || 0) : 50;
  const turnPct = turns.length > 0 ? 100 - getPercentile(turns, a.turn_time || 999) : 50;

  if (speedPct < 30) weaknesses.push('Below-average top speed');
  if (climbPct < 30) weaknesses.push('Poor climb rate');
  if (turnPct < 30) weaknesses.push('Wide turn radius');
  if (a.mass && a.mass > 6000) weaknesses.push('Heavy airframe limits agility');

  if (weaknesses.length === 0) weaknesses.push('No major weaknesses at this BR');

  return weaknesses.slice(0, 4);
}

function generateTips(style: FightingStyle): string[] {
  const tips: Record<FightingStyle, string[]> = {
    boom_and_zoom: [
      'Gain altitude before engaging',
      'Use speed to dictate engagement terms',
      'Avoid prolonged turnfights',
      'Extend after each pass to regain energy',
    ],
    energy_fighter: [
      'Maintain energy advantage through altitude and speed',
      'Use vertical maneuvers to force overshoots',
      'Avoid sustained horizontal turns against turn fighters',
      'Rope-a-dope tactics work well',
    ],
    turn_fighter: [
      'Force enemies into turnfights',
      'Use combat flaps to tighten turns',
      'Be aware of energy state — don\'t bleed all speed',
      'Bait energy fighters into low-speed engagements',
    ],
    interceptor: [
      'Climb to altitude quickly using optimal IAS',
      'Use speed advantage to pick engagements',
      'Avoid low-altitude fights where possible',
      'Prioritize high-value targets (bombers, climbing enemies)',
    ],
    multirole: [
      'Adapt fighting style to the situation',
      'Can handle most opponents but excels against none',
      'Use team tactics for best results',
      'Identify enemy weaknesses and exploit them',
    ],
    ground_attacker: [
      'Strike ground targets then gain altitude',
      'Avoid dogfights when possible',
      'Use speed to escape after attack runs',
      'Stay aware of enemy fighters above you',
    ],
    heavy_fighter: [
      'Use boom and zoom tactics — avoid turnfights',
      'Heavy armament is your main advantage',
      'Side-climb to gain altitude away from the main furball',
      'Head-on passes can be effective with heavy guns',
    ],
    bomber: [
      'Climb to altitude before approaching targets',
      'Use defensive gunners against pursuing fighters',
      'Fly in formation with teammates if possible',
      'Avoid fighters; focus on completing objectives',
    ],
  };

  return tips[style] || tips.multirole;
}

function generateClimbProfile(a: Aircraft): { altitude: number; ias: number; time_to_alt?: number }[] {
  const climbRate = a.climb_rate || 10;
  const maxAlt = a.max_altitude || 8000;
  const maxSpeed = a.max_speed || 400;
  const optimalIAS = Math.round(maxSpeed * 0.65);

  const points: { altitude: number; ias: number; time_to_alt?: number }[] = [];
  const altitudes = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];

  for (const alt of altitudes) {
    if (alt > maxAlt) break;

    // Climb rate degrades with altitude (roughly)
    const altFactor = 1 - (alt / maxAlt) * 0.5;
    const effectiveClimb = climbRate * altFactor;
    const ias = Math.round(optimalIAS * (1 - (alt / maxAlt) * 0.2));
    const time = alt === 0 ? 0 : Math.round(alt / effectiveClimb);

    points.push({ altitude: alt, ias, time_to_alt: time });
  }

  return points;
}

function generateSpeedAtAltitude(a: Aircraft): { altitude: number; speed: number }[] | undefined {
  if (!a.max_speed) return undefined;

  const seaLevelSpeed = a.max_speed;
  const altSpeed = a.max_speed_at_altitude || seaLevelSpeed;
  const maxAlt = a.max_altitude || 8000;

  const points: { altitude: number; speed: number }[] = [];
  const altitudes = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];

  for (const alt of altitudes) {
    if (alt > maxAlt) break;

    const factor = alt / 5000;
    const speed = Math.round(seaLevelSpeed + (altSpeed - seaLevelSpeed) * Math.min(factor, 1));
    points.push({ altitude: alt, speed: Math.max(speed, Math.round(seaLevelSpeed * 0.6)) });
  }

  return points;
}

function getRoleDescription(style: FightingStyle): string {
  const roles: Record<FightingStyle, string> = {
    boom_and_zoom: 'Boom & Zoom fighter — uses speed and altitude advantage to strike and disengage',
    energy_fighter: 'Energy fighter — maintains energy superiority through speed and vertical maneuvers',
    turn_fighter: 'Turn fighter — excels in close-range dogfighting with tight turn radius',
    interceptor: 'Interceptor — fast climber designed to engage targets at altitude',
    multirole: 'Multirole fighter — versatile aircraft capable of adapting to various combat situations',
    ground_attacker: 'Ground attacker — designed for close air support and ground strike missions',
    heavy_fighter: 'Heavy fighter — powerful armament with reduced agility',
    bomber: 'Bomber — strategic aircraft for high-altitude bombing runs',
  };
  return roles[style];
}

// Generate curated data for all fighters
const curatedData: CuratedData[] = [];

for (const aircraft of fighters) {
  const bracket = getBracketAircraft(aircraft.simulator_br);
  const style = determineFightingStyle(aircraft, bracket);
  const maxSpeed = aircraft.max_speed || 400;

  const curated: CuratedData = {
    identifier: aircraft.identifier,
    optimal_climb_ias: Math.round(maxSpeed * 0.65),
    optimal_altitude_range: [
      Math.round((aircraft.max_altitude || 6000) * 0.4),
      Math.round((aircraft.max_altitude || 6000) * 0.7),
    ],
    energy_retention: determineEnergyRetention(aircraft, bracket),
    fighting_style: style,
    strengths: generateStrengths(aircraft, bracket),
    weaknesses: generateWeaknesses(aircraft, bracket),
    tips: generateTips(style),
    vs_tips: {},
    climb_profile: generateClimbProfile(aircraft),
    speed_at_altitude: generateSpeedAtAltitude(aircraft),
    role_description: getRoleDescription(style),
  };

  curatedData.push(curated);
}

// Write output
const outputPath = path.resolve(__dirname, '../src/data/curated-aircraft.json');
fs.writeFileSync(outputPath, JSON.stringify(curatedData, null, 2));

console.log(`Generated curated data for ${curatedData.length} aircraft`);
console.log(`Output written to ${outputPath}`);

// Print style distribution
const styleCounts: Record<string, number> = {};
for (const c of curatedData) {
  styleCounts[c.fighting_style] = (styleCounts[c.fighting_style] || 0) + 1;
}
console.log('\nFighting style distribution:');
for (const [style, count] of Object.entries(styleCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${style}: ${count}`);
}
