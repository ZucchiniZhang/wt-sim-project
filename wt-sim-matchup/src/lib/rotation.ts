/**
 * EC bracket rotation logic for War Thunder Simulator Battles
 *
 * WT Sim rotates through 4 bracket sets (A/B/C/D) every 2 days.
 * Reference date: 2023-09-24 (Cycle A start)
 * Timezone: PST (UTC-8) - Gaijin uses Pacific time for rotations
 *
 * Source: https://warthunder.highwaymen.space/SimCal/
 */

import type { SimBracket } from '../types/aircraft';

export interface RotationConfig {
  reference_date: string;
  cycle_duration_days: number;
  timezone_offset: number;
}

export interface RotationCycleData {
  id: string;
  brackets: SimBracket[];
}

export interface CycleInfo {
  cycleIndex: number;
  cycleLetter: string;
  dayInCycle: number;
  brackets: SimBracket[];
  nextRotation: Date;
}

const CYCLE_LETTERS = ['A', 'B', 'C', 'D'];

/**
 * Get the current rotation cycle info based on a date
 */
export function getCycleInfo(
  cycles: RotationCycleData[],
  rotationConfig: RotationConfig,
  date: Date = new Date()
): CycleInfo {
  const { reference_date, cycle_duration_days, timezone_offset } = rotationConfig;

  // Adjust date to PST (UTC-8)
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  const pstMs = utcMs + timezone_offset * 60 * 60 * 1000;
  const pstDate = new Date(pstMs);

  // Reference date in PST
  const refParts = reference_date.split('-').map(Number);
  const refDate = new Date(refParts[0], refParts[1] - 1, refParts[2]);

  // Days since reference
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceRef = Math.floor((pstDate.getTime() - refDate.getTime()) / msPerDay);

  // Which 2-day cycle are we in?
  const cycleNumber = Math.floor(daysSinceRef / cycle_duration_days);
  const cycleIndex = ((cycleNumber % 4) + 4) % 4; // handle negative modulo
  const dayInCycle = (daysSinceRef % cycle_duration_days) + 1;

  // Calculate next rotation time (in user's local time)
  const daysUntilNext = cycle_duration_days - (daysSinceRef % cycle_duration_days);
  const nextRotation = new Date(date.getTime() + daysUntilNext * msPerDay);
  // Set to midnight PST, then convert back
  nextRotation.setHours(0, 0, 0, 0);

  const cycle = cycles[cycleIndex];

  return {
    cycleIndex,
    cycleLetter: CYCLE_LETTERS[cycleIndex],
    dayInCycle,
    brackets: cycle?.brackets ?? [],
    nextRotation,
  };
}

/**
 * Get cycle info for a specific cycle letter (A/B/C/D)
 * Useful for browsing other rotations
 */
export function getCycleByLetter(
  cycles: RotationCycleData[],
  letter: string
): RotationCycleData | null {
  return cycles.find(c => c.id === letter) ?? null;
}
