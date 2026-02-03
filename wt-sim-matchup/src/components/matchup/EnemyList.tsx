/**
 * EnemyList - Display grouped enemy aircraft by nation
 * Collapsible nation groups with threat indicators and sorting
 */

import { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AircraftCard } from '../aircraft/AircraftCard';
import { getNationFlag, getNationName } from '../../lib/utils';
import { groupByNation } from '../../lib/matchup-logic';
import type { Aircraft, Nation, ThreatAssessment } from '../../types/aircraft';

type SortOption = 'threat' | 'br' | 'speed' | 'turn';

interface EnemyListProps {
  enemyAircraft: Aircraft[];
  onAircraftClick?: (aircraft: Aircraft) => void;
  threatMap?: Map<string, ThreatAssessment>;
  playerAircraft?: Aircraft;
  className?: string;
}

export const EnemyList = memo(function EnemyList({ enemyAircraft, onAircraftClick, threatMap, playerAircraft, className }: EnemyListProps) {
  const [expandedNations, setExpandedNations] = useState<Set<Nation>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('threat');

  // Sort aircraft within each nation group
  const sortedAircraft = useMemo(() => {
    const sorted = [...enemyAircraft];
    switch (sortBy) {
      case 'threat':
        if (threatMap) {
          sorted.sort((a, b) => {
            const ta = threatMap.get(a.identifier)?.score ?? 0;
            const tb = threatMap.get(b.identifier)?.score ?? 0;
            return tb - ta;
          });
        }
        break;
      case 'br':
        sorted.sort((a, b) => b.simulator_br - a.simulator_br);
        break;
      case 'speed':
        sorted.sort((a, b) => (b.max_speed ?? 0) - (a.max_speed ?? 0));
        break;
      case 'turn':
        sorted.sort((a, b) => (a.turn_time ?? 999) - (b.turn_time ?? 999));
        break;
    }
    return sorted;
  }, [enemyAircraft, sortBy, threatMap]);

  const groupedEnemies = useMemo(() => groupByNation(sortedAircraft), [sortedAircraft]);

  const toggleNation = (nation: Nation) => {
    setExpandedNations((prev) => {
      const next = new Set(prev);
      if (next.has(nation)) {
        next.delete(nation);
      } else {
        next.add(nation);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedNations(new Set(groupedEnemies.keys()));
  };

  const collapseAll = () => {
    setExpandedNations(new Set());
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'threat', label: 'Threat' },
    { value: 'br', label: 'BR' },
    { value: 'speed', label: 'Speed' },
    { value: 'turn', label: 'Turn' },
  ];

  return (
    <div className={className}>
      {/* Header with sort controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-red-500/40" />
          <span className="section-label text-red-400/70">
            Hostile Aircraft ({enemyAircraft.length})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort options */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-aviation-text-muted uppercase tracking-wider">Sort:</span>
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`text-xs uppercase tracking-wider px-1.5 py-0.5 rounded transition-colors ${
                  sortBy === opt.value
                    ? 'text-aviation-amber bg-aviation-amber/10 border border-aviation-amber/30'
                    : 'text-aviation-text-muted hover:text-aviation-amber'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="w-px h-3 bg-aviation-amber/20" />

          <button
            onClick={expandAll}
            className="text-xs uppercase tracking-wider text-aviation-text-muted hover:text-aviation-amber transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs uppercase tracking-wider text-aviation-text-muted hover:text-aviation-amber transition-colors"
          >
            Collapse
          </button>
        </div>
      </div>

      {/* Grouped by nation */}
      <div className="space-y-2">
        {Array.from(groupedEnemies.entries()).map(([nation, aircraft]) => {
          const isExpanded = expandedNations.has(nation);

          return (
            <div key={nation} className="border border-aviation-border rounded-lg overflow-hidden">
              {/* Nation header */}
              <button
                onClick={() => toggleNation(nation)}
                className="w-full px-4 py-2.5 bg-aviation-slate/40 hover:bg-aviation-slate/60 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getNationFlag(nation)}</span>
                  <span className="text-sm font-header font-bold text-aviation-text uppercase tracking-wider">
                    {getNationName(nation)}
                  </span>
                  <span className="text-xs text-aviation-text-muted uppercase tracking-widest">
                    {aircraft.length} aircraft
                  </span>
                </div>

                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-aviation-amber text-xs"
                >
                  V
                </motion.span>
              </button>

              {/* Aircraft grid */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 bg-aviation-charcoal/30">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        {aircraft.map((plane) => (
                          <AircraftCard
                            key={plane.identifier}
                            aircraft={plane}
                            onClick={() => onAircraftClick?.(plane)}
                            threat={threatMap?.get(plane.identifier)}
                            playerAircraft={playerAircraft}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
});
