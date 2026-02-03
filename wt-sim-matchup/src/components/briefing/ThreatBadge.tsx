/**
 * ThreatBadge - Large, prominent threat level display with score
 * Used as the focal threat indicator in briefing panels
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import {
  getThreatColor,
  getThreatBgColor,
  getThreatLabel,
} from '../../lib/threat-analysis';
import type { ThreatLevel } from '../../types/aircraft';

interface ThreatBadgeProps {
  level: ThreatLevel;
  score: number;
  className?: string;
}

/** Color config per threat level for the radial glow and ring */
function getThreatRingColor(level: ThreatLevel): string {
  switch (level) {
    case 'critical':
      return 'ring-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]';
    case 'high':
      return 'ring-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.15)]';
    case 'moderate':
      return 'ring-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.15)]';
    case 'low':
      return 'ring-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.15)]';
  }
}

function getScoreBarColor(level: ThreatLevel): string {
  switch (level) {
    case 'critical':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'moderate':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
  }
}

export const ThreatBadge = memo(function ThreatBadge({
  level,
  score,
  className,
}: ThreatBadgeProps) {
  const clampedScore = Math.min(Math.max(score, 0), 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn(
        'flex flex-col items-center gap-3 p-5 rounded-xl border ring-1',
        'bg-aviation-surface/80 backdrop-blur-sm',
        getThreatBgColor(level),
        getThreatRingColor(level),
        className
      )}
    >
      {/* Section label */}
      <div className="section-label text-aviation-text-muted">
        Threat Assessment
      </div>

      {/* Threat level text */}
      <div
        className={cn(
          'text-2xl sm:text-3xl font-mono font-bold tracking-wider',
          getThreatColor(level)
        )}
      >
        {getThreatLabel(level)}
      </div>

      {/* Score display */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl sm:text-4xl font-mono font-bold text-aviation-text">
          {clampedScore}
        </span>
        <span className="text-sm font-mono text-aviation-text-muted">
          / 100
        </span>
      </div>

      {/* Score bar */}
      <div className="w-full max-w-[200px]">
        <div className="w-full h-2 rounded-full bg-aviation-charcoal/80 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clampedScore}%` }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className={cn('h-full rounded-full', getScoreBarColor(level))}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs font-mono text-aviation-text-muted/50 uppercase tracking-wider">
            Low
          </span>
          <span className="text-xs font-mono text-aviation-text-muted/50 uppercase tracking-wider">
            Critical
          </span>
        </div>
      </div>

      {/* Risk descriptor */}
      <div className="text-xs font-mono text-aviation-text-muted text-center leading-relaxed">
        {level === 'critical' && 'Extreme danger. Engage only with decisive advantage.'}
        {level === 'high' && 'Significant threat. Careful approach required.'}
        {level === 'moderate' && 'Manageable opponent. Standard engagement rules apply.'}
        {level === 'low' && 'Favorable matchup. Press your advantages.'}
      </div>
    </motion.div>
  );
});
