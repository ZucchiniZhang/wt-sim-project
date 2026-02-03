/**
 * AI Service Layer - OpenAI Platform Integration
 * Generates tactical guides and matchup playbooks using OpenAI API
 */

import OpenAI from 'openai';
import type { TacticalGuide, MatchupPlaybook } from '../types/curated';
import type { Aircraft } from '../types/aircraft';

// Configuration
const AI_ENABLED = import.meta.env.VITE_AI_ENABLE_GENERATION === 'true';
const API_KEY = import.meta.env.VITE_AI_API_KEY;
const MODEL = import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini';
const CACHE_VERSION = import.meta.env.VITE_AI_CACHE_VERSION || 'v1.0';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Initialize OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai && API_KEY) {
    openai = new OpenAI({
      apiKey: API_KEY,
      dangerouslyAllowBrowser: true, // Client-side usage
    });
  }
  if (!openai) {
    throw new Error('OpenAI client not initialized. Check VITE_AI_API_KEY.');
  }
  return openai;
}

// Usage tracking
class UsageTracker {
  private static instance: UsageTracker;
  private totalTokens = 0;
  private totalCost = 0;

  static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  trackUsage(inputTokens: number, outputTokens: number) {
    // GPT-4o-mini pricing (as of 2026): $0.150/1M input, $0.600/1M output
    const inputCost = (inputTokens / 1_000_000) * 0.15;
    const outputCost = (outputTokens / 1_000_000) * 0.6;

    this.totalTokens += inputTokens + outputTokens;
    this.totalCost += inputCost + outputCost;
  }

  getStats() {
    return {
      totalTokens: this.totalTokens,
      totalCost: this.totalCost,
    };
  }

  reset() {
    this.totalTokens = 0;
    this.totalCost = 0;
  }
}

// Error handling with retry logic
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
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
      message.includes('rate limit') ||
      message.includes('timeout') ||
      message.includes('503') ||
      message.includes('502')
    );
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate Tactical Guide for an aircraft
 */
export async function generateTacticalGuide(
  aircraft: Aircraft
): Promise<TacticalGuide> {
  if (!AI_ENABLED) {
    throw new Error('AI generation is disabled. Set VITE_AI_ENABLE_GENERATION=true');
  }

  const client = getOpenAIClient();

  const prompt = `You are a War Thunder Simulator Battles expert. Generate a comprehensive tactical guide for the following aircraft.

Aircraft: ${aircraft.localized_name || aircraft.identifier}
Identifier: ${aircraft.identifier}
Nation: ${aircraft.country}
BR: ${aircraft.simulator_br}
Type: ${aircraft.vehicle_type}
Max Speed: ${aircraft.max_speed || 'Unknown'} km/h
Climb Rate: ${aircraft.climb_rate || 'Unknown'} m/s
Turn Time: ${aircraft.turn_time || 'Unknown'}s

Generate a detailed tactical guide in JSON format with:
1. primary_role: Brief role description (e.g., "High-altitude escort fighter")
2. optimal_envelope: Best performance altitude/speed range with description
3. energy_management: Energy retention rating and guidance
4. combat_tactics: 200-300 words on how to fight effectively in this aircraft
5. counters_well: Array of aircraft types this excels against
6. struggles_against: Array of aircraft types to avoid
7. performance_notes: Key performance characteristics
8. mec_guidance: (optional) Manual engine controls guide if relevant

Focus on practical Sim Battles tactics. Be specific and actionable.

Return ONLY valid JSON matching this schema:
{
  "identifier": "${aircraft.identifier}",
  "primary_role": "string",
  "optimal_envelope": {
    "altitude_min": number,
    "altitude_max": number,
    "speed_min": number,
    "speed_max": number,
    "description": "string"
  },
  "energy_management": {
    "retention": "excellent" | "good" | "average" | "poor",
    "guidance": "string"
  },
  "combat_tactics": "string",
  "counters_well": ["string"],
  "struggles_against": ["string"],
  "performance_notes": "string",
  "mec_guidance": {
    "radiator_oil": "string",
    "radiator_water": "string",
    "prop_pitch": "string",
    "mixture": "string",
    "supercharger": "string"
  } (optional)
}`;

  const response = await withRetry(async () => {
    return await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a War Thunder Simulator Battles tactical expert. Respond only with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });
  });

  // Track usage
  if (response.usage) {
    UsageTracker.getInstance().trackUsage(
      response.usage.prompt_tokens,
      response.usage.completion_tokens
    );
  }

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in AI response');
  }

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

  const client = getOpenAIClient();

  const prompt = `You are a War Thunder Simulator Battles expert. Generate a tactical playbook for this 1v1 matchup.

YOUR AIRCRAFT: ${playerAircraft.localized_name || playerAircraft.identifier}
- BR: ${playerAircraft.simulator_br}
- Type: ${playerAircraft.vehicle_type}
- Max Speed: ${playerAircraft.max_speed || 'Unknown'} km/h
- Climb Rate: ${playerAircraft.climb_rate || 'Unknown'} m/s
- Turn Time: ${playerAircraft.turn_time || 'Unknown'}s

ENEMY AIRCRAFT: ${enemyAircraft.localized_name || enemyAircraft.identifier}
- BR: ${enemyAircraft.simulator_br}
- Type: ${enemyAircraft.vehicle_type}
- Max Speed: ${enemyAircraft.max_speed || 'Unknown'} km/h
- Climb Rate: ${enemyAircraft.climb_rate || 'Unknown'} m/s
- Turn Time: ${enemyAircraft.turn_time || 'Unknown'}s

Generate a matchup-specific playbook in JSON format with:
1. threat_assessment: Threat level (CRITICAL/HIGH/MODERATE/LOW) and reasoning
2. engagement_principles: Your advantages, enemy advantages, and win condition
3. tactical_scenarios: 3 scenarios (enemy has altitude, co-altitude merge, enemy low/slow). Each MUST include diagram_data with player/enemy positions on a 0-100 grid (0,0 is top-left), headings in degrees (0=north/up, 90=east), movement arrows, and optional zones/annotations.
4. altitude_advantage_guide: Altitude zones showing who has advantage

Focus on practical Sim Battles tactics for this specific matchup. For diagrams, think of a top-down tactical view where y=0 is north.

Return ONLY valid JSON matching this schema:
{
  "player_id": "${playerAircraft.identifier}",
  "enemy_id": "${enemyAircraft.identifier}",
  "threat_assessment": {
    "level": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
    "reasoning": "string"
  },
  "engagement_principles": {
    "your_advantages": ["string"],
    "enemy_advantages": ["string"],
    "win_condition": "string"
  },
  "tactical_scenarios": [
    {
      "title": "string",
      "situation": "string",
      "recommended_response": "string",
      "diagram_data": {
        "player": { "x": 0-100, "y": 0-100, "heading": 0-360 },
        "enemy": { "x": 0-100, "y": 0-100, "heading": 0-360 },
        "arrows": [{ "from": "player"|"enemy", "to": [x, y], "label": "string" }],
        "zones": [{ "x": 0-100, "y": 0-100, "radius": 5-30, "type": "danger"|"safe"|"engage" }],
        "annotations": [{ "x": 0-100, "y": 0-100, "text": "string" }]
      }
    }
  ],
  "altitude_advantage_guide": [
    {
      "altitude_min": number,
      "altitude_max": number,
      "advantage": "player" | "enemy" | "neutral",
      "reasoning": "string"
    }
  ]
}`;

  const response = await withRetry(async () => {
    return await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a War Thunder Simulator Battles tactical expert. Respond only with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });
  });

  // Track usage
  if (response.usage) {
    UsageTracker.getInstance().trackUsage(
      response.usage.prompt_tokens,
      response.usage.completion_tokens
    );
  }

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in AI response');
  }

  const playbook = JSON.parse(content) as MatchupPlaybook;

  // Add metadata
  playbook.generated_at = new Date().toISOString();
  playbook.generation_version = CACHE_VERSION;

  return playbook;
}

/**
 * Get usage statistics
 */
export function getUsageStats() {
  return UsageTracker.getInstance().getStats();
}

/**
 * Reset usage statistics
 */
export function resetUsageStats() {
  UsageTracker.getInstance().reset();
}

/**
 * Check if AI generation is enabled
 */
export function isAIEnabled(): boolean {
  return AI_ENABLED && !!API_KEY;
}

/**
 * Get current cache version
 */
export function getCacheVersion(): string {
  return CACHE_VERSION;
}
