/**
 * AI Service Layer - Ollama Integration
 * Generates tactical guides and matchup playbooks using local Ollama API
 */

import type { TacticalGuide, MatchupPlaybook } from '../types/curated';
import type { Aircraft } from '../types/aircraft';

// Configuration
const AI_ENABLED = import.meta.env.VITE_AI_ENABLE_GENERATION === 'true';
const OLLAMA_URL = import.meta.env.VITE_AI_OLLAMA_URL || 'http://localhost:11434';
const MODEL = import.meta.env.VITE_AI_MODEL || 'qwen3:30b-a3b';
const CACHE_VERSION = import.meta.env.VITE_AI_CACHE_VERSION || 'v2.0';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// JSON Schemas for structured output
const tacticalGuideSchema = {
  type: 'object',
  required: [
    'identifier',
    'primary_role',
    'optimal_envelope',
    'energy_management',
    'combat_tactics',
    'counters_well',
    'struggles_against',
    'performance_notes',
  ],
  properties: {
    identifier: { type: 'string' },
    primary_role: { type: 'string' },
    optimal_envelope: {
      type: 'object',
      required: ['altitude_min', 'altitude_max', 'speed_min', 'speed_max', 'description'],
      properties: {
        altitude_min: { type: 'number' },
        altitude_max: { type: 'number' },
        speed_min: { type: 'number' },
        speed_max: { type: 'number' },
        description: { type: 'string' },
      },
    },
    energy_management: {
      type: 'object',
      required: ['retention', 'guidance'],
      properties: {
        retention: { type: 'string', enum: ['excellent', 'good', 'average', 'poor'] },
        guidance: { type: 'string' },
      },
    },
    combat_tactics: { type: 'string' },
    counters_well: { type: 'array', items: { type: 'string' } },
    struggles_against: { type: 'array', items: { type: 'string' } },
    performance_notes: { type: 'string' },
    mec_guidance: {
      type: 'object',
      properties: {
        radiator_oil: { type: 'string' },
        radiator_water: { type: 'string' },
        prop_pitch: { type: 'string' },
        mixture: { type: 'string' },
        supercharger: { type: 'string' },
      },
    },
  },
};

const matchupPlaybookSchema = {
  type: 'object',
  required: [
    'player_id',
    'enemy_id',
    'threat_assessment',
    'engagement_principles',
    'tactical_scenarios',
    'altitude_advantage_guide',
  ],
  properties: {
    player_id: { type: 'string' },
    enemy_id: { type: 'string' },
    threat_assessment: {
      type: 'object',
      required: ['level', 'reasoning'],
      properties: {
        level: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'] },
        reasoning: { type: 'string' },
      },
    },
    engagement_principles: {
      type: 'object',
      required: ['your_advantages', 'enemy_advantages', 'win_condition'],
      properties: {
        your_advantages: { type: 'array', items: { type: 'string' } },
        enemy_advantages: { type: 'array', items: { type: 'string' } },
        win_condition: { type: 'string' },
      },
    },
    tactical_scenarios: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'situation', 'recommended_response'],
        properties: {
          title: { type: 'string' },
          situation: { type: 'string' },
          recommended_response: { type: 'string' },
          diagram_data: {
            type: 'object',
            properties: {
              player: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                  heading: { type: 'number' },
                },
              },
              enemy: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                  heading: { type: 'number' },
                },
              },
              arrows: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    from: { type: 'string', enum: ['player', 'enemy'] },
                    to: { type: 'array', items: { type: 'number' } },
                    label: { type: 'string' },
                  },
                },
              },
              zones: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    x: { type: 'number' },
                    y: { type: 'number' },
                    radius: { type: 'number' },
                    type: { type: 'string', enum: ['danger', 'safe', 'engage'] },
                  },
                },
              },
              annotations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    x: { type: 'number' },
                    y: { type: 'number' },
                    text: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    altitude_advantage_guide: {
      type: 'array',
      items: {
        type: 'object',
        required: ['altitude_min', 'altitude_max', 'advantage', 'reasoning'],
        properties: {
          altitude_min: { type: 'number' },
          altitude_max: { type: 'number' },
          advantage: { type: 'string', enum: ['player', 'enemy', 'neutral'] },
          reasoning: { type: 'string' },
        },
      },
    },
  },
};

// Helper functions
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      await sleep(RETRY_DELAY_MS * (MAX_RETRIES - retries + 1));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('network') ||
      message.includes('503') ||
      message.includes('502')
    );
  }
  return false;
}

/**
 * Check if Ollama is running and accessible
 */
export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Call Ollama API with structured output
 */
async function callOllama(
  prompt: string,
  schema: object,
  maxTokens: number
): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      format: schema,
      options: {
        temperature: 0.7,
        num_predict: maxTokens,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama API error: ${response.status} - ${text}`);
  }

  const data = await response.json();

  // Qwen3 with thinking mode may put structured output in 'thinking' field
  // when 'response' is empty. Check both fields.
  const content = data.response || data.thinking;

  if (!content) {
    throw new Error('No response from Ollama');
  }

  return content.trim();
}

/**
 * Generate Tactical Guide for an aircraft
 */
export async function generateTacticalGuide(aircraft: Aircraft): Promise<TacticalGuide> {
  if (!AI_ENABLED) {
    throw new Error('AI generation is disabled. Set VITE_AI_ENABLE_GENERATION=true');
  }

  const isConnected = await checkOllamaConnection();
  if (!isConnected) {
    throw new Error('Cannot connect to Ollama. Make sure Ollama is running (ollama serve)');
  }

  const prompt = `You are a War Thunder Simulator Battles expert. Generate a comprehensive tactical guide for the following aircraft. Be specific and actionable with practical Sim Battles tactics.

Aircraft: ${aircraft.localized_name || aircraft.identifier}
Identifier: ${aircraft.identifier}
Nation: ${aircraft.country}
BR: ${aircraft.simulator_br}
Type: ${aircraft.vehicle_type}
Max Speed: ${aircraft.max_speed || 'Unknown'} km/h
Climb Rate: ${aircraft.climb_rate || 'Unknown'} m/s
Turn Time: ${aircraft.turn_time || 'Unknown'}s

Generate a tactical guide with:
- identifier: "${aircraft.identifier}"
- primary_role: Brief role description (e.g., "High-altitude escort fighter")
- optimal_envelope: Best performance altitude (meters) and speed (km/h) ranges with description
- energy_management: Energy retention rating (excellent/good/average/poor) and detailed guidance
- combat_tactics: 200-300 words on how to fight effectively in this aircraft
- counters_well: Array of aircraft types/categories this excels against
- struggles_against: Array of aircraft types/categories to avoid or approach with caution
- performance_notes: Key performance characteristics pilots should know
- mec_guidance: (optional) Manual engine controls guide if this aircraft benefits from MEC

`;

  const content = await withRetry(() => callOllama(prompt, tacticalGuideSchema, 2000));

  const guide = JSON.parse(content) as TacticalGuide;

  // Add metadata
  guide.generated_at = new Date().toISOString();
  guide.generation_version = CACHE_VERSION;

  return guide;
}

/**
 * Generate Matchup Playbook for a specific 1v1 engagement
 */
export async function generateMatchupPlaybook(
  playerAircraft: Aircraft,
  enemyAircraft: Aircraft
): Promise<MatchupPlaybook> {
  if (!AI_ENABLED) {
    throw new Error('AI generation is disabled. Set VITE_AI_ENABLE_GENERATION=true');
  }

  const isConnected = await checkOllamaConnection();
  if (!isConnected) {
    throw new Error('Cannot connect to Ollama. Make sure Ollama is running (ollama serve)');
  }

  const prompt = `You are a War Thunder Simulator Battles expert. Generate a tactical playbook for this 1v1 matchup. Focus on practical Sim Battles tactics for this specific matchup.

YOUR AIRCRAFT: ${playerAircraft.localized_name || playerAircraft.identifier}
- Identifier: ${playerAircraft.identifier}
- BR: ${playerAircraft.simulator_br}
- Type: ${playerAircraft.vehicle_type}
- Max Speed: ${playerAircraft.max_speed || 'Unknown'} km/h
- Climb Rate: ${playerAircraft.climb_rate || 'Unknown'} m/s
- Turn Time: ${playerAircraft.turn_time || 'Unknown'}s

ENEMY AIRCRAFT: ${enemyAircraft.localized_name || enemyAircraft.identifier}
- Identifier: ${enemyAircraft.identifier}
- BR: ${enemyAircraft.simulator_br}
- Type: ${enemyAircraft.vehicle_type}
- Max Speed: ${enemyAircraft.max_speed || 'Unknown'} km/h
- Climb Rate: ${enemyAircraft.climb_rate || 'Unknown'} m/s
- Turn Time: ${enemyAircraft.turn_time || 'Unknown'}s

Generate a matchup playbook with:
- player_id: "${playerAircraft.identifier}"
- enemy_id: "${enemyAircraft.identifier}"
- threat_assessment: Threat level (CRITICAL/HIGH/MODERATE/LOW) and reasoning
- engagement_principles: Your advantages, enemy advantages, and win condition
- tactical_scenarios: 3 scenarios with diagram_data. Each diagram uses a 0-100 grid (0,0=top-left), headings in degrees (0=north/up, 90=east). Include:
  1. "Enemy Has Altitude Advantage"
  2. "Co-Altitude Merge"
  3. "Enemy Low and Slow"
- altitude_advantage_guide: Array of altitude zones (in meters) showing who has advantage at each altitude band

For diagram_data, position player and enemy on the grid, add movement arrows showing recommended maneuvers, and optional zones (danger/safe/engage areas).

`;

  const content = await withRetry(() => callOllama(prompt, matchupPlaybookSchema, 3000));

  const playbook = JSON.parse(content) as MatchupPlaybook;

  // Add metadata
  playbook.generated_at = new Date().toISOString();
  playbook.generation_version = CACHE_VERSION;

  return playbook;
}

/**
 * Check if AI generation is enabled
 */
export function isAIEnabled(): boolean {
  return AI_ENABLED;
}

/**
 * Get current cache version
 */
export function getCacheVersion(): string {
  return CACHE_VERSION;
}

/**
 * Get current model name
 */
export function getModelName(): string {
  return MODEL;
}
