import { memo, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { CHART_THEME } from './chartTheme';
import type { Aircraft } from '../../types/aircraft';

interface SelfRadarChartProps {
  aircraft: Pick<Aircraft, 'max_speed' | 'climb_rate' | 'turn_time' | 'mass' | 'weapons_summary'>;
  className?: string;
}

// Reference values used to normalize stats to the 0-100 scale.
// These represent approximate upper bounds for WWII-era aircraft
// commonly found in War Thunder simulator battles.
const REFERENCE = {
  maxSpeed: 800,       // km/h
  climbRate: 35,       // m/s
  turnTime: 30,        // seconds (lower is better, so we invert)
  firepower: 6,        // weapon count proxy
  mass: 15000,         // kg — heavier = more survivable (simplified)
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeSpeed(maxSpeed?: number): number {
  if (maxSpeed == null) return 0;
  return clamp((maxSpeed / REFERENCE.maxSpeed) * 100, 0, 100);
}

function normalizeClimb(climbRate?: number): number {
  if (climbRate == null) return 0;
  return clamp((climbRate / REFERENCE.climbRate) * 100, 0, 100);
}

function normalizeTurn(turnTime?: number): number {
  // Lower turn time is better, so we invert the scale.
  if (turnTime == null) return 0;
  // A turn time of ~10s is exceptional (score 100), 30s+ is poor (score ~0).
  return clamp(((REFERENCE.turnTime - turnTime) / REFERENCE.turnTime) * 100 + 33, 0, 100);
}

function normalizeFirepower(weapons?: Aircraft['weapons_summary']): number {
  if (!weapons || weapons.length === 0) return 0;
  const totalCount = weapons.reduce((sum, w) => sum + w.count, 0);
  return clamp((totalCount / REFERENCE.firepower) * 100, 0, 100);
}

function normalizeSurvivability(mass?: number): number {
  if (mass == null) return 0;
  return clamp((mass / REFERENCE.mass) * 100, 0, 100);
}

interface RadarDataPoint {
  stat: string;
  value: number;
  fullMark: number;
}

export const SelfRadarChart = memo(function SelfRadarChart({
  aircraft,
  className,
}: SelfRadarChartProps) {
  const radarData: RadarDataPoint[] = useMemo(() => [
    { stat: 'Speed', value: normalizeSpeed(aircraft.max_speed), fullMark: 100 },
    { stat: 'Climb', value: normalizeClimb(aircraft.climb_rate), fullMark: 100 },
    { stat: 'Turn Rate', value: normalizeTurn(aircraft.turn_time), fullMark: 100 },
    { stat: 'Firepower', value: normalizeFirepower(aircraft.weapons_summary), fullMark: 100 },
    { stat: 'Survivability', value: normalizeSurvivability(aircraft.mass), fullMark: 100 },
  ], [aircraft]);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
          <PolarGrid stroke={CHART_THEME.grid.stroke} />
          <PolarAngleAxis
            dataKey="stat"
            tick={{ ...CHART_THEME.axis.tick, fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={CHART_THEME.tooltip.contentStyle}
            labelStyle={CHART_THEME.tooltip.labelStyle}
            itemStyle={CHART_THEME.tooltip.itemStyle}
            formatter={((value: number) => [`${Math.round(value)} / 100`, 'Score']) as never}
          />
          <Radar
            name="Stats"
            dataKey="value"
            stroke={CHART_THEME.colors.primary}
            fill={CHART_THEME.colors.primary}
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
});
