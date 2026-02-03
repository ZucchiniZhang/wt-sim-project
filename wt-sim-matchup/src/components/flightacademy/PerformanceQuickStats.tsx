/**
 * PerformanceQuickStats - At-a-glance performance metrics with mini visualizations
 * Shows speed, climb, and turn rate with sparkline-style charts
 */

import type { Aircraft } from '../../types/aircraft';

interface PerformanceQuickStatsProps {
  aircraft: Aircraft;
}

export function PerformanceQuickStats({ aircraft }: PerformanceQuickStatsProps) {
  // Normalize values to 0-100 scale for visualization (relative to typical values)
  const normalizeSpeed = (speed: number) => Math.min((speed / 800) * 100, 100); // 800 km/h is high
  const normalizeClimb = (climb: number) => Math.min((climb / 30) * 100, 100); // 30 m/s is excellent
  const normalizeTurn = (turn: number) => Math.max(0, 100 - ((turn - 10) / 20) * 100); // Lower is better, 10s is excellent

  const speedPercent = normalizeSpeed(aircraft.max_speed || 0);
  const climbPercent = normalizeClimb(aircraft.climb_rate || 0);
  const turnPercent = normalizeTurn(aircraft.turn_time || 30);

  return (
    <div className="corner-brackets">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-px bg-aviation-amber/30" />
        <span className="section-label">PERFORMANCE AT A GLANCE</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Speed Card */}
        <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4 backdrop-blur-sm">
          {/* Icon & Label */}
          <div className="flex items-center gap-2 mb-3">
            <div className="text-aviation-amber text-xl">⚡</div>
            <span className="text-xs uppercase tracking-widest text-aviation-text-muted">
              Max Speed
            </span>
          </div>

          {/* Mini Chart */}
          <div className="h-12 mb-3 flex items-end gap-1">
            {[20, 40, 60, 80, speedPercent].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-aviation-amber to-aviation-amber/50 rounded-t transition-all"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          {/* Value */}
          <div className="text-2xl font-mono font-bold text-aviation-amber">
            {aircraft.max_speed?.toFixed(0) || '—'}
          </div>
          <div className="text-xs text-aviation-text-muted">km/h</div>
        </div>

        {/* Climb Card */}
        <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4 backdrop-blur-sm">
          {/* Icon & Label */}
          <div className="flex items-center gap-2 mb-3">
            <div className="text-aviation-amber text-xl">↑</div>
            <span className="text-xs uppercase tracking-widest text-aviation-text-muted">
              Climb Rate
            </span>
          </div>

          {/* Mini Chart */}
          <div className="h-12 mb-3 flex items-end gap-1">
            {[30, 50, 70, 85, climbPercent].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-blue-400 to-blue-400/50 rounded-t transition-all"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          {/* Value */}
          <div className="text-2xl font-mono font-bold text-blue-400">
            {aircraft.climb_rate?.toFixed(1) || '—'}
          </div>
          <div className="text-xs text-aviation-text-muted">m/s</div>
        </div>

        {/* Turn Card */}
        <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4 backdrop-blur-sm">
          {/* Icon & Label */}
          <div className="flex items-center gap-2 mb-3">
            <div className="text-aviation-amber text-xl">⟲</div>
            <span className="text-xs uppercase tracking-widest text-aviation-text-muted">
              Turn Time
            </span>
          </div>

          {/* Mini Chart */}
          <div className="h-12 mb-3 flex items-end gap-1">
            {[40, 60, 75, 90, turnPercent].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-green-400 to-green-400/50 rounded-t transition-all"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          {/* Value */}
          <div className="text-2xl font-mono font-bold text-green-400">
            {aircraft.turn_time?.toFixed(1) || '—'}
          </div>
          <div className="text-xs text-aviation-text-muted">sec</div>
        </div>
      </div>
    </div>
  );
}
