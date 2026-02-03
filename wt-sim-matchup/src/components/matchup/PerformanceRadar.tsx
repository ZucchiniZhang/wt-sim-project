/**
 * PerformanceRadar - Spider/radar chart comparing two aircraft across 5 axes
 * Uses Recharts RadarChart
 */

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts';
import { getAircraftDisplayName } from '../../lib/utils';
import { CHART_THEME } from '../charts/chartTheme';
import type { Aircraft } from '../../types/aircraft';

interface PerformanceRadarProps {
  player: Aircraft;
  enemy: Aircraft;
  size?: number;
  className?: string;
}

interface RadarDataPoint {
  axis: string;
  player: number;
  enemy: number;
}

/**
 * Normalize a value to a 0-100 scale given a typical range
 */
function normalize(value: number | undefined, min: number, max: number): number {
  if (value == null) return 0;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

/**
 * Get armament score for radar display
 */
function getFirepowerScore(aircraft: Aircraft): number {
  const weapons = aircraft.weapons_summary;
  if (!weapons || weapons.length === 0) return 10;

  let score = 0;
  for (const w of weapons) {
    const cal = parseFloat(w.caliber);
    if (isNaN(cal)) continue;
    const calMm = cal < 2 ? cal * 25.4 : cal;
    score += calMm * w.count;
  }
  // Normalize: typical range 50-500
  return Math.min(100, (score / 400) * 100);
}

/**
 * Get survivability score based on mass and type
 */
function getSurvivabilityScore(aircraft: Aircraft): number {
  let score = 50; // baseline

  // Heavier = more survivable (generally)
  if (aircraft.mass != null) {
    score = normalize(aircraft.mass, 1000, 15000);
  }

  // Bombers tend to be tougher
  if (aircraft.vehicle_type === 'bomber') {
    score = Math.min(100, score + 20);
  }

  return score;
}

function buildRadarData(player: Aircraft, enemy: Aircraft): RadarDataPoint[] {
  return [
    {
      axis: 'Speed',
      player: normalize(player.max_speed, 200, 2500),
      enemy: normalize(enemy.max_speed, 200, 2500),
    },
    {
      axis: 'Turn Rate',
      // Lower turn time = better, so invert
      player: player.turn_time != null ? normalize(40 - player.turn_time, 0, 30) : 0,
      enemy: enemy.turn_time != null ? normalize(40 - enemy.turn_time, 0, 30) : 0,
    },
    {
      axis: 'Climb',
      player: normalize(player.climb_rate, 0, 80),
      enemy: normalize(enemy.climb_rate, 0, 80),
    },
    {
      axis: 'Firepower',
      player: getFirepowerScore(player),
      enemy: getFirepowerScore(enemy),
    },
    {
      axis: 'Survivability',
      player: getSurvivabilityScore(player),
      enemy: getSurvivabilityScore(enemy),
    },
  ];
}

export function PerformanceRadar({ player, enemy, size = 250, className }: PerformanceRadarProps) {
  const data = buildRadarData(player, enemy);
  const playerName = getAircraftDisplayName(player);
  const enemyName = getAircraftDisplayName(enemy);

  return (
    <div className={className}>
      <div className="text-xs text-aviation-text-muted uppercase tracking-wider mb-2 text-center">
        Performance Comparison
      </div>
      <ResponsiveContainer width="100%" height={size}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid
            stroke={CHART_THEME.grid.stroke}
            strokeDasharray="2 2"
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={CHART_THEME.axis.tick}
          />
          <Radar
            name={playerName}
            dataKey="player"
            stroke={CHART_THEME.colors.player}
            fill="rgba(74, 222, 128, 0.15)"
            strokeWidth={2}
          />
          <Radar
            name={enemyName}
            dataKey="enemy"
            stroke={CHART_THEME.colors.enemy}
            fill="rgba(248, 113, 113, 0.15)"
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={CHART_THEME.legend.wrapperStyle}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
