/**
 * API client for War Thunder Vehicles API
 * Primarily uses local cached data, but can fetch fresh data if needed
 */

import type { Aircraft } from '../types/aircraft';
import { AIRCRAFT_VEHICLE_TYPES } from '../types/aircraft';

/**
 * Load aircraft data from local cache
 * This is the preferred method for production use
 */
export async function loadLocalAircraftData(): Promise<Aircraft[]> {
  // In production, this would be imported from the local JSON file
  // For now, we'll need to dynamically import it
  try {
    const module = await import('../data/aircraft.json');
    const allVehicles = module.default as unknown as Aircraft[];
    // Filter to aircraft only (exclude tanks, boats, SPAA, etc.)
    return allVehicles.filter(v =>
      (AIRCRAFT_VEHICLE_TYPES as string[]).includes(v.vehicle_type)
    );
  } catch (error) {
    console.error('Failed to load local aircraft data:', error);
    throw new Error('Aircraft data not found. Please run the data fetch script.');
  }
}
