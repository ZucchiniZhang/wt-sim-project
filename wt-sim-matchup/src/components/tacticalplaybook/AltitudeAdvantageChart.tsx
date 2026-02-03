/**
 * AltitudeAdvantageChart - Vertical band chart showing performance advantage by altitude zone
 * Color-coded: green (player advantage), yellow (neutral), red (enemy advantage)
 */

import type { AltitudeAdvantageZone } from '../../types/curated';

interface AltitudeAdvantageChartProps {
  zones: AltitudeAdvantageZone[];
}

const ADVANTAGE_CONFIG = {
  player:  { color: 'bg-green-500/30', border: 'border-green-500/40', text: 'text-green-400', label: 'YOU' },
  enemy:   { color: 'bg-red-500/30', border: 'border-red-500/40', text: 'text-red-400', label: 'ENEMY' },
  neutral: { color: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'NEUTRAL' },
};

function formatAltitude(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

export function AltitudeAdvantageChart({ zones }: AltitudeAdvantageChartProps) {
  // Sort zones by altitude (highest first for top-down display)
  const sorted = [...zones].sort((a, b) => b.altitude_max - a.altitude_max);

  // Find overall altitude range for proportional sizing
  const maxAlt = Math.max(...zones.map(z => z.altitude_max));
  const minAlt = Math.min(...zones.map(z => z.altitude_min));
  const totalRange = maxAlt - minAlt || 1;

  return (
    <div className="corner-brackets bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
        <span className="section-label">Altitude Advantage</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-5" aria-hidden="true">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-500/40 border border-green-500/60" />
          <span className="text-xs text-aviation-text-muted uppercase tracking-wider">You</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-yellow-500/30 border border-yellow-500/50" />
          <span className="text-xs text-aviation-text-muted uppercase tracking-wider">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-500/40 border border-red-500/60" />
          <span className="text-xs text-aviation-text-muted uppercase tracking-wider">Enemy</span>
        </div>
      </div>

      {/* Altitude Bands */}
      <div className="space-y-1" role="list" aria-label="Altitude advantage zones">
        {sorted.map((zone, i) => {
          const config = ADVANTAGE_CONFIG[zone.advantage];
          const heightPercent = Math.max(
            ((zone.altitude_max - zone.altitude_min) / totalRange) * 100,
            15 // minimum visual height
          );

          return (
            <div
              key={i}
              role="listitem"
              className={`flex items-stretch rounded border ${config.border} ${config.color} overflow-hidden`}
              style={{ minHeight: `${Math.max(heightPercent * 0.8, 48)}px` }}
            >
              {/* Altitude Range Label */}
              <div className="flex-shrink-0 w-28 flex flex-col justify-center px-3 py-2 border-r border-aviation-border/30">
                <div className="text-xs font-mono text-aviation-text">
                  {formatAltitude(zone.altitude_max)}
                </div>
                <div className="text-[10px] text-aviation-text-muted" aria-hidden="true">|</div>
                <div className="text-xs font-mono text-aviation-text">
                  {formatAltitude(zone.altitude_min)}
                </div>
              </div>

              {/* Advantage Badge */}
              <div className="flex-shrink-0 w-20 flex items-center justify-center px-2">
                <span className={`text-xs font-header font-bold uppercase tracking-wider ${config.text}`}>
                  {config.label}
                </span>
              </div>

              {/* Reasoning */}
              <div className="flex-1 flex items-center px-3 py-2">
                <p className="text-xs text-aviation-text leading-relaxed">
                  {zone.reasoning}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
