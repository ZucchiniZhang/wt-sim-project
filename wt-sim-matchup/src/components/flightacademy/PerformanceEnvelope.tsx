/**
 * PerformanceEnvelope - Interactive chart showing optimal performance zone
 * Uses Recharts ComposedChart when speed-at-altitude data is available,
 * falls back to a polished CSS visualization of the optimal zone boundaries.
 */

import { memo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from 'recharts';
import { CHART_THEME } from '../charts/chartTheme';
import type { OptimalEnvelope, SpeedAtAltitudePoint } from '../../types/curated';

interface PerformanceEnvelopeProps {
  envelope: OptimalEnvelope;
  speedAtAltitude?: SpeedAtAltitudePoint[];
}

/** Normalization boundaries for CSS envelope visualization */
const MAX_SPEED_KMH = 800;
const MAX_ALTITUDE_M = 10000;

/** CSS-only fallback when no curated speed data is available */
function CSSEnvelopeVisualization({ envelope }: { envelope: OptimalEnvelope }) {
  // Compute dynamic boundaries with headroom if envelope exceeds defaults
  const maxSpeed = Math.max(MAX_SPEED_KMH, envelope.speed_max * 1.2);
  const maxAltitude = Math.max(MAX_ALTITUDE_M, envelope.altitude_max * 1.2);

  return (
    <div className="bg-aviation-charcoal/50 border border-aviation-border/30 rounded p-4 relative overflow-hidden">
      <div className="flex gap-4">
        {/* Y-axis labels (altitude) */}
        <div className="flex flex-col justify-between text-xs font-mono text-aviation-text-muted py-2 w-12 shrink-0">
          <div>{(envelope.altitude_max / 1000).toFixed(1)}km</div>
          <div className="text-center opacity-30">|</div>
          <div>{(envelope.altitude_min / 1000).toFixed(1)}km</div>
          <div className="text-center opacity-30">|</div>
          <div className="opacity-50">0</div>
        </div>

        {/* Chart area */}
        <div className="flex-1 relative" style={{ height: '160px' }}>
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between opacity-15">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-t border-aviation-border" />
            ))}
          </div>

          {/* Optimal zone */}
          <div
            className="absolute bg-gradient-to-br from-aviation-amber/25 to-green-400/10 border-2 border-dashed border-aviation-amber/40 rounded transition-all"
            style={{
              left: `${(envelope.speed_min / maxSpeed) * 100}%`,
              right: `${100 - (envelope.speed_max / maxSpeed) * 100}%`,
              top: `${100 - (envelope.altitude_max / maxAltitude) * 100}%`,
              bottom: `${(envelope.altitude_min / maxAltitude) * 100}%`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-header font-bold text-aviation-amber uppercase tracking-wider whitespace-nowrap">
                Optimal Zone
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* X-axis labels (speed) */}
      <div className="flex justify-between text-xs font-mono text-aviation-text-muted mt-2 ml-16">
        <div>0</div>
        <div>{envelope.speed_min} km/h</div>
        <div>{envelope.speed_max} km/h</div>
        <div className="opacity-50">800</div>
      </div>
    </div>
  );
}

export const PerformanceEnvelope = memo(function PerformanceEnvelope({
  envelope,
  speedAtAltitude,
}: PerformanceEnvelopeProps) {
  const hasChartData = speedAtAltitude && speedAtAltitude.length > 0;

  return (
    <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm corner-brackets">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-4 h-px bg-aviation-amber/30" />
        <span className="section-label">OPTIMAL PERFORMANCE ENVELOPE</span>
      </div>

      {hasChartData ? (
        /* Recharts visualization with actual speed-at-altitude data */
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart
            data={speedAtAltitude}
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              stroke={CHART_THEME.grid.stroke}
              strokeDasharray={CHART_THEME.grid.strokeDasharray}
            />
            <XAxis
              dataKey="speed"
              stroke={CHART_THEME.axis.stroke}
              tick={CHART_THEME.axis.tick}
              label={{
                value: 'Speed (km/h)',
                position: 'insideBottomRight',
                offset: -5,
                ...CHART_THEME.axis.label,
              }}
            />
            <YAxis
              dataKey="altitude"
              stroke={CHART_THEME.axis.stroke}
              tick={CHART_THEME.axis.tick}
              label={{
                value: 'Altitude (m)',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                ...CHART_THEME.axis.label,
              }}
            />
            <Tooltip
              contentStyle={CHART_THEME.tooltip.contentStyle}
              labelStyle={CHART_THEME.tooltip.labelStyle}
              itemStyle={CHART_THEME.tooltip.itemStyle}
              labelFormatter={(value) => `Speed: ${value} km/h`}
              formatter={((value: number) => [`${value} m`, 'Altitude']) as never}
            />
            {/* Optimal zone overlay */}
            <ReferenceArea
              x1={envelope.speed_min}
              x2={envelope.speed_max}
              y1={envelope.altitude_min}
              y2={envelope.altitude_max}
              fill={CHART_THEME.colors.primary}
              fillOpacity={0.15}
              stroke={CHART_THEME.colors.primary}
              strokeOpacity={0.4}
              strokeDasharray="4 4"
            />
            {/* Speed curve */}
            <Line
              type="monotone"
              dataKey="altitude"
              stroke={CHART_THEME.colors.secondary}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: CHART_THEME.colors.secondary }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        /* CSS fallback */
        <CSSEnvelopeVisualization envelope={envelope} />
      )}

      {/* Envelope description */}
      <div className="mt-4 border-t border-aviation-border/30 pt-4">
        <p className="text-sm text-aviation-text leading-relaxed">
          {envelope.description}
        </p>
      </div>
    </div>
  );
});
