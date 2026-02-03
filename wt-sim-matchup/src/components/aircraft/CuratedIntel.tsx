/**
 * CuratedIntel - Display curated intelligence data for an aircraft
 * Shows fighting style, strengths/weaknesses, tips, climb data, and energy retention
 */

import { memo } from 'react';
import { cn } from '../../lib/utils';
import type { CuratedAircraftData, FightingStyle, EnergyRetention } from '../../types/curated';

interface CuratedIntelProps {
  data: CuratedAircraftData;
  className?: string;
}

/** Map fighting style to a human-readable label */
function getFightingStyleLabel(style: FightingStyle): string {
  const labels: Record<FightingStyle, string> = {
    boom_and_zoom: 'Boom & Zoom',
    energy_fighter: 'Energy Fighter',
    turn_fighter: 'Turn Fighter',
    interceptor: 'Interceptor',
    multirole: 'Multirole',
    ground_attacker: 'Ground Attacker',
    heavy_fighter: 'Heavy Fighter',
    bomber: 'Bomber',
  };
  return labels[style] || style.replace(/_/g, ' ');
}

/** Get color classes for energy retention rating */
function getEnergyRetentionColor(rating: EnergyRetention): string {
  const colors: Record<EnergyRetention, string> = {
    excellent: 'bg-green-500/20 text-green-400 border-green-500/40',
    good: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    average: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    poor: 'bg-red-500/20 text-red-400 border-red-500/40',
  };
  return colors[rating] || 'bg-aviation-slate-light/80 text-aviation-text-muted border-aviation-amber/15';
}

export const CuratedIntel = memo(function CuratedIntel({
  data,
  className,
}: CuratedIntelProps) {
  return (
    <div className={cn('space-y-5', className)}>
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-px bg-aviation-amber/30" />
        <span className="section-label">Curated Intelligence</span>
      </div>

      {/* Fighting style and role description */}
      <div className="rounded-lg border border-aviation-border bg-aviation-charcoal/40 p-3 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-aviation-amber/15 text-aviation-amber border border-aviation-amber/30 rounded">
            {getFightingStyleLabel(data.fighting_style)}
          </span>
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border',
              getEnergyRetentionColor(data.energy_retention)
            )}
          >
            {data.energy_retention} Energy
          </span>
        </div>
        {data.role_description && (
          <p className="text-sm text-aviation-text leading-relaxed">
            {data.role_description}
          </p>
        )}
      </div>

      {/* Strengths and Weaknesses grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-px bg-green-500/50" />
            <span className="text-xs font-bold uppercase tracking-widest text-green-400">
              Strengths
            </span>
          </div>
          <ul className="space-y-1.5">
            {data.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-aviation-text">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
            {data.strengths.length === 0 && (
              <li className="text-sm text-aviation-text-muted italic">
                No data available
              </li>
            )}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-px bg-red-500/50" />
            <span className="text-xs font-bold uppercase tracking-widest text-red-400">
              Weaknesses
            </span>
          </div>
          <ul className="space-y-1.5">
            {data.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-aviation-text">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <span>{weakness}</span>
              </li>
            ))}
            {data.weaknesses.length === 0 && (
              <li className="text-sm text-aviation-text-muted italic">
                No data available
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Tips */}
      {data.tips.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-px bg-aviation-amber/50" />
            <span className="text-xs font-bold uppercase tracking-widest text-aviation-amber">
              Tactical Tips
            </span>
          </div>
          <ul className="space-y-1.5">
            {data.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-aviation-text">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-aviation-amber flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Climb and Altitude readouts */}
      <div className="rounded-lg border border-aviation-border bg-aviation-charcoal/40 overflow-hidden">
        <div className="px-3 py-2 border-b border-aviation-border bg-aviation-surface/40">
          <span className="text-xs font-bold uppercase tracking-widest text-aviation-text-muted">
            Performance Readouts
          </span>
        </div>

        <div className="divide-y divide-aviation-border/50">
          {/* Optimal Climb IAS */}
          <div className="flex justify-between items-center px-3 py-2.5">
            <span className="text-sm text-aviation-text-muted uppercase tracking-wider">
              Optimal Climb IAS
            </span>
            <span className="font-mono font-bold text-sm text-aviation-amber">
              {data.optimal_climb_ias} km/h
            </span>
          </div>

          {/* Optimal Altitude Range */}
          <div className="flex justify-between items-center px-3 py-2.5">
            <span className="text-sm text-aviation-text-muted uppercase tracking-wider">
              Optimal Altitude
            </span>
            <span className="font-mono font-bold text-sm text-aviation-text">
              {formatAltitude(data.optimal_altitude_range[0])} &ndash; {formatAltitude(data.optimal_altitude_range[1])}
            </span>
          </div>

          {/* Energy Retention */}
          <div className="flex justify-between items-center px-3 py-2.5">
            <span className="text-sm text-aviation-text-muted uppercase tracking-wider">
              Energy Retention
            </span>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded border',
                getEnergyRetentionColor(data.energy_retention)
              )}
            >
              {data.energy_retention}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

/** Format altitude in meters with thousands separator */
function formatAltitude(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}
