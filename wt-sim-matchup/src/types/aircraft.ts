/**
 * TypeScript type definitions for War Thunder aircraft data
 * Based on WT Vehicles API schema
 */

// Nation enum
export type Nation =
  | 'usa'
  | 'germany'
  | 'ussr'
  | 'britain'
  | 'japan'
  | 'italy'
  | 'france'
  | 'china'
  | 'sweden'
  | 'israel';

// Vehicle type enum - matches actual API data values
export type VehicleType =
  | 'fighter'
  | 'bomber'
  | 'assault';

// All vehicle types in the data (including non-aircraft)
export type AllVehicleType =
  | VehicleType
  | 'light_tank'
  | 'medium_tank'
  | 'heavy_tank'
  | 'tank_destroyer'
  | 'spaa'
  | 'boat';

// Aircraft-only vehicle types for filtering
export const AIRCRAFT_VEHICLE_TYPES: VehicleType[] = ['fighter', 'bomber', 'assault'];

// Simplified weapon summary for display
export interface WeaponSummary {
  name: string;
  caliber: string;
  count: number;
}

// Threat assessment types
export type ThreatLevel = 'critical' | 'high' | 'moderate' | 'low';

export interface ThreatAssessment {
  threatLevel: ThreatLevel;
  score: number;
  advantages: string[];
  disadvantages: string[];
  tacticalAdvice: string;
}

// Full aircraft data from API
export interface Aircraft {
  identifier: string;
  country: Nation;
  vehicle_type: VehicleType;
  vehicle_sub_types?: VehicleType[];

  // Battle Ratings
  arcade_br: number;
  realistic_br: number;
  simulator_br: number;
  realistic_ground_br?: number;
  simulator_ground_br?: number;

  // Classification
  is_premium: boolean;
  is_pack?: boolean;
  squadron_vehicle?: boolean;
  on_marketplace?: boolean;
  event?: string;
  release_date?: string;

  // Display
  localized_name?: string;

  // Images
  images?: {
    image: string;
  };

  // Performance
  max_speed?: number;
  max_speed_at_altitude?: number;
  optimal_altitude?: number;
  climb_rate?: number;
  turn_time?: number;
  roll_rate?: number;

  // Aerodynamics
  aerodynamics?: {
    wing_loading?: number;
    wing_area?: number;
    optimal_altitude?: number;
    aspect_ratio?: number;
    [key: string]: number | undefined;
  };

  // Physical dimensions
  wing_area?: number;
  wingspan?: number;
  length?: number;

  // Weight
  empty_weight?: number;
  max_takeoff_weight?: number;
  mass?: number;

  // Altitude
  max_altitude?: number;

  // Engine
  engine?: {
    max_rpm?: number;
    horse_power?: number;
    weight_kg?: number;
    [key: string]: number | undefined;
  };

  // Armament
  weapons?: {
    [key: string]: Record<string, unknown>;
  };
  weapons_summary?: WeaponSummary[];
  weapon_presets?: string[];
  presets?: Record<string, unknown>[];
  has_customizable_weapons?: boolean;

  // Economy
  repair_cost_arcade?: number;
  repair_cost_realistic?: number;
  repair_cost_simulator?: number;
  repair_cost_simulator_upgraded?: number;
  sl_mul_arcade?: number;
  sl_mul_realistic?: number;
  sl_mul_simulator?: number;
  value?: number;
  ge_cost?: number;

  // Research
  req_exp?: number;
  era?: number;
  required_vehicle?: string;

  // Modifications
  modifications?: Record<string, unknown>[];

  // Additional fields
  visibility?: number;
  version?: string;

  // Devices
  ir_devices?: Record<string, unknown>;
  thermal_devices?: Record<string, unknown>;
  ballistic_computer?: Record<string, unknown>;
}

// Sim bracket definition
export interface SimBracket {
  id: string;
  name: string;
  min_br: number;
  max_br: number;
  description?: string;
}

// Team configuration
export interface TeamConfig {
  id: string;
  name: string;
  team_a: Nation[];
  team_b: Nation[];
}

// Matchup calculation result
export interface MatchupResult {
  selectedAircraft: Aircraft;
  bracket: SimBracket;
  playerTeam: 'A' | 'B';
  enemyNations: Nation[];
  enemyAircraft: Aircraft[];
  allyNations: Nation[];
  allyAircraft?: Aircraft[];
  activePresetName?: string;
}

// Rotation cycle definition
export interface RotationCycle {
  id: string;
  brackets: SimBracket[];
}

// Rotation configuration
export interface RotationConfig {
  reference_date: string;
  cycle_duration_days: number;
  timezone_offset: number;
}

// Bracket and team data structure (with rotating cycles)
export interface BracketData {
  rotation: RotationConfig;
  cycles: RotationCycle[];
  teams: {
    default: TeamConfig;
    presets: TeamConfig[];
  };
}
