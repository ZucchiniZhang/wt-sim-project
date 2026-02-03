/**
 * AircraftCard - Military briefing style aircraft display card
 * Clean rounded panels, amber accents, readable typography
 * Now includes optional threat level badge and stat deltas
 */

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { cn, getAircraftDisplayName, getAircraftImageUrl, formatBR, getNationFlag, getAircraftTypeIcon, getAircraftTypeName } from '../../lib/utils';
import { getThreatColor, getThreatBgColor, getThreatLabel } from '../../lib/threat-analysis';
import type { Aircraft, ThreatAssessment } from '../../types/aircraft';

interface AircraftCardProps {
  aircraft: Aircraft;
  onClick?: () => void;
  isSelected?: boolean;
  className?: string;
  threat?: ThreatAssessment;
  playerAircraft?: Aircraft;
}

export const AircraftCard = memo(function AircraftCard({
  aircraft,
  onClick,
  isSelected = false,
  className,
  threat,
  playerAircraft,
}: AircraftCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const displayName = getAircraftDisplayName(aircraft);
  const imageUrl = getAircraftImageUrl(aircraft.identifier);

  // Calculate stat deltas if we have both threat and player data
  const speedDelta = playerAircraft?.max_speed != null && aircraft.max_speed != null
    ? aircraft.max_speed - playerAircraft.max_speed : null;
  const turnDelta = playerAircraft?.turn_time != null && aircraft.turn_time != null
    ? aircraft.turn_time - playerAircraft.turn_time : null;

  // Make card keyboard accessible
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative cursor-pointer rounded-lg',
        'bg-aviation-slate/60 overflow-hidden',
        'border transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aviation-amber focus-visible:ring-offset-2 focus-visible:ring-offset-aviation-charcoal',
        isSelected
          ? 'border-aviation-amber/50 shadow-card'
          : 'border-aviation-border hover:border-aviation-amber/30',
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${displayName}, ${formatBR(aircraft.simulator_br)} BR, ${getNationFlag(aircraft.country)} ${aircraft.country} ${getAircraftTypeName(aircraft.vehicle_type)}${isSelected ? ', selected' : ''}`}
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] bg-aviation-charcoal overflow-hidden">
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-aviation-slate to-aviation-charcoal animate-pulse" />
        )}

        {/* Aircraft image */}
        {!imageError ? (
          <img
            src={imageUrl}
            alt={displayName}
            className={cn(
              'w-full h-full object-cover transition-all duration-300',
              'group-hover:scale-105 group-hover:brightness-110',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-aviation-charcoal/80">
            <div className="text-center text-aviation-text-muted">
              <div className="text-3xl mb-1 opacity-40">
                {getAircraftTypeIcon(aircraft.vehicle_type)}
              </div>
              <div className="text-xs font-mono uppercase tracking-wider opacity-40">No Image</div>
            </div>
          </div>
        )}

        {/* Amber tint overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-aviation-amber/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Top-left: BR readout */}
        <div className="absolute top-2 left-2">
          <div className="bg-aviation-charcoal/90 border border-aviation-amber/40 px-2 py-0.5 rounded font-mono text-xs font-bold text-aviation-amber">
            {formatBR(aircraft.simulator_br)}
          </div>
        </div>

        {/* Top-right: Threat badge or Premium marker */}
        <div className="absolute top-2 right-2 flex gap-1">
          {threat && (
            <div className={cn(
              'px-1.5 py-0.5 rounded font-mono text-xs font-bold uppercase tracking-wider border',
              getThreatBgColor(threat.threatLevel),
              getThreatColor(threat.threatLevel)
            )}>
              {getThreatLabel(threat.threatLevel)}
            </div>
          )}
          {aircraft.is_premium && (
            <div className="bg-yellow-600/80 px-1.5 py-0.5 rounded font-mono text-xs font-bold text-white uppercase tracking-wider">
              P
            </div>
          )}
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-aviation-slate/80 to-transparent" />
      </div>

      {/* Info section */}
      <div className="p-3 space-y-1.5">
        {/* Aircraft name */}
        <h3 className="font-header font-semibold text-aviation-text text-sm line-clamp-1 group-hover:text-aviation-amber transition-colors tracking-wide">
          {displayName}
        </h3>

        {/* Metadata row */}
        <div className="flex items-center justify-between text-xs text-aviation-text-muted uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <span className="text-sm">{getNationFlag(aircraft.country)}</span>
            <span>{aircraft.country}</span>
          </span>

          <span className="flex items-center gap-1.5 text-aviation-text-muted/70">
            <span>{getAircraftTypeIcon(aircraft.vehicle_type)}</span>
            <span>{getAircraftTypeName(aircraft.vehicle_type)}</span>
          </span>
        </div>

        {/* Stat deltas (when threat data present) */}
        {threat && (speedDelta !== null || turnDelta !== null) && (
          <div className="flex gap-2 font-mono text-xs">
            {speedDelta !== null && (
              <span className={cn(
                speedDelta > 10 ? 'text-red-400' : speedDelta < -10 ? 'text-green-400' : 'text-aviation-text-muted'
              )}>
                {speedDelta > 0 ? '+' : ''}{Math.round(speedDelta)} km/h
              </span>
            )}
            {turnDelta !== null && (
              <span className={cn(
                turnDelta < -1 ? 'text-red-400' : turnDelta > 1 ? 'text-green-400' : 'text-aviation-text-muted'
              )}>
                {turnDelta > 0 ? '+' : ''}{turnDelta.toFixed(1)}s turn
              </span>
            )}
          </div>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <div className="flex items-center gap-1.5 text-aviation-amber text-xs font-mono font-bold tracking-wider">
            <span className="w-1.5 h-1.5 bg-aviation-amber rounded-full" />
            <span>SELECTED</span>
          </div>
        )}
      </div>
    </motion.div>
  );
});
