/**
 * QuickCompare - Side-by-side stat comparison overlay when clicking an enemy aircraft
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn, getAircraftDisplayName, formatBR, getNationFlag } from '../../lib/utils';
import { getThreatColor, getThreatBgColor, getThreatLabel } from '../../lib/threat-analysis';
import { PerformanceRadar } from './PerformanceRadar';
import type { Aircraft, ThreatAssessment } from '../../types/aircraft';

interface QuickCompareProps {
  player: Aircraft;
  enemy: Aircraft;
  assessment: ThreatAssessment;
  onClose: () => void;
  onAddToComparison?: (aircraft: Aircraft) => void;
}

export const QuickCompare = memo(function QuickCompare({ player, enemy, assessment, onClose, onAddToComparison }: QuickCompareProps) {
  const playerName = getAircraftDisplayName(player);
  const enemyName = getAircraftDisplayName(enemy);

  const stats: StatRow[] = [
    {
      label: 'Max Speed',
      playerValue: player.max_speed,
      enemyValue: enemy.max_speed,
      unit: 'km/h',
      format: (v) => `${Math.round(v)}`,
    },
    {
      label: 'Turn Time',
      playerValue: player.turn_time,
      enemyValue: enemy.turn_time,
      unit: 's',
      lowerIsBetter: true,
      format: (v) => `${v.toFixed(1)}`,
    },
    {
      label: 'Climb Rate',
      playerValue: player.climb_rate,
      enemyValue: enemy.climb_rate,
      unit: 'm/s',
      format: (v) => `${v.toFixed(1)}`,
    },
    {
      label: 'Max Altitude',
      playerValue: player.max_altitude,
      enemyValue: enemy.max_altitude,
      unit: 'm',
      format: (v) => `${Math.round(v).toLocaleString()}`,
    },
    {
      label: 'Mass',
      playerValue: player.mass,
      enemyValue: enemy.mass,
      unit: 'kg',
      format: (v) => `${Math.round(v).toLocaleString()}`,
    },
    {
      label: 'Repair (SB)',
      playerValue: player.repair_cost_simulator,
      enemyValue: enemy.repair_cost_simulator,
      unit: 'SL',
      format: (v) => `${Math.round(v).toLocaleString()}`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-aviation-slate/90 panel-border backdrop-blur-md rounded-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-aviation-border">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-aviation-amber" />
          <span className="section-label text-aviation-amber">
            Quick Compare
          </span>
          <span className={cn(
            'text-xs font-mono font-bold px-1.5 py-0.5 rounded border ml-2',
            getThreatBgColor(assessment.threatLevel),
            getThreatColor(assessment.threatLevel)
          )}>
            {getThreatLabel(assessment.threatLevel)}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-aviation-text-muted hover:text-aviation-amber text-xs font-mono transition-colors"
        >
          X
        </button>
      </div>

      <div className="p-4">
        {/* Aircraft names header */}
        <div className="grid grid-cols-[1fr_80px_1fr] gap-2 mb-4">
          <div className="text-right">
            <div className="text-xs text-aviation-text-muted uppercase tracking-wider mb-1">
              Your Aircraft
            </div>
            <div className="text-sm font-header font-semibold text-aviation-amber truncate">
              {getNationFlag(player.country)} {playerName}
            </div>
            <div className="text-xs font-mono text-aviation-text-muted">
              BR {formatBR(player.simulator_br)}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-xs font-mono text-aviation-text-muted">VS</span>
          </div>
          <div>
            <div className="text-xs text-aviation-text-muted uppercase tracking-wider mb-1">
              Enemy
            </div>
            <div className="text-sm font-header font-semibold text-red-400 truncate">
              {getNationFlag(enemy.country)} {enemyName}
            </div>
            <div className="text-xs font-mono text-aviation-text-muted">
              BR {formatBR(enemy.simulator_br)}
            </div>
          </div>
        </div>

        {/* Stat comparison bars */}
        <div className="space-y-3">
          {stats.map((stat) => (
            <ComparisonBar key={stat.label} {...stat} />
          ))}
        </div>

        {/* Radar chart + Tactical advice */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <PerformanceRadar player={player} enemy={enemy} size={220} />
          <div className="p-3 bg-aviation-charcoal/50 border border-aviation-border rounded-lg flex flex-col justify-center">
            <div className="text-xs text-aviation-amber uppercase tracking-wider mb-1">
              Tactical Advice
            </div>
            <div className="text-sm font-mono text-aviation-text leading-relaxed">
              {assessment.tacticalAdvice}
            </div>
          </div>
        </div>

        {/* Add to comparison button */}
        {onAddToComparison && (
          <button
            onClick={() => onAddToComparison(enemy)}
            className="mt-3 w-full py-2 text-xs font-mono text-aviation-amber border border-aviation-amber/30 rounded-lg hover:bg-aviation-amber/10 uppercase tracking-wider transition-colors"
          >
            + Add to Full Comparison
          </button>
        )}
      </div>
    </motion.div>
  );
});

interface StatRow {
  label: string;
  playerValue?: number;
  enemyValue?: number;
  unit: string;
  lowerIsBetter?: boolean;
  format?: (v: number) => string;
}

function ComparisonBar({ label, playerValue, enemyValue, unit, lowerIsBetter = false, format }: StatRow) {
  if (playerValue == null && enemyValue == null) return null;

  const pv = playerValue ?? 0;
  const ev = enemyValue ?? 0;
  const fmt = format ?? ((v: number) => `${v}`);
  const max = Math.max(pv, ev, 1);
  const playerPct = (pv / max) * 100;
  const enemyPct = (ev / max) * 100;

  const playerBetter = lowerIsBetter ? pv < ev : pv > ev;
  const equal = pv === ev;

  return (
    <div>
      <div className="text-xs text-aviation-text-muted uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="grid grid-cols-[1fr_80px_1fr] gap-2 items-center">
        {/* Player bar (right-aligned) */}
        <div className="flex items-center gap-1.5 justify-end">
          <span className={cn(
            'text-xs font-mono',
            playerBetter && !equal ? 'text-green-400 font-bold' : 'text-aviation-text-muted'
          )}>
            {playerValue != null ? `${fmt(pv)} ${unit}` : 'N/A'}
          </span>
          <div className="w-24 h-2 bg-aviation-charcoal/50 rounded overflow-hidden">
            <div
              className={cn('h-full float-right', playerBetter ? 'bg-green-500/60' : 'bg-aviation-amber/40')}
              style={{ width: `${playerPct}%` }}
            />
          </div>
        </div>

        {/* Delta */}
        <div className="text-center">
          {playerValue != null && enemyValue != null && (
            <span className={cn(
              'text-xs font-mono font-bold',
              equal ? 'text-aviation-text-muted' :
              playerBetter ? 'text-green-400' : 'text-red-400'
            )}>
              {(() => {
                const diff = lowerIsBetter ? pv - ev : ev - pv;
                return diff > 0 ? `+${fmt(Math.abs(diff))}` : `-${fmt(Math.abs(diff))}`;
              })()}
            </span>
          )}
        </div>

        {/* Enemy bar (left-aligned) */}
        <div className="flex items-center gap-1.5">
          <div className="w-24 h-2 bg-aviation-charcoal/50 rounded overflow-hidden">
            <div
              className={cn('h-full', !playerBetter && !equal ? 'bg-red-500/60' : 'bg-aviation-text-muted/30')}
              style={{ width: `${enemyPct}%` }}
            />
          </div>
          <span className={cn(
            'text-xs font-mono',
            !playerBetter && !equal ? 'text-red-400 font-bold' : 'text-aviation-text-muted'
          )}>
            {enemyValue != null ? `${fmt(ev)} ${unit}` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}
