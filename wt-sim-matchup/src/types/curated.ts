/**
 * Curated aircraft data types
 * Supplementary hand-tunable data for enhanced briefings
 */

export type FightingStyle =
  | 'boom_and_zoom'
  | 'energy_fighter'
  | 'turn_fighter'
  | 'interceptor'
  | 'multirole'
  | 'ground_attacker'
  | 'heavy_fighter'
  | 'bomber';

export type EnergyRetention = 'excellent' | 'good' | 'average' | 'poor';

export interface ClimbProfilePoint {
  altitude: number;  // meters
  ias: number;       // km/h indicated airspeed
  time_to_alt?: number; // seconds
}

export interface SpeedAtAltitudePoint {
  altitude: number;  // meters
  speed: number;     // km/h
}

export interface CuratedAircraftData {
  identifier: string;
  optimal_climb_ias: number;
  optimal_altitude_range: [number, number];
  energy_retention: EnergyRetention;
  fighting_style: FightingStyle;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  vs_tips: Record<string, string>;
  climb_profile: ClimbProfilePoint[];
  speed_at_altitude?: SpeedAtAltitudePoint[];
  role_description?: string;
}

// AI-Generated Tactical Guides (Phase 1: Flight Academy)

export interface MECGuidance {
  radiator_oil: string;      // e.g., "Keep at 20-30% for optimal cooling"
  radiator_water: string;     // e.g., "Open to 40% in climbs, close in dives"
  prop_pitch: string;         // e.g., "100% for climb, 85-90% for cruise"
  mixture: string;            // e.g., "90% below 3km, 80% at 4-5km, 70% above 5km"
  supercharger: string;       // e.g., "Gear 1 below 3km, Gear 2 above 3km"
}

export interface OptimalEnvelope {
  altitude_min: number;       // meters - minimum effective altitude
  altitude_max: number;       // meters - maximum effective altitude
  speed_min: number;          // km/h - minimum combat speed
  speed_max: number;          // km/h - maximum safe speed
  description: string;        // e.g., "Excels at 4000-6000m in the 350-450 km/h range"
}

export interface EnergyManagement {
  retention: 'excellent' | 'good' | 'average' | 'poor';
  guidance: string;           // e.g., "Bleeds energy quickly in sustained turns; use vertical maneuvers"
}

export interface TacticalGuide {
  identifier: string;                     // Aircraft identifier (e.g., "p-51d-30")
  primary_role: string;                   // e.g., "High-altitude escort fighter"
  optimal_envelope: OptimalEnvelope;      // Performance sweet spot
  energy_management: EnergyManagement;    // Energy fighting characteristics
  combat_tactics: string;                 // 200-300 words on how to fight in this aircraft
  counters_well: string[];                // Aircraft types this excels against
  struggles_against: string[];            // Aircraft types to avoid or be cautious with
  performance_notes: string;              // Key performance characteristics
  mec_guidance?: MECGuidance;             // Manual engine controls guide (optional)
  generated_at: string;                   // ISO timestamp
  generation_version: string;             // Cache invalidation key (e.g., "v1.0")
}

// AI-Generated Matchup Playbooks (Phase 2: Tactical Briefings)

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface ThreatAssessment {
  level: ThreatLevel;
  reasoning: string;                      // Why this threat level
}

export interface EngagementPrinciples {
  your_advantages: string[];              // What you have over the enemy
  enemy_advantages: string[];             // What the enemy has over you
  win_condition: string;                  // How to win this fight
}

export interface DiagramPosition {
  x: number;   // 0-100 grid percentage
  y: number;   // 0-100 grid percentage
  heading: number; // 0-360 degrees (0=north/up)
}

export interface DiagramData {
  player: DiagramPosition;
  enemy: DiagramPosition;
  arrows?: Array<{
    from: 'player' | 'enemy';
    to: [number, number];       // [x, y] target position (0-100)
    label?: string;
  }>;
  zones?: Array<{
    x: number;
    y: number;
    radius: number;             // 0-50 (percentage of viewbox)
    type: 'danger' | 'safe' | 'engage';
  }>;
  annotations?: Array<{
    x: number;
    y: number;
    text: string;
  }>;
}

export interface TacticalScenario {
  title: string;                          // e.g., "Enemy Has Altitude Advantage"
  situation: string;                      // Scenario description
  recommended_response: string;           // What to do in this scenario
  diagram_data?: DiagramData;             // Optional tactical diagram data
}

export interface AltitudeAdvantageZone {
  altitude_min: number;                   // meters
  altitude_max: number;                   // meters
  advantage: 'player' | 'enemy' | 'neutral';
  reasoning: string;
}

export interface MatchupPlaybook {
  player_id: string;                      // Player aircraft identifier
  enemy_id: string;                       // Enemy aircraft identifier
  threat_assessment: ThreatAssessment;
  engagement_principles: EngagementPrinciples;
  tactical_scenarios: TacticalScenario[]; // 3 scenario cards with diagrams
  altitude_advantage_guide: AltitudeAdvantageZone[];
  generated_at: string;                   // ISO timestamp
  generation_version: string;             // Cache invalidation key (e.g., "v1.0")
}
