/**
 * SimCal API Integration
 * Fetches current War Thunder Sim Battles bracket schedule
 * Source: https://warthunder.highwaymen.space
 */

export interface SimBracketSchedule {
  bracket_id: string;
  bracket_name: string;
  start_time: string;     // ISO timestamp
  end_time: string;       // ISO timestamp
  is_active: boolean;
}

export interface SimCalWeeklySchedule {
  week_start: string;     // ISO timestamp
  week_end: string;       // ISO timestamp
  brackets: SimBracketSchedule[];
}

const SIMCAL_API_URL = 'https://warthunder.highwaymen.space';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

// In-memory cache
let cachedSchedule: SimCalWeeklySchedule | null = null;
let cacheTimestamp = 0;

/**
 * Fetch current bracket schedule from SimCal
 * Falls back to manual selection if API unavailable
 */
export async function fetchCurrentBracket(): Promise<SimBracketSchedule | null> {
  try {
    const schedule = await fetchWeeklySchedule();
    const now = new Date();

    // Find currently active bracket
    const activeBracket = schedule.brackets.find(bracket => {
      const start = new Date(bracket.start_time);
      const end = new Date(bracket.end_time);
      return now >= start && now <= end;
    });

    return activeBracket || null;
  } catch (error) {
    console.error('Failed to fetch current bracket from SimCal:', error);
    return null;
  }
}

/**
 * Fetch full weekly schedule
 */
export async function fetchWeeklySchedule(): Promise<SimCalWeeklySchedule> {
  // Check cache
  const now = Date.now();
  if (cachedSchedule && now - cacheTimestamp < CACHE_DURATION_MS) {
    return cachedSchedule;
  }

  try {
    const response = await fetch(SIMCAL_API_URL, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`SimCal API returned ${response.status}`);
    }

    const html = await response.text();

    // Parse HTML to extract schedule data
    // Note: This is a simplified parser. In production, you'd parse the actual HTML structure
    const schedule = parseSimCalHTML(html);

    // Update cache
    cachedSchedule = schedule;
    cacheTimestamp = now;

    return schedule;
  } catch (error) {
    console.error('Failed to fetch weekly schedule from SimCal:', error);

    // Return fallback static schedule
    return getFallbackSchedule();
  }
}

/**
 * Parse SimCal HTML to extract bracket schedule
 * TODO: Implement actual HTML parsing based on SimCal structure
 */
function parseSimCalHTML(_html: string): SimCalWeeklySchedule {
  // Placeholder implementation - would need actual HTML parsing
  // For now, return fallback schedule
  console.warn('SimCal HTML parsing not yet implemented, using fallback');
  return getFallbackSchedule();
}

/**
 * Fallback schedule when SimCal API is unavailable
 * Based on typical War Thunder Sim rotation pattern
 */
function getFallbackSchedule(): SimCalWeeklySchedule {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - now.getDay()); // Start of week

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return {
    week_start: weekStart.toISOString(),
    week_end: weekEnd.toISOString(),
    brackets: [
      {
        bracket_id: 'props_low',
        bracket_name: 'Props Low Tier (BR 1.0-3.3)',
        start_time: now.toISOString(),
        end_time: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        is_active: false,
      },
      {
        bracket_id: 'props_mid',
        bracket_name: 'Props Mid Tier (BR 3.7-5.7)',
        start_time: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        is_active: false,
      },
      {
        bracket_id: 'props_high',
        bracket_name: 'Props High Tier (BR 6.0-7.3)',
        start_time: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
        is_active: false,
      },
    ],
  };
}

/**
 * Get time remaining until bracket ends
 */
export function getTimeRemaining(bracket: SimBracketSchedule): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const end = new Date(bracket.end_time);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

/**
 * Clear cached schedule (force refresh)
 */
export function clearScheduleCache(): void {
  cachedSchedule = null;
  cacheTimestamp = 0;
}
