import { memo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { CHART_THEME } from './chartTheme';

interface SpeedAltitudeDataPoint {
  altitude: number;
  speed: number;
}

interface SpeedAltitudeChartProps {
  data: SpeedAltitudeDataPoint[];
  className?: string;
}

export const SpeedAltitudeChart = memo(function SpeedAltitudeChart({
  data,
  className,
}: SpeedAltitudeChartProps) {
  if (data.length === 0) {
    return (
      <div className={className}>
        <p className="text-gray-500 text-sm text-center py-8">
          No speed vs altitude data available.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <CartesianGrid
            stroke={CHART_THEME.grid.stroke}
            strokeDasharray={CHART_THEME.grid.strokeDasharray}
          />
          <XAxis
            dataKey="altitude"
            stroke={CHART_THEME.axis.stroke}
            tick={CHART_THEME.axis.tick}
            label={{
              value: 'Altitude (m)',
              position: 'insideBottomRight',
              offset: -5,
              ...CHART_THEME.axis.label,
            }}
          />
          <YAxis
            stroke={CHART_THEME.axis.stroke}
            tick={CHART_THEME.axis.tick}
            label={{
              value: 'Speed (km/h)',
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
            labelFormatter={(value) => `Altitude: ${value} m`}
            formatter={((value: number) => [`${value} km/h`, 'Speed']) as never}
          />
          <Line
            type="monotone"
            dataKey="speed"
            stroke={CHART_THEME.colors.primary}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: CHART_THEME.colors.primary }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
