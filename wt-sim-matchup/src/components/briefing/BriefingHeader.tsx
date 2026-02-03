/**
 * BriefingHeader - Side-by-side comparison header for player vs enemy aircraft
 * Shows aircraft thumbnails, names, nations, and BRs with a VS divider
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  cn,
  getAircraftDisplayName,
  getAircraftImageUrl,
  getNationFlag,
  getNationName,
  formatBR,
} from '../../lib/utils';
import { getThreatColor } from '../../lib/threat-analysis';
import type { Aircraft, ThreatAssessment } from '../../types/aircraft';

interface BriefingHeaderProps {
  player: Aircraft;
  enemy: Aircraft;
  assessment: ThreatAssessment;
}

export const BriefingHeader = memo(function BriefingHeader({
  player,
  enemy,
  assessment,
}: BriefingHeaderProps) {
  const playerName = getAircraftDisplayName(player);
  const enemyName = getAircraftDisplayName(enemy);
  const playerImage = getAircraftImageUrl(player.identifier);
  const enemyImage = getAircraftImageUrl(enemy.identifier);

  return (
    <div className="flex items-center gap-3 sm:gap-6">
      {/* Player aircraft column */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-w-0"
      >
        <div className="section-label text-aviation-amber mb-2">
          Your Aircraft
        </div>
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="w-[120px] h-[80px] flex-shrink-0 rounded-lg overflow-hidden bg-aviation-charcoal border border-aviation-border">
            <img
              src={playerImage}
              alt={playerName}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.fallback-icon')) {
                  const fallback = document.createElement('div');
                  fallback.className =
                    'fallback-icon w-full h-full flex items-center justify-center text-aviation-text-muted text-2xl';
                  fallback.textContent = getNationFlag(player.country);
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>

          {/* Info */}
          <div className="min-w-0">
            <div className="text-sm font-mono text-aviation-text-muted mb-1">
              {getNationFlag(player.country)}{' '}
              <span className="uppercase tracking-wider">
                {getNationName(player.country)}
              </span>
            </div>
            <div className="text-base sm:text-lg font-header font-semibold text-aviation-text truncate">
              {playerName}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-aviation-amber/15 text-aviation-amber border border-aviation-amber/30">
                BR {formatBR(player.simulator_br)}
              </span>
              {player.is_premium && (
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-amber-600/20 text-amber-400 border border-amber-600/30">
                  Premium
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* VS Divider */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex flex-col items-center flex-shrink-0"
      >
        <div className="w-px h-6 bg-gradient-to-b from-transparent to-aviation-border" />
        <div
          className={cn(
            'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center',
            'border-2 font-header font-bold text-sm sm:text-base',
            'bg-aviation-charcoal',
            assessment.threatLevel === 'critical'
              ? 'border-red-500/50 text-red-400'
              : assessment.threatLevel === 'high'
                ? 'border-orange-500/50 text-orange-400'
                : assessment.threatLevel === 'moderate'
                  ? 'border-yellow-500/50 text-yellow-400'
                  : 'border-green-500/50 text-green-400'
          )}
        >
          VS
        </div>
        <div className="w-px h-6 bg-gradient-to-b from-aviation-border to-transparent" />
      </motion.div>

      {/* Enemy aircraft column */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-w-0"
      >
        <div
          className={cn(
            'section-label mb-2',
            getThreatColor(assessment.threatLevel)
          )}
        >
          Enemy Aircraft
        </div>
        <div className="flex items-center gap-3 flex-row-reverse sm:flex-row">
          {/* Info (right-aligned on mobile, left on desktop) */}
          <div className="min-w-0 text-right sm:text-left">
            <div className="text-sm font-mono text-aviation-text-muted mb-1">
              <span className="uppercase tracking-wider">
                {getNationName(enemy.country)}
              </span>{' '}
              {getNationFlag(enemy.country)}
            </div>
            <div className="text-base sm:text-lg font-header font-semibold text-aviation-text truncate">
              {enemyName}
            </div>
            <div className="flex items-center gap-2 mt-1 justify-end sm:justify-start">
              <span
                className={cn(
                  'text-xs font-mono px-1.5 py-0.5 rounded border',
                  assessment.threatLevel === 'critical'
                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                    : assessment.threatLevel === 'high'
                      ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                      : assessment.threatLevel === 'moderate'
                        ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                        : 'bg-green-500/15 text-green-400 border-green-500/30'
                )}
              >
                BR {formatBR(enemy.simulator_br)}
              </span>
              {enemy.is_premium && (
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-amber-600/20 text-amber-400 border border-amber-600/30">
                  Premium
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="w-[120px] h-[80px] flex-shrink-0 rounded-lg overflow-hidden bg-aviation-charcoal border border-aviation-border">
            <img
              src={enemyImage}
              alt={enemyName}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.fallback-icon')) {
                  const fallback = document.createElement('div');
                  fallback.className =
                    'fallback-icon w-full h-full flex items-center justify-center text-aviation-text-muted text-2xl';
                  fallback.textContent = getNationFlag(enemy.country);
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
});
