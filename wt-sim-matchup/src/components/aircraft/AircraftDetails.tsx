/**
 * AircraftDetails - Detailed view of a single aircraft
 * Shows full stats, large image, and armament info
 */

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { cn, getAircraftDisplayName, getAircraftImageUrl, formatBR, getNationFlag, getNationName, getAircraftTypeIcon, getAircraftTypeName } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AircraftStats } from './AircraftStats';
import type { Aircraft } from '../../types/aircraft';

interface AircraftDetailsProps {
  aircraft: Aircraft;
  onAddToComparison?: () => void;
  onClose?: () => void;
  className?: string;
}

export const AircraftDetails = memo(function AircraftDetails({
  aircraft,
  onAddToComparison,
  onClose,
  className,
}: AircraftDetailsProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const displayName = getAircraftDisplayName(aircraft);
  const imageUrl = getAircraftImageUrl(aircraft.identifier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn('w-full', className)}
    >
      <div className="bg-aviation-slate/60 border border-aviation-amber/15 backdrop-blur-sm rounded-lg">
        {/* Header */}
        <div className="p-4 border-b border-aviation-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 bg-aviation-amber rounded-full" />
              <span className="section-label">Selected Aircraft</span>
            </div>
            <h2 className="text-xl font-header font-bold text-aviation-amber uppercase tracking-wider">
              {displayName}
            </h2>
            <p className="text-sm text-aviation-text-muted mt-1 uppercase tracking-widest">
              {getNationFlag(aircraft.country)} {getNationName(aircraft.country)} &middot;
              {' '}{getAircraftTypeIcon(aircraft.vehicle_type)} {getAircraftTypeName(aircraft.vehicle_type)}
            </p>
          </div>

          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        <div className="p-4 space-y-5">
          {/* Image */}
          <div className="relative aspect-[21/9] bg-aviation-charcoal overflow-hidden rounded-lg border border-aviation-border">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-aviation-slate to-aviation-charcoal animate-pulse" />
            )}

            {!imageError ? (
              <img
                src={imageUrl}
                alt={displayName}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-300',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-aviation-charcoal/80">
                <div className="text-center text-aviation-text-muted">
                  <div className="text-4xl mb-2">
                    {getAircraftTypeIcon(aircraft.vehicle_type)}
                  </div>
                  <div className="text-xs font-mono uppercase tracking-widest">No Image Available</div>
                </div>
              </div>
            )}

            {/* Badges overlay */}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant="br">BR {formatBR(aircraft.simulator_br)}</Badge>
              {aircraft.is_premium && <Badge variant="premium">Premium</Badge>}
            </div>
          </div>

          {/* Stats and Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Performance Stats */}
            <AircraftStats aircraft={aircraft} />

            {/* Additional Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-px bg-aviation-amber/30" />
                <span className="section-label">Intel Data</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-aviation-border">
                  <span className="text-aviation-text-muted uppercase tracking-wider">Battle Rating</span>
                  <span className="text-aviation-amber font-mono font-bold">
                    {formatBR(aircraft.simulator_br)}
                  </span>
                </div>

                {aircraft.era !== undefined && (
                  <div className="flex justify-between py-1 border-b border-aviation-border">
                    <span className="text-aviation-text-muted uppercase tracking-wider">Era / Rank</span>
                    <span className="text-aviation-text font-mono">Rank {aircraft.era}</span>
                  </div>
                )}

                {aircraft.mass !== undefined && (
                  <div className="flex justify-between py-1 border-b border-aviation-border">
                    <span className="text-aviation-text-muted uppercase tracking-wider">Mass</span>
                    <span className="text-aviation-text font-mono">{aircraft.mass.toFixed(0)} kg</span>
                  </div>
                )}

                {aircraft.value !== undefined && (
                  <div className="flex justify-between py-1 border-b border-aviation-border">
                    <span className="text-aviation-text-muted uppercase tracking-wider">Research Cost</span>
                    <span className="text-aviation-text font-mono">
                      {aircraft.value.toLocaleString()} RP
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          {onAddToComparison && (
            <div className="pt-4 border-t border-aviation-border">
              <Button
                variant="primary"
                className="w-full"
                onClick={onAddToComparison}
              >
                + Add to Comparison
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
