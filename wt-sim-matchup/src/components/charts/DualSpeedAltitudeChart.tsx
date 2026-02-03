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

interface SpeedAltitudeDataPoint {
  altitude: number;
  speed: number;
}

interface DualSpeedAltitudeChartProps {
  playerData: SpeedAltitudeDataPoint[];
  enemyData: SpeedAltitudeDataPoint[];
  playerName: string;
  enemyName: string;
  className?: string;
}

interface MergedDataPoint {
  altitude: number;
  playerSpeed: number | null;
  enemySpeed: number | null;
}

/**
 * Merge player and enemy speed-vs-altitude data into a single array
 * keyed by altitude, with `playerSpeed` and `enemySpeed` fields.
 * Points are sorted by altitude ascending.
 */
function mergeByAltitude(
  playerData: SpeedAltitudeDataPoint[],
  enemyData: SpeedAltitudeDataPoint[],
): MergedDataPoint[] {
  const map = new Map<number, MergedDataPoint>();

  for (const point of playerData) {
    const existing = map.get(point.altitude);
    if (existing) {
      existing.playerSpeed = point.speed;
    } else {
      map.set(point.altitude, {
        altitude: point.altitude,
        playerSpeed: point.speed,
        enemySpeed: null,
      });
    }
  }

  for (const point of enemyData) {
    const existing = map.get(point.altitude);
    if (existing) {
      existing.enemySpeed = point.speed;
    } else {
      map.set(point.altitude, {
        altitude: point.altitude,
        playerSpeed: null,
        enemySpeed: point.speed,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.altitude - b.altitude);
}

export const DualSpeedAltitudeChart = memo(function DualSpeedAltitudeChart({
  playerData,
  enemyData,
  playerName,
  enemyName,
  className,
}: DualSpeedAltitudeChartProps) {
  const mergedData = useMemo(
    () => mergeByAltitude(playerData, enemyData),
    [playerData, enemyData],
  );

  if (mergedData.length === 0) {
    return (
      <div className={className}>
        <p className="text-gray-500 text-sm text-center py-8">
          No speed vs altitude data available for comparison.
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
            formatter={((value: number, name: string) => {
              const label = name === 'playerSpeed' ? playerName : enemyName;
              return [`${value} km/h`, label];
            }) as never}
          />
          <Legend
            wrapperStyle={CHART_THEME.legend.wrapperStyle}
            formatter={((value: string) => {
              if (value === 'playerSpeed') return playerName;
              if (value === 'enemySpeed') return enemyName;
              return value;
            }) as never}
          />
          <Line
            type="monotone"
            dataKey="playerSpeed"
            name="playerSpeed"
            stroke={CHART_THEME.colors.player}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: CHART_THEME.colors.player }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="enemySpeed"
            name="enemySpeed"
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
