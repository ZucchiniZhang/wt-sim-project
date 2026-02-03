import { memo, useMemo } from 'react';
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

interface ClimbDataPoint {
  altitude: number;
  ias: number;
  time_to_alt?: number;
}

interface ClimbProfileChartProps {
  data: ClimbDataPoint[];
  className?: string;
}

export const ClimbProfileChart = memo(function ClimbProfileChart({
  data,
  className,
}: ClimbProfileChartProps) {
  const filteredData = useMemo(
    () => data.filter((d) => d.time_to_alt != null),
    [data],
  );

  if (filteredData.length === 0) {
    return (
      <div className={className}>
        <p className="text-gray-500 text-sm text-center py-8">
          No climb profile data available.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={filteredData}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <CartesianGrid
            stroke={CHART_THEME.grid.stroke}
            strokeDasharray={CHART_THEME.grid.strokeDasharray}
          />
          <XAxis
            dataKey="time_to_alt"
            stroke={CHART_THEME.axis.stroke}
            tick={CHART_THEME.axis.tick}
            label={{
              value: 'Time (s)',
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
            labelFormatter={(value) => `Time: ${value}s`}
            formatter={((value: number, name: string) => {
              if (name === 'altitude') return [`${value} m`, 'Altitude'];
              return [value, name];
            }) as never}
          />
          <Line
            type="monotone"
            dataKey="altitude"
            stroke={CHART_THEME.colors.secondary}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: CHART_THEME.colors.secondary }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
