import { memo, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { CHART_THEME } from './chartTheme';

interface ClimbDataPoint {
  altitude: number;
  ias: number;
  time_to_alt?: number;
}

interface DualClimbProfileChartProps {
  playerData: ClimbDataPoint[];
  enemyData: ClimbDataPoint[];
  playerName: string;
  enemyName: string;
  className?: string;
}

interface MergedClimbPoint {
  time_to_alt: number;
  playerAltitude: number | null;
  enemyAltitude: number | null;
}

/**
 * Filter entries that have `time_to_alt` defined, then merge player
 * and enemy data into a single array keyed by time_to_alt, with
 * `playerAltitude` and `enemyAltitude` fields.
 * Points are sorted by time ascending.
 */
function mergeByTime(
  playerData: ClimbDataPoint[],
  enemyData: ClimbDataPoint[],
): MergedClimbPoint[] {
  const map = new Map<number, MergedClimbPoint>();

  for (const point of playerData) {
    if (point.time_to_alt == null) continue;
    const existing = map.get(point.time_to_alt);
    if (existing) {
      existing.playerAltitude = point.altitude;
    } else {
      map.set(point.time_to_alt, {
        time_to_alt: point.time_to_alt,
        playerAltitude: point.altitude,
        enemyAltitude: null,
      });
    }
  }

  for (const point of enemyData) {
    if (point.time_to_alt == null) continue;
    const existing = map.get(point.time_to_alt);
    if (existing) {
      existing.enemyAltitude = point.altitude;
    } else {
      map.set(point.time_to_alt, {
        time_to_alt: point.time_to_alt,
        playerAltitude: null,
        enemyAltitude: point.altitude,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.time_to_alt - b.time_to_alt);
}

export const DualClimbProfileChart = memo(function DualClimbProfileChart({
  playerData,
  enemyData,
  playerName,
  enemyName,
  className,
}: DualClimbProfileChartProps) {
  const mergedData = useMemo(
    () => mergeByTime(playerData, enemyData),
    [playerData, enemyData],
  );

  if (mergedData.length === 0) {
    return (
      <div className={className}>
        <p className="text-gray-500 text-sm text-center py-8">
          No climb profile data available for comparison.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={mergedData}
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
              const label = name === 'playerAltitude' ? playerName : enemyName;
              return [`${value} m`, label];
            }) as never}
          />
          <Legend
            wrapperStyle={CHART_THEME.legend.wrapperStyle}
            formatter={((value: string) => {
              if (value === 'playerAltitude') return playerName;
              if (value === 'enemyAltitude') return enemyName;
              return value;
            }) as never}
          />
          <Line
            type="monotone"
            dataKey="playerAltitude"
            name="playerAltitude"
            stroke={CHART_THEME.colors.player}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: CHART_THEME.colors.player }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="enemyAltitude"
            name="enemyAltitude"
            stroke={CHART_THEME.colors.enemy}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: CHART_THEME.colors.enemy }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
