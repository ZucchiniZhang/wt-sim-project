/**
 * TopThreats - Shows the top 5 most dangerous enemies in a prominent horizontal row
 */

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getAircraftDisplayName, getAircraftImageUrl, formatBR, getNationFlag } from '../../lib/utils';
import { getThreatColor, getThreatBgColor, getThreatLabel } from '../../lib/threat-analysis';
import type { Aircraft, ThreatAssessment } from '../../types/aircraft';

interface TopThreatsProps {
  threats: { aircraft: Aircraft; assessment: ThreatAssessment }[];
  playerAircraft: Aircraft;
  onAircraftClick?: (aircraft: Aircraft) => void;
  className?: string;
}

export const TopThreats = memo(function TopThreats({ threats, playerAircraft, onAircraftClick, className }: TopThreatsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (threats.length === 0) return null;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-px bg-red-500/40" />
        <span className="section-label text-red-400/70">
          Priority Threats
        </span>
      </div>

      {/* Threat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {threats.map(({ aircraft, assessment }, index) => {
          const isExpanded = expandedId === aircraft.identifier;
          const displayName = getAircraftDisplayName(aircraft);
          const imageUrl = getAircraftImageUrl(aircraft.identifier);

          return (
            <motion.div
              key={aircraft.identifier}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'border rounded-lg backdrop-blur-sm cursor-pointer transition-all',
                getThreatBgColor(assessment.threatLevel),
                isExpanded ? 'col-span-1 sm:col-span-2 lg:col-span-5' : ''
              )}
              onClick={() => {
                if (isExpanded) {
                  setExpandedId(null);
                } else {
                  setExpandedId(aircraft.identifier);
                }
              }}
            >
              {/* Compact view */}
              <div className="p-3">
                <div className="flex items-start gap-3">
                  {/* Rank number */}
                  <div className="text-xs font-mono text-aviation-text-muted/50 mt-0.5">
                    #{index + 1}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-12 h-8 bg-aviation-charcoal rounded overflow-hidden flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + threat badge */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={cn(
                        'text-xs font-mono font-bold px-1 py-0.5 rounded border',
                        getThreatBgColor(assessment.threatLevel),
                        getThreatColor(assessment.threatLevel)
                      )}>
                        {getThreatLabel(assessment.threatLevel)}
                      </span>
                      <span className="text-xs font-mono text-aviation-amber">
                        {formatBR(aircraft.simulator_br)}
                      </span>
                    </div>

                    <div className="text-sm font-header font-semibold text-aviation-text truncate">
                      {getNationFlag(aircraft.country)} {displayName}
                    </div>

                    {/* Tactical tip (1 line) */}
                    <div className="text-xs text-aviation-text-muted mt-0.5 line-clamp-1">
                      {assessment.tacticalAdvice}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded comparison view */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-aviation-border"
                  >
                    <div className="p-3">
                      <QuickStatComparison player={playerAircraft} enemy={aircraft} assessment={assessment} />
                      {onAircraftClick && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAircraftClick(aircraft);
                          }}
                          className="mt-2 text-xs font-mono text-aviation-amber hover:text-aviation-amber/80 uppercase tracking-wider"
                        >
                          + Add to Comparison
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

function QuickStatComparison({
  player,
  enemy,
  assessment,
}: {
  player: Aircraft;
  enemy: Aircraft;
  assessment: ThreatAssessment;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Stat bars */}
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wider text-aviation-text-muted mb-1">
          Performance
        </div>
        <StatBar
          label="Speed"
          playerValue={player.max_speed}
          enemyValue={enemy.max_speed}
          unit="km/h"
        />
        <StatBar
          label="Turn Time"
          playerValue={player.turn_time}
          enemyValue={enemy.turn_time}
          unit="s"
          lowerIsBetter
        />
        <StatBar
          label="Climb"
          playerValue={player.climb_rate}
          enemyValue={enemy.climb_rate}
          unit="m/s"
        />
      </div>

      {/* Advantages / Disadvantages */}
      <div>
        <div className="text-xs uppercase tracking-wider text-aviation-text-muted mb-1">
          Enemy Advantages
        </div>
        <div className="space-y-0.5">
          {assessment.advantages.length > 0 ? (
            assessment.advantages.map((adv, i) => (
              <div key={i} className="text-xs font-mono text-red-400">
                + {adv}
              </div>
            ))
          ) : (
            <div className="text-xs font-mono text-green-400/50">None identified</div>
          )}
        </div>
        <div className="text-xs uppercase tracking-wider text-aviation-text-muted mb-1 mt-2">
          Enemy Weaknesses
        </div>
        <div className="space-y-0.5">
          {assessment.disadvantages.length > 0 ? (
            assessment.disadvantages.map((dis, i) => (
              <div key={i} className="text-xs font-mono text-green-400">
                - {dis}
              </div>
            ))
          ) : (
            <div className="text-xs font-mono text-red-400/50">None identified</div>
          )}
        </div>
      </div>

      {/* Tactical advice */}
      <div>
        <div className="text-xs uppercase tracking-wider text-aviation-text-muted mb-1">
          Tactical Advice
        </div>
        <div className="text-sm font-mono text-aviation-amber/90 leading-relaxed">
          {assessment.tacticalAdvice}
        </div>
      </div>
    </div>
  );
}

function StatBar({
  label,
  playerValue,
  enemyValue,
  unit,
  lowerIsBetter = false,
}: {
  label: string;
  playerValue?: number;
  enemyValue?: number;
  unit: string;
  lowerIsBetter?: boolean;
}) {
  if (playerValue == null && enemyValue == null) return null;

  const pv = playerValue ?? 0;
  const ev = enemyValue ?? 0;
  const max = Math.max(pv, ev, 1);
  const playerPct = (pv / max) * 100;
  const enemyPct = (ev / max) * 100;

  const playerBetter = lowerIsBetter ? pv < ev : pv > ev;
  const delta = lowerIsBetter ? pv - ev : ev - pv;
  const deltaStr = delta > 0 ? `+${Math.abs(delta).toFixed(delta >= 10 ? 0 : 1)}` : `${delta.toFixed(delta >= 10 || delta <= -10 ? 0 : 1)}`;

  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-aviation-text-muted uppercase tracking-wider">{label}</span>
        <span className={cn(
          delta > 0 ? 'text-red-400' : delta < 0 ? 'text-green-400' : 'text-aviation-text-muted'
        )}>
          {deltaStr} {unit}
        </span>
      </div>
      <div className="flex gap-0.5 h-1.5">
        <div className="flex-1 bg-aviation-charcoal/50 rounded overflow-hidden">
          <div
            className={cn('h-full', playerBetter ? 'bg-green-500/60' : 'bg-aviation-amber/40')}
            style={{ width: `${playerPct}%` }}
          />
        </div>
        <div className="flex-1 bg-aviation-charcoal/50 rounded overflow-hidden">
          <div
            className={cn('h-full', !playerBetter ? 'bg-red-500/60' : 'bg-aviation-text-muted/30')}
            style={{ width: `${enemyPct}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between text-xs font-mono text-aviation-text-muted/50">
        <span>You: {playerValue != null ? `${pv.toFixed(lowerIsBetter ? 1 : 0)} ${unit}` : 'N/A'}</span>
        <span>Them: {enemyValue != null ? `${ev.toFixed(lowerIsBetter ? 1 : 0)} ${unit}` : 'N/A'}</span>
      </div>
    </div>
  );
}
