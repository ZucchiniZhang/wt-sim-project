/**
 * API client for War Thunder Vehicles API
 * Primarily uses local cached data, but can fetch fresh data if needed
 */

import type { Aircraft, Nation } from '../types/aircraft';
import { AIRCRAFT_VEHICLE_TYPES } from '../types/aircraft';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch all aircraft for a specific nation
 * Note: This is mainly for updating cached data - prefer using local aircraft.json
 */
export async function fetchAircraftByNation(nation: Nation): Promise<Aircraft[]> {
  const response = await fetch(
    `${API_BASE_URL}/vehicles?country=${nation}&vehicleType=aircraft`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch aircraft for ${nation}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a specific aircraft by identifier
 */
export async function fetchAircraftByIdentifier(identifier: string): Promise<Aircraft> {
  const response = await fetch(`${API_BASE_URL}/vehicles/${identifier}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch aircraft ${identifier}: ${response.statusText}`);
  }

  return response.json();
}

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
