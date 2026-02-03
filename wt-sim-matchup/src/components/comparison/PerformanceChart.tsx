/**
 * PerformanceChart - Recharts visualization of performance curves
 * Military briefing styled chart
 */

import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAircraftDisplayName } from '../../lib/utils';
import { CHART_THEME, CHART_COLORS } from '../charts/chartTheme';
import type { Aircraft } from '../../types/aircraft';

interface PerformanceChartProps {
  aircraft: Aircraft[];
  className?: string;
}

export const PerformanceChart = memo(function PerformanceChart({ aircraft, className }: PerformanceChartProps) {
  const data = useMemo(() => {
    const altitudes = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];

    return altitudes.map((altitude) => {
      const dataPoint: Record<string, number> = { altitude };

      aircraft.forEach((plane) => {
        const seaLevelSpeed = plane.max_speed || 500;
        const optimalAlt = plane.aerodynamics?.optimal_altitude || 5000;
        const altitudeSpeed = plane.max_speed_at_altitude || seaLevelSpeed;

        const altitudeFactor = 1 - Math.abs(altitude - optimalAlt) / 10000;
        const speed = seaLevelSpeed + (altitudeSpeed - seaLevelSpeed) * altitudeFactor;

        dataPoint[plane.identifier] = Math.max(speed, seaLevelSpeed * 0.6);
      });

      return dataPoint;
    });
  }, [aircraft]);

  if (aircraft.length === 0) {
    return (
      <div className={className}>
        <div className="py-16 text-center">
          <p className="text-sm text-aviation-text-muted">
            Add aircraft to see performance comparison
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 bg-aviation-amber/50 rounded-full" />
        <span className="text-xs text-aviation-text-muted">
          Speed vs Altitude (simulated curves)
        </span>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray={CHART_THEME.grid.strokeDasharray} stroke={CHART_THEME.grid.stroke} />
          <XAxis
            dataKey="altitude"
            label={{
              value: 'Altitude (m)',
              position: 'insideBottom',
              offset: -5,
              style: CHART_THEME.axis.label,
            }}
            stroke={CHART_THEME.axis.stroke}
            tick={CHART_THEME.axis.tick}
          />
          <YAxis
            label={{
              value: 'Speed (km/h)',
              angle: -90,
              position: 'insideLeft',
              style: CHART_THEME.axis.label,
            }}
            stroke={CHART_THEME.axis.stroke}
            tick={CHART_THEME.axis.tick}
          />
          <Tooltip
            contentStyle={CHART_THEME.tooltip.contentStyle}
            labelStyle={CHART_THEME.tooltip.labelStyle}
            itemStyle={CHART_THEME.tooltip.itemStyle}
          />
          <Legend
            wrapperStyle={CHART_THEME.legend.wrapperStyle}
            formatter={(value) => {
              const plane = aircraft.find((a) => a.identifier === value);
              return plane ? getAircraftDisplayName(plane) : value;
            }}
          />

          {aircraft.map((plane, index) => (
            <Line
              key={plane.identifier}
              type="monotone"
              dataKey={plane.identifier}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: CHART_COLORS[index % CHART_COLORS.length] }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
