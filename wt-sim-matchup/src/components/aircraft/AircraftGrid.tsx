/**
 * AircraftGrid - Grid layout for aircraft cards
 */

import { memo } from 'react';
import { AircraftCard } from './AircraftCard';
import type { Aircraft } from '../../types/aircraft';
import { cn } from '../../lib/utils';

interface AircraftGridProps {
  aircraft: Aircraft[];
  selectedAircraft?: Aircraft | null;
  onAircraftClick?: (aircraft: Aircraft) => void;
  isLoading?: boolean;
  className?: string;
}

export const AircraftGrid = memo(function AircraftGrid({
  aircraft,
  selectedAircraft,
  onAircraftClick,
  isLoading = false,
  className,
}: AircraftGridProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3',
          className
        )}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-aviation-slate/40 overflow-hidden rounded-lg border border-aviation-border"
          >
            <div className="aspect-[16/10] bg-aviation-charcoal animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-aviation-charcoal/40 rounded animate-pulse" />
              <div className="h-3 bg-aviation-charcoal/20 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (aircraft.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="panel-border bg-aviation-slate/20 p-8 max-w-sm rounded-lg">
          <div className="section-label mb-3">No Results</div>
          <h3 className="text-lg font-header font-semibold text-aviation-text mb-2 uppercase tracking-wide">
            No Aircraft Found
          </h3>
          <p className="text-sm text-aviation-text-muted">
            Adjust filters or search query to find aircraft.
          </p>
        </div>
      </div>
    );
  }

  // Aircraft grid
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3',
        className
      )}
    >
      {aircraft.map((plane) => (
        <AircraftCard
          key={plane.identifier}
          aircraft={plane}
          onClick={() => onAircraftClick?.(plane)}
          isSelected={selectedAircraft?.identifier === plane.identifier}
        />
      ))}
    </div>
  );
});
