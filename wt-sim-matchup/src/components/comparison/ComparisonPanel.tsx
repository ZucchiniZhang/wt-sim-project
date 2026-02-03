/**
 * ComparisonPanel - Side-by-side aircraft comparison
 * Supports up to 4 aircraft with visual stat bars
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { getAircraftDisplayName, formatBR, getNationFlag, getAircraftImageUrl } from '../../lib/utils';
import type { Aircraft } from '../../types/aircraft';

interface ComparisonPanelProps {
  aircraft: Aircraft[];
  onRemove?: (identifier: string) => void;
  onClear?: () => void;
  className?: string;
}

export const ComparisonPanel = memo(function ComparisonPanel({
  aircraft,
  onRemove,
  onClear,
  className,
}: ComparisonPanelProps) {
  if (aircraft.length === 0) {
    return (
      <div className={className}>
        <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg py-16 text-center backdrop-blur-sm">
          <div className="text-aviation-amber/20 text-4xl mb-4">&mdash;</div>
          <h3 className="text-sm font-semibold text-aviation-text mb-2">
            No aircraft to compare
          </h3>
          <p className="text-xs text-aviation-text-muted max-w-md mx-auto">
            Click "Add to Comparison" on any aircraft to start comparing
          </p>
        </div>
      </div>
    );
  }

  // Find max values for normalization (memoized)
  const { maxSpeed, maxClimbRate, maxTurnTime } = useMemo(() => ({
    maxSpeed: Math.max(...aircraft.map((a) => a.max_speed || 0)),
    maxClimbRate: Math.max(...aircraft.map((a) => a.climb_rate || 0)),
    maxTurnTime: Math.max(...aircraft.map((a) => a.turn_time || 999)),
  }), [aircraft]);

  return (
    <div className={className}>
      {/* Header */}
      {(onClear || onRemove) && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-aviation-text-muted">
            {aircraft.length}/4 Aircraft
          </span>
          {onClear && aircraft.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-aviation-text-muted hover:text-aviation-amber transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Comparison grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3">
        {aircraft.map((plane, index) => (
          <motion.div
            key={plane.identifier}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg backdrop-blur-sm">
              {/* Header with image */}
              <div className="p-3 border-b border-aviation-border">
                <div className="aspect-video bg-aviation-charcoal overflow-hidden mb-3 border border-aviation-border rounded relative">
                  <img
                    src={getAircraftImageUrl(plane.identifier)}
                    alt={getAircraftDisplayName(plane)}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-aviation-text truncate">
                      {getAircraftDisplayName(plane)}
                    </h3>
                    <p className="text-xs text-aviation-text-muted flex items-center gap-1 mt-1">
                      <span>{getNationFlag(plane.country as any)}</span>
                      <span>{plane.country}</span>
                    </p>
                  </div>

                  {onRemove && (
                    <button
                      onClick={() => onRemove(plane.identifier)}
                      className="text-xs text-aviation-text-muted hover:text-red-400 transition-colors"
                    >
                      X
                    </button>
                  )}
                </div>

                <div className="mt-2 flex gap-2">
                  <Badge variant="br">BR {formatBR(plane.simulator_br)}</Badge>
                  {plane.is_premium && (
                    <Badge variant="premium">Premium</Badge>
                  )}
                </div>
              </div>

              <div className="p-3 space-y-2.5">
                {/* Max Speed */}
                {plane.max_speed !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-aviation-text-muted">Max Speed</span>
                      <span className="font-semibold text-aviation-text">
                        {plane.max_speed.toFixed(0)} km/h
                      </span>
                    </div>
                    <div className="h-1.5 bg-aviation-charcoal overflow-hidden rounded border border-aviation-border">
                      <div
                        className="h-full bg-aviation-amber/70 transition-all duration-300 rounded"
                        style={{ width: `${(plane.max_speed / maxSpeed) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Climb Rate */}
                {plane.climb_rate !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-aviation-text-muted">Climb Rate</span>
                      <span className="font-semibold text-aviation-text">
                        {plane.climb_rate.toFixed(1)} m/s
                      </span>
                    </div>
                    <div className="h-1.5 bg-aviation-charcoal overflow-hidden rounded border border-aviation-border">
                      <div
                        className="h-full bg-aviation-amber/70 transition-all duration-300 rounded"
                        style={{ width: `${(plane.climb_rate / maxClimbRate) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Turn Time (inverse - lower is better) */}
                {plane.turn_time !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-aviation-text-muted">Turn Time</span>
                      <span className="font-semibold text-aviation-text">
                        {plane.turn_time.toFixed(1)} sec
                      </span>
                    </div>
                    <div className="h-1.5 bg-aviation-charcoal overflow-hidden rounded border border-aviation-border">
                      <div
                        className="h-full bg-aviation-amber-dark/70 transition-all duration-300 rounded"
                        style={{
                          width: `${100 - (plane.turn_time / maxTurnTime) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Repair Cost */}
                {plane.repair_cost_simulator !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-aviation-text-muted">Repair Cost</span>
                      <span className="font-semibold text-aviation-text">
                        {plane.repair_cost_simulator.toLocaleString()} SL
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});
