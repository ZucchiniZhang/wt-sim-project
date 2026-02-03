/**
 * MatchupComparisonBars - Side-by-side stat comparison bars for player vs enemy
 * Compares Speed, Climb Rate, Turn Time (inverted), BR, and Mass
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn, formatBR } from '../../lib/utils';
import type { Aircraft } from '../../types/aircraft';

interface MatchupComparisonBarsProps {
  player: Aircraft;
  enemy: Aircraft;
  className?: string;
}

interface StatConfig {
  label: string;
  playerValue: number | undefined;
  enemyValue: number | undefined;
  unit: string;
  /** If true, lower raw value is better (e.g. turn time) */
  lowerIsBetter: boolean;
  /** Custom formatter for the displayed value */
  format?: (value: number) => string;
}

function ComparisonBar({
  label,
  playerValue,
  enemyValue,
  unit,
  lowerIsBetter,
  format,
  index,
}: StatConfig & { index: number }) {
  if (playerValue == null && enemyValue == null) return null;

  const pv = playerValue ?? 0;
  const ev = enemyValue ?? 0;
  const maxVal = Math.max(pv, ev, 0.01);

  const playerPct = (pv / maxVal) * 100;
  const enemyPct = (ev / maxVal) * 100;

  // Determine who "wins" this stat
  const playerBetter = lowerIsBetter ? pv < ev : pv > ev;
  const enemyBetter = lowerIsBetter ? ev < pv : ev > pv;
  const tied = pv === ev;

  const formatValue = format ?? ((v: number) => {
    if (v >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (v >= 10) return v.toFixed(0);
    return v.toFixed(1);
  });

  const playerDisplay = playerValue != null ? `${formatValue(pv)} ${unit}` : 'N/A';
  const enemyDisplay = enemyValue != null ? `${formatValue(ev)} ${unit}` : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      className="space-y-1.5"
    >
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-aviation-text-muted">
          {label}
        </span>
        {!tied && (playerValue != null && enemyValue != null) && (
          <span
            className={cn(
              'text-xs font-mono uppercase tracking-wider',
              playerBetter ? 'text-green-400/70' : 'text-red-400/70'
            )}
          >
            {playerBetter ? 'Advantage' : 'Disadvantage'}
          </span>
        )}
      </div>

      {/* Bars */}
      <div className="flex gap-1.5 items-center">
        {/* Player bar (grows right-to-left, aligned right) */}
        <div className="flex-1 flex justify-end">
          <div className="w-full h-3 rounded-sm bg-aviation-charcoal/60 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${playerPct}%` }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.06, ease: 'easeOut' }}
              className={cn(
                'absolute right-0 top-0 h-full rounded-sm',
                playerBetter
                  ? 'bg-green-500/70'
                  : tied
                    ? 'bg-aviation-amber/50'
                    : 'bg-aviation-text-muted/30'
              )}
            />
          </div>
        </div>

        {/* Center divider */}
        <div className="w-px h-4 bg-aviation-border flex-shrink-0" />

        {/* Enemy bar (grows left-to-right) */}
        <div className="flex-1">
          <div className="w-full h-3 rounded-sm bg-aviation-charcoal/60 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${enemyPct}%` }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.06, ease: 'easeOut' }}
              className={cn(
                'absolute left-0 top-0 h-full rounded-sm',
                enemyBetter
                  ? 'bg-red-500/70'
                  : tied
                    ? 'bg-aviation-amber/50'
                    : 'bg-aviation-text-muted/30'
              )}
            />
          </div>
        </div>
      </div>

      {/* Value labels */}
      <div className="flex justify-between">
        <span
          className={cn(
            'text-xs font-mono',
            playerBetter ? 'text-green-400' : 'text-aviation-text-muted'
          )}
        >
          {playerDisplay}
        </span>
        <span
          className={cn(
            'text-xs font-mono',
            enemyBetter ? 'text-red-400' : 'text-aviation-text-muted'
          )}
        >
          {enemyDisplay}
        </span>
      </div>
    </motion.div>
  );
}

export const MatchupComparisonBars = memo(function MatchupComparisonBars({
  player,
  enemy,
  className,
}: MatchupComparisonBarsProps) {
  const stats: StatConfig[] = useMemo(
    () => [
      {
        label: 'Max Speed',
        playerValue: player.max_speed,
        enemyValue: enemy.max_speed,
        unit: 'km/h',
        lowerIsBetter: false,
      },
      {
        label: 'Climb Rate',
        playerValue: player.climb_rate,
        enemyValue: enemy.climb_rate,
        unit: 'm/s',
        lowerIsBetter: false,
      },
      {
        label: 'Turn Time',
        playerValue: player.turn_time,
        enemyValue: enemy.turn_time,
        unit: 's',
        lowerIsBetter: true,
        format: (v: number) => v.toFixed(1),
      },
      {
        label: 'Battle Rating',
        playerValue: player.simulator_br,
        enemyValue: enemy.simulator_br,
        unit: '',
        lowerIsBetter: true,
        format: (v: number) => formatBR(v),
      },
      {
        label: 'Mass',
        playerValue: player.mass ?? player.empty_weight,
        enemyValue: enemy.mass ?? enemy.empty_weight,
        unit: 'kg',
        lowerIsBetter: false,
        format: (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      },
    ],
    [player, enemy]
  );

  // Filter out stats where both values are missing
  const availableStats = stats.filter(
    (s) => s.playerValue != null || s.enemyValue != null
  );

  if (availableStats.length === 0) {
    return (
      <div className={cn('text-sm font-mono text-aviation-text-muted text-center py-4', className)}>
        No performance data available for comparison.
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {/* Column headers */}
      <div className="flex justify-between mb-3">
        <span className="section-label text-green-400/70">You</span>
        <span className="section-label text-aviation-text-muted">
          Performance Comparison
        </span>
        <span className="section-label text-red-400/70">Enemy</span>
      </div>

      {/* Stat bars */}
      <div className="space-y-4">
        {availableStats.map((stat, index) => (
          <ComparisonBar key={stat.label} {...stat} index={index} />
        ))}
      </div>
    </div>
  );
});
