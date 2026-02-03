/**
 * AircraftStats - Display aircraft performance stats with visual bars
 * Military briefing styled stat readouts
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface StatBarProps {
  label: string;
  value: number | string;
  maxValue?: number;
  color?: 'green' | 'yellow' | 'red' | 'blue';
  unit?: string;
  className?: string;
}

export const StatBar = memo(function StatBar({
  label,
  value,
  maxValue = 100,
  color = 'blue',
  unit = '',
  className,
}: StatBarProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString());
  const percentage = maxValue > 0 ? Math.min((numericValue / maxValue) * 100, 100) : 0;

  const barColors = {
    green: 'bg-aviation-amber',
    yellow: 'bg-aviation-amber-dark',
    red: 'bg-red-500/70',
    blue: 'bg-aviation-amber',
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between items-baseline text-sm">
        <span className="text-aviation-text-muted uppercase tracking-wider">{label}</span>
        <span className="font-bold font-mono text-aviation-text">
          {typeof value === 'number' ? value.toFixed(1) : value}
          {unit && <span className="text-aviation-text-muted ml-1">{unit}</span>}
        </span>
      </div>

      <div className="h-1.5 bg-aviation-charcoal overflow-hidden rounded border border-aviation-border">
        <motion.div
          className={cn('h-full', barColors[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ opacity: 0.7 }}
        />
      </div>
    </div>
  );
});

interface AircraftStatsProps {
  aircraft: {
    max_speed?: number;
    max_speed_at_altitude?: number;
    climb_rate?: number;
    turn_time?: number;
    repair_cost_simulator?: number;
  };
  className?: string;
}

export const AircraftStats = memo(function AircraftStats({ aircraft, className }: AircraftStatsProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <div className="w-4 h-px bg-aviation-amber/30" />
        <span className="section-label">Performance</span>
      </div>

      <div className="space-y-2.5">
        {aircraft.max_speed !== undefined && (
          <StatBar
            label="Max Speed (Sea Level)"
            value={aircraft.max_speed}
            maxValue={800}
            color="blue"
            unit="km/h"
          />
        )}

        {aircraft.max_speed_at_altitude !== undefined && (
          <StatBar
            label="Max Speed (Altitude)"
            value={aircraft.max_speed_at_altitude}
            maxValue={900}
            color="blue"
            unit="km/h"
          />
        )}

        {aircraft.climb_rate !== undefined && (
          <StatBar
            label="Climb Rate"
            value={aircraft.climb_rate}
            maxValue={30}
            color="green"
            unit="m/s"
          />
        )}

        {aircraft.turn_time !== undefined && (
          <StatBar
            label="Turn Time"
            value={aircraft.turn_time}
            maxValue={30}
            color="yellow"
            unit="sec"
          />
        )}

        {aircraft.repair_cost_simulator !== undefined && (
          <StatBar
            label="Repair Cost (SB)"
            value={aircraft.repair_cost_simulator}
            maxValue={20000}
            color="red"
            unit="SL"
          />
        )}
      </div>
    </div>
  );
});
